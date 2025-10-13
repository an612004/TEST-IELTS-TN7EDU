// pages/index.tsx
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import "@/styles/hide-scroll.css";
import { IMAGES } from "@/utils/images";
import { Check } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ROUTES } from "@/utils/routes";
import Link from "next/link";

interface QuestionAnswer {
  question_id: string;
  answer: string[];
  correct_answer: string | string[];
  is_correct: boolean;
  is_pass: boolean;
  q_type: string;
}

interface PartResult {
  type: string;
  part_id: string;
  user_answers: QuestionAnswer[];
  correct_count: number;
  incorrect_count: number;
  pass_count: number;
}

interface ResultData {
  _id?: string;
  user_id?: string;
  user_email?: string;
  test_id?: string;
  test_type?: string;
  submit_id?: string;
  result: PartResult[];
}

const ResultStatistic = () => {
  const { id } = useParams();
  const [result, setResult] = useState<ResultData | null>(null);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [incorrectCount, setIncorrectCount] = useState<number>(0);
  const [unanswerCount, setUnanswerCount] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const router = useRouter();

  const [response, setResponse] = useState<ResultData | null>(null);

  useEffect(() => {
    const storedAnswers = localStorage.getItem("readingTestAnswers");

    if (storedAnswers) {
      try {
        const parsedAnswers = JSON.parse(storedAnswers);
        setResponse(parsedAnswers);

        if (parsedAnswers?.data) {
          const resultData = parsedAnswers.data as ResultData;
          setResult(resultData);

          // Dynamically aggregate counts
          const totals = resultData.result.reduce(
            (acc, part) => ({
              correct: acc.correct + part.correct_count,
              incorrect: acc.incorrect + part.incorrect_count,
              unanswered: acc.unanswered + part.pass_count,
            }),
            { correct: 0, incorrect: 0, unanswered: 0 }
          );

          setCorrectCount(totals.correct);
          setIncorrectCount(totals.incorrect);
          setUnanswerCount(totals.unanswered);

          const totalQuestions = resultData.result.reduce(
            (acc, part) =>
              acc + part.correct_count + part.incorrect_count + part.pass_count,
            0
          );
          const calculatedScore = totalQuestions
            ? (totals.correct / totalQuestions) * 9.0
            : 0;
          setScore(calculatedScore);

          if (totals.correct >= 0 && totals.correct <= 1) {
            setScore(0);
          } else if (totals.correct >= 2 && totals.correct <= 3) {
            setScore(1);
          } else if (totals.correct >= 4 && totals.correct <= 5) {
            setScore(2);
          } else if (totals.correct >= 5 && totals.correct <= 6) {
            setScore(3);
          } else if (totals.correct >= 7 && totals.correct <= 9) {
            setScore(3.5);
          } else if (totals.correct >= 10 && totals.correct <= 12) {
            setScore(4);
          } else if (totals.correct >= 13 && totals.correct <= 15) {
            setScore(4.5);
          } else if (totals.correct >= 16 && totals.correct <= 19) {
            setScore(5);
          } else if (totals.correct >= 20 && totals.correct <= 22) {
            setScore(5.5);
          } else if (totals.correct >= 23 && totals.correct <= 26) {
            setScore(6);
          } else if (totals.correct >= 27 && totals.correct <= 29) {
            setScore(6.5);
          } else if (totals.correct >= 30 && totals.correct <= 32) {
            setScore(7);
          } else if (totals.correct >= 33 && totals.correct <= 34) {
            setScore(7.5);
          } else if (totals.correct >= 35 && totals.correct <= 36) {
            setScore(8);
          } else if (totals.correct >= 37 && totals.correct <= 38) {
            setScore(8.5);
          } else if (totals.correct >= 39 && totals.correct <= 40) {
            setScore(9);
          }
        } else {
          console.error("Invalid data structure in parsedAnswers");
        }
      } catch (error) {
        console.error("Error parsing stored answers:", error);
      }
    } else {
      console.warn("No readingTestAnswers found in localStorage");
    }
  }, []);

  // Memoize resultStats to reflect updated state
  const resultStats = useMemo(
    () => ({
      correct: correctCount,
      incorrect: incorrectCount,
      unanswered: unanswerCount,
      score: score.toFixed(1),
    }),
    [correctCount, incorrectCount, unanswerCount, score]
  );

  const scorePercentage = Number(resultStats.score) * 10;

  const handleSubmit = async () => {
    const jsonData = JSON.stringify(response, null, 2);

    // Store JSON data in localStorage
    localStorage.setItem("readingTestAnswers", jsonData);

    router.push(`${ROUTES.READING_RESULT}/${id}`);
  };

  // Helper to render passage answers
  const renderPassageAnswers = (part: PartResult, passageNum: number) => {
    // Sort user_answers: MP questions first, then FB questions
    const sortedAnswers = [...part.user_answers].sort((a, b) => {
      if (a.q_type === "MP" && b.q_type !== "MP") return -1; // MP comes first
      if (a.q_type !== "MP" && b.q_type === "MP") return 1; // FB comes after
      return 0; // Maintain original order for same types
    });

    return sortedAnswers.map((answer, index) => {
      // Adjust question numbering to reflect the passage
      const questionNumber = index + 1 + (passageNum - 1) * 13; // Assuming 13 questions per passage
      return (
        <div key={answer.question_id} className="flex items-center text-sm">
          <div className="grid grid-cols-12 gap-5 items-center justify-start w-full mt-2">
            <div className="col-span-1 flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-800 mr-2">
              {questionNumber}
            </div>
            <div className="col-span-11">
              <div>
                <span
                  className={`${
                    answer.is_pass
                      ? "text-yellow-600"
                      : answer.is_correct
                      ? "text-green-500"
                      : "text-red-500"
                  } mr-2`}
                >
                  {answer.is_pass
                    ? "Skipped"
                    : answer.is_correct
                    ? "Correct"
                    : "Incorrect"}
                </span>
                <span className="text-green-600 font-medium">
                  {Array.isArray(answer.correct_answer)
                    ? answer.correct_answer.join(", ")
                    : answer.correct_answer}
                </span>
              </div>
              {!answer.is_pass && !answer.is_correct && (
                <span className="text-gray-600 ml-2">
                  (Your answer:{" "}
                  {answer.answer.length ? answer.answer.join(", ") : "None"})
                </span>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen w-full">
      <header className="fixed top-0 left-0 right-0 bg-white shadow p-2 flex justify-between items-center z-20">
        <Link
          href={ROUTES.HOME}
          className="hidden lg:flex items-center w-[10%] py-3"
        >
          <Image
            src={IMAGES.LOGO}
            alt="DOL DINH LUC"
            width={1000}
            height={1000}
            className="ml-2 w-full h-full"
          />
        </Link>
        <div className="text-center mr-24">
          <div className="font-semibold">Answer key</div>
          <div className="text-sm text-gray-600">Reading Test</div>
        </div>
        <Link href={ROUTES.HOME} className="text-gray-600 mr-3">
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
        </Link>
      </header>

      <main
        className=" w-[95%] lg:w-[55%] mx-auto py-6 px-4 overflow-y-auto scroll-bar-style"
        style={{
          height: "calc(100vh - 10px)",
          paddingTop: "100px",
        }}
      >
        {/* Score Card */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex flex-col justify-center items-center p-6">
            <div className="font-medium text-lg mb-4">
              {resultStats.correct === 0
                ? "Oops! Bạn chưa làm đúng câu nào, cố gắng lần sau nhé."
                : `Bạn đã làm đúng ${resultStats.correct} câu!`}
            </div>

            <div className="flex justify-center lg:justify-between items-center">
              <div className="flex flex-col lg:flex-row items-center gap-16">
                <div className="relative w-44 h-44 mt-5 lg:mt-0">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#fed7aa"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="10"
                      strokeDasharray={`${scorePercentage * 2.83} 283`}
                      strokeDashoffset="0"
                      transform="rotate(-90 50 50)"
                    />
                    <circle cx="50" cy="50" r="35" fill="#fff7ed" />
                    <text
                      x="50"
                      y="61"
                      textAnchor="middle"
                      fill="#f97316"
                      fontSize="30"
                      fontWeight="bold"
                    >
                      {resultStats.score}
                    </text>
                  </svg>
                  <div className="absolute -top-[5%] lg:top-[15%] right-[36%] lg:right-[31%] bg-[#FF991F] rounded-full w-12 h-12 lg:w-8 lg:h-8 flex items-center justify-center">
                    <Check color="white" size={17} strokeWidth={6} />
                  </div>
                </div>

                <div className="flex flex-col justify-between items-center lg:items-start w-60 lg:w-full">
                  <div className="mb-2 flex flex-row justify-between items-center w-full lg:w-28">
                    <span className="text-sm text-black mr-2 font-semibold">
                      Đúng:
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded w-10 text-center">
                      {resultStats.correct}
                    </span>
                  </div>
                  <div className="mb-2 flex flex-row justify-between items-center w-full lg:w-28">
                    <span className="text-sm text-black mr-2 font-semibold">
                      Sai:
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded w-10 text-center">
                      {resultStats.incorrect}
                    </span>
                  </div>
                  <div className="mb-2 flex flex-row justify-between items-center w-full lg:w-28">
                    <span className="text-sm text-black mr-2 font-semibold">
                      Bỏ qua:
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded w-10 text-center">
                      {resultStats.unanswered}
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex w-40 h-40">
                <Image
                  src={IMAGES.RESULT}
                  alt="Student reading"
                  width={1000}
                  height={1000}
                  className="w-full h-full"
                />
              </div>
            </div>
            <div
              onClick={handleSubmit}
              className="cursor-pointer bg-red-600 text-white rounded-md px-4 py-2 text-sm mt-4"
            >
              Xem giải thích
            </div>
          </div>
        </div>

        {/* Answer Key */}
        <div className="bg-white rounded-lg shadow mb-16 lg:mb-0">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result?.result.map((part, index) => (
                <div key={part.part_id}>
                  <h3
                    className={`font-medium mb-2 ${
                      index === 2 ? "mt-5" : "mt-0"
                    }`}
                  >
                    PASSAGE {index + 1} (QUESTION {index * 13 + 1} -{" "}
                    {(index + 1) * 13 + (index === 2 ? 1 : 0)})
                  </h3>
                  <div className="space-y-2">
                    {renderPassageAnswers(part, index + 1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultStatistic;
