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
              className="fixed top-[30%] left-[4%] lg:left-[34%] transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-50 w-11/12 max-w-lg"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                INSTRUCTIONS
              </h2>
              <div className="text-gray-800 mb-6">
                <div>
                  <strong className="uppercase">IELTS Writing Test</strong>
                  <p>&ensp; &#8226; Time approximately 60 minutes.</p>
                </div>
                <div className="mt-3">
                  <strong className="uppercase">
                    Instructions to candidates:
                  </strong>
                  <p>&ensp; &#8226; Answer all the writing tasks.</p>
                  <p>
                    &ensp; &#8226; You can change your answer at anytime during
                    the test.
                  </p>
                </div>
                <div className="mt-3">
                  <strong className="uppercase">
                    Information for candidates:
                  </strong>
                  <p>&ensp; &#8226; There are 2 tasks in the test.</p>
                  <p>&ensp; &#8226; Each task will be a paragraph.</p>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCancelTest}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleStartTest}
                  className="px-4 py-2 bg-[#FA812F] text-white rounded-md hover:bg-[#e06b1f] transition"
                >
                  Bắt đầu
                </button>
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
      <header className="fixed top-0 left-0 right-0 flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2 z-20">
        <Link
          href={ROUTES.HOME}
          className="hidden lg:flex items-center w-[10%] py-3"
        >
          <Image
            src={IMAGES.LOGO}
            alt="DOL DINH LUC"
            width={1000}
            height={1000}
            className="w-full h-full"
          />
        </Link>
        <div className="text-center">
          <div className="font-semibold">{data?.name}</div>
          <div className="text-sm text-gray-600">Writing Test</div>
        </div>
        <div className="flex items-center">
          <div className="relative flex flex-row items-center mr-5">
            <div
              onClick={() => {
                if (isLogin) {
                  setShowConfirmSubmitDialog(true);
                } else {
                  setShowGetInfoDialog(true);
                }
              }}
              className={`w-36 flex justify-center items-center ${
                selectedPartIndex === parts.length - 1
                  ? "border border-[#FA812F]"
                  : "hidden"
              } rounded-lg my-2 py-2 px-4 mr-4 bg-[#FA812F] text-white cursor-pointer`}
            >
              <div
                className={`font-medium text-md justify-center items-center ${
                  selectedPartIndex === parts.length - 1 ? "flex" : "hidden"
                }`}
              >
                Nộp bài
              </div>
            </div>
            <div>
              {(() => {
                const passage = passages.find(
                  (passage) => selectedPartIndex === passage.id - 1
                );
                return (
                  passage && (
                    <div className="flex items-center gap-2">
                      <div>
                        <ChevronLeft
                          className={`w-4 h-4 rotate-[270deg] transition-all duration-300 ${
                            isPassageProgressBarOpen ? "rotate-[90deg]" : ""
                          }`}
                        />
                      </div>
                      <PassageProgressBar
                        key={passage.id}
                        passageNumber={passage.id}
                        currentQuestion={passage.answeredQuestions}
                        totalQuestions={
                          passage.endQuestion - passage.startQuestion + 1
                        }
                        choosenPassage={selectedPartIndex === passage.id - 1}
                        onClick={() => {
                          setIsPassageProgressBarOpen(
                            !isPassageProgressBarOpen
                          );
                        }}
                      />
                    </div>
                  )
                );
              })()}
            </div>
            {isPassageProgressBarOpen && (
              <div className="flex flex-col justify-center items-center absolute top-[120%] -right-[5%] bg-white py-3 !w-44 rounded-lg border border-gray-200 gap-3">
                {passages.map((passage) => (
                  <PassageProgressBar
                    key={passage.id}
                    passageNumber={passage.id}
                    currentQuestion={passage.answeredQuestions}
                    totalQuestions={
                      passage.endQuestion - passage.startQuestion + 1
                    }
                    choosenPassage={selectedPartIndex === passage.id - 1}
                    onClick={() => {
                      handlePassageSelect(passage.id);
                      setIsPassageProgressBarOpen(!isPassageProgressBarOpen);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="w-24">
            <div className="bg-gray-100 px-3 py-1 rounded-full flex justify-center items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500 mr-1"
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
              <span className="text-[#FA812F] font-semibold">{timeLeft}</span>
            </div>
          </div>
          <div
            className="ml-4 cursor-pointer"
            onClick={() => setShowConfirmCloseDialog(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="fixed top-[8%] bottom-[0%] left-0 right-0 grid grid-cols-1 lg:grid-cols-2 w-full overflow-y-auto">
        {/* Reading passage */}
        <div
          className={`p-4 overflow-y-auto scroll-bar-style border-r border-gray-200 pt-8 pb-24 lg:pb-5 bg-white ${
            switchWriting ? "" : "hidden lg:block"
          }`}
        >
          {parts.length > 0 && (
            <div>
              <h1 className="text-2xl font-bold mb-4">
                Writing Task {selectedPartIndex + 1}
              </h1>
              {parts[selectedPartIndex]?.question.map((q, qIdx) => (
                <div key={q._id || qIdx}>
                  {/* <div
                    className="text-xl font-bold mb-4"
                    dangerouslySetInnerHTML={{
                      __html: (q.question || q.content).replace(/\\/g, ""),
                    }}
                  /> */}
                  <div
                    className="mb-4 text-sm lg:text-[17px] font-semibold border-double border-2 border-black p-4 text-justify w-full"
                    dangerouslySetInnerHTML={{
                      __html: (q.content || "").replace(/\\/g, ""),
                    }}
                  />
                  {q.image && (
                    <div>
                      <Image
                        src={q.image}
                        alt=""
                        width={1000}
                        height={1000}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              ))}
              <p className="mb-4 text-sm lg:text-[15px]">
                Write at least {selectedPartIndex === 0 ? 150 : 250} words.
              </p>
            </div>
          )}
        </div>

        {/* Writing Area */}
        <div
          className={`bg-white px-4 pt-8 overflow-y-auto scroll-bar-style ${
            switchWriting ? "hidden lg:block" : ""
          }`}
        >
          <div className="text-xl font-bold mb-4">Bài làm</div>
          <div className="w-full h-full">
            <textarea
              id="title"
              value={answers[selectedPartIndex] || ""}
              onChange={handleTextChange}
              placeholder="Nhập bài viết của bạn"
              className="w-full h-2/3 lg:h-3/4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#FA812F] focus:border-transparent resize-none"
            ></textarea>
            <div className="flex justify-between">
              <div className="text-right">{wordCount} words</div>
              <div className="text-right">{characterCount}/1000</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="fixed bottom-0 left-0 right-0 bg-white pt-0 pb-2 z-10">
        {/* NAVIGATION DESKTOP */}
        {/* <div className="hidden lg:flex justify-between mt-2 lg:mt-0 text-sm border-t border-gray-200 pt-2">
          <div
            className={`${
              selectedPartIndex === 0 ? "" : "border border-[#FA812F]"
            } w-36 flex justify-center items-center rounded-lg my-2 py-2 px-4 bg-white ml-4 cursor-pointer`}
            onClick={handlePreviousPassage}
          >
            <div
              className={`text-[#FA812F] font-medium text-md justify-center items-center ${
                selectedPartIndex === 0 ? "hidden" : "flex"
              }`}
            >
              <ChevronLeft color="#FA812F" /> Task {selectedPartIndex}
            </div>
          </div>
          <div className="flex justify-center items-center">
            {passages.map((passage) => (
              <PassageProgressBar
                key={passage.id}
                passageNumber={passage.id}
                currentQuestion={passage.answeredQuestions}
                totalQuestions={passage.endQuestion - passage.startQuestion + 1}
                choosenPassage={selectedPartIndex === passage.id - 1}
                onClick={() => {
                  handlePassageSelect(passage.id);
                }}
              />
            ))}
          </div>
          <div
            className={`w-36 flex justify-center items-center ${
              selectedPartIndex === parts.length - 1
                ? "hidden"
                : "border border-[#FA812F]"
            } rounded-lg my-2 py-2 px-4 bg-white mr-4 cursor-pointer`}
            onClick={handleNextPassage}
          >
            <div
              className={`text-[#FA812F] font-medium text-md justify-center items-center ${
                selectedPartIndex === parts.length - 1 ? "hidden" : "flex"
              }`}
            >
              Task {selectedPartIndex + 2} <ChevronRight color="#FA812F" />
            </div>
          </div>

          <div
            onClick={() => {
              if (isLogin) {
                setShowConfirmSubmitDialog(true);
              } else {
                setShowGetInfoDialog(true);
              }
            }}
            className={`w-36 flex justify-center items-center ${
              selectedPartIndex === parts.length - 1
                ? "border border-[#FA812F]"
                : "hidden"
            } rounded-lg my-2 py-2 px-4 mr-4 bg-[#FA812F] text-white cursor-pointer`}
          >
            <div
              className={`font-medium text-md justify-center items-center ${
                selectedPartIndex === parts.length - 1 ? "flex" : "hidden"
              }`}
            >
              Nộp bài
            </div>
          </div>
        </div> */}

        {/* NAVIGATE MOBILE */}
        <div className="lg:hidden relative flex justify-center items-center py-0 pt-2 border-t border-gray-200">
          <div className="flex justify-center text-sm">
            {parts.map((part, idx) => (
              <PassageProgressBarMobile
                key={part._id || idx}
                passageNumber={idx + 1}
                currentQuestion={part.question.length}
                totalQuestions={part.question.length}
                choosenPassage={selectedPartIndex === idx}
                onClick={() => handlePassageSelect(idx + 1)}
              />
            ))}
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex flex-col justify-center -translate-y-[2px]">
            <div className="w-full flex justify-center">
              <div
                className={`w-11 h-11 border-2 border-gray-300 rounded-full bg-white cursor-pointer flex items-center justify-center`}
                onClick={() => setIsPopupOpen(true)}
              >
                <Grid2x2Check color="#6B7280" size={17} />
              </div>
            </div>
            <div
              className={`text-gray-500 text-center font-bold text-[9px] mt-0.5`}
            >
              Reviews & Submit
            </div>
          </div>

          {/* Toggle Button (Mobile Only) */}
          <div className="lg:hidden absolute bg-[#FA812F] rounded-full bottom-[0%] right-[5%] z-20 -translate-y-24">
            <div
              className="p-3.5"
              onClick={() => setSwitchWriting(!switchWriting)}
            >
              {switchWriting ? (
                <Grid2x2Check color="white" />
              ) : (
                <FileText color="white" />
              )}
            </div>
          </div>
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
