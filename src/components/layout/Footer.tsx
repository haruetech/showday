"use client";
import { useEffect, useState } from "react";
import KakaoChannelButton from "@/components/kakao/KakaoChannelButton";
import KakaoChannelQr from "@/components/kakao/KakaoChannelQr";

type BusinessInfo = {
  business_name?: string; ceo_name?: string; business_reg_no?: string;
  mail_order_no?: string; address?: string; support_contact?: string;
};

const LINK_GROUPS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "서비스",
    links: [
      { label: "공연 찾기", href: "/#show-search" },
      { label: "내 주변 공연·행사", href: "/my-area" },
      { label: "MY SHOWDAY", href: "/my" },
    ],
  },
  {
    title: "이용 정보",
    links: [
      { label: "이용약관", href: "/terms" },
      { label: "개인정보처리방침", href: "/privacy" },
    ],
  },
];

export default function Footer() {
  const [biz, setBiz] = useState<BusinessInfo>({});

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setBiz).catch(() => {});
  }, []);

  const has = biz.business_name || biz.ceo_name || biz.business_reg_no;

  return (
    <footer className="border-t border-line py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 text-xs text-muted">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-display font-bold text-sm text-paper">SHOWDAY — 하루애</p>
            <p className="mt-2 leading-6">공연을 찾게 하지 않고, 지금 볼 만한 선택지를 먼저 보여드립니다.</p>
            <div className="mt-4 flex items-center gap-2">
              <KakaoChannelButton />
              <KakaoChannelQr />
            </div>
          </div>

          {LINK_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-[11px] font-black tracking-[.08em] text-paper">{group.title}</p>
              <ul className="mt-3 space-y-2">
                {group.links.map((l) => (
                  <li key={l.href}><a href={l.href} className="hover:text-gold">{l.label}</a></li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-[11px] font-black tracking-[.08em] text-paper">제휴 · 비즈니스</p>
            <ul className="mt-3 space-y-2">
              <li><a href="/register" className="hover:text-gold">공연 등록 (주최·기획사)</a></li>
              <li><a href="/partnership" className="hover:text-gold">제휴·광고 문의</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-line pt-4 leading-6">
          {/* 사업자 정보 미입력 시 아래 안내 문구가 고객에게 그대로 노출됩니다. /admin/business 에서 입력해주세요. */}
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
              사업자 정보 등록 준비 중입니다.
            </p>
          )}
          <p className="mt-3 text-[11px] text-muted/70">공연 데이터 제공: 공연예술통합전산망(KOPIS)</p>
          <p className="mt-1 text-[11px] text-muted/70">© {new Date().getFullYear()} 하루애. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
