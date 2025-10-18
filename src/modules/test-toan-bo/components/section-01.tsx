// components/ReadingTestCollection.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { IMAGES } from "@/utils/images";
import Link from "next/link";
import { ROUTES } from "@/utils/routes";
import { FullTestService } from "@/services/full-test";
import Skeleton from "@/components/ui/skeleton";
import {
  BookCheck,
  ChevronDown,
  Headphones,
  PencilLine,
  PlayIcon,
} from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { UserService } from "@/services/user";
import SearchBar from "@/components/ui/search-bar";

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

interface CompletedTest {
  test_id: string;
  // Add other relevant fields from completed test if needed
}

const FullTestSection: React.FC = () => {
  const COUNT = 12;

  const [fullTests, setFullTests] = useState<FullTestItem[]>([]);
  const [filteredFullTests, setFilteredFullTests] = useState<FullTestItem[]>(
    []
  );
  const [currentData, setCurrentData] = useState<FullTestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [completedTests, setCompletedTests] = useState<string[]>([]);
  const [isFull, setIsFull] = useState<boolean>(false);

  const isLogin = Cookies.get("isLogin");
  const router = useRouter();

  const render = (data: FullTestItem[]) => {
    setFilteredFullTests(data);
    setCurrentData(data);
  };

  const init = async () => {
    setLoading(true);
    try {
      const res = await FullTestService.getAll();
      if (res && res.length > 0) {
        const filteredData = res.filter(
          (item: FullTestItem) => item.thumbnail != null
        );
        setFullTests(filteredData);
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
        setFullTests([]);
        setFilteredFullTests([]);
      }
    } catch (error) {
      console.error("Error initializing data:", error);
      setFullTests([]);
      setFilteredFullTests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (query: string) => {
    const lowerCaseQuery = query.toLowerCase().trim();
    if (!lowerCaseQuery) {
      render(fullTests); // Reset to all readings if query is empty
      return;
    }

    const filtered = fullTests.filter((test) =>
      test.name.toLowerCase().includes(lowerCaseQuery)
    );
    render(filtered);
  };

  // Test card component
  const TestCard: React.FC<{ test: FullTestItem }> = ({ test }) => {
    const isReadingCompleted = completedTests.includes(test.r_id);
    const isListeningCompleted = completedTests.includes(test.l_id);
    const isWritingCompleted = completedTests.includes(test.w_id);
    return (
      <div className="flex flex-col">
        <div className="relative mb-2 flex justify-center items-center">
          <div className="w-full flex justify-center items-center bg-gradient-to-br from-white to-orange-50 rounded-2xl border-2 border-[#FA812F] shadow-xl p-2" style={{minHeight:'120px'}}>
            <Image
              src={IMAGES.THUMBNAIL}
              alt={test.name}
              width={320}
              height={120}
              className="object-contain h-28 w-full"
            />
          </div>
        </div>
        <div className="flex flex-col justify-between h-full">
          <div>
            <h3 className="font-medium text-xl lg:text-sm mb-1">{test.name}</h3>
            <p className="text-gray-500 text-sm lg:text-xs mb-2">3 kĩ năng</p>
          </div>
          <Link
            href={`${ROUTES.FULLTEST_DETAIL}/${test._id}`}
            className="flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-0 text-md lg:text-sm"
          >
            <div className="text-[#FA812F] flex flex-row items-center gap-2 border border-[#FA812F] hover:bg-[#FA812F] hover:text-white rounded-lg px-3 py-2 group transition-all duration-200 ease-in-out">
              <div className="p-0.5 border border-[#FA812F] group-hover:border-white rounded-full transition-all duration-200 ease-in-out">
                <PlayIcon
                  size={14}
                  fill="#FA812F"
                  className="group-hover:fill-white transition-colors duration-200 ease-in-out"
                />
              </div>
              <span className="mr-1 text-[#FA812F] group-hover:text-white">
                Làm bài
              </span>
            </div>
            <div className="flex flex-row items-center gap-3 ml-0 lg:ml-5">
              <div
                className={`border p-1.5 rounded-full ${
                  isListeningCompleted
                    ? "text-white border-white bg-[#58c558]"
                    : "text-gray-500 border-gray-500"
                }`}
              >
                <Headphones size={15} />
              </div>
              <div
                className={`border p-1.5 rounded-full ${
                  isReadingCompleted
                    ? "text-white border-white bg-[#58c558]"
                    : "text-gray-500 border-gray-500"
                }`}
              >
                <BookCheck size={15} />
              </div>
              <div
                className={`border p-1.5 rounded-full ${
                  isWritingCompleted
                    ? "text-white border-white bg-[#58c558]"
                    : "text-gray-500 border-gray-500"
                }`}
              >
                <PencilLine size={15} />
              </div>
            </div>
          </Link>
        </div>
      </div>
    );
  };

  const filteredData = isFull ? currentData : currentData.slice(0, 12);

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-0">
      <section>
        <div className="flex flex-col gap-6">
          <div className="flex flex-row items-center gap-2 justify-between w-full">
            <SearchBar onSearch={handleSearch} />
            <div className="w-48 flex justify-end items-center text-sm lg:text-base mr-2">
              Số lượng: {currentData.length} bài
            </div>
          </div>
          <div className="flex-1">
            {loading ? (
              <Skeleton />
            ) : currentData.length === 0 ? (
              <div className="flex justify-center items-center">
                Không tìm thấy bài test.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredData.map((test: FullTestItem) => (
                  <TestCard key={test._id} test={test} />
                ))}
              </div>
            )}
            {currentData.length > 12 &&
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

export default FullTestSection;
