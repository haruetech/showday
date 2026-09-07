import Link from "next/link";

// ARENA NOW — 개발 보류 상태의 프리뷰 페이지.
// 기획(PARENTS TIME, AROUND, 짐보관, 귀가, K-Food)은 보존하되,
// 서울아레나 제휴가 구체화되기 전까지는 라우트와 메뉴만 유지합니다.
// SHOWDAY 본체(공연장 데이터, 추천 등)와는 독립적으로 개발합니다.

const plannedFeatures = [
  { title: "TODAY AT ARENA", desc: "오늘 서울아레나 공연 정보와 입장 시간을 한눈에" },
  { title: "PARENTS TIME", desc: "자녀 공연 관람 중 부모를 위한 2~3시간 코스" },
  { title: "AROUND ARENA", desc: "공연 시간 기준 식사·카페·짐보관 추천" },
  { title: "AFTER SHOW", desc: "막차·주차장 출차·귀가 안내" },
];

export default function ArenaNowPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <span className="rounded-full border border-gold px-3 py-1 text-xs text-gold">
        서울아레나 제휴 준비 중
      </span>

      <h1 className="font-display text-3xl text-paper sm:text-4xl">
        ARENA NOW
        <br />
        서울아레나 가는 날의 현장비서
      </h1>

      <p className="max-w-md text-sm text-muted">
        서울아레나와 함께할 새로운 공연 경험을 준비하고 있습니다. SHOWDAY는
        먼저 SHOWDAY 본체 서비스를 완성한 뒤, 제휴가 구체화되는 시점에 이
        페이지를 새로운 디자인으로 열 예정입니다. 아래 기능들은 기획을
        보존한 상태로 개발을 준비하고 있습니다.
      </p>

      <div className="grid w-full gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
        {plannedFeatures.map((f) => (
          <div key={f.title} className="bg-surface p-5 text-left">
            <p className="mb-1 text-xs text-gold">{f.title}</p>
            <p className="text-sm text-muted">{f.desc}</p>
          </div>
        ))}
      </div>

      <Link
        href="/"
        className="rounded-sm border border-line px-6 py-3 text-sm text-paper transition-colors hover:border-gold"
      >
        SHOWDAY 메인으로 돌아가기
      </Link>
    </main>
  );
}
