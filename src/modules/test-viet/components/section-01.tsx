// components/ReadingTestCollection.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { WritingService } from "@/services/writing";
import Link from "next/link";
import { ROUTES } from "@/utils/routes";
import { IMAGES } from "@/utils/images";
import Skeleton from "@/components/ui/skeleton";
import { ChevronDown, CircleCheckBig, PlayIcon, RotateCw } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { UserService } from "@/services/user";
import SearchBar from "@/components/ui/search-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WritingTestItem {
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
  // Add other relevant fields from completed test if needed
}

const WritingSection: React.FC = () => {
  const [writings, setWritings] = useState<WritingTestItem[]>([]);
  const [filteredWritings, setFilteredWritings] = useState<WritingTestItem[]>(
    []
  );
  const [currenData, setCurrenData] = useState<any>([] as any);
  const [loading, setLoading] = useState<boolean>(true);
  const [completedTests, setCompletedTests] = useState<string[]>([]);
  const [isFull, setIsFull] = useState<boolean>(false);
  const [selectedPartCount, setSelectedPartCount] = useState<
    string | undefined
  >(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("asc");
  const isLogin = Cookies.get("isLogin");
  const router = useRouter();

  const sortDataByName = (
    data: WritingTestItem[],
    order: "asc" | "desc" | "none"
  ) => {
    if (order === "none") return data;

    return [...data].sort((a, b) => {
      // Trích xuất số cuối cùng từ tên bài test
      const extractLastNumber = (name: string): number => {
        const match = name.match(/(\d+)(?!.*\d)/);
        return match ? parseInt(match[1], 10) : 0;
      };

      const numberA = extractLastNumber(a.name);
      const numberB = extractLastNumber(b.name);

      if (order === "asc") {
        return numberA - numberB;
      } else {
        return numberB - numberA;
      }
    });
  };

  const render = useCallback((data: WritingTestItem[]) => {
    const sortedData = sortDataByName(data, sortOrder);
    setFilteredWritings(sortedData);
    setCurrenData(sortedData);
    // setFilteredReadings(data);
    // setCurrentData(data);
  }, [sortOrder]);

  // const render = (data: WritingTestItem[]) => {
  //   setFilteredWritings(data);
  //   setCurrenData(data);
  // };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const res = await WritingService.getAll();
        if (res && res.length > 0) {
          const filteredData = res.filter(
            (item: WritingTestItem) => item.thumbnail != ""
          );
          setWritings(filteredData);
          render(filteredData);
          if (isLogin) {
            const completedRes = await UserService.getCompleteUserTestById(
              isLogin
            );
            if (completedRes && completedRes.length > 0) {
              const completedTestIds = completedRes.map(
                (test: CompletedTest) => test.test_id
              );
              setCompletedTests(completedTestIds);
            }
          }
        } else {
          setWritings([]);
          setFilteredWritings([]);
        }
      } catch (error) {
        console.error("Error initializing data:", error);
        setWritings([]);
        setFilteredWritings([]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [isLogin, render]);

  const handleSearch = (query: string) => {
    const lowerCaseQuery = query.toLowerCase().trim();
    if (!lowerCaseQuery) {
      render(writings); // Reset to all readings if query is empty
      return;
    }

    const filtered = writings.filter((test) =>
      test.name.toLowerCase().includes(lowerCaseQuery)
    );
    render(filtered);
  };

  const handleViewResult = async (testId: string) => {
    if (isLogin) {
      const response = await UserService.getCompleteTestById(testId, isLogin);

      const jsonData = JSON.stringify(response, null, 2);
      localStorage.setItem("writingTestAnswers", jsonData);
      router.push(`${ROUTES.TEST_WRITING_RESULT}/${testId}`);
    }
  };

  const filterByPartCount = (count: string | null) => {
    if (!count) {
      render(writings);
      return;
    }
    if (count === "0") {
      render(writings);
      return;
    }
    const filtered = writings.filter(
      (test) => test.parts.length === Number(count)
    );
    render(filtered);
  };

  // Test card component
  const TestCard: React.FC<{ test: WritingTestItem }> = ({ test }) => {
    const isCompleted = completedTests.includes(test._id);
    return (
      <div className="flex flex-col">
        <div className="relative mb-2">
          <Image
            src={IMAGES.THUMBNAIL}
            alt={test.name}
            width={280}
            height={180}
            className="rounded-lg w-full object-cover border border-gray-200 px-0 h-60 lg:h-40"
          />
        </div>
        <div className="flex flex-col justify-between h-full">
          <div>
            <h3 className="font-medium text-xl lg:text-base mb-1">
              {test.name}
            </h3>
            <p className="text-gray-500 text-sm lg:text-xs mb-2">
              <span className="text-gray-500 text-sm lg:text-xs">
                {test.parts.length} phần
              </span>
            </p>
          </div>
          {isLogin && isCompleted ? (
            <>
              <div className="grid grid-cols-12 items-center gap-3 w-full lg:w-full">
                <Link
                  href={`${ROUTES.WRITING_TEST}/${test._id}?isRetake=true`}
                  className="col-span-5 sm:col-span-12 md:col-span-5 flex flex-row justify-center items-center gap-2 border border-[#0D5293] hover:bg-[#0D5293] hover:text-white rounded-lg px-3 py-2 group transition-all duration-200 ease-in-out"
                >
                  <RotateCw
                    size={15}
                    className="text-[#0D5293] group-hover:text-white transition-colors duration-200 ease-in-out"
                  />
                  <span className="text-sm mr-1 text-[#0D5293] group-hover:text-white">
                    Làm lại
                  </span>
                </Link>
                <div
                  onClick={() => handleViewResult(test._id)}
                  className="cursor-pointer col-span-7 sm:col-span-12 md:col-span-7 flex flex-row justify-center items-center gap-2 border border-[#58c558] hover:bg-[#58c558] hover:text-white rounded-lg px-3 py-2 group transition-all duration-200 ease-in-out"
                >
                  <CircleCheckBig
                    size={15}
                    className="text-[#58c558] group-hover:text-white transition-colors duration-200 ease-in-out"
                  />
                  <span className="text-sm mr-1 text-[#58c558] group-hover:text-white">
                    Xem kết quả
                  </span>
                </div>
              </div>
            </>
          ) : (
            <Link
              href={`${ROUTES.WRITING_TEST}/${test._id}`}
              className="w-full lg:w-1/2 flex items-center text-md lg:text-sm"
            >
              <div className="w-full flex flex-row justify-center items-center gap-2 border border-[#FA812F] hover:bg-[#FA812F] hover:text-white rounded-lg px-3 py-2 group transition-all duration-200 ease-in-out">
                <div className="p-0.5 border border-[#FA812F] group-hover:border-white rounded-full transition-all duration-200 ease-in-out text-[#FA812F] group-hover:text-white">
                  <PlayIcon
                    size={12}
                    fill="#FA812F"
                    className="group-hover:fill-white transition-colors duration-200 ease-in-out"
                  />
                </div>
                <span className="text-sm mr-1 text-[#FA812F] group-hover:text-white">
                  Làm bài
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>
    );
  };

  const filteredData = isFull ? currenData : currenData.slice(0, 12);

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-0">
      <section>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row items-center gap-2 justify-between w-full">
            <SearchBar onSearch={handleSearch} />
            <div className="w-full lg:w-2/6 flex flex-col lg:flex-row justify-between items-center gap-2">
              <div className="w-48 hidden lg:flex justify-end items-center text-sm lg:text-base mr-2">
                Số lượng: {currenData.length} bài
              </div>
              <Select
                value={selectedPartCount}
                onValueChange={(value) => {
                  setSelectedPartCount(value);
                  filterByPartCount(value);
                }}
              >
                <SelectTrigger className="w-[213.33px] lg:w-56">
                  <SelectValue placeholder="Select Part" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All Parts</SelectItem>
                  <SelectItem value="1">1 Part</SelectItem>
                  <SelectItem value="2">2 Parts</SelectItem>
                </SelectContent>
              </Select>
              <div className="w-48 lg:hidden flex justify-center items-center text-sm lg:text-base mr-2 mt-1">
                Số lượng: {currenData.length} bài
              </div>
            </div>
          </div>
          <div className="flex-1">
            {loading ? (
              <Skeleton />
            ) : currenData.length === 0 ? (
              <div className="flex justify-center items-center">
                Không tìm thấy bài viết.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredData.map((test: WritingTestItem, index: number) => (
                  <TestCard key={test._id} test={test} />
                ))}
              </div>
            )}
            {currenData.length > 12 &&
              (!isFull ? (
                <div
                  onClick={() => setIsFull(true)}
                  className="mt-6 flex justify-center relative"
                >
                  <div className="text-[#FA812F] cursor-pointer font-semibold px-4 py-2 lg:py-4 lg:px-8 flex items-center gap-2 rounded-md">
                    <>
                      <p className="text-[14px] lg:text-base">Xem thêm</p>{" "}
                      <div className="flex flex-col items-center gap-2">
                        <ChevronDown
                          size={16}
                          className="translate-y-1 updown-animation1 delay-0"
                        />
                        <ChevronDown
                          size={16}
                          className="-translate-y-1 updown-animation2 delay-1"
                        />
                      </div>
                    </>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsFull(false)}
                  className="mt-6 flex justify-center relative"
                >
                  <div className="text-[#FA812F] cursor-pointer font-semibold px-4 py-2 lg:py-4 lg:px-8 flex items-center gap-2 rounded-md">
                    <>
                      <p className="text-[14px] lg:text-base">Thu gọn</p>{" "}
                      <div className="flex flex-col items-center gap-2">
                        <ChevronDown
                          size={16}
                          className="translate-y-1 updown-animation3 delay-0"
                        />
                        <ChevronDown
                          size={16}
                          className="-translate-y-1 updown-animation4 delay-1"
                        />
                      </div>
                    </>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default WritingSection;
