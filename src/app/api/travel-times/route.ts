import { NextRequest, NextResponse } from "next/server";

type VenueReq={id:string;name:string;region?:string};
type Point={lng:number;lat:number};
const headers=(key:string)=>({Authorization:`KakaoAK ${key}`});

async function geocodeVenue(key:string, venue:VenueReq):Promise<Point|null>{
  const q=[venue.name,venue.region].filter(Boolean).join(" ");
  const u=new URL("https://dapi.kakao.com/v2/local/search/keyword.json");
  u.searchParams.set("query",q);u.searchParams.set("size","1");
  const r=await fetch(u,{headers:headers(key),next:{revalidate:86400}}); if(!r.ok)return null;
  const j=await r.json(); const d=j?.documents?.[0];
  const lng=Number(d?.x),lat=Number(d?.y);return Number.isFinite(lng)&&Number.isFinite(lat)?{lng,lat}:null;
}
async function transit(key:string,a:Point,b:Point){
  const u=new URL("https://dapi.kakao.com/v2/routing/publictraffic");
  u.searchParams.set("start_x",String(a.lng));u.searchParams.set("start_y",String(a.lat));u.searchParams.set("end_x",String(b.lng));u.searchParams.set("end_y",String(b.lat));
  const r=await fetch(u,{headers:headers(key),cache:"no-store"}); if(!r.ok)return null; const j=await r.json();
  const sec=Number(j?.routes?.[0]?.properties?.totalTime);return Number.isFinite(sec)?Math.max(1,Math.round(sec/60)):null;
}
async function drive(key:string,a:Point,b:Point){
  const u=new URL("https://apis-navi.kakaomobility.com/v1/directions");
  u.searchParams.set("origin",`${a.lng},${a.lat}`);u.searchParams.set("destination",`${b.lng},${b.lat}`);u.searchParams.set("summary","true");
  const r=await fetch(u,{headers:{...headers(key),"Content-Type":"application/json"},cache:"no-store"}); if(!r.ok)return null; const j=await r.json();
  const sec=Number(j?.routes?.[0]?.summary?.duration);return Number.isFinite(sec)?Math.max(1,Math.round(sec/60)):null;
}
function haversine(a:Point,b:Point){const R=6371,rad=(x:number)=>x*Math.PI/180,dLat=rad(b.lat-a.lat),dLng=rad(b.lng-a.lng);const z=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;return R*2*Math.atan2(Math.sqrt(z),Math.sqrt(1-z));}
export async function POST(req:NextRequest){
  const key=process.env.KAKAO_REST_API_KEY;
  if(!key)return NextResponse.json({configured:false,times:{},message:"KAKAO_REST_API_KEY가 설정되지 않았습니다."});
  const body=await req.json().catch(()=>null);const origin=body?.origin as Point;const venues=(body?.venues||[]).slice(0,16) as VenueReq[];
  if(!origin||!Number.isFinite(origin.lat)||!Number.isFinite(origin.lng))return NextResponse.json({configured:true,times:{},message:"현재 위치가 올바르지 않습니다."},{status:400});
  const entries=await Promise.all(venues.map(async v=>{const dest=await geocodeVenue(key,v);if(!dest)return [v.id,{transitMinutes:null,driveMinutes:null,distanceKm:null}] as const;const [t,d]=await Promise.all([transit(key,origin,dest),drive(key,origin,dest)]);return [v.id,{transitMinutes:t,driveMinutes:d,distanceKm:Number(haversine(origin,dest).toFixed(1))}] as const;}));
  return NextResponse.json({configured:true,times:Object.fromEntries(entries)});
}
