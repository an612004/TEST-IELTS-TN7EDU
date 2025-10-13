"use client";

import Header from "@/layout/header";
import Footer from "@/layout/footer";
import ReadingContent from "./main";

export default function ReadingClient() {
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <Header />
      <div className="w-full mb-0">
        <ReadingContent />
      </div>
      <Footer meta={<></>}><></></Footer>
    </div>
  );
}
