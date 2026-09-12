"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MyAreaSection from "@/components/home/MyAreaSection";

type ViewMode = "guest" | "member";

export default function MyAreaPage(){
  const [mode,setMode]=useState<ViewMode>("guest");
  return <>
    <Header mode={mode} onModeChange={setMode}/>
    <main className="flex-1 my-area-page-shell">
      <MyAreaSection fullPage/>
    </main>
    <Footer/>
  </>;
}
