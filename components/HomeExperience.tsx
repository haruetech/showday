'use client';
import { useState } from 'react';
import Link from 'next/link';
import ShowCard from './ShowCard';
import type { Show } from '@/lib/data';

export default function HomeExperience({ liveShows }: { liveShows: Show[] }) {
  const [personalized, setPersonalized] = useState(false);
  const visible = personalized ? liveShows.slice(0, 4) : liveShows.slice(0, 3);

  return <>
    <div className="demoToggle" role="group" aria-label="메인 상태 전환">
      <span>DEMO VIEW</span>
      <button className={!personalized ? 'active' : ''} onClick={() => setPersonalized(false)}>비로그인</button>
      <button className={personalized ? 'active' : ''} onClick={() => setPersonalized(true)}>개인화</button>
    </div>

    <section className="hero">
      <div className="eyebrow">AI PERFORMANCE DISCOVERY · KOPIS CONNECTED</div>
      <h1>{personalized ? <>준호님을 위한<br/><strong>오늘의 SHOWDAY.</strong></> : <>공연을 찾지 마세요.<br/><strong>SHOWDAY가 찾아드릴게요.</strong></>}</h1>
      <p>{personalized ? '관심 아티스트, 위치, 주말 선호, 가족 관람 취향을 바탕으로 추천합니다.' : '아티스트, 취향, 위치, 시간, 동반자를 이해하고 나에게 맞는 공연과 공연 가는 하루를 연결합니다.'}</p>
      <div className="aiSearch"><span>✦</span><input aria-label="AI 공연 검색" placeholder="이번 주말 아내와 서울에서 볼 공연 추천해줘"/><button>AI 추천</button></div>
      <div className="quick"><button>오늘 공연</button><button>이번 주말</button><button>내 주변</button><button>부모님과</button></div>
    </section>

    {personalized && <section className="personalStrip">
      <article><small>MY ARTIST</small><b>이문세 · 임영웅</b><span>새 공연 2건</span></article>
      <article><small>NEAR YOU</small><b>서울 · 60분 이내</b><span>추천 18건</span></article>
      <article><small>WITH FAMILY</small><b>부부 · 부모님</b><span>주말 추천 보기</span></article>
      <article><small>AI ALERT</small><b>조건 알림 3개</b><span>토요일 · 10만원 이하</span></article>
    </section>}

    <section className="section"><div className="sectionHead"><div><small>{personalized ? 'FOR YOU · LIVE DATA' : 'TODAY · LIVE DATA'}</small><h2>{personalized ? '당신을 위한 공연' : '지금 만날 수 있는 공연'}</h2></div><Link href="/my">취향 설정 →</Link></div><div className="cardGrid">{visible.map(s=><ShowCard key={s.id} show={s}/>)}</div></section>
  </>;
}
