/**
 * 예매처 제휴 링크 관리
 * ------------------------------------------------------------
 * 지금은 어떤 예매처와도 제휴(CPS/CPA) 계약이 없어서 원본 링크를 그대로 씁니다.
 * 나중에 인터파크·NOL·예스24·멜론티켓·티켓링크 등과 제휴가 성사되면,
 * 컴포넌트 코드는 건드릴 필요 없이 아래 PLATFORMS에 한 줄만 추가하면
 * 사이트 전체(공연 상세페이지 "예매처에서 좌석·가격 확인" 버튼 등)에 바로 적용됩니다.
 *
 * 예시) 인터파크와 제휴 성사 시:
 *   interpark: {
 *     label: "인터파크",
 *     domains: ["ticket.interpark.com", "tickets.interpark.com"],
 *     wrap: (url) => `https://interpark.some-affiliate-network.com/click?aid=SHOWDAY123&url=${encodeURIComponent(url)}`,
 *   }
 */

type Platform = {
  label: string;
  domains: string[];
  /** 원본 예매 URL을 제휴 추적 URL로 바꿔주는 함수. 제휴 전에는 항상 원본 그대로 반환. */
  wrap: (url: string) => string;
};

const identity = (url: string) => url;

export const PLATFORMS: Record<string, Platform> = {
  interpark: { label: "인터파크", domains: ["interpark.com", "tickets.interpark.com", "ticket.interpark.com"], wrap: identity },
  yes24: { label: "예스24 공연", domains: ["ticket.yes24.com"], wrap: identity },
  melon: { label: "멜론티켓", domains: ["ticket.melon.com", "tickets.melon.com"], wrap: identity },
  ticketlink: { label: "티켓링크", domains: ["ticketlink.co.kr"], wrap: identity },
  nol: { label: "NOL 티켓", domains: ["nol.nolticket.com", "nolticket.com"], wrap: identity },
};

/** URL의 도메인으로 어느 예매처인지 찾는다. 매칭되는 곳이 없으면 null. */
export function detectPlatform(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    for (const [key, platform] of Object.entries(PLATFORMS)) {
      if (platform.domains.some((d) => host === d || host.endsWith(`.${d}`))) return key;
    }
  } catch {
    // URL 파싱 실패(상대경로 등)는 매칭 없음으로 처리
  }
  return null;
}

/**
 * 예매 버튼에 실제로 쓸 최종 링크를 만든다.
 * 제휴가 잡힌 예매처면 자동으로 추적 URL로 바뀌고, 아니면 원본 그대로 나간다.
 * 컴포넌트에서는 이 함수만 부르면 되고, 나중에 제휴가 늘어나도 호출부는 수정할 필요가 없다.
 */
export function toBookingLink(url: string | undefined): { href: string; platform: string | null } {
  if (!url) return { href: "", platform: null };
  const platform = detectPlatform(url);
  const href = platform ? PLATFORMS[platform].wrap(url) : url;
  return { href, platform };
}
