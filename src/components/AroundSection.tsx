const timeline = [
  { time: "공연 2시간 전", label: "빨리 먹을 수 있는 맛집" },
  { time: "공연 1시간 전", label: "가까운 카페" },
  { time: "공연 종료 22:00", label: "늦게까지 영업하는 식당" },
  { time: "지방에서 방문", label: "공연장 근처 숙박" },
];

export default function AroundSection() {
  return (
    <section id="around" className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-5">
        <p className="mb-1 text-xs text-muted">AROUND</p>
        <h2 className="font-display text-2xl text-paper">
          공연 시간을 기준으로 주변을 추천합니다
        </h2>
      </div>

      <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-4">
        {timeline.map((t) => (
          <div key={t.label} className="bg-surface p-5">
            <p className="mb-2 text-xs text-gold">{t.time}</p>
            <p className="text-sm text-paper">{t.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
