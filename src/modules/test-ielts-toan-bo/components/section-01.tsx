import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IMAGES } from "@/utils/images";
import {
  BookOpenText,
  CircleCheckBig,
  Facebook,
  Headphones,
  PenLine,
  PlayIcon,
  RotateCw,
} from "lucide-react";
import { FullTestService } from "@/services/full-test";
import { usePathname } from "next/navigation";
import { ReadingService } from "@/services/reading";
import { ListeningService } from "@/services/listening";
import { WritingService } from "@/services/writing";
import { ROUTES } from "@/utils/routes";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { UserService } from "@/services/user";

interface FullTestItem {
  _id: string;
  name: string;
  thumbnail: string;
  description: string;
  r_id: string;
  l_id: string;
  w_id: string;
  created_at: string;
}

interface WritingDetail {
  _id: string;
  type: string;
  parts: string[];
  name: string;
  thumbnail: string;
  time: number;
  created_at: string;
}
interface ListenDetail {
  _id: string;
  type: string;
  parts: string[];
  name: string;
  thumbnail: string;
  time: number;
  created_at: string;
}
interface ReadingDetail {
  _id: string;
  type: string;
  parts: string[];
  name: string;
  thumbnail: string;
  time: number;
  created_at: string;
}

interface CompletedTest {
  test_id: string;
}

export default function Section01() {
  const pathname = usePathname();
  const [fullTestDetail, setFullTestDetail] = useState<FullTestItem | null>(
    null
  );
  const [fullTests, setFullTests] = useState<FullTestItem[]>([]);
  const [reading, setReading] = useState<ReadingDetail | null>(null);
  const [listening, setListening] = useState<ListenDetail | null>(null);
  const [writing, setWriting] = useState<WritingDetail | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [completedTests, setCompletedTests] = useState<string[]>([]);

  const isLogin = Cookies.get("isLogin");
  const router = useRouter();

  const render = (data: FullTestItem[]) => {
    setFullTests(data);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const init = async () => {
    const segments = pathname.split("/").filter(Boolean);
    const id = segments[segments.length - 1];

    try {
      const res = await FullTestService.getFullTestById(id);

      if (!res) {
        throw new Error("Full test data not found");
      }

      const resReading = await ReadingService.getReadingById(res.r_id);
      const resListening = await ListeningService.getListeningById(res.l_id);
      const resWriting = await WritingService.getWritingById(res.w_id);

      if (isLogin) {
        const completedRes = await UserService.getCompleteUserTestById(isLogin);
        if (completedRes && completedRes.length > 0) {
          const completedTestIds = completedRes.map(
            (test: CompletedTest) => test.test_id
          );
          setCompletedTests(completedTestIds);
        }
      }

      setFullTestDetail(res || null);
      setReading(resReading || null);
      setListening(resListening || null);
      setWriting(resWriting || null);
    } catch (error) {
      console.error("Error initializing reading test:", error);
      setFullTestDetail(null);
      setReading(null);
      setListening(null);
      setWriting(null);
    }

    try {
      const res = await FullTestService.getAll();
      if (!res || !Array.isArray(res) || res.length === 0) {
        setFullTests([]);
        return;
      }
      const filteredData = res.filter(
        (item: FullTestItem) => item && item.thumbnail != null
      );
      render(filteredData);
    } catch (error) {
      console.error("Error fetching all tests:", error);
      setFullTests([]);
    }
  };

  useEffect(() => {
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTestClick = (url: string) => {
    if (isMobile) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleViewReadingResult = async (testId: string) => {
    if (isLogin) {
      const response = await UserService.getCompleteTestById(testId, isLogin);
      const jsonData = JSON.stringify(response, null, 2);
      localStorage.setItem("readingTestAnswers", jsonData);
      router.push(`${ROUTES.READING_STATISTIC}/${testId}`);
    }
  };

  const handleViewListeningResult = async (testId: string) => {
    if (isLogin) {
      const response = await UserService.getCompleteTestById(testId, isLogin);
      const jsonData = JSON.stringify(response, null, 2);
      localStorage.setItem("listeningTestAnswers", jsonData);
      router.push(`${ROUTES.LISTENING_STATISTIC}/${testId}`);
    }
  };

  const handleViewWritingResult = async (testId: string) => {
    if (isLogin) {
      const response = await UserService.getCompleteTestById(testId, isLogin);
      const jsonData = JSON.stringify(response, null, 2);
      localStorage.setItem("writingTestAnswers", jsonData);
      router.push(`${ROUTES.WRITING_RESULT}/${testId}`);
    }
  };

  const isReadingCompleted = completedTests.includes(
    fullTestDetail?.r_id || ""
  );
  const isListeningCompleted = completedTests.includes(
    fullTestDetail?.l_id || ""
  );
  const isWritingCompleted = completedTests.includes(
    fullTestDetail?.w_id || ""
  );

  return (
    <div className="w-full mx-auto px-5 lg:px-0">
      <main>
        <div className="flex flex-col justify-center items-center lg:justify-start lg:items-start lg:flex-row mb-4">
          <div className="w-full lg:w-40 h-60 lg:h-28 mr-0 lg:mr-4 mb-5 lg:mb-0 border border-gray-200 rounded-lg">
            <div className="w-full flex justify-center items-center bg-gradient-to-br from-white to-orange-50 rounded-2xl border-2 border-[#FA812F] shadow-xl p-2" style={{minHeight:'120px'}}>
              <Image
                src={IMAGES.THUMBNAIL}
                alt=""
                width={320}
                height={120}
                className="object-contain h-28 w-full"
              />
            </div>
          </div>
          <div className="flex flex-col justify-between items-start">
            <div className="flex flex-col lg:items-start justify-center items-center">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                {fullTestDetail?.name}
              </h1>
              <div className="flex justify-center lg:justify-start items-center text-sm text-gray-600">
                <span>8 bài tests</span>
                <span className="mx-2">•</span>
                <span>74,734 lượt làm</span>
              </div>
            </div>
            <div className="mt-1 flex justify-center lg:justify-start items-center w-full">
              <button className="bg-blue-500 text-white text-xs px-3 py-1 rounded-sm flex items-center">
                <Facebook
                  size={15}
                  color="#ffffff"
                  fill="white"
                  className="mr-1"
                />
                Share
              </button>
            </div>
          </div>
        </div>

        <p className="text-sm lg:text-lg text-justify lg:text-left text-gray-700 mb-6">
          {fullTestDetail?.description}
        </p>

        <div className="mt-10 mb-8 w-full">
          <div className="hidden lg:grid lg:grid-cols-4 gap-4 mb-4 text-base lg:text-lg border-b border-gray-200 pb-2">
            <div className="font-bold text-gray-800 text-center">BÀI TEST</div>
            <div className="font-bold text-gray-800 text-center">LISTENING</div>
            <div className="font-bold text-gray-800 text-center">READING</div>

            <div className="font-bold text-gray-800 text-center">WRITING</div>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 items-center py-3 border-b border-gray-200">
            <div className="w-full text-center mb-4 lg:mb-0">
              <div className="font-medium text-lg lg:text-base">Full Test</div>
            </div>

            <div className="items-start w-full lg:col-span-3 flex overflow-x-auto lg:overflow-visible gap-4 lg:grid lg:grid-cols-3 pb-4 lg:pb-0 px-0 mx-0 snap-x snap-mandatory scrollbar scrollbar-thumb-gray-300 scrollbar-track-gray-100 scroll-bar-style">
              {/* Listening */}
              <div className="flex-shrink-0 flex justify-center items-center w-36 lg:w-auto">
                {listening ? (
                  <div className="flex flex-col justify-center items-center gap-1">
                    <div className="border-4 border-gray-200 p-3 rounded-full">
                      <Headphones />
                    </div>
                    {isMobile ? (
                      isLogin && isListeningCompleted ? (
                        <div className="grid grid-cols-12 items-center gap-3 mt-4">
                          <Link
                            href={`${ROUTES.LISTENING_TEST}/${fullTestDetail?.l_id}?isRetake=true`}
                            className="col-span-12 flex flex-row justify-center items-center gap-2 border border-[#0D5293] hover:bg-[#0D5293] hover:text-white rounded-lg px-3 py-2 group transition-all duration-200 ease-in-out"
                          >
                            <RotateCw
                              size={17}
                              className="text-[#0D5293] group-hover:text-white transition-colors duration-200 ease-in-out"
                            />
                            <span className="text-sm mr-1 text-[#0D5293] group-hover:text-white">
                              Làm lại
                            </span>
                          </Link>
                          <div
                            onClick={() =>
                              handleViewListeningResult(
                                fullTestDetail?.l_id || ""
                              )
                            }
                            className="cursor-pointer col-span-12 flex flex-row justify-center items-center gap-2 border border-[#58c558] hover:bg-[#58c558] hover:text-white rounded-lg px-3 py-2 group transition-all duration-200 ease-in-out"
                          >
                            <CircleCheckBig
                              size={17}
                              className="text-[#58c558] group-hover:text-white transition-colors duration-200 ease-in-out"
                            />
                            <span className="text-sm text-center mr-1 text-[#58c558] group-hover:text-white">
                              Xem kết quả
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() =>
                            handleTestClick(
                              `${ROUTES.LISTENING_TEST}/${fullTestDetail?.l_id}`
                            )
                          }
                          className="text-[#FA812F] mt-4 flex flex-row justify-center w-full items-center gap-2 border border-[#FA812F] hover:bg-[#FA812F] hover:text-white rounded-lg px-3 py-2 group transition-all duration-200 ease-in-out"
                        >
                          <div className="p-0.5 border border-[#FA812F] group-hover:border-white rounded-full transition-all duration-200 ease-in-out">
                            <PlayIcon
                              size={14}
                              fill="#FA812F"
                              className="group-hover:fill-white transition-colors duration-200 ease-in-out"
                            />
                          </div>
                          <span className="mr-1 text-sm text-[#FA812F] group-hover:text-white">
                            Làm bài
                          </span>
                        </div>
                      )
                    ) : isLogin && isListeningCompleted ? (
                      <div className="grid grid-cols-12 items-center gap-3">
                        <Link
                          href={`${ROUTES.LISTENING_TEST}/${fullTestDetail?.l_id}?isRetake=true`}
                          className="col-span-5 flex flex-row justify-center items-center gap-2 border border-[#0D5293] hover:bg-[#0D5293] hover:text-white rounded-lg px-3 py-2 mt-4 group transition-all duration-200 ease-in-out"
                        >
                          <RotateCw
                            size={17}
                            className="text-[#0D5293] group-hover:text-white transition-colors duration-200 ease-in-out"
                          />
                          <span className="text-sm mr-1 text-[#0D5293] group-hover:text-white">
                            Làm lại
                          </span>
                        </Link>
                        <div
                          onClick={() =>
                            handleViewListeningResult(
                              fullTestDetail?.l_id || ""
                            )
                          }
                          className="cursor-pointer col-span-7 flex flex-row justify-center items-center gap-2 border border-[#58c558] hover:bg-[#58c558] hover:text-white rounded-lg px-3 py-2 mt-4 group transition-all duration-200 ease-in-out"
                        >
                          <CircleCheckBig
                            size={17}
                            className="text-[#58c558] group-hover:text-white transition-colors duration-200 ease-in-out"
                          />
                          <span className="text-sm mr-1 text-[#58c558] group-hover:text-white">
                            Xem kết quả
                          </span>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={`${ROUTES.LISTENING_TEST}/${fullTestDetail?.l_id}`}
                        target="_blank"
                        className="text-[#FA812F] mt-4 flex flex-row justify-center w-full items-center gap-2 border border-[#FA812F] hover:bg-[#FA812F] hover:text-white rounded-lg px-3 py-2 group transition-all duration-200 ease-in-out"
                      >
                        <div className="p-0.5 border border-[#FA812F] group-hover:border-white rounded-full transition-all duration-200 ease-in-out">
                          <PlayIcon
                            size={14}
                            fill="#FA812F"
                            className="group-hover:fill-white transition-colors duration-200 ease-in-out"
                          />
                        </div>
                        <span className="mr-1 text-sm text-[#FA812F] group-hover:text-white">
                          Làm bài
                        </span>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="h-[104px] lg:h-[120px]" />
                )}
              </div>

              {/* Reading */}
              <div className="flex-shrink-0 flex justify-center items-center w-36 lg:w-auto">
                {reading ? (
                  <div className="flex flex-col justify-center items-center gap-1">
                    <div className="border-4 border-gray-200 p-3 rounded-full">
                      <BookOpenText />
                    </div>
                    {isMobile ? (
                      isLogin && isReadingCompleted ? (
                        <div className="grid grid-cols-12 items-center gap-3 mt-4">
                          <Link
                            href={`${ROUTES.READING_TEST}/${fullTestDetail?.r_id}?isRetake=true`}
                            className="col-span-12 flex flex-row justify-center items-center gap-2 border border-[#0D5293] hover:bg-[#0D5293] hover:text-white rounded-lg px-3 py-2 group transition-all duration-200 ease-in-out"
                          >
                            <RotateCw
                              size={17}
                              className="text-[#0D5293] group-hover:text-white transition-colors duration-200 ease-in-out"
                            />
                            <span className="text-sm mr-1 text-[#0D5293] group-hover:text-white">
                              Làm lại
                            </span>
                          </Link>
                          <div
                            onClick={() =>
                              handleViewReadingResult(
                                fullTestDetail?.r_id || ""
                              )
                            }
                            className="cursor-pointer col-span-12 flex flex-row justify-center items-center gap-2 border border-[#58c558] hover:bg-[#58c558] hover:text-white rounded-lg px-3 py-2 group transition-all duration-200 ease-in-out"
                          >
                            <CircleCheckBig
                              size={17}
                              className="text-[#58c558] group-hover:text-white transition-colors duration-200 ease-in-out"
                            />
                            <span className="text-sm text-center mr-1 text-[#58c558] group-hover:text-white">
                              Xem kết quả
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() =>
                            handleTestClick(
                              `${ROUTES.READING_TEST}/${fullTestDetail?.r_id}`
                            )
                          }
                          className="text-[#FA812F] mt-4 flex flex-row justify-center w-full items-center gap-2 border border-[#FA812F] hover:bg-[#FA812F] hover:text-white rounded-lg px-3 py-2 group transition-all duration-200 ease-in-out"
                        >
                          <div className="p-0.5 border border-[#FA812F] group-hover:border-white rounded-full transition-all duration-200 ease-in-out">
                            <PlayIcon
                              size={14}
                              fill="#FA812F"
                              className="group-hover:fill-white transition-colors duration-200 ease-in-out"
                            />
                          </div>
                          <span className="mr-1 text-sm text-[#FA812F] group-hover:text-white">
                            Làm bài
                          </span>
                        </div>
                      )
                    ) : isLogin && isReadingCompleted ? (
                      <div className="grid grid-cols-12 items-center gap-3">
                        <Link
                          href={`${ROUTES.READING_TEST}/${fullTestDetail?.r_id}?isRetake=true`}
                          className="col-span-5 flex flex-row justify-center items-center gap-2 border border-[#0D5293] hover:bg-[#0D5293] hover:text-white rounded-lg px-3 py-2 mt-4 group transition-all duration-200 ease-in-out"
                        >
                          <RotateCw
                            size={17}
                            className="text-[#0D5293] group-hover:text-white transition-colors duration-200 ease-in-out"
                          />
                          <span className="text-sm mr-1 text-[#0D5293] group-hover:text-white">
                            Làm lại
                          </span>
                        </Link>
                        <div
                          onClick={() =>
                            handleViewReadingResult(fullTestDetail?.r_id || "")
                          }
                          className="cursor-pointer col-span-7 flex flex-row justify-center items-center gap-2 border border-[#58c558] hover:bg-[#58c558] hover:text-white rounded-lg px-3 py-2 mt-4 group transition-all duration-200 ease-in-out"
                        >
                          <CircleCheckBig
                            size={17}
                            className="text-[#58c558] group-hover:text-white transition-colors duration-200 ease-in-out"
                          />
                          <span className="text-sm mr-1 text-[#58c558] group-hover:text-white">
                            Xem kết quả
                          </span>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={`${ROUTES.READING_TEST}/${fullTestDetail?.r_id}`}
                        target="_blank"
                        className="text-[#FA812F] mt-4 flex flex-row justify-center w-full items-center gap-2 border border-[#FA812F] hover:bg-[#FA812F] hover:text-white rounded-lg px-3 py-2 group transition-all duration-200 ease-in-out"
                      >
                        <div className="p-0.5 border border-[#FA812F] group-hover:border-white rounded-full transition-all duration-200 ease-in-out">
                          <PlayIcon
                            size={14}
                            fill="#FA812F"
                            className="group-hover:fill-white transition-colors duration-200 ease-in-out"
                          />
                        </div>
                        <span className="text-sm mr-1 text-[#FA812F] group-hover:text-white">
                          Làm bài
                        </span>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="h-[104px] lg:h-[120px]" />
                )}
              </div>

              {/* Writing */}
              <div className="flex-shrink-0 flex justify-center items-center w-36 lg:w-auto">
                {writing ? (
                  <div className="flex flex-col justify-center items-center gap-1">
                    <div className="border-4 border-gray-200 p-3 rounded-full">
                      <PenLine />
                    </div>
                    {isMobile ? (
                      isLogin && isWritingCompleted ? (
                        <div className="grid grid-cols-12 items-center gap-3 mt-4">
                          <Link
                            href={`${ROUTES.WRITING_TEST}/${fullTestDetail?.w_id}?isRetake=true`}
                            className="col-span-12 flex flex-row justify-center items-center gap-2 border border-[#0D5293] hover:bg-[#0D5293] hover:text-white rounded-lg px-3 py-2 group transition-all duration-200 ease-in-out"
                          >
                            <RotateCw
                              size={17}
                              className="text-[#0D5293] group-hover:text-white transition-colors duration-200 ease-in-out"
                            />
                            <span className="text-sm mr-1 text-[#0D5293] group-hover:text-white">
                              Làm lại
                            </span>
                          </Link>
                          <div
                            onClick={() =>
                              handleViewWritingResult(
                                fullTestDetail?.w_id || ""
                              )
                            }
                            className="cursor-pointer col-span-12 flex flex-row justify-center items-center gap-2 border border-[#58c558] hover:bg-[#58c558] hover:text-white rounded-lg px-3 py-2 group transition-all duration-200 ease-in-out"
                          >
                            <CircleCheckBig
                              size={17}
                              className="text-[#58c558] group-hover:text-white transition-colors duration-200 ease-in-out"
                            />
                            <span className="text-sm mr-1 text-[#58c558] group-hover:text-white">
                              Xem kết quả
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() =>
                            handleTestClick(
                              `${ROUTES.WRITING_TEST}/${fullTestDetail?.w_id}`
                            )
                          }
                          className="text-[#FA812F] mt-4 flex flex-row justify-center w-full items-center gap-2 border border-[#FA812F] hover:bg-[#FA812F] hover:text-white rounded-lg px-3 py-2 group transition-all duration-200 ease-in-out"
                        >
                          <div className="p-0.5 border border-[#FA812F] group-hover:border-white rounded-full transition-all duration-200 ease-in-out">
                            <PlayIcon
                              size={14}
                              fill="#FA812F"
                              className="group-hover:fill-white transition-colors duration-200 ease-in-out"
                            />
                          </div>
                          <span className="mr-1 text-sm text-[#FA812F] group-hover:text-white">
                            Làm bài
                          </span>
                        </div>
                      )
                    ) : isLogin && isWritingCompleted ? (
                      <div className="grid grid-cols-12 items-center gap-3">
                        <Link
                          href={`${ROUTES.WRITING_TEST}/${fullTestDetail?.w_id}?isRetake=true`}
                          className="col-span-5 flex flex-row justify-center items-center gap-2 border border-[#0D5293] hover:bg-[#0D5293] hover:text-white rounded-lg px-3 py-2 mt-4 group transition-all duration-200 ease-in-out"
                        >
                          <RotateCw
                            size={17}
                            className="text-[#0D5293] group-hover:text-white transition-colors duration-200 ease-in-out"
                          />
                          <span className="text-sm mr-1 text-[#0D5293] group-hover:text-white">
                            Làm lại
                          </span>
                        </Link>
                        <div
                          onClick={() =>
                            handleViewWritingResult(fullTestDetail?.w_id || "")
                          }
                          className="cursor-pointer col-span-7 flex flex-row justify-center items-center gap-2 border border-[#58c558] hover:bg-[#58c558] hover:text-white rounded-lg px-3 py-2 mt-4 group transition-all duration-200 ease-in-out"
                        >
                          <CircleCheckBig
                            size={17}
                            className="text-[#58c558] group-hover:text-white transition-colors duration-200 ease-in-out"
                          />
                          <span className="text-sm mr-1 text-[#58c558] group-hover:text-white">
                            Xem kết quả
                          </span>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={`${ROUTES.WRITING_TEST}/${fullTestDetail?.w_id}`}
                        target="_blank"
                        className="text-[#FA812F] mt-4 flex flex-row justify-center w-full items-center gap-2 border border-[#FA812F] hover:bg-[#FA812F] hover:text-white rounded-lg px-3 py-2 group transition-all duration-200 ease-in-out"
                      >
                        <div className="p-0.5 border border-[#FA812F] group-hover:border-white rounded-full transition-all duration-200 ease-in-out">
                          <PlayIcon
                            size={14}
                            fill="#FA812F"
                            className="group-hover:fill-white transition-colors duration-200 ease-in-out"
                          />
                        </div>
                        <span className="mr-1 text-sm text-[#FA812F] group-hover:text-white">
                          Làm bài
                        </span>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="h-[104px] lg:h-[120px]" />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
