import { fiftyPlusPicks } from "@/lib/dummy-data";

// 50+는 SHOWDAY 전체 사용자 메인 안의 "전문 카테고리"입니다.
// PARENTS TIME(부모 대기 코스)은 ARENA NOW 전용 기능이라 여기서는 다루지 않고,
// /arena 프리뷰 페이지에만 기획으로 남겨둡니다.
export default function ParentsFiftyPlusSection() {
  return (
    <section id="fiftyplus" className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-5">
        <p className="mb-1 text-xs text-muted">50+ · 전문 카테고리</p>
        <h2 className="font-display text-2xl text-paper">
          부모님과, 또는 나를 위한 50+ 공연
        </h2>
      </div>

      <div className="border border-line bg-surface p-6">
        <h3 className="mb-4 font-display text-lg text-paper">50+ 추천 테마</h3>
        <div className="flex flex-wrap gap-2">
          {fiftyPlusPicks.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-brick px-3 py-1 text-xs text-paper"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
