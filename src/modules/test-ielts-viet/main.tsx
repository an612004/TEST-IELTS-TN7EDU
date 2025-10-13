// pages/ielts-test.tsx
import { toast } from "@/hooks/use-toast";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { IMAGES } from "@/utils/images";
import PassageProgressBar from "./components/processing-bar";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Grid2x2Check,
} from "lucide-react";
import Link from "next/link";
import PassageProgressBarMobile from "./components/processing-bar-mobile";
import { motion, AnimatePresence } from "framer-motion";
import PopupMenu from "./components/pop-up";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { WritingService } from "@/services/writing";
import { QuestionsService } from "@/services/questions";
import { ROUTES } from "@/utils/routes";
import "@/styles/hide-scroll.css";
import { SubmitService } from "@/services/submit";
import Cookies from "js-cookie";
import { UserService } from "@/services/user";

interface UserAccount {
  _id: string;
  user_name: string;
  avatar: string;
  email: string;
  password: string;
  created_at: string;
}

interface PassageSection {
  _id: string;
  stest_id: string;
  type: string;
  part_num: number;
  question: Array<{
    question: any;
    _id: string;
    q_type: string;
    part_id: string;
    image?: string;
    content: string;
    created_at: string;
  }>;
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

export default function WritingTestClient() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRetake = searchParams.get("isRetake") === "true";
  const [data, setData] = useState<WritingDetail | null>(null);
  const [timeLeft, setTimeLeft] = useState("00:00");
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [selectedPartIndex, setSelectedPartIndex] = useState(0);
  const [parts, setParts] = useState<PassageSection[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [switchWriting, setSwitchWriting] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(true);
  const [showConfirmSubmitDialog, setShowConfirmSubmitDialog] = useState(false);
  const [showConfirmCloseDialog, setShowConfirmCloseDialog] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showGetInfoDialog, setShowGetInfoDialog] = useState(false);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [guestGmail, setGuestGmail] = useState("");
  const isLogin = Cookies.get("isLogin");
  const [isAutoSubmitted, setIsAutoSubmitted] = useState(false);
  const [isPassageProgressBarOpen, setIsPassageProgressBarOpen] =
    useState(false);

  // COUNTING DOWN TIMER
  useEffect(() => {
    if (!timeLeft || !isTimerRunning) return;

    const [minutes, seconds] = timeLeft.split(":").map(Number);
    let totalSeconds = minutes * 60 + seconds;

    if (totalSeconds <= 0) {
      setTimeLeft("00:00");
      return;
    }

    const timer = setInterval(() => {
      totalSeconds -= 1;

      const newMinutes = Math.floor(totalSeconds / 60);
      const newSeconds = totalSeconds % 60;
      const formattedTime = `${newMinutes
        .toString()
        .padStart(2, "0")}:${newSeconds.toString().padStart(2, "0")}`;
      setTimeLeft(formattedTime);

      if (totalSeconds <= 0) {
        clearInterval(timer);
        setTimeLeft("00:00");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTimerRunning]);

  // ALERT ON PAGE RELOAD OR CLOSE
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
      return "Are you sure you want to leave? Your answers will not be saved.";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // HANDLE EXIT LINK CLICK
  const handleExitClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const confirmExit = window.confirm(
      "Are you sure you want to leave? Your answers will not be saved."
    );

    if (confirmExit) {
      router.push(ROUTES.WRITING_HOME);
    }
  };

  const init = async () => {
    const segments = pathname.split("/").filter(Boolean);
    const id = segments[segments.length - 1];

    try {
      if (isLogin) {
        try {
          const data = await UserService.getUserById(isLogin);
          if (data) {
            setUserAccount(data);
          } else {
            setUserAccount(null);
          }
        } catch (error) {
          console.error("Error fetching account:", error);
        }
      }

      const res = await WritingService.getWritingById(id);
      setTimeLeft(res.time.toString().padStart(2, "0") + ":00");
      if (!res) throw new Error("Writing data not found");

      const partIds = res.parts || [];
      const questionResults = await Promise.all(
        partIds.map((partId: string) =>
          QuestionsService.getQuestionsById(partId)
        )
      );
      setParts(questionResults.filter(Boolean));
      setData(res);
    } catch (error) {
      console.error("Error initializing writing test:", error);
      setData(null);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const passages = parts.map((part, idx) => ({
    id: idx + 1,
    startQuestion: 1,
    endQuestion: part.question.length,
    answeredQuestions: (answers[idx] || "").trim() ? 1 : 0,
  }));

  const handlePassageSelect = (passageId: number) => {
    setSelectedPartIndex(passageId - 1);
    setCurrentPage(passageId);
    setWordCount(countWords(answers[passageId]));
    setCharacterCount(countCharacters(answers[passageId]));
  };

  const handleNextPassage = () => {
    const nextPassage =
      selectedPartIndex < parts.length ? selectedPartIndex + 2 : 1;
    handlePassageSelect(nextPassage);
  };

  const handlePreviousPassage = () => {
    const prevPassage =
      selectedPartIndex + 1 > 1 ? selectedPartIndex : parts.length;
    handlePassageSelect(prevPassage);
  };

  const countWords = (input: string) => {
    const trimmedText = (input || "").trim();
    if (!trimmedText) return 0;
    const words = trimmedText.split(/\s+/).filter((word) => word.length > 0);
    return words.length;
  };

  const countCharacters = (input: string) => {
    return (input || "").length;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setAnswers((prev) => ({ ...prev, [selectedPartIndex]: newText }));
    setWordCount(countWords(newText));
    setCharacterCount(countCharacters(newText));
  };

  const handleSubmit = async () => {
    const segments = pathname.split("/").filter(Boolean);
    const id = segments[segments.length - 1];

    let userId = "";
    let userEmail = "";

    if (isLogin) {
      userId = isLogin;
      userEmail = userAccount?.email || "";
    } else {
      userEmail = guestGmail;
    }

    if (!isLogin && !userEmail) {
      alert("Vui lòng nhập Gmail để nộp bài");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (userEmail && !emailRegex.test(userEmail)) {
      toast({
        variant: "destructive",
        title: "Vui lòng nhập địa chỉ Gmail hợp lệ",
      });
      return;
    }

    const body = {
      user_id: userId,
      test_id: id,
      user_email: userEmail,
      parts: parts.map((part, idx) => ({
        part_id: data?.parts[idx] || "",
        user_answers: part.question.map((q) => ({
          question_id: q._id || "",
          answer: [answers[idx] || ""],
        })),
        isComplete: (answers[idx] || "").trim() !== "",
      })),
    };

    try {
      // const response = await SubmitService.submitTest(body);
      const response = await (isRetake
        ? SubmitService.updateSubmitTest(body)
        : SubmitService.submitTest(body));
      const jsonData = JSON.stringify(response, null, 2);

      localStorage.setItem("writingTestAnswers", jsonData);
      const segments = pathname.split("/").filter(Boolean);
      const testId = segments[segments.length - 1];
      router.push(`${ROUTES.WRITING_RESULT}/${testId}`);
    } catch (error) {
      console.error("Error submitting test:", error);
    }
  };

  const handleStartTest = () => {
    setShowConfirmDialog(false);
    setIsTimerRunning(true); // Start the timer
  };

  const handleCancelTest = () => {
    setShowConfirmDialog(false);
    router.push(`${ROUTES.WRITING_HOME}`);
  };

  const handleSubmitTest = () => {
    handleSubmit();
  };

  const handleCancelSubmitTest = () => {
    setShowConfirmSubmitDialog(false);
    setShowGetInfoDialog(false);
  };

  const handleAutoSubmit = useCallback(async () => {
    if (isAutoSubmitted) return;

    setIsAutoSubmitted(true);
    setIsTimerRunning(false);

    const segments = pathname.split("/").filter(Boolean);
    const id = segments[segments.length - 1];

    let userId = "";
    let userEmail = "";

    if (isLogin) {
      userId = isLogin;
      userEmail = userAccount?.email || "";
    } else {
      userEmail = guestGmail || "auto-submit@temp.com";
    }

    const body = {
      user_id: userId,
      test_id: id,
      user_email: userEmail,
      parts: parts.map((part, idx) => ({
        part_id: data?.parts[idx] || "",
        user_answers: part.question.map((q) => ({
          question_id: q._id || "",
          answer: [answers[idx] || ""],
        })),
        isComplete: (answers[idx] || "").trim() !== "",
      })),
    };

    try {
      const response = await (isRetake
        ? SubmitService.updateSubmitTest(body)
        : SubmitService.submitTest(body));

      toast({
        title: "Thời gian đã hết",
        description: "Bài thi đã được tự động nộp",
      });

      const jsonData = JSON.stringify(response, null, 2);
      localStorage.setItem("writingTestAnswers", jsonData);
      router.push(`${ROUTES.WRITING_RESULT}/${id}`);
    } catch (error) {
      console.error("Error auto-submitting test:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tự động nộp bài. Vui lòng thử lại.",
      });
    }
  }, [
    isAutoSubmitted,
    isLogin,
    userAccount,
    guestGmail,
    pathname,
    answers,
    parts,
    data,
    isRetake,
    router,
  ]);

  useEffect(() => {
    if (!timeLeft || !isTimerRunning) return;

    const [minutes, seconds] = timeLeft.split(":").map(Number);
    let totalSeconds = minutes * 60 + seconds;

    if (totalSeconds <= 0) {
      setTimeLeft("00:00");
      handleAutoSubmit(); // Auto-submit when time is up
      return;
    }

    const timer = setInterval(() => {
      totalSeconds -= 1;

      const newMinutes = Math.floor(totalSeconds / 60);
      const newSeconds = totalSeconds % 60;
      const formattedTime = `${newMinutes
        .toString()
        .padStart(2, "0")}:${newSeconds.toString().padStart(2, "0")}`;
      setTimeLeft(formattedTime);

      if (totalSeconds <= 0) {
        clearInterval(timer);
        setTimeLeft("00:00");
        handleAutoSubmit(); // Auto-submit when time is up
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTimerRunning, handleAutoSubmit]);

  return (
    <div className="relative min-h-screen w-full bg-gray-50">
      {/* Instruction Dialog */}
      <AnimatePresence>
        {showConfirmDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-50"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-blue-100 max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">IELTS Writing Test</h2>
                <p className="text-gray-600">Please read the instructions carefully before starting</p>
              </div>

              {/* Instructions */}
              <div className="space-y-6 mb-8">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Test Information
                  </h3>
                  <ul className="space-y-2 text-blue-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Duration: Approximately 60 minutes
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      2 Writing Tasks (Task 1: 150+ words, Task 2: 250+ words)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      You can edit your answers anytime during the test
                    </li>
                  </ul>
                </div>

                <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                  <h3 className="font-bold text-orange-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Important Instructions
                  </h3>
                  <ul className="space-y-2 text-orange-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Complete both writing tasks
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Manage your time effectively between tasks
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Review your work before submitting
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCancelTest}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartTest}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg"
                >
                  Start Test
                </button>
              </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Submit Dialog */}
      <AnimatePresence>
        {showConfirmSubmitDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-50"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed top-[37%] left-[4%] lg:left-[37%] transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-50 w-11/12 max-w-md"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Xác nhận nộp bài kiểm tra
              </h2>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn nộp bài kiểm tra này không? Sau khi nộp,
                bạn sẽ không thể chỉnh sửa câu trả lời của mình.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCancelSubmitTest}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitTest}
                  className="px-4 py-2 bg-[#FA812F] text-white rounded-md hover:bg-[#e06b1f] transition"
                >
                  Nộp bài
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Close Test Dialog */}
      <AnimatePresence>
        {showConfirmCloseDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-50"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed top-[37%] left-[4%] lg:left-[37%] transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-50 w-11/12 max-w-md"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Xác nhận thoát bài kiểm tra
              </h2>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn thoát bài kiểm tra này không? Bài kiểm tra
                của bạn sẽ không được lưu.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmCloseDialog(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    router.push(ROUTES.HOME);
                  }}
                  className="px-4 py-2 bg-[#FA812F] text-white rounded-md hover:bg-[#e06b1f] transition"
                >
                  Thoát
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Get non Login Info Dialog */}
      <AnimatePresence>
        {showGetInfoDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-50"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed top-[37%] left-[4%] lg:left-[37%] transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-50 w-11/12 max-w-md"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Bạn chưa có tài khoản
              </h2>
              <p className="text-gray-600 mb-4">
                Vui lòng cung cấp thông tin Gmail của bạn để nộp bài kiểm tra
              </p>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-[#FA812F] focus:border-transparent"
                placeholder="Vui lòng nhập Gmail của bạn"
                value={guestGmail}
                onChange={(e) => setGuestGmail(e.target.value)}
              />
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCancelSubmitTest}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitTest}
                  className="px-4 py-2 bg-[#FA812F] text-white rounded-md hover:bg-[#e06b1f] transition"
                >
                  Nộp bài
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b-2 border-gray-100 px-4 lg:px-6 py-3 z-20 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href={ROUTES.HOME}
            className="hidden lg:flex items-center"
          >
            <Image
              src={IMAGES.LOGO}
              alt="IELTS Writing Test"
              width={150}
              height={40}
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Test Info */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-lg inline-block">
              <div className="font-bold text-lg text-gray-800">{data?.name || 'IELTS Writing Test'}</div>
              <div className="text-sm text-blue-600 font-medium">
                Task {selectedPartIndex + 1} of {parts.length} • 
                <span className="ml-1">
                  {selectedPartIndex === 0 ? 'Data Description' : 'Essay Writing'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            {/* Task Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {parts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPartIndex(index)}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                    selectedPartIndex === index
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <button
              onClick={() => {
                if (isLogin) {
                  setShowConfirmSubmitDialog(true);
                } else {
                  setShowGetInfoDialog(true);
                }
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="hidden sm:inline">Submit Test</span>
            </button>
            {/* Timer */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg
                  className="h-5 w-5 text-orange-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-700">{timeLeft}</div>
                  <div className="text-xs text-orange-600">Time Left</div>
                </div>
              </div>
            </div>

            {/* Exit Button */}
            <button
              onClick={() => setShowConfirmCloseDialog(true)}
              className="p-2.5 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 rounded-lg transition-all"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="fixed top-[8%] bottom-[0%] left-0 right-0 w-full overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row">
          {/* Task Instructions Panel */}
          <div
            className={`flex-1 bg-gradient-to-br from-slate-50 to-blue-50 border-r-2 border-blue-100 overflow-y-auto scroll-bar-style ${
              switchWriting ? "" : "hidden lg:block"
            }`}
          >
            <div className="p-6 lg:p-8">
              {parts.length > 0 && (
                <div className="max-w-4xl">
                  {/* Task Header */}
                  <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg flex items-center justify-center mr-3 text-lg font-bold">
                          {selectedPartIndex + 1}
                        </div>
                        Writing Task {selectedPartIndex + 1}
                      </h1>
                      <div className="bg-blue-50 px-4 py-2 rounded-lg">
                        <span className="text-sm font-semibold text-blue-700">
                          Minimum: {selectedPartIndex === 0 ? 150 : 250} words
                        </span>
                      </div>
                    </div>
                    
                    {/* Task Type Badge */}
                    <div className="mb-4">
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                        selectedPartIndex === 0 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {selectedPartIndex === 0 ? 'Data Description Task' : 'Essay Writing Task'}
                      </span>
                    </div>
                  </div>

                  {/* Task Content */}
                  {parts[selectedPartIndex]?.question.map((q, qIdx) => (
                    <div key={q._id || qIdx} className="space-y-6">
                      {/* Main Task Description */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-blue-600" />
                            Task Instructions
                          </h3>
                        </div>
                        <div className="p-6">
                          <div
                            className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: (q.content || "").replace(/\\/g, ""),
                            }}
                          />
                        </div>
                      </div>

                      {/* Image/Chart if exists */}
                      {q.image && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {selectedPartIndex === 0 ? 'Chart/Diagram' : 'Reference Material'}
                            </h3>
                          </div>
                          <div className="p-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <Image
                                src={q.image}
                                alt="Task visual content"
                                width={1000}
                                height={1000}
                                className="w-full h-auto object-contain rounded-lg shadow-sm"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Writing Guidelines */}
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-l-4 border-orange-400 p-6">
                        <h4 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Writing Guidelines
                        </h4>
                        <ul className="space-y-2 text-orange-700">
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Write at least <strong>{selectedPartIndex === 0 ? 150 : 250} words</strong>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {selectedPartIndex === 0 
                              ? 'Describe the main features and make comparisons where relevant'
                              : 'Present a clear position with supporting arguments and examples'
                            }
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Use appropriate vocabulary and grammar structures
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Organize your ideas in clear paragraphs
                          </li>
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Writing Area Panel */}
          <div
            className={`flex-1 bg-white overflow-y-auto scroll-bar-style ${
              switchWriting ? "hidden lg:block" : ""
            }`}
          >
            <div className="h-full flex flex-col p-6 lg:p-8">
              {/* Writing Area Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Your Answer
                  </h2>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Task {selectedPartIndex + 1} of {parts.length}</div>
                  </div>
                </div>

                {/* Word Count Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">{wordCount}</div>
                    <div className="text-sm text-gray-600">Words written</div>
                    <div className={`text-xs mt-1 ${
                      wordCount >= (selectedPartIndex === 0 ? 150 : 250) 
                        ? 'text-green-600' 
                        : 'text-orange-600'
                    }`}>
                      {wordCount >= (selectedPartIndex === 0 ? 150 : 250) 
                        ? '✓ Minimum reached' 
                        : `Need ${(selectedPartIndex === 0 ? 150 : 250) - wordCount} more`
                      }
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center border border-blue-100">
                    <div className="text-2xl font-bold text-indigo-600">{characterCount}</div>
                    <div className="text-sm text-gray-600">Characters</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((characterCount / 1000) * 100)}% of limit
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Editor */}
              <div className="flex-1 bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Write your response below:</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        wordCount >= (selectedPartIndex === 0 ? 150 : 250) 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {wordCount >= (selectedPartIndex === 0 ? 150 : 250) ? 'Complete' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                </div>
                <textarea
                  id="writing-area"
                  value={answers[selectedPartIndex] || ""}
                  onChange={handleTextChange}
                  placeholder={`Start writing your ${selectedPartIndex === 0 ? 'description' : 'essay'} here...\n\n${selectedPartIndex === 0 
                    ? 'Tip: Begin with an overview of the main trends or features shown in the chart/diagram.'
                    : 'Tip: Start with a clear introduction stating your position on the topic.'
                  }`}
                  className="w-full h-full p-6 resize-none focus:outline-none text-gray-800 leading-relaxed text-base"
                  style={{ minHeight: 'calc(100vh - 400px)' }}
                />
              </div>

              {/* Writing Progress Bar */}
              <div className="mt-4 bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    wordCount >= (selectedPartIndex === 0 ? 250 : 350)
                      ? 'bg-green-500'
                      : wordCount >= (selectedPartIndex === 0 ? 150 : 250)
                      ? 'bg-blue-500'
                      : 'bg-orange-500'
                  }`}
                  style={{ 
                    width: `${Math.min((wordCount / (selectedPartIndex === 0 ? 250 : 350)) * 100, 100)}%` 
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0 words</span>
                <span className="font-medium">Target: {selectedPartIndex === 0 ? 250 : 350} words</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 px-4 py-3 z-20 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Task Navigation */}
          <div className="flex items-center space-x-2">
            {parts.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPartIndex(idx)}
                className={`w-12 h-12 rounded-xl font-bold transition-all ${
                  selectedPartIndex === idx
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="text-sm">T{idx + 1}</div>
                <div className="text-xs">{answers[idx] ? '✓' : '○'}</div>
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <button
            onClick={() => setSwitchWriting(!switchWriting)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-xl shadow-md"
          >
            {switchWriting ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </button>

          {/* Submit Button */}
          <button
            onClick={() => setIsPopupOpen(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Review</span>
          </button>
        </div>
      </div>
      {/* POPUP MENU QUESTIONS */}
      <AnimatePresence>
        {isPopupOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-0 top-0 left-0 right-0 bg-black z-20"
            />
            <PopupMenu
              isOpen={isPopupOpen}
              setIsOpen={setIsPopupOpen}
              answers={answers}
              onSelectTask={handlePassageSelect}
              onSubmit={() => setShowConfirmSubmitDialog(true)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
