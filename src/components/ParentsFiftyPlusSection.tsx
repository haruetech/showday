"use client";

import { signInWithKakao, isAuthConfigured } from "@/lib/auth";
import { fiftyPlusPicks } from "@/lib/dummy-data";

const services = [
  {
    no: "01",
    title: "카카오 기반 50+ 관람비서",
    desc: "앱 설치가 부담스러운 이용자에게 이번 주 볼만한 공연, 준비사항, 공연 당일 알림을 카카오 중심으로 연결합니다.",
    badge: "톡 중심",
  },
  {
    no: "02",
    title: "공연 동행 · 함께 가기",
    desc: "혼자 관람이 부담스러운 50+ 이용자를 위해 이동·식사·귀가까지 고려한 신뢰형 동행 서비스를 기획합니다.",
    badge: "안심 동행",
  },
  {
    no: "03",
    title: "복지관·데이케어 단체관람",
    desc: "버스, 좌석, 식사, 화장실 동선, 안전 대응을 묶어 기관이 공연 나들이를 쉽게 준비할 수 있는 B2B 패키지입니다.",
    badge: "B2B",
  },
  {
    no: "04",
    title: "공연 후 회복 라운지",
    desc: "공연 후 바로 귀가하기 힘든 이용자에게 가까운 카페·휴식공간 등 잠깐 쉬었다 갈 장소를 연결합니다.",
    badge: "AFTER SHOW",
  },
];

export default function ParentsFiftyPlusSection() {
  return (
    <section id="fiftyplus" className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.18em] text-gold">SHOWDAY 50+</p>
          <h2 className="font-display text-3xl leading-snug text-paper">부모님과, 또는<br />나를 위한 50+ 공연</h2>
          <p className="mt-4 text-sm leading-7 text-muted">대형 콘서트만 보여주지 않습니다. 클래식·연극·뮤지컬·강연·지역문화공연까지 취향과 이동 편의에 맞춰 고르는 전문 카테고리입니다.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {fiftyPlusPicks.map((tag) => <span key={tag} className="rounded-full border border-line px-3 py-1 text-xs text-paper">{tag}</span>)}
          </div>
          {isAuthConfigured && (
            <button onClick={signInWithKakao} className="mt-6 rounded-full bg-[#FEE500] px-5 py-2.5 text-xs font-bold text-[#191600]">카카오로 50+ 추천 받기 →</button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((s) => (
            <article key={s.no} className="rounded-md border border-line bg-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-gold">{s.no}</span>
                <span className="rounded-full border border-line px-2 py-1 text-[10px] text-muted">{s.badge}</span>
              </div>
              <h3 className="mt-4 font-display text-lg text-paper">{s.title}</h3>
              <p className="mt-2 text-xs leading-6 text-muted">{s.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
