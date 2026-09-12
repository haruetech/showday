"use client";
import Script from "next/script";

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Channel: {
        addChannel: (opts: { channelPublicId: string }) => void;
      };
    };
  }
}

// SDK 버전은 카카오 개발자문서 다운로드 페이지(https://developers.kakao.com/docs/latest/ko/javascript/download)에서
// 최신 버전으로 주기적으로 갱신해주는 게 좋습니다. integrity 값도 그 페이지의 "Copy Integrity Value" 버튼으로
// 복사해서 아래 script 태그에 integrity="..." crossOrigin="anonymous" 로 추가하면 보안이 한 단계 강화됩니다(선택사항).
const KAKAO_SDK_VERSION = "2.7.1";

export default function KakaoSdk() {
  const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!jsKey) return null; // 키 미설정 시 아무것도 하지 않음 (다른 기능에 영향 없음)

  return (
    <Script
      src={`https://t1.kakaocdn.net/kakao_js_sdk/${KAKAO_SDK_VERSION}/kakao.min.js`}
      strategy="afterInteractive"
      onLoad={() => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          window.Kakao.init(jsKey);
        }
      }}
    />
  );
}
