"use client";

import Header from "@/layout/header";
import Footer from "@/layout/footer";
import ListeningContent from "./main";

export default function ListeningClient() {
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <Header />
      <div className="w-full mb-0">
        <ListeningContent />
      </div>
      <Footer />
    </div>
  );
}
