"use client";

import Header from "@/layout/header";
import Footer from "@/layout/footer";
import FullTestContent from "./main";

export default function FullTestClient() {
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <Header />
      <div className="w-full mb-0">
        <FullTestContent />
      </div>
      <Footer meta={<></>}><></></Footer>
    </div>
  );
}
