"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Header mode="guest" onModeChange={() => {}} />
      <main className="mx-auto max-w-[760px] px-6 py-14">
        <p className="text-[11px] font-bold tracking-[.16em] text-gold">SHOWDAY</p>
        <h1 className="mt-2 text-3xl font-black text-paper">개인정보처리방침</h1>
        <p className="mt-2 text-sm text-muted">
          시행일: [ 예: 2026년 O월 O일 ] — 아래는 표준 뼈대이며, 실제 수집·이용 항목에 맞춰 검토·수정 후 게시해주세요.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-paper">
          <section>
            <h2 className="text-base font-black">1. 수집하는 개인정보 항목</h2>
            <p className="mt-2 text-muted">
              카카오 소셜 로그인 시: 닉네임, 프로필 사진, 카카오계정(이메일)
              <br />
              온보딩(추천 설정) 시: 관심 지역, 동행자 유형, 연령대, 선호 요일, 이동 가능 거리, 관심 장르
            </p>
          </section>
          <section>
            <h2 className="text-base font-black">2. 개인정보의 수집 및 이용 목적</h2>
            <p className="mt-2 text-muted">
              회원 식별 및 로그인 유지, 맞춤 공연 추천 제공, 관심 공연 저장·알림 기능 제공을 위해 이용합니다.
            </p>
          </section>
          <section>
            <h2 className="text-base font-black">3. 개인정보의 보유 및 이용 기간</h2>
            <p className="mt-2 text-muted">
              회원 탈퇴 시 또는 카카오 로그인 연동 해제 시까지 보유하며, 관계 법령에 따라 보존이 필요한 경우 해당
              기간 동안 보관합니다.
            </p>
          </section>
          <section>
            <h2 className="text-base font-black">4. 개인정보의 제3자 제공</h2>
            <p className="mt-2 text-muted">
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 예매 버튼을 통해 외부 예매처로
              이동하는 경우, 해당 예매처의 개인정보처리방침이 별도로 적용됩니다.
            </p>
          </section>
          <section>
            <h2 className="text-base font-black">5. 이용자의 권리</h2>
            <p className="mt-2 text-muted">
              이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며, 회원 탈퇴를 통해 개인정보 이용에
              대한 동의를 철회할 수 있습니다.
            </p>
          </section>
          <section>
            <h2 className="text-base font-black">6. 개인정보 보호책임자</h2>
            <p className="mt-2 text-muted">
              성명: [ 담당자명 ] · 연락처: [ 이메일 또는 전화번호 ]
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
