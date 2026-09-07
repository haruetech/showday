import { redirect } from "next/navigation";

// ARENA NOW는 별도 저장소/배포(arena-now)로 완전히 분리되어
// arena.showday.kr에서 서비스됩니다. 이 경로는 안내 페이지 없이
// 곧바로 그쪽으로 넘깁니다.
export default function ArenaRedirectPage() {
  redirect("https://arena.showday.kr");
}
