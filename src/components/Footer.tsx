export default function Footer() {
  return (
    <footer className="border-t border-line py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 text-xs text-muted sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-sm text-paper">SHOWDAY — 하루애</p>
          <p className="mt-1">공연을 찾게 하지 않고, 지금 볼 만한 선택지를 먼저 보여드립니다.</p>
        </div>
        <p>공연 데이터 제공: 공연예술통합전산망(KOPIS)</p>
      </div>
    </footer>
  );
}
