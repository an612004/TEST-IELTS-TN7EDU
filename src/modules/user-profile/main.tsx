"use client";

import ProfileSection from "./components/section-01";

export default function ProfileContent() {
  return (
    <main className="w-full flex flex-col justify-center items-center overflow-hidden">
      <div className="w-full flex flex-col justify-center items-center">
        <div className="w-full lg:w-3/4 py-12">
          <ProfileSection />
        </div>
      </div>
    </main>
  );
}
