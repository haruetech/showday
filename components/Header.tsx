import Link from 'next/link';
export default function Header(){
 const nav=[['공연','/shows'],['아티스트','/artists'],['공연장','/venues'],['AROUND','/around'],['50+','/50plus'],['ARENA NOW','/arena']];
 return <header className="header"><Link className="logo" href="/">SHOWDAY<span>•</span></Link><nav>{nav.map(([n,h])=><Link key={h} href={h}>{n}</Link>)}</nav><Link className="my" href="/my">MY SHOWDAY</Link></header>
}
