export default function Footer() {
  return (
    <footer className="border-t border-line py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-6 text-xs text-muted">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display font-bold text-sm text-paper">SHOWDAY — 하루애</p>
            <p className="mt-1">공연을 찾게 하지 않고, 지금 볼 만한 선택지를 먼저 보여드립니다.</p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <a href="/terms" className="hover:text-paper">이용약관</a>
            <a href="/privacy" className="font-semibold text-paper hover:text-gold">개인정보처리방침</a>
          </div>
        </div>

        <div className="border-t border-line pt-4 leading-6">
          {/* TODO: 아래 [ ] 안 내용을 실제 사업자 정보로 채워주세요. 이 파일(src/components/Footer.tsx)에서 직접 수정하시면 됩니다. */}
          <p>
            상호명 [ 예: ㈜미니멈 ] · 대표 [ 대표자명 ] · 사업자등록번호 [ 000-00-00000 ]
            <br className="sm:hidden" /> 통신판매업신고 [ 제0000-서울OO-00000호 ] · 주소 [ 사업장 주소 ]
          </p>
          <p className="mt-1">
            고객센터 [ 이메일 또는 전화번호 ] · 사업자등록번호는{" "}
            <a href="https://www.ftc.go.kr/bizCommPop.do" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-paper">
              공정거래위원회 사업자정보확인
            </a>
            에서 조회하실 수 있습니다.
          </p>
          <p className="mt-3 text-[11px] text-muted/70">공연 데이터 제공: 공연예술통합전산망(KOPIS)</p>
          <p className="mt-1 text-[11px] text-muted/70">© {new Date().getFullYear()} 하루애. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
