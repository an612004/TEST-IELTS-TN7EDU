"use client";

import Image from "next/image";

import { ROUTES } from "@/utils/routes";
import ReadingSection from "./components/section-01";
import SectionFooter from "./components/section-footer";
import Link from "next/link";

export default function ReadingContent() {
  return (
    <main className="w-full flex flex-col justify-center items-center overflow-hidden">
      <div className="w-full relative bg-[#FDF8F5] min-h-[240px] flex items-center overflow-hidden">
        <div className="absolute left-12 bottom-12 grid grid-cols-4 gap-2">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[rgb(var(--secondary-rgb))] opacity-60"
            />
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-4 w-full text-center">
          <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold text-gray-900 mb-4">
            Reading
          </h1>
          <nav className="flex justify-center items-center space-x-2 text-gray-600">
            <Link
              href={ROUTES.HOME}
              className="hover:text-gray-900 transition-colors"
            >
              Trang Chủ
            </Link>
            <span className="text-gray-400">•</span>
            <span className="text-gray-900">Reading Test </span>
          </nav>
        </div>
      </div>
      <div className="w-full flex flex-col justify-center items-center">
        <div className="w-full lg:w-3/4 py-12">
          <ReadingSection />
        </div>
      </div>
    </main>
  );
}
