export default function ShowdayNow(){
  const items=[
    {k:"PERFORMANCE",t:"오늘의 공연 흐름",d:"새로 시작하거나 관심이 모이는 공연을 짧게 정리합니다."},
    {k:"TICKET",t:"티켓 오픈 체크",d:"예매 일정과 놓치기 쉬운 오픈 정보를 한눈에 확인합니다."},
    {k:"ARTIST",t:"아티스트 소식",d:"새 공연 발표·투어·공연 관련 소식을 선별해 보여줍니다."},
  ];
  return <section className="mx-auto max-w-6xl px-6 py-12"><div className="mb-6"><p className="text-xs font-bold tracking-[.18em] text-gold">SHOWDAY NOW</p><h2 className="mt-2 text-3xl font-black text-paper">공연을 고르는 데 필요한 소식만</h2><p className="mt-2 text-sm text-muted">뉴스를 많이 보여주기보다 공연 선택과 예매에 직접 도움이 되는 정보만 큐레이션하는 영역입니다.</p></div><div className="grid gap-3 md:grid-cols-3">{items.map(i=><article key={i.k} className="rounded-xl border border-line bg-surface p-5"><span className="text-[10px] font-bold text-gold">{i.k}</span><h3 className="mt-3 text-lg font-black text-paper">{i.t}</h3><p className="mt-2 text-sm leading-6 text-muted">{i.d}</p><span className="mt-4 inline-block text-xs font-bold text-gold">최신 소식 보기 →</span></article>)}</div></section>
}
