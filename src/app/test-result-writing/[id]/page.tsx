"use client";

import AnswerKeyWritingPage from "@/modules/result-answer-writing/main";
import { Loader } from "lucide-react";
import React, { Suspense } from "react";

export default function TestResultWriting() {
  return (
    <div className="w-full flex flex-col justify-center items-center">
      {/* <BlogProvider>
        <Suspense
          fallback={
            <div className="w-full h-[500px] flex flex-col justify-center items-center">
              <Loader className="animate-spin" size={24} />
            </div>
          }
        >
          <TipsClient />
        </Suspense>
      </BlogProvider> */}

      <Suspense
        fallback={
          <div className="w-full h-[500px] flex flex-col justify-center items-center">
            <Loader className="animate-spin" size={24} />
          </div>
        }
      >
        <AnswerKeyWritingPage />
      </Suspense>
    </div>
  );
}
