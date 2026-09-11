"use client";
import { useState } from "react";

export default function AdminLoginForm(){
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();
    setLoading(true);setError("");
    try{
      const res=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});
      const data=await res.json();
      if(!res.ok||!data.ok){setError(data.message||"로그인에 실패했습니다.");setLoading(false);return}
      window.location.reload();
    }catch{
      setError("네트워크 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1c130b] to-[#3d2a17] px-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.04] p-9 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#e8a353] to-[#b3742f] text-lg font-black text-[#1c130b]">S</div>
          <div>
            <p className="text-base font-black text-white">SHOWDAY</p>
            <p className="text-[10px] font-semibold tracking-[.2em] text-[#c9a877]">ADMIN CONSOLE</p>
          </div>
        </div>
        <h1 className="mt-7 text-lg font-black text-white">관리자 로그인</h1>
        <p className="mt-1 text-xs text-[#c9a877]">SHOWDAY 운영진 전용 페이지입니다.</p>
        <input
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          placeholder="관리자 비밀번호"
          autoFocus
          className="mt-6 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-sm text-white placeholder:text-[#8a7360] outline-none focus:border-[#e8a353]"
        />
        {error&&<p className="mt-2 text-xs font-semibold text-[#f0a0a0]">{error}</p>}
        <button type="submit" disabled={loading||!password} className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#e8a353] to-[#b3742f] py-3.5 text-sm font-black text-[#1c130b] transition disabled:opacity-40">
          {loading?"확인 중...":"로그인"}
        </button>
      </form>
    </div>
  );
}
