import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
export const metadata: Metadata={ title:'SHOWDAY — 나에게 맞는 공연을 먼저', description:'AI 기반 공연 발견·추천·공연장 라이프 플랫폼' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body><Header/>{children}<footer><b>SHOWDAY</b><span>공연을 찾고, 가고, 즐기는 하루.</span><small>SHOWDAY는 각 공연장·예매처의 공식 서비스가 아닌 독립 공연 라이프 플랫폼입니다.</small></footer></body></html>}
