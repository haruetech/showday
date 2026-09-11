"use client";
import { useEffect, useState } from "react";
import KakaoChannelButton from "@/components/KakaoChannelButton";

type BusinessInfo = {
  business_name?: string; ceo_name?: string; business_reg_no?: string;
  mail_order_no?: string; address?: string; support_contact?: string;
};

export default function Footer() {
  const [biz, setBiz] = useState<BusinessInfo>({});

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setBiz).catch(() => {});
  }, []);

  const has = biz.business_name || biz.ceo_name || biz.business_reg_no;

  return (
    <footer className="border-t border-line py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-6 text-xs text-muted">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display font-bold text-sm text-paper">SHOWDAY — 하루애</p>
            <p className="mt-1">공연을 찾게 하지 않고, 지금 볼 만한 선택지를 먼저 보여드립니다.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a href="/terms" className="hover:text-paper">이용약관</a>
            <a href="/privacy" className="font-semibold text-paper hover:text-gold">개인정보처리방침</a>
            <KakaoChannelButton />
          </div>
        </div>

        <div className="border-t border-line pt-4 leading-6">
          {has ? (
            <>
              <p>
                상호명 {biz.business_name || "-"} · 대표 {biz.ceo_name || "-"} · 사업자등록번호 {biz.business_reg_no || "-"}
                {biz.mail_order_no && <> <br className="sm:hidden" /> 통신판매업신고 {biz.mail_order_no}</>}
                {biz.address && <> · 주소 {biz.address}</>}
              </p>
              {biz.support_contact && (
                <p className="mt-1">
                  고객센터 {biz.support_contact} · 사업자등록번호는{" "}
                  <a href="https://www.ftc.go.kr/bizCommPop.do" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-paper">
                    공정거래위원회 사업자정보확인
                  </a>
                  에서 조회하실 수 있습니다.
                </p>
              )}
            </>
          ) : (
            <p className="text-muted/70">
              사업자 정보 준비 중입니다. (관리자 화면 &quot;사업자 정보&quot;에서 입력하면 여기 표시됩니다.)
            </p>
          )}
          <p className="mt-3 text-[11px] text-muted/70">공연 데이터 제공: 공연예술통합전산망(KOPIS)</p>
          <p className="mt-1 text-[11px] text-muted/70">© {new Date().getFullYear()} 하루애. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
