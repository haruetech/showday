export default function ArenaNowBanner() {
  return (
    <section id="arena-now" className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-col justify-between gap-6 border border-line bg-surface-raised p-8 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs text-muted">COMING · 서울아레나 제휴 준비 중</p>
          <h2 className="font-display text-2xl text-paper sm:text-3xl">
            ARENA NOW
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted">
            서울아레나 개관(2027년 예정)에 맞춰 준비 중인 현장 안내 서비스입니다.
            지금은 기획만 공개되어 있어요.
          </p>
        </div>
        <a
          href="/arena"
          className="shrink-0 rounded-sm border border-line px-6 py-3 text-center text-sm text-paper transition-colors hover:border-gold"
        >
          기획 미리보기
        </a>
      </div>
    </section>
  );
}
