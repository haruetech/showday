const services = [
  { icon:"🧘", title:"힐링 · 마음 휴식", desc:"명상, 음악, 가벼운 호흡과 휴식 콘텐츠를 공연·문화와 연결합니다.", badge:"HEALING" },
  { icon:"🧠", title:"뇌 휴식 · 인지 콘텐츠", desc:"집중과 이완을 돕는 짧은 음악·영상·두뇌활동 콘텐츠를 큐레이션합니다.", badge:"BRAIN REST" },
  { icon:"🦶", title:"발 건강 · 걷기", desc:"공연이나 외출 전후에 활용할 수 있는 발 건강, 스트레칭, 걷기 정보를 제공합니다.", badge:"FOOT CARE" },
  { icon:"✨", title:"50+ AI 생활", desc:"AI 배우기, 취미, 문화생활처럼 바로 참여 가능한 50+ 라이프 콘텐츠를 소개합니다.", badge:"AI LIFE" },
];

export default function ParentsFiftyPlusSection() {
  return <section id="fiftyplus" className="mx-auto w-full max-w-6xl px-6 py-12">
    <div className="rounded-2xl border border-line bg-surface p-6 lg:p-8">
      <div className="mb-6 max-w-2xl"><p className="text-xs font-bold tracking-[.18em] text-gold">SHOWDAY 50+ LIFE & CULTURE</p><h2 className="mt-2 text-3xl font-black text-paper">공연을 넘어, 50+의 좋은 하루로</h2><p className="mt-3 text-sm leading-7 text-muted">당장 운영 가능한 힐링·뇌 휴식·발 건강·AI 생활 콘텐츠부터 시작해 SHOWDAY만의 50+ 문화 영역으로 확장합니다.</p></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{services.map(s=><article key={s.title} className="rounded-xl border border-line bg-ink/55 p-5"><div className="text-3xl">{s.icon}</div><span className="mt-4 inline-block text-[10px] font-bold text-gold">{s.badge}</span><h3 className="mt-2 text-lg font-black text-paper">{s.title}</h3><p className="mt-2 text-xs leading-6 text-muted">{s.desc}</p><button className="mt-4 text-xs font-bold text-gold">콘텐츠 보기 →</button></article>)}</div>
    </div>
  </section>;
}
