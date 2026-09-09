import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24", "aria-hidden": true };
export function SearchIcon(p:P){return <svg {...base} {...p}><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.2 4.2"/></svg>}
export function SparkIcon(p:P){return <svg {...base} {...p}><path d="M12 2.8 13.8 8l5.2 1.8-5.2 1.8L12 17l-1.8-5.4L5 9.8 10.2 8 12 2.8Z"/><path d="m18.2 15 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"/></svg>}
export function CalendarIcon(p:P){return <svg {...base} {...p}><rect x="3.5" y="5.5" width="17" height="15" rx="2.5"/><path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17"/></svg>}
export function PinIcon(p:P){return <svg {...base} {...p}><path d="M20 10c0 5.2-8 11-8 11S4 15.2 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.4"/></svg>}
export function TicketIcon(p:P){return <svg {...base} {...p}><path d="M4 7.5h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4v-3Z"/><path d="M12 8.5v2M12 13.5v2"/></svg>}
export function TrendIcon(p:P){return <svg {...base} {...p}><path d="m4 17 5-5 3 3 7-8"/><path d="M14 7h5v5"/></svg>}
export function HeartIcon({filled=false,...p}:P&{filled?:boolean}){return <svg {...base} {...p} fill={filled?"currentColor":"none"}><path d="M20.5 9.2c0 5-8.5 10.1-8.5 10.1S3.5 14.2 3.5 9.2A4.5 4.5 0 0 1 12 7.1a4.5 4.5 0 0 1 8.5 2.1Z"/></svg>}
export function BellIcon(p:P){return <svg {...base} {...p}><path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 6 2.2 6.5 2.2 6.5H4.3S6.5 16 6.5 10Z"/><path d="M10 19.5h4"/></svg>}
export function ArrowIcon(p:P){return <svg {...base} {...p}><path d="M5 12h14M14 7l5 5-5 5"/></svg>}
export function BrainIcon(p:P){return <svg {...base} {...p}><path d="M9.5 5.2A3 3 0 0 0 4.8 8a3.2 3.2 0 0 0 .3 6 3.1 3.1 0 0 0 4.4 4.2V5.2ZM14.5 5.2A3 3 0 0 1 19.2 8a3.2 3.2 0 0 1-.3 6 3.1 3.1 0 0 1-4.4 4.2V5.2Z"/><path d="M7 10h2.5M14.5 10H17M7.5 15h2M14.5 15h2"/></svg>}
export function WellnessIcon(p:P){return <svg {...base} {...p}><path d="M12 20c-4-2.7-6.7-5.6-6.7-9.1a3.9 3.9 0 0 1 6.7-2.7 3.9 3.9 0 0 1 6.7 2.7C18.7 14.4 16 17.3 12 20Z"/><path d="M7.5 13h2l1.1-2.3 2.1 4.5 1.2-2.2h2.6"/></svg>}
export function WalkIcon(p:P){return <svg {...base} {...p}><circle cx="13.5" cy="4.5" r="2"/><path d="m11 8-2 5 3 2 1.5 5M11 8l4 3 3-1M9 13l-4 5M12 15l4 1"/></svg>}
export function PlayIcon(p:P){return <svg {...base} {...p}><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4V8Z"/></svg>}
