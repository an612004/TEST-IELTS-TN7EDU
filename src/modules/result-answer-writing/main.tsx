// pages/ielts-test.tsx
import { useEffect, useState } from "react";
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
import { usePathname, useRouter } from "next/navigation";
import { WritingService } from "@/services/writing";
import { QuestionsService } from "@/services/questions";
import { ROUTES } from "@/utils/routes";
import "@/styles/hide-scroll.css";
import { SubmitService } from "@/services/submit";
import Cookies from "js-cookie";
import { Dialog } from "@/components/ui/dialog";

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

interface UserAnswer {
  question_id: string;
  answer: string[];
  topic: string;
}
interface PartResult {
  type: string;
  part_id: string;
  user_answers: UserAnswer[];
}

interface ResultData {
  submit_id: string;
  result: PartResult[];
}

export default function AnswerKeyWritingPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [data, setData] = useState<WritingDetail | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPassage, setSelectedPassage] = useState(1);
  const [parts, setParts] = useState<PassageSection[]>([]); // dynamic parts
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [switchWriting, setSwitchWriting] = useState(true);
  const [feedback, setFeedback] = useState<any>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const userId = Cookies.get("userLogin") || "";
  const [response, setResponse] = useState<ResultData | null>(null);

  // Helper to calculate average score
  const getAverageScore = (
    task1Score: number,
    task2Score: number
  ): number | null => {
    if (
      task1Score == null ||
      task2Score == null ||
      task1Score < 0 ||
      task2Score < 0
    )
      return null;
    const average = (task1Score + task2Score) / 2;
    return Math.round(average * 2) / 2;
  };

  const handleExitClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    router.push(ROUTES.WRITING_HOME);
  };

  const init = async () => {
    const storedAnswers = localStorage.getItem("writingTestAnswers");
    const parsedAnswers = storedAnswers ? JSON.parse(storedAnswers) : null;
    setResponse(parsedAnswers?.data || null);
    const segments = pathname.split("/").filter(Boolean);
    const id = segments[segments.length - 1];
    try {
      const res = await WritingService.getWritingById(id);
      const resFeedback = await WritingService.getFeedbackById(id, userId);
      if (!res) throw new Error("Writing data not found");
      const partIds = res.parts || [];
      const questionResults = await Promise.all(
        partIds.map((partId: string) =>
          QuestionsService.getQuestionsById(partId)
        )
      );
      setParts(questionResults.filter(Boolean));
      setData(res);
      setFeedback(resFeedback);
      // Set initial word/character count for first passage
      setWordCount(
        countWords(
          parsedAnswers?.data?.result?.[0]?.user_answers?.[0]?.answer?.[0] ?? ""
        )
      );
      setCharacterCount(
        countCharacters(
          parsedAnswers?.data?.result?.[0]?.user_answers?.[0]?.answer?.[0] ?? ""
        )
      );
    } catch (error) {
      console.error("Error initializing writing test:", error);
      setData(null);
    }
  };

  useEffect(() => {
    init();
  }, []);

  // Build passages array dynamically
  const passages = parts.map((part, idx) => ({
    id: idx + 1,
    startQuestion: 1,
    endQuestion: part.question.length,
    answeredQuestions: response?.result?.[
      idx
    ]?.user_answers?.[0]?.answer?.[0]?.trim()
      ? 1
      : 0,
  }));

  const handlePassageSelect = (passageId: number) => {
    setSelectedPassage(passageId);
    setCurrentPage(passageId);
    setWordCount(
      countWords(
        response?.result?.[passageId - 1]?.user_answers?.[0]?.answer?.[0] ?? ""
      )
    );
    setCharacterCount(
      countCharacters(
        response?.result?.[passageId - 1]?.user_answers?.[0]?.answer?.[0] ?? ""
      )
    );
  };

  const handleNextPassage = () => {
    const nextPassage =
      selectedPassage < passages.length ? selectedPassage + 1 : 1;
    handlePassageSelect(nextPassage);
  };

  const handlePreviousPassage = () => {
    const prevPassage =
      selectedPassage > 1 ? selectedPassage - 1 : passages.length;
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

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2 z-30 shadow-sm">
        <Link href={ROUTES.WRITING_HOME} className="hidden lg:flex items-center w-[10%] py-3">
          <Image src={IMAGES.LOGO} alt="DOL DINH LUC" width={80} height={32} className="w-auto h-8" />
        </Link>
        <div className="text-center flex flex-col items-center">
          <div className="font-bold text-xl text-gray-800">{data?.name}</div>
          <div className="text-sm text-gray-500 tracking-wide">IELTS Writing Test</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="ml-2 px-4 py-2 rounded-lg bg-[#FA812F] text-white font-semibold shadow hover:bg-[#e06d1a] transition" onClick={() => setIsFeedbackOpen(true)}>
            Xem nhận xét
          </button>
          <Link href={ROUTES.WRITING_HOME} className="ml-4" onClick={handleExitClick}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-8 relative border border-gray-200">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setIsFeedbackOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-6 text-[#FA812F] flex items-center gap-2">
              <Grid2x2Check size={24} /> Nhận xét & Điểm số
            </h2>
            {!feedback || !feedback.writing_feedback || feedback.writing_feedback.length === 0 ? (
              <div className="text-gray-600 text-center py-8">Bài viết chưa được chấm điểm. Vui lòng quay lại sau.</div>
            ) : (
              <>
                <div className="mb-6 flex flex-col gap-2">
                  <div className="font-semibold text-lg">Điểm trung bình: <span className="text-[#FA812F] text-xl font-bold">{getAverageScore(Number(feedback.writing_feedback[0].score), Number(feedback.writing_feedback[1].score))}</span></div>
                </div>
                <div className="space-y-4 max-h-72 overflow-y-auto">
                  {feedback.writing_feedback.map((item: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-4 bg-blue-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-700 flex items-center gap-2"><FileText size={18} /> Giáo viên: {item.teacher}</span>
                        <span className="font-semibold text-[#FA812F]">Điểm: {item.score}</span>
                      </div>
                      <div className="text-gray-800 whitespace-pre-line text-base leading-relaxed">{item.feedback}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="fixed top-[8%] bottom-[0%] left-0 right-0 grid grid-cols-1 lg:grid-cols-2 w-full overflow-y-auto">
        {/* Writing passage */}
        <div className={`p-6 overflow-y-auto scroll-bar-style border-r border-gray-200 pt-12 ${switchWriting ? "" : "hidden lg:block"}`}>
          {parts.length > 0 && (
            <div>
              <h1 className="text-2xl font-bold mb-6 text-[#FA812F]">Task {selectedPassage}</h1>
              {parts[selectedPassage - 1]?.question.map((q, qIdx) => (
                <div key={q._id || qIdx} className="mb-6">
                  <h2 className="text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2"><FileText size={20} /> {q.question || q.content}</h2>
                  <div className="mb-4 text-base font-normal border border-gray-300 rounded-lg p-4 bg-white shadow-sm text-justify w-full" dangerouslySetInnerHTML={{ __html: (q.content || "").replace(/\\/g, "") }} />
                  {q.image && (
                    <div className="mb-2">
                      <Image src={q.image} alt="" width={600} height={400} className="rounded-lg border object-contain mx-auto" />
                    </div>
                  )}
                </div>
              ))}
              <p className="mb-4 text-sm text-gray-600">Yêu cầu: Viết tối thiểu {selectedPassage === 1 ? 150 : 250} từ.</p>
            </div>
          )}
        </div>

        {/* Writing Area */}
        <div className={`bg-white px-6 pt-12 overflow-y-auto scroll-bar-style ${switchWriting ? "hidden lg:block" : ""}`}>
          <div className="text-xl font-bold mb-6 text-[#FA812F]">Bài làm của bạn</div>
          <div className="w-full h-full">
            <div className="border border-gray-300 rounded-lg bg-blue-50 p-6 shadow-sm mb-4">
              <div className="flex flex-col gap-2 mb-2">
                <span className="font-semibold text-gray-700">Số từ: <span className="text-[#FA812F]">{wordCount}</span></span>
                <span className="font-semibold text-gray-700">Số ký tự: <span className="text-[#FA812F]">{characterCount}/1000</span></span>
              </div>
              <textarea
                id="title"
                value={response?.result?.[selectedPassage - 1]?.user_answers?.[0]?.answer?.[0] || ""}
                placeholder="Bài viết của bạn sẽ hiển thị ở đây"
                className="w-full h-64 lg:h-80 p-4 border rounded-lg bg-white text-base font-medium text-gray-800 resize-none shadow"
                disabled
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="fixed bottom-0 left-0 right-0 bg-white pt-0 pb-2 z-10">
        {/* NAVIGATION DESKTOP */}
        <div className="hidden lg:flex justify-between mt-2 lg:mt-0 text-sm border-t border-gray-200 pt-2">
          <div
            className={`${
              selectedPassage === 1 ? "" : "border border-[#FA812F]"
            } w-36 flex justify-center items-center rounded-lg my-2 py-2 px-4 bg-white ml-4 cursor-pointer`}
            onClick={handlePreviousPassage}
          >
            <div
              className={`text-[#FA812F] font-medium text-md justify-center items-center ${
                selectedPassage === 1 ? "hidden" : "flex"
              }`}
            >
              <ChevronLeft color="#FA812F" /> Task {selectedPassage - 1}
            </div>
          </div>
          <div className="flex justify-center items-center">
            {passages.map((passage) => (
              <PassageProgressBar
                key={passage.id}
                passageNumber={passage.id}
                currentQuestion={passage.answeredQuestions}
                totalQuestions={passage.endQuestion - passage.startQuestion + 1}
                choosenPassage={selectedPassage === passage.id}
                onClick={() => handlePassageSelect(passage.id)}
              />
            ))}
          </div>
          <div
            className={`w-36 flex justify-center items-center ${
              passages.length === 1 || selectedPassage === 2
                ? "hidden"
                : "border border-[#FA812F]"
            } rounded-lg my-2 py-2 px-4 bg-white mr-4 cursor-pointer`}
            onClick={handleNextPassage}
          >
            <div
              className={`text-[#FA812F] font-medium text-md justify-center items-center ${
                passages.length === 1 || selectedPassage === 2
                  ? "hidden"
                  : "flex"
              }`}
            >
              Task {selectedPassage + 1} <ChevronRight color="#FA812F" />
            </div>
          </div>
          <div
            className={`w-36 flex justify-center items-center ${
              passages.length === 1 || selectedPassage === 2 ? "" : "hidden"
            } rounded-lg my-2 py-2 px-4 bg-white mr-4 cursor-pointer`}
            onClick={handleNextPassage}
          ></div>
        </div>

        {/* NAVIGATE MOBILE */}
        <div className="lg:hidden relative flex justify-center items-center py-0 pt-2 border-t border-gray-200">
          <div className="flex justify-center text-sm">
            {passages.map((passage) => (
              <PassageProgressBarMobile
                key={passage.id}
                passageNumber={passage.id}
                currentQuestion={passage.answeredQuestions}
                totalQuestions={passage.endQuestion - passage.startQuestion + 1}
                choosenPassage={passage.id === selectedPassage}
                onClick={() => handlePassageSelect(passage.id)}
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
              answers={[]}
              onSelectTask={handlePassageSelect}
              onSubmit={() => {}}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
