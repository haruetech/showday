import Link from 'next/link';
import HomeExperience from '@/components/HomeExperience';
import { shows as fallbackShows, venues, type Show } from '@/lib/data';
import { getKopisShows } from '@/lib/kopis';

function toShow(s: Awaited<ReturnType<typeof getKopisShows>>[number], i: number): Show {
  return {
    id: s.mt20id,
    title: s.prfnm,
    artist: s.genrenm || 'LIVE PERFORMANCE',
    venue: s.fcltynm,
    date: `${s.prfpdfrom} ~ ${s.prfpdto}`,
    time: s.prfstate,
    genre: s.genrenm,
    tags: [s.area, s.prfstate, 'KOPIS'].filter(Boolean),
    tone: ['warm','blue','violet','green'][i % 4],
    poster: s.poster,
  };
}

export default async function Home(){
  let liveShows: Show[] = fallbackShows;
  if (process.env.KOPIS_API_KEY) {
    try {
      const data = await getKopisShows({ rows: 8 });
      if (data.length) liveShows = data.map(toShow);
    } catch (e) {
      console.error('KOPIS home fallback:', e);
    }
  }

  return <main>
    <HomeExperience liveShows={liveShows}/>
    <section className="darkBand"><div><small>MY ARTISTS</small><h2>좋아하는 아티스트의 새 공연을<br/>가장 먼저 만나세요.</h2><p>아티스트 팔로우 + 티켓오픈 + 지역 조건 알림. “서울에서 이문세 공연이 잡히면 알려줘”처럼 자연어 조건도 저장합니다.</p></div><div className="artistBubbles"><span>임영웅 ♡</span><span>이문세 ♡</span><span>박진영 ♡</span><span>+ 아티스트 추가</span></div></section>
    <section className="section"><div className="sectionHead"><div><small>VENUES</small><h2>공연장으로 발견하기</h2></div><Link href="/venues">전체 공연장 →</Link></div><div className="venueGrid">{venues.map((v,i)=><Link key={v} href={i===0?'/arena':'/venues'}><span>0{i+1}</span><b>{v}</b><small>{i===0?'ARENA NOW 전용관':'공연·시설·주변정보'}</small></Link>)}</div></section>
    <section className="arenaFeature"><div className="arenaCopy"><small>FEATURED VENUE</small><h2>ARENA NOW</h2><p>서울아레나 가는 날, 필요한 모든 것.</p><div className="chips"><span>공연</span><span>교통</span><span>주차</span><span>맛집</span><span>부모 기다림</span><span>K-FOOD</span><span>귀가</span></div><Link className="primary" href="/arena">서울아레나 전용관 →</Link></div><div className="arenaArt"><div className="stage"></div><span>SEOUL ARENA · CHANG-DONG</span></div></section>
    <section className="section split"><div><small>BEFORE & AFTER</small><h2>공연 전후까지<br/>SHOWDAY</h2><p>공연 2시간 전 식사, 공연 전 카페, 짐보관부터 공연이 끝난 뒤 막차·야식·숙박까지 공연시간을 기준으로 추천합니다.</p><Link href="/around">AROUND 둘러보기 →</Link></div><div className="timeline"><article><b>17:00</b><span>공연 전 식사</span></article><article><b>18:20</b><span>공연장 이동</span></article><article><b>19:00</b><span>SHOW TIME</span></article><article><b>22:10</b><span>귀가 · 야식 · 숙박</span></article></div></section>
    <section className="parents"><small>PARENTS TIME · 50+</small><h2>아이는 공연 중,<br/>부모의 시간도 특별하게.</h2><p>자녀의 공연시간에 맞춰 강연·문화·식사·산책을 연결합니다. 서울아레나에서 먼저 실증하고 전국 공연장으로 확장합니다.</p><Link href="/50plus">50+ 프로그램 보기 →</Link></section>
  </main>
}
