"use client";

import Header from "@/layout/header";
import Footer from "@/layout/footer";
import ProfileContent from "./main";

export default function ProfileClient() {
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <Header />
      <div className="w-full mb-0">
        <ProfileContent />
      </div>
      <Footer meta={<></>}><></></Footer>
    </div>
  );
}
