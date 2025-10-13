"use client";

import Image from "next/image";
import gif from "../../../../public/lucky.gif";
import Link from "next/link";
import { ROUTES } from "@/utils/routes";
import { usePathname, useRouter } from "next/navigation";

export default function WritingSubmission() {
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split("/").filter(Boolean);
  const id = segments[segments.length - 1];

  const handleViewResult = async (testId: string) => {
    // const response = await UserService.getCompleteTestById(testId, isLogin);

    // const jsonData = JSON.stringify(response, null, 2);
    // localStorage.setItem("writingTestAnswers", jsonData);
    router.push(`${ROUTES.TEST_WRITING_RESULT}/${testId}`);
  };
  return (
    <div className="w-full flex flex-col justify-center items-center">
      {/* <Header /> */}
      <div className="w-full flex justify-center items-center mb-20">
        <Image
          src={gif}
          alt=""
          width={1000}
          height={1000}
          className="w-full lg:w-1/3 h-full"
        />
      </div>
      <div className="text-center font-medium text-xl">
        Bài viết của bạn đã nộp thành công và đang chờ chấm điểm.
      </div>
      <div className="text-center font-medium text-xl">
        Điểm của bạn sẽ được phản hồi qua Email trong 24h tới nhé!
      </div>
      <div className="flex flex-row items-center gap-3">
        <Link
          href={ROUTES.WRITING_HOME}
          target="_blank"
          className="mt-3 text-lg text-[#FA812F] font-semibold flex flex-row gap-2 items-center border border-[#FA812F] rounded-lg px-4 py-2 hover:bg-[#FA812F] hover:text-white transition-all duration-300"
        >
          <span className="">Trang chủ</span>{" "}
        </Link>

        <div
          onClick={() => handleViewResult(id)}
          className="cursor-pointer mt-3 text-lg text-[#58c558] font-semibold flex flex-row gap-2 items-center border border-[#58c558] rounded-lg px-4 py-2 hover:bg-[#58c558] hover:text-white transition-all duration-300"
        >
          <span className="">Xem bài nộp</span>{" "}
        </div>
      </div>
    </div>
  );
}
