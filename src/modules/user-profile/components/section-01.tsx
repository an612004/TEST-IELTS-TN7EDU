// components/ReadingTestCollection.tsx
"use client";

import { UserService } from "@/services/user";
import Cookies from "js-cookie";
import React, { useEffect } from "react";
import { ModalUpdateProfile } from "./modal-update-profile";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Info, Loader } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { ROUTES } from "@/utils/routes";

interface ProfileSectionProps {
  _id: string;
  user_name: string;
  avatar: string;
  email: string;
  isStudent: boolean;
  password: string;
  created_at: string;
}

interface CompletedTest {
  _id: string;
  user_id: string;
  user_email: string;
  test_id: string;
  test_type: string;
  score: number;
  correct_answer: number;
  incorrect_answer: number;
  pass_answer: number;
  user_avatar: string;
  user_name: string;
  test_name: string;
  test_image: string;
}

const ProfileSection: React.FC = () => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = React.useState("personalInfo");
  const userId = Cookies.get("isLogin") || "";
  const [data, setData] = React.useState<ProfileSectionProps>();
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isCPLoading, setIsCPLoading] = React.useState(false);
  const [completedTests, setCompletedTests] = React.useState<CompletedTest[]>(
    []
  );
  const isLogin = Cookies.get("isLogin");
  const handleViewResult = async (testId: string, testType: string) => {
    if (isLogin) {
      const response = await UserService.getCompleteTestById(testId, isLogin);

      const jsonData = JSON.stringify(response, null, 2);
      if (testType === "R") {
        localStorage.setItem("readingTestAnswers", jsonData);
      } else if (testType === "L") {
        localStorage.setItem("listeningTestAnswers", jsonData);
      } else if (testType === "W") {
        localStorage.setItem("writingTestAnswers", jsonData);
      }

      if (testType === "R") {
        router.push(`${ROUTES.READING_STATISTIC}/${testId}`);
      } else if (testType === "L") {
        router.push(`${ROUTES.LISTENING_STATISTIC}/${testId}`);
      } else if (testType === "W") {
        router.push(`${ROUTES.TEST_WRITING_RESULT}/${testId}`);
      }
    }
  };

  const init = async () => {
    try {
      const response = await UserService.getUserById(userId);
      setData(response);
      const testResponse = await UserService.getCompleteUserTestById(userId);
      setCompletedTests(testResponse || []);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      setData({
        _id: "",
        user_name: "",
        avatar: "",
        email: "",
        isStudent: false,
        password: "",
        created_at: "",
      });
    }
  };

  useEffect(() => {
    init();
  }, []);

  const handleChangePassword = async () => {
    setIsCPLoading(true);
    if (newPassword !== confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu mới và xác nhận mật khẩu không khớp.",
        variant: "destructive",
      });
      setIsCPLoading(false);
      return;
    }

    const body = {
      oldPassword,
      newPassword,
    };

    try {
      const response = await UserService.changePassword(data?._id || "", body);

      if (!response) {
        toast({
          title: "Lỗi",
          description: "Mật khẩu cũ không chính xác.",
          variant: "destructive",
        });
        setIsCPLoading(false);
      } else {
        toast({
          title: "Thành công",
          description: "Mật khẩu đã được thay đổi thành công.",
          className: "bg-green-500 text-white",
        });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsCPLoading(false);
        router.push("/profile");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Đổi mật khẩu thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-full p-0 px-4 lg:px-0">
      <div className="w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <button
                className={`w-full text-left px-4 py-3 border border-gray-200 rounded-lg ${
                  selectedOption === "personalInfo"
                    ? "bg-orange-50 text-[#FA812F] border-[#f27d2e]"
                    : "bg-white text-black hover:bg-orange-100"
                } transition-colors`}
                onClick={() => setSelectedOption("personalInfo")}
              >
                Thông tin cá nhân
              </button>
            </div>
            {data?.isStudent === true && (
              <div className="bg-white rounded-lg shadow-sm mt-5">
                <button
                  className={`w-full text-left px-4 py-3 border border-gray-200 rounded-lg ${
                    selectedOption === "changePassword"
                      ? "bg-orange-50 text-[#FA812F] border-[#f27d2e]"
                      : "bg-white text-black hover:bg-orange-100"
                  } transition-colors`}
                  onClick={() => setSelectedOption("changePassword")}
                >
                  Đổi mật khẩu
                </button>
              </div>
            )}
            <div className="bg-white rounded-lg shadow-sm mt-5">
              <button
                className={`w-full text-left px-4 py-3 border border-gray-200 rounded-lg ${
                  selectedOption === "history"
                    ? "bg-orange-50 text-[#FA812F] border-[#f27d2e]"
                    : "bg-white text-black hover:bg-orange-100"
                } transition-colors`}
                onClick={() => setSelectedOption("history")}
              >
                Lịch sử bài làm
              </button>
            </div>
          </div>

          {/* Main Content */}
          {selectedOption === "personalInfo" && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Thông tin cơ bản
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Một số thông tin cá nhân được bảo mật của bạn
                  </p>
                </div>

                {/* Personal Information */}
                <div className="space-y-6 mb-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b border-gray-100">
                    <div className="text-gray-700 font-medium">Tên</div>
                    <div className="md:col-span-2 text-gray-900">
                      {data?.user_name}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b border-gray-100">
                    <div className="text-gray-700 font-medium">Email</div>
                    <div className="md:col-span-2 text-gray-900">
                      {data?.email}
                    </div>
                  </div>

                  {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b border-gray-100">
                  <div className="text-gray-700 font-medium">Số điện thoại</div>
                  <div className="md:col-span-2 text-gray-400">-</div>
                </div> */}

                  <div className="w-full flex justify-end">
                    <ModalUpdateProfile data={data} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-5">
                <div className="pt-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Vai trò đăng nhập
                  </h3>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        Học viên
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center bounce delay-0">
                            <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center bounce delay-1"></div>
                          </div>
                          <span className="text-sm text-gray-700">
                            {data?.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedOption === "changePassword" && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Thay đổi mật khẩu
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Vui lòng nhập thông tin mật khẩu
                  </p>
                </div>

                {/* Personal Information */}
                <div className="space-y-6 mb-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b border-gray-100 items-center">
                    <div className="text-gray-700 font-medium">Mật khẩu cũ</div>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="md:col-span-2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Nhập mật khẩu cũ"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b border-gray-100 items-center !mt-0">
                    <div className="text-gray-700 font-medium">
                      Mật khẩu mới
                    </div>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="md:col-span-2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Nhập mật khẩu mới"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b border-gray-100 items-center !mt-0">
                    <div className="text-gray-700 font-medium">
                      Xác nhận mật khẩu mới
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="md:col-span-2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>

                  {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b border-gray-100">
                  <div className="text-gray-700 font-medium">Số điện thoại</div>
                  <div className="md:col-span-2 text-gray-400">-</div>
                </div> */}

                  <div className="w-full flex justify-end">
                    <button onClick={handleChangePassword}>
                      <div className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                        Lưu thay đổi
                        {isCPLoading && (
                          <Loader className="ml-2 animate-spin h-4 w-4" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedOption === "history" && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Lịch sử bài làm
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Xem lại các bài làm đã thực hiện
                  </p>
                </div>

                {/* Personal Information */}
                <div className="space-y-6 mb-0">
                  <Table
                    aria-label="Example static collection table"
                    className="border border-gray-200 rounded-lg"
                  >
                    <TableHeader className="!border-b !border-gray-200 flex !items-start !text-left !rounded-lg">
                      <TableColumn className="!text-left bg-orange-50 !rounded-l-lg">
                        Bài test
                      </TableColumn>
                      <TableColumn className="!text-left bg-orange-50">
                        Kỹ năng
                      </TableColumn>
                      <TableColumn className="!text-left bg-orange-50">
                        Điểm số
                      </TableColumn>
                      <TableColumn className="!text-left bg-orange-50 !rounded-r-lg w-40">
                        Chi tiết
                      </TableColumn>
                    </TableHeader>
                    <TableBody>
                      {completedTests.map((test: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{test.test_name}</TableCell>
                          <TableCell>
                            {test.test_type === "R"
                              ? "Reading"
                              : test.test_type === "L"
                              ? "Listening"
                              : "Writing"}
                          </TableCell>
                          <TableCell className="!px-7">
                            {Number.isInteger(test.score)
                              ? `${test.score}.0`
                              : `${test.score}`}
                          </TableCell>
                          <TableCell className="">
                            <div
                              onClick={() =>
                                handleViewResult(test?.test_id, test?.test_type)
                              }
                              className="cursor-pointer w-full flex flex-row justify-center items-center gap-2 border border-orange-500 hover:bg-orange-500 hover:text-white rounded-lg px-3 py-2 group transition-all duration-200 ease-in-out"
                            >
                              <span className="text-sm mr-1 text-orange-500 group-hover:text-white">
                                Xem kết quả
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
