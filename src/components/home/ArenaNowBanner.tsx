export default function ArenaNowBanner() {
  return (
    <section id="arena-now" className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-col justify-between gap-6 border border-line bg-surface-raised p-8 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[.12em] text-gold">SEOUL ARENA · BY SHOWDAY</p>
          <h2 className="font-display text-2xl font-bold text-paper sm:text-3xl">
            서울아레나 가는 날, 공연 전부터 공연 후까지 더 편하게.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            서울아레나 주변 교통·주차·식사·카페·짐보관·화장실·지역 즐길거리부터 예약·미리주문·픽업까지 연결하는 방문객 서비스를 준비하고 있습니다. 공연 관람객과 창동·도봉 지역상권을 자연스럽게 잇는 것이 목표입니다.
          </p>
        </div>
        <a href="https://arena.showday.kr" target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-full border border-gold/40 px-5 py-2.5 text-center text-xs font-bold text-gold transition hover:bg-gold/10">SEOUL ARENA 보기 →</a>
      </div>
    </section>
  );
}
