"use client";

const items = [
  {
    eyebrow: "POPULAR NOW",
    title: "지금 많이 보는 공연",
    body: "KOPIS 공연 데이터와 SHOWDAY 이용 흐름을 나눠 보고, 실제 관심이 모이는 공연을 발견합니다.",
    chips: ["콘서트", "뮤지컬", "이번 주"],
    target: "today-shows",
    icon: "↗",
  },
  {
    eyebrow: "BY GENERATION",
    title: "세대별 공연 발견",
    body: "20·30·40·50+처럼 세대별로 시작하되, 나이만으로 단정하지 않고 취향과 동행 조건을 함께 봅니다.",
    chips: ["20·30", "40대", "50+"],
    target: "fiftyplus",
    icon: "◎",
  },
  {
    eyebrow: "WISH LIST",
    title: "보고 싶은 공연",
    body: "‘이 아티스트를 무대에서 보고 싶어요’를 모아 SHOWDAY만의 공연 수요 데이터로 축적합니다.",
    chips: ["부모님과", "우리 동네", "보고 싶어요 ♡"],
    target: "wanted-artists",
    icon: "♡",
  },
  {
    eyebrow: "SHOW TALK",
    title: "이번 주 공연 이야기",
    body: "티켓 오픈·추가 회차·내한·지역축제 등 공연을 고를 때 알아두면 좋은 소식을 한곳에서 봅니다.",
    chips: ["티켓 오픈", "내한", "지역 공연"],
    target: "upcoming-shows",
    icon: "✦",
  },
];

export default function DiscoverSection() {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12" id="discover">
      <div className="mb-6 max-w-3xl">
        <p className="mb-2 text-xs font-bold tracking-[0.18em] text-gold">DISCOVER SHOWDAY</p>
        <h2 className="font-display text-3xl font-black text-paper sm:text-4xl">공연을 찾는 것에서, 공연을 발견하는 곳으로</h2>
        <p className="mt-3 text-sm leading-6 text-muted">단순 공연 목록보다 지금 사람들의 관심, 세대별 취향, 보고 싶은 무대와 이번 주 이야기를 함께 보여드립니다.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <button key={item.title} type="button" onClick={() => go(item.target)} className="group min-h-60 rounded-md border border-line bg-surface p-5 text-left transition hover:-translate-y-0.5 hover:border-gold/70">
            <div className="flex items-start justify-between gap-4">
              <p className="text-[10px] font-bold tracking-[0.14em] text-muted">{item.eyebrow}</p>
              <span className="text-xl text-gold">{item.icon}</span>
            </div>
            <h3 className="mt-7 font-display text-xl font-bold text-paper">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{item.body}</p>
            <div className="mt-5 flex flex-wrap gap-1.5">{item.chips.map((chip) => <span key={chip} className="rounded-full border border-line px-2.5 py-1 text-[10px] text-paper">{chip}</span>)}</div>
            <p className="mt-5 text-xs font-bold text-gold">살펴보기 →</p>
          </button>
        ))}
      </div>
    </section>
  );
}
