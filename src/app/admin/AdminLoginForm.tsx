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

  return <div className="flex min-h-screen items-center justify-center bg-[#faf5ec] px-6">
    <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-[#e7dcc9] bg-white p-8 shadow-sm">
      <p className="text-[11px] font-bold tracking-[.16em] text-[#b3742f]">SHOWDAY ADMIN</p>
      <h1 className="mt-2 text-xl font-black text-[#2a1d12]">관리자 로그인</h1>
      <input
        type="password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        placeholder="관리자 비밀번호"
        autoFocus
        className="mt-6 w-full rounded-lg border border-[#e7dcc9] px-4 py-3 text-sm outline-none focus:border-[#b3742f]"
      />
      {error&&<p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
      <button type="submit" disabled={loading||!password} className="mt-4 w-full rounded-lg bg-[#2a1d12] py-3 text-sm font-bold text-white disabled:opacity-40">
        {loading?"확인 중...":"로그인"}
      </button>
    </form>
  </div>;
}
