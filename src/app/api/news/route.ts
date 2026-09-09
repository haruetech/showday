import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({ ignoreAttributes:false });
function arr<T>(v:T|T[]|undefined):T[]{ return !v?[]:Array.isArray(v)?v:[v]; }
function cleanTitle(v:string){ return v.replace(/\s+-\s+[^-]+$/,"").trim(); }

export async function GET(){
  try{
    const q=encodeURIComponent('(공연 OR 콘서트 OR 뮤지컬 OR 페스티벌) (티켓 OR 예매 OR 투어 OR 공연발표)');
    const url=`https://news.google.com/rss/search?q=${q}&hl=ko&gl=KR&ceid=KR:ko`;
    const r=await fetch(url,{next:{revalidate:900}});
    if(!r.ok) throw new Error(`news ${r.status}`);
    const xml=await r.text();
    const j=parser.parse(xml);
    const items=arr(j?.rss?.channel?.item).slice(0,9).map((x:any,i:number)=>({
      id:String(x.guid?.["#text"]||x.guid||i),
      title:cleanTitle(String(x.title||"")),
      link:String(x.link||""),
      publishedAt:String(x.pubDate||""),
      source:String(x.source?.["#text"]||x.source||"공연 뉴스"),
    })).filter((x:any)=>x.title&&x.link);
    return NextResponse.json({source:"google-news-rss",items},{headers:{"Cache-Control":"s-maxage=900, stale-while-revalidate=1800"}});
  }catch(e){
    console.error("SHOWDAY NOW news fetch failed",e);
    return NextResponse.json({source:"none",items:[]});
  }
}
