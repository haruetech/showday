export default function ArenaNowBanner() {
  return (
    <section id="arena-now" className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-col justify-between gap-6 border border-line bg-surface-raised p-8 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs text-muted">ARENA NOW · 별도 서비스</p>
          <h2 className="font-display text-2xl text-paper sm:text-3xl">
            ARENA NOW
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted">
            SHOWDAY와는 다른 디자인으로 arena.showday.kr에서 별도로
            서비스됩니다. 서울아레나와 함께할 새로운 공연 경험을 준비하고
            있습니다.
          </p>
        </div>
        <a
          href="https://arena.showday.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-sm border border-line px-6 py-3 text-center text-sm text-paper transition-colors hover:border-gold"
        >
          arena.showday.kr 보러가기
        </a>
      </div>
    </section>
  );
}
