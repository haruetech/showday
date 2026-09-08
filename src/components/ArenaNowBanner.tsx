export default function ArenaNowBanner() {
  return (
    <section id="arena-now" className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-col justify-between gap-6 border border-line bg-surface-raised p-8 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs text-muted">ARENA NOW · 공연 당일 현장 비서</p>
          <h2 className="font-display text-2xl text-paper sm:text-3xl">
            공연 가는 날, 필요한 것부터 먼저
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            주차·교통·먹거리·화장실·입장정보·현장 이슈를 한 화면에서 확인하세요.
            서울아레나 공연 당일의 불편을 줄이는 SHOWDAY 현장 서비스입니다.
          </p>
        </div>
        <a
          href="https://arena.showday.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-sm border border-line px-6 py-3 text-center text-sm text-paper transition-colors hover:border-gold"
        >
          ARENA NOW 열기 →
        </a>
      </div>
    </section>
  );
}
