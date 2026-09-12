"use client";
import { ArrowIcon, HeartIcon } from "@/components/common/Icons";
import { Artist, Show } from "@/types/show";
import { signInWithKakao, isAuthConfigured } from "@/lib/auth";

export default function ArtistCard({artist,shows=[],mode,isFollowing,onToggleFollow}:{artist:Artist;shows?:Show[];mode:"guest"|"member";isFollowing?:boolean;onToggleFollow?:(artistId:string)=>void}){
  const nextShow=shows[0];
  const openArtistShows=()=>{if(nextShow){window.location.href=`/show/${encodeURIComponent(nextShow.id)}`;return}window.dispatchEvent(new CustomEvent("showday:search",{detail:{query:artist.name,mode:"artist"}}));document.getElementById("show-search")?.scrollIntoView({behavior:"smooth",block:"start"})};
  const handleHeart=(e:React.MouseEvent)=>{e.stopPropagation();if(mode!=="member"){if(isAuthConfigured)signInWithKakao();else alert("관심 아티스트 저장은 로그인 후 이용할 수 있습니다.");return}onToggleFollow?.(artist.id)};
  return <article className="group relative w-[76vw] max-w-[270px] shrink-0 border-b border-line pb-4 sm:w-[238px] lg:w-[252px]">
    <button type="button" onClick={handleHeart} aria-label={`${artist.name} 관심 저장`} className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/92 text-paper shadow-sm backdrop-blur"><HeartIcon filled={isFollowing} className={`h-4.5 w-4.5 ${isFollowing?"text-gold":"text-paper"}`}/></button>
    <button type="button" onClick={openArtistShows} className="block w-full text-left">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-raised">{nextShow?.posterUrl?<img src={nextShow.posterUrl} alt={`${artist.name} 공연 이미지`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"/>:<div className="flex h-full items-end bg-[linear-gradient(145deg,#c8875e,#7a351d)] p-5"><span className="text-5xl font-black text-white/90">{artist.name.slice(0,1)}</span></div>}<div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/65 to-transparent"/><div className="absolute bottom-3 left-4 text-white"><p className="text-[9px] font-semibold tracking-[.14em] text-white/70">ARTIST</p><h3 className="mt-1 text-xl font-black">{artist.name}</h3></div></div>
      <div className="pt-4"><p className="text-[10px] font-semibold tracking-[.08em] text-gold">{artist.genre}</p>{nextShow?<><p className="mt-2 line-clamp-2 min-h-[40px] text-sm font-bold leading-5 text-paper">{nextShow.title}</p><p className="mt-2 text-xs text-muted">{nextShow.dateLabel}</p><p className="mt-1 line-clamp-1 text-xs text-muted">{nextShow.venue}</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-paper group-hover:text-gold">이 아티스트 공연 보기 <ArrowIcon className="h-3.5 w-3.5"/></span></>:<><p className="mt-2 text-sm text-muted">현재 확인된 예정 공연이 없습니다.</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-paper">공연 알림 받기 <ArrowIcon className="h-3.5 w-3.5"/></span></>}</div>
    </button>
  </article>
}
