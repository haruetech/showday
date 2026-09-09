export default function ShowdayTrends(){
  const cards=[
    ["지금 많이 보는 공연","현재 관심이 모이는 공연을 빠르게 살펴보세요.","🔥 TREND"],
    ["이번 주말 뭐 볼까?","주말에 바로 갈 수 있는 공연을 장르별로 발견해보세요.","📅 WEEKEND"],
    ["티켓 오픈 · 곧 시작","예매를 놓치기 쉬운 공연과 새로 시작하는 공연을 확인하세요.","🎫 OPEN"],
    ["공연으로 만나고 싶은 아티스트","아직 일정이 없어도 보고 싶은 아티스트를 관심 목록에 담아보세요.","💜 WANT TO SEE"],
  ];
  return <section id="discover" className="mx-auto max-w-[1440px] px-6 py-10"><div className="mb-5"><p className="text-xs font-bold tracking-[.18em] text-gold">DISCOVER</p><h2 className="mt-2 text-2xl font-black text-paper">취향대로 공연 발견하기</h2><p className="mt-2 text-sm text-muted">전체 공연을 나열하기보다 지금 선택에 도움이 되는 공연부터 보여드립니다.</p></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{cards.map(([t,d,k])=><article key={t} className="rounded-md border border-line bg-surface p-5 transition-colors hover:border-gold"><span className="text-[10px] font-bold text-gold">{k}</span><h3 className="mt-3 text-lg font-bold text-paper">{t}</h3><p className="mt-2 text-sm leading-6 text-muted">{d}</p></article>)}</div></section>
}
