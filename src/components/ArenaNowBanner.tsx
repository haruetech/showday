export default function ArenaNowBanner() {
  return (
    <section id="arena-now" className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-col justify-between gap-6 border border-line bg-surface-raised p-8 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[.12em] text-gold">ARENA NOW · COMING SOON</p>
          <h2 className="font-display text-2xl font-bold text-paper sm:text-3xl">
            공연장이 완성되는 동안, 새로운 공연 경험도 준비하고 있습니다.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            서울아레나 개장과 함께 공연 전 이동·주차부터 현장 편의, 입장, 공연 후 귀가까지 연결하는 ARENA NOW를 준비하고 있습니다.
            공연 가는 하루를 더 편리하게 만드는 SHOWDAY의 현장 서비스를 순차적으로 선보일 예정입니다.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-gold/40 px-5 py-2.5 text-center text-xs font-bold text-gold">서비스 준비 중</span>
      </div>
    </section>
  );
}
