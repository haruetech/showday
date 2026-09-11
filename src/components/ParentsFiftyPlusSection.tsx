import { ArrowIcon, BrainIcon, PlayIcon, WalkIcon, WellnessIcon } from "@/components/Icons";

const services = [
  { icon:WellnessIcon, title:"힐링 · 마음 휴식", desc:"5~15분 음악·호흡·명상처럼 바로 이용할 수 있는 짧은 휴식 콘텐츠", badge:"WELLNESS" },
  { icon:BrainIcon, title:"뇌 휴식 · 인지 콘텐츠", desc:"집중과 이완을 돕는 음악·영상·가벼운 두뇌활동 콘텐츠", badge:"BRAIN REST" },
  { icon:WalkIcon, title:"발 건강 · 걷기", desc:"공연·외출 전후에 활용하는 스트레칭, 보행, 발 관리 정보", badge:"FOOT & WALK" },
  { icon:PlayIcon, title:"50+ AI 생활", desc:"AI 배우기, 취미, 문화생활을 짧고 쉽게 시작하는 생활 콘텐츠", badge:"AI LIFE" },
];

export default function ParentsFiftyPlusSection(){return <section id="fiftyplus" className="mx-auto w-full max-w-[1280px] px-6 py-14">
  <div className="border-t border-line pt-9">
    <div className="grid gap-7 lg:grid-cols-[.75fr_1.25fr]">
      <div
        className="relative max-w-md overflow-hidden rounded-2xl px-6 py-8"
        style={{backgroundImage:"url(/healing-bg.svg)",backgroundSize:"cover",backgroundPosition:"center"}}
      >
        <p className="text-[11px] font-semibold tracking-[.18em] text-gold">SHOWDAY 50+ LIFE</p>
        <h2 className="mt-3 text-[clamp(1.3rem,2.6vw,1.875rem)] font-black leading-tight text-paper">공연을 넘어, 좋은 하루를 위한 콘텐츠</h2>
        <p className="mt-4 text-sm leading-7 text-muted">힐링·뇌 휴식·발 건강·AI 생활 콘텐츠를 순차적으로 준비하고 있습니다.</p>
      </div>
      <div className="grid border-t border-line sm:grid-cols-2 lg:border-t-0 lg:grid-cols-2">{services.map((s,i)=>{const Icon=s.icon;return <article key={s.title} className={`group border-b border-line py-5 sm:px-5 ${i%2===0?"sm:border-r":""} lg:py-6`}><div className="flex items-start gap-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-gold"><Icon className="h-5 w-5"/></div><div><span className="text-[10px] font-semibold tracking-[.12em] text-muted">{s.badge}</span><h3 className="mt-1.5 text-lg font-black text-paper">{s.title}</h3><p className="mt-2 text-xs leading-6 text-muted">{s.desc}</p><span className="mt-3 inline-flex items-center rounded-full border border-line px-3 py-1.5 text-[11px] font-semibold text-muted">콘텐츠 제작 중</span></div></div></article>})}</div>
    </div>
  </div>
</section>}
