import { toast } from "@/hooks/use-toast";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import Image from "next/image";
import { IMAGES } from "@/utils/images";
import PassageProgressBar from "./components/processing-bar";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Grid2x2Check } from "lucide-react";
import PassageProgressBarMobile from "./components/processing-bar-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { ShortAnswerQuiz } from "./components/test-type/fil-in-the-blank/fill-in";
import PopupMenu from "./components/pop-up";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ListeningService } from "@/services/listening";
import { QuestionsService } from "@/services/questions";
import { SubmitService } from "@/services/submit";
import { ROUTES } from "@/utils/routes";
import Cookies from "js-cookie";
import { UserService } from "@/services/user";
import {
  QuizHeader,
  QuizQuestion,
} from "./components/test-type/multiple-choice/multiple-choice";
import MatchingHeadings from "./components/test-type/matching-headings/matching-headings";
import MatchingFeatures from "./components/test-type/matching-features/matching-features";
import TrueFalseNotGiven from "./components/test-type/true-false-notgiven/true-false-notgiven";

interface UserAccount {
  _id: string;
  user_name: string;
  avatar: string;
  email: string;
  password: string;
  created_at: string;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  isMultiple: boolean;
  selectedOptions: string | string[] | null;
  q_type: string;
  start_passage?: string;
  end_passage?: string;
  question_id: string;
  // Add new properties for different question types
  heading?: string;
  paragraph_id?: string;
  feature?: string;
  sentence?: string;
}

interface PassageSection {
  _id: string;
  stest_id: string;
  type: string;
  image: string;
  content: string;
  part_num: number;
  audio?: string;
  question: Array<{
    question: any;
    _id: string;
    q_type: string;
    part_id: string;
    choices?: string[];
    options?: string[];
    isMultiple?: boolean;
    answer: string[];
    created_at: string;
    start_passage?: string;
    end_passage?: string;
    // Add new properties for different question types
    heading?: string;
    paragraph_id?: string;
    feature?: string;
    sentence?: string;
  }>;
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

interface UserAnswer {
  question_id: string;
  answer: string[];
}

interface PartAnswer {
  part_id: string;
  user_answers: UserAnswer[];
  isComplete: boolean;
}

interface AnswerState {
  parts: PartAnswer[];
}

interface PassageInfo {
  id: number;
  startQuestion: number;
  endQuestion: number;
  answeredQuestions: number;
}

const TimeProgressBar: React.FC<{ progress: number; timeLeft: string }> = ({
  progress,
  timeLeft,
}) => {
  return (
    <div className="flex items-center w-screen h-4">
      {/* Progress Bar */}
      <div
        className={`relative h-0.5 bg-[#FA812F] rounded-full overflow-hidden`}
        style={{ width: `${100 - progress}%` }}
      >
        <div className="absolute top-0 left-0 h-full bg-[#FA812F] transition-all duration-1000 rounded-full" />
      </div>
      {/* Time Display */}
      <div className="bg-[#FA812F] text-white text-sm font-semibold px-2 py-0.5 rounded-full">
        {timeLeft}
      </div>
    </div>
  );
};

const ListeningTestClient: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRetake = searchParams.get("isRetake") === "true";
  const [data, setData] = useState<ListenDetail | null>(null);
  const [passage1, setPassage1] = useState<PassageSection | null>(null);
  const [passage2, setPassage2] = useState<PassageSection | null>(null);
  const [passage3, setPassage3] = useState<PassageSection | null>(null);
  const [passage4, setPassage4] = useState<PassageSection | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [selectedPassage, setSelectedPassage] = useState(1);
  const [answers, setAnswers] = useState<AnswerState>({ parts: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(true);
  const [showConfirmSubmitDialog, setShowConfirmSubmitDialog] = useState(false);
  const [showCheckFullAnsDialog, setShowCheckFullAnsDialog] = useState(false);
  const [showConfirmCloseDialog, setShowConfirmCloseDialog] = useState(false);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [initialTotalTime, setInitialTotalTime] = useState<number | null>(null);
  const [progress, setProgress] = useState(100);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [showGetInfoDialog, setShowGetInfoDialog] = useState(false);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [guestGmail, setGuestGmail] = useState("");
  const isLogin = Cookies.get("isLogin");
  const [isSinglePartMode, setIsSinglePartMode] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const [isPassageProgressBarOpen, setIsPassageProgressBarOpen] =
    useState(false);
  const [isAutoSubmitted, setIsAutoSubmitted] = useState(false);

  // ALERT ON PAGE RELOAD OR CLOSE
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = ""; // Standard way to trigger the browser's confirmation dialog
      return "Are you sure you want to leave? Your answers will not be saved.";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Memoize audio sources to prevent re-computation on every render
  const audioSources = useMemo(() => {
    // Collect all non-null passage audios in order
    return [passage1, passage2, passage3, passage4]
      .filter((p): p is PassageSection => !!p && !!p.audio)
      .map((p) => p.audio as string);
  }, [passage1, passage2, passage3, passage4]);

  // Update currentAudio based on currentAudioIndex
  useEffect(() => {
    const sectionLabels = ["Section 1", "Section 2", "Section 3", "Section 4"];
    if (currentAudioIndex >= 0 && currentAudioIndex < sectionLabels.length) {
      setCurrentAudio(sectionLabels[currentAudioIndex]);
    } else {
      setCurrentAudio(null);
    }
  }, [currentAudioIndex]);

  // Function to get the duration of an audio file
  const getAudioDuration = (src: string): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio(src);
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
        audio.remove();
      };
      audio.onerror = () => {
        console.warn(`Failed to load audio: ${src}`);
        resolve(0);
      };
    });
  };

  // Calculate total audio duration and set initial timeLeft
  useEffect(() => {
    const calculateTotalDuration = async () => {
      if (audioSources.length === 0) {
        setTimeLeft("00:15"); // Fallback to 15 seconds if no audio
        setInitialTotalTime(15);
        return;
      }

      try {
        const durations = await Promise.all(
          audioSources.map((src) => getAudioDuration(src))
        );
        const totalDuration = durations.reduce(
          (sum, duration) => sum + duration,
          0
        );
        const totalSeconds = Math.ceil(totalDuration) + 15; // Add 15 seconds

        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;
        setTimeLeft(formattedTime);
        setInitialTotalTime(totalSeconds);
      } catch (error) {
        console.error("Error calculating audio durations:", error);
        setTimeLeft("00:15"); // Fallback to 15 seconds on error
        setInitialTotalTime(15);
      }
    };

    if (audioSources.length > 0) {
      calculateTotalDuration();
    }
  }, [audioSources]);

  // Update progress based on timeLeft
  useEffect(() => {
    if (!timeLeft || !initialTotalTime || !isTimerRunning) {
      setProgress(100);
      return;
    }

    const [minutes, seconds] = timeLeft.split(":").map(Number);
    const currentSeconds = minutes * 60 + seconds;
    const progressPercentage = (currentSeconds / initialTotalTime) * 100;
    setProgress(Math.max(0, progressPercentage));
  }, [timeLeft, initialTotalTime, isTimerRunning]);

  // Countdown timer logic
  useEffect(() => {
    if (!timeLeft || !isTimerRunning) return;

    const [minutes, seconds] = timeLeft.split(":").map(Number);
    let totalSeconds = minutes * 60 + seconds;

    if (totalSeconds <= 0) {
      setTimeLeft("00:00");
      setProgress(0);
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
        setProgress(0);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTimerRunning]);

  // Audio playback logic
  useEffect(() => {
    if (currentAudioIndex < 0 || currentAudioIndex >= audioSources.length) {
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(audioSources[currentAudioIndex]);
    audioRef.current = audio;

    audio.play().catch((error) => {
      console.error(
        `Error playing audio ${audioSources[currentAudioIndex]}:`,
        error
      );
    });

    const handleEnded = () => {
      setCurrentAudioIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex < audioSources.length) {
          return nextIndex;
        }
        return prev; // Stop at the last audio
      });
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("ended", handleEnded);
        audioRef.current = null;
      }
    };
  }, [currentAudioIndex, audioSources]);

  const calculatePassages = (): PassageInfo[] => {
    const passagesInfo: PassageInfo[] = [];
    const passageData = [passage1, passage2, passage3, passage4].filter(
      (p): p is PassageSection => p !== null
    );

    let questionCounter = 1;

    passageData.forEach((passage, index) => {
      const questionCount = passage.question.length;
      const partId = passage._id;

      const answeredQuestions = answers.parts
        .filter((part) => part.part_id === partId)
        .reduce((count, part) => {
          return (
            count +
            part.user_answers.filter(
              (ua) => ua.answer.length > 0 && ua.answer[0] !== ""
            ).length
          );
        }, 0);

      passagesInfo.push({
        id: index + 1,
        startQuestion: questionCounter,
        endQuestion: questionCounter + questionCount - 1,
        answeredQuestions,
      });

      questionCounter += questionCount;
    });

    return passagesInfo;
  };

  const passages = calculatePassages();

  const mapAndArrangeQuestions = (passage: PassageSection, startId: number) => {
    const mappedQuestions = passage.question.map((q, index) => {
      const partAnswer = answers.parts.find(
        (part) => part.part_id === q.part_id
      );
      const userAnswer = partAnswer?.user_answers.find(
        (ua) => ua.question_id === q._id
      );

      // Improved handling of selectedOptions for different question types
      let selectedOptions;
      if (userAnswer?.answer?.length) {
        if (q.q_type === "MP" && q.isMultiple) {
          selectedOptions = userAnswer.answer;
        } else if (q.q_type === "MP") {
          selectedOptions = userAnswer.answer[0];
        } else if (
          q.q_type === "MH" ||
          q.q_type === "MF" ||
          q.q_type === "TFNG"
        ) {
          // For matching headings, matching features, and true-false-not-given
          selectedOptions = userAnswer.answer[0] || "";
        } else {
          // For fill-in-the-blank and other types
          selectedOptions = userAnswer.answer[0] || "";
        }
      } else {
        // Default values when no answer is selected
        if (q.q_type === "MP") {
          selectedOptions = q.isMultiple ? [] : null;
        } else {
          selectedOptions = "";
        }
      }

      return {
        id: startId + index,
        question:
          q.q_type === "MP"
            ? q.question
            : q.q_type === "MH"
            ? q.question
            : q.q_type === "MF"
            ? q.question
            : q.q_type === "TFNG"
            ? q.question
            : "",
        options:
          q.q_type === "MP" && q.choices
            ? q.choices
            : q.q_type === "MH" && q.options
            ? q.options
            : q.q_type === "MF" && q.options
            ? q.options
            : [],
        isMultiple: q.q_type === "MP" ? q.isMultiple || false : false,
        selectedOptions,
        q_type: q.q_type,
        start_passage: q.q_type === "FB" ? q.start_passage : undefined,
        end_passage: q.q_type === "FB" ? q.end_passage : undefined,
        question_id: q._id,
        // Add new properties for different question types
        heading: q.q_type === "MH" ? q.heading : undefined,
        paragraph_id: q.q_type === "MH" ? q.paragraph_id : undefined,
        feature: q.q_type === "MF" ? q.feature : undefined,
        sentence: q.q_type === "TFNG" ? q.sentence : undefined,
      };
    });

    const firstQuestionType = passage.question[0]?.q_type;

    // Updated arrangement to include MH, MF, and TFNG question types
    let arrangedQuestions: any[] = [];

    if (firstQuestionType === "MP") {
      arrangedQuestions = [
        ...mappedQuestions.filter((q) => q.q_type === "MP"),
        ...mappedQuestions.filter((q) => q.q_type === "FB"),
        ...mappedQuestions.filter((q) => q.q_type === "MH"),
        ...mappedQuestions.filter((q) => q.q_type === "MF"),
        ...mappedQuestions.filter((q) => q.q_type === "TFNG"),
      ];
    } else if (firstQuestionType === "FB") {
      arrangedQuestions = [
        ...mappedQuestions.filter((q) => q.q_type === "FB"),
        ...mappedQuestions.filter((q) => q.q_type === "MP"),
        ...mappedQuestions.filter((q) => q.q_type === "MH"),
        ...mappedQuestions.filter((q) => q.q_type === "MF"),
        ...mappedQuestions.filter((q) => q.q_type === "TFNG"),
      ];
    } else if (firstQuestionType === "MH") {
      arrangedQuestions = [
        ...mappedQuestions.filter((q) => q.q_type === "MH"),
        ...mappedQuestions.filter((q) => q.q_type === "MP"),
        ...mappedQuestions.filter((q) => q.q_type === "FB"),
        ...mappedQuestions.filter((q) => q.q_type === "MF"),
        ...mappedQuestions.filter((q) => q.q_type === "TFNG"),
      ];
    } else if (firstQuestionType === "MF") {
      arrangedQuestions = [
        ...mappedQuestions.filter((q) => q.q_type === "MF"),
        ...mappedQuestions.filter((q) => q.q_type === "MP"),
        ...mappedQuestions.filter((q) => q.q_type === "FB"),
        ...mappedQuestions.filter((q) => q.q_type === "MH"),
        ...mappedQuestions.filter((q) => q.q_type === "TFNG"),
      ];
    } else if (firstQuestionType === "TFNG") {
      arrangedQuestions = [
        ...mappedQuestions.filter((q) => q.q_type === "TFNG"),
        ...mappedQuestions.filter((q) => q.q_type === "MP"),
        ...mappedQuestions.filter((q) => q.q_type === "FB"),
        ...mappedQuestions.filter((q) => q.q_type === "MH"),
        ...mappedQuestions.filter((q) => q.q_type === "MF"),
      ];
    } else {
      // Default arrangement if no recognized question type is first
      arrangedQuestions = mappedQuestions;
    }

    return arrangedQuestions.map((q, index) => ({
      ...q,
      id: startId + index,
    }));
  };

  const init = async () => {
    const segments = pathname.split("/").filter(Boolean);
    const id = segments[segments.length - 1];

    try {
      setIsDataLoading(true); // Add this line at the start

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

      const res = await ListeningService.getListeningById(id);
      if (!res) throw new Error("Listening data not found");

      const partIds = res.parts || [];
      const questionResults = await Promise.all(
        partIds.map((partId: string) =>
          QuestionsService.getQuestionsById(partId)
        )
      );

      // questionResults will be [resP1, resP2, ...] (length matches partIds.length)

      const passageArr = questionResults.filter(Boolean);
      if (passageArr.length === 0) {
        setData(null);
        return;
      }

      // Set passages dynamically
      if (passageArr[0]) setPassage1(passageArr[0]);
      if (passageArr[1]) setPassage2(passageArr[1]);
      if (passageArr[2]) setPassage3(passageArr[2]);
      if (passageArr[3]) setPassage4(passageArr[3]);

      setData(res);

      setAnswers((prev) => {
        if (prev.parts.length > 0) return prev;
        const allQuestions = passageArr.flatMap((p) =>
          p.question.map((q: any) => ({
            part_id: q.part_id,
            question_id: q._id,
          }))
        );
        const groupedByPartId = allQuestions.reduce(
          (acc, { part_id, question_id }) => {
            if (!acc[part_id]) {
              acc[part_id] = {
                part_id,
                user_answers: [],
                isComplete: false,
              };
            }
            acc[part_id].user_answers.push({ question_id, answer: [] });
            return acc;
          },
          {} as Record<string, PartAnswer>
        );
        const initialParts: PartAnswer[] = Object.values(groupedByPartId);
        return { parts: initialParts };
      });

      const passageQuestionCounts = passageArr.map((p) => p.question.length);
      const passagesWithQuestions = passageQuestionCounts.filter(
        (count) => count > 0
      ).length;

      if (passagesWithQuestions < 4) {
        setIsSinglePartMode(true);
        const allQs = passageArr.flatMap((p, idx) =>
          mapAndArrangeQuestions(
            p,
            1 +
              (idx === 0
                ? 0
                : passageQuestionCounts
                    .slice(0, idx)
                    .reduce((a, b) => a + b, 0))
          )
        );
        setQuestions(allQs);
        setAllQuestions(allQs);
      } else {
        // All 4 parts exist
        const passage1Questions = mapAndArrangeQuestions(passageArr[0], 1);
        const passage2Questions = mapAndArrangeQuestions(
          passageArr[1],
          passage1Questions.length + 1
        );
        const passage3Questions = mapAndArrangeQuestions(
          passageArr[2],
          passage1Questions.length + passage2Questions.length + 1
        );
        const passage4Questions = mapAndArrangeQuestions(
          passageArr[3],
          passage1Questions.length +
            passage2Questions.length +
            passage3Questions.length +
            1
        );

        setAllQuestions([
          ...passage1Questions,
          ...passage2Questions,
          ...passage3Questions,
          ...passage4Questions,
        ]);
        setQuestions(passage1Questions);
      }

      setIsDataLoading(false); // Add this line at the end of successful execution
    } catch (error) {
      console.error("Error initializing listening test:", error);
      setData(null);
      setIsDataLoading(false); // Add this line to handle error case
    }
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    const startIds = passages.reduce(
      (acc, passage) => ({
        ...acc,
        [passage.id]: passage.startQuestion,
      }),
      {} as { [key: number]: number }
    );

    const passageData = { 1: passage1, 2: passage2, 3: passage3, 4: passage4 };
    const selectedPassageData = passageData[selectedPassage as 1 | 2 | 3 | 4];
    if (selectedPassageData) {
      const updatedQuestions = mapAndArrangeQuestions(
        selectedPassageData,
        startIds[selectedPassage]
      );
      setQuestions(updatedQuestions);
    }
  }, [selectedPassage, passage1, passage2, passage3, passage4, answers]);

  const handlePassageSelect = (passageId: number) => {
    setSelectedPassage(passageId);
    setCurrentPage(passageId);
  };

  const handleQuestionSelect = (questionNum: number) => {
    const passage = passages.find(
      (p) => questionNum >= p.startQuestion && questionNum <= p.endQuestion
    );
    if (passage) {
      setSelectedPassage(passage.id);
      setCurrentPage(passage.id);
    }
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

  const currentPassage = passages[selectedPassage - 1] || {
    startQuestion: 1,
    endQuestion: 1,
    answeredQuestions: 0,
  };

  const passageQuestionNumbers = Array.from(
    {
      length: currentPassage.endQuestion - currentPassage.startQuestion + 1,
    },
    (_, i) => currentPassage.startQuestion + i
  );

  const getAnsweredStatus = (questionNum: number) => {
    const question = allQuestions.find((q) => q.id === questionNum);
    if (!question) return false;

    const questionData =
      passage1?.question.find((q) => q._id === question.question_id) ||
      passage2?.question.find((q) => q._id === question.question_id) ||
      passage3?.question.find((q) => q._id === question.question_id) ||
      passage4?.question.find((q) => q._id === question.question_id);

    if (!questionData) return false;

    const partAnswer = answers.parts.find(
      (part) => part.part_id === questionData.part_id
    );
    if (!partAnswer) return false;

    const userAnswer = partAnswer.user_answers.find(
      (ua) => ua.question_id === question.question_id
    );
    if (!userAnswer) return false;

    const hasAnswer = userAnswer.answer?.length > 0;
    if (!hasAnswer) return false;

    if (question.q_type === "FB") {
      return userAnswer.answer[0] !== "";
    }

    // All other question types (MP, MH, MF, TFNG) are considered answered if they have an answer
    return true;
  };

  const updatePartCompletion = (partId: string) => {
    setAnswers((prev) => {
      const updatedParts = prev.parts.map((part) => {
        if (part.part_id === partId) {
          const allAnswered = part.user_answers.every(
            (ua) => ua.answer.length > 0 && ua.answer[0] !== ""
          );
          return { ...part, isComplete: allAnswered };
        }
        return part;
      });
      return { parts: updatedParts };
    });
  };

  // Unified function to get saved answers for all question types
  const getSavedAnswers = (questions: any[], questionType: string) => {
    const savedAnswers: Record<string, string> = {};

    questions.forEach((q) => {
      const questionData =
        passage1?.question.find((pq) => pq._id === q.question_id) ||
        passage2?.question.find((pq) => pq._id === q.question_id) ||
        passage3?.question.find((pq) => pq._id === q.question_id) ||
        passage4?.question.find((pq) => pq._id === q.question_id);

      if (questionData) {
        const partAnswer = answers.parts.find(
          (part) => part.part_id === questionData.part_id
        );
        const userAnswer = partAnswer?.user_answers.find(
          (ua) => ua.question_id === q.question_id
        );

        // Fixed TypeScript errors by safely checking for undefined values
        if (
          userAnswer &&
          userAnswer.answer &&
          userAnswer.answer.length > 0 &&
          userAnswer.answer[0] !== ""
        ) {
          // Use different keys based on question type
          if (questionType === "MH" && q.paragraph_id) {
            // For MH, store the full answer (id + text)
            savedAnswers[q.paragraph_id] = userAnswer.answer[0];
          } else if (
            questionType === "MF" ||
            questionType === "TFNG" ||
            questionType === "MP" ||
            questionType === "FB"
          ) {
            if (q.id) {
              savedAnswers[q.id.toString()] = userAnswer.answer[0];
            }
          }
        }
      }
    });

    return savedAnswers;
  };

  const handleSelectOption = (questionId: number, option: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) {
      console.error("Question not found:", questionId);
      return;
    }

    const questionData =
      passage1?.question.find((q) => q._id === question.question_id) ||
      passage2?.question.find((q) => q._id === question.question_id) ||
      passage3?.question.find((q) => q._id === question.question_id) ||
      passage4?.question.find((q) => q._id === question.question_id);

    if (!questionData) {
      console.error("Question data not found for ID:", question.question_id);
      return;
    }

    setAnswers((prev) => {
      const updatedParts = prev.parts.map((part) => {
        if (part.part_id === questionData.part_id) {
          let updatedUserAnswers = part.user_answers;
          if (
            !updatedUserAnswers.some(
              (ua) => ua.question_id === question.question_id
            )
          ) {
            updatedUserAnswers = [
              ...updatedUserAnswers,
              { question_id: question.question_id, answer: [] },
            ];
          }

          updatedUserAnswers = updatedUserAnswers.map((ua) => {
            if (ua.question_id === question.question_id) {
              const currentAnswer = ua.answer || [];
              let newAnswer: string[];

              // Handle different question types comprehensively
              if (question.q_type === "MP" && question.isMultiple) {
                // Multiple choice with multiple answers
                newAnswer = currentAnswer.includes(option)
                  ? currentAnswer.filter((opt) => opt !== option)
                  : [...currentAnswer, option];
              } else if (question.q_type === "MH" || question.q_type === "MF") {
                // For MH and MF, store only the option text without duplicating the ID
                const optionIndex = question.options.indexOf(option);
                if (optionIndex !== -1) {
                  // If option is a full text (from the options array)
                  const optionId =
                    question.q_type === "MH"
                      ? [
                          "i",
                          "ii",
                          "iii",
                          "iv",
                          "v",
                          "vi",
                          "vii",
                          "viii",
                          "ix",
                          "x",
                          "xi",
                          "xii",
                        ][optionIndex]
                      : ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"][
                          optionIndex
                        ];
                  // Store only the option text to avoid duplication
                  newAnswer = [option];
                } else {
                  // If option is already in the format "id text" or just an id
                  // Check if it starts with a known ID pattern and extract just the text
                  const mhIdPattern =
                    /^(i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\s+/;
                  const mfIdPattern = /^([A-J])\s+/;

                  if (question.q_type === "MH" && mhIdPattern.test(option)) {
                    newAnswer = [option.replace(mhIdPattern, "")];
                  } else if (
                    question.q_type === "MF" &&
                    mfIdPattern.test(option)
                  ) {
                    newAnswer = [option.replace(mfIdPattern, "")];
                  } else {
                    newAnswer = [option];
                  }
                }
              } else {
                // Single answer questions (TFNG, FB)
                newAnswer = [option];
              }

              return {
                ...ua,
                answer: newAnswer,
              };
            }
            return ua;
          });

          return { ...part, user_answers: updatedUserAnswers };
        }
        return part;
      });

      return { parts: updatedParts };
    });

    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              selectedOptions: question.isMultiple
                ? Array.isArray(q.selectedOptions)
                  ? q.selectedOptions.includes(option)
                    ? q.selectedOptions.filter((opt) => opt !== option)
                    : [...q.selectedOptions, option]
                  : [option]
                : option,
            }
          : q
      )
    );

    setAllQuestions((prevAllQuestions) =>
      prevAllQuestions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              selectedOptions: question.isMultiple
                ? Array.isArray(q.selectedOptions)
                  ? q.selectedOptions.includes(option)
                    ? q.selectedOptions.filter((opt) => opt !== option)
                    : [...q.selectedOptions, option]
                  : [option]
                : option,
            }
          : q
      )
    );

    updatePartCompletion(questionData.part_id);
  };

  const handleFillInAnswer = (questionId: number, answer: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const questionData =
      passage1?.question.find((q) => q._id === question.question_id) ||
      passage2?.question.find((q) => q._id === question.question_id) ||
      passage3?.question.find((q) => q._id === question.question_id) ||
      passage4?.question.find((q) => q._id === question.question_id);

    if (!questionData) return;

    setAnswers((prev) => {
      const updatedParts = prev.parts.map((part) => {
        if (part.part_id === questionData.part_id) {
          const updatedUserAnswers = part.user_answers.map((ua) =>
            ua.question_id === question.question_id
              ? { ...ua, answer: [answer] }
              : ua
          );
          return { ...part, user_answers: updatedUserAnswers };
        }
        return part;
      });
      return { parts: updatedParts };
    });

    setAllQuestions((prevAllQuestions) =>
      prevAllQuestions.map((q) =>
        q.id === questionId ? { ...q, selectedOptions: answer } : q
      )
    );

    updatePartCompletion(questionData.part_id);
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
      parts: answers.parts,
    };

    console.log("check body: ", JSON.stringify(body));

    try {
      const response = await (isRetake
        ? SubmitService.updateSubmitTest(body)
        : SubmitService.submitTest(body));
      const jsonData = JSON.stringify(response, null, 2);
      localStorage.setItem("listeningTestAnswers", jsonData);
      const segments = pathname.split("/").filter(Boolean);
      const testId = segments[segments.length - 1];
      router.push(`${ROUTES.LISTENING_STATISTIC}/${testId}`);
    } catch (error) {
      console.error("Error submitting test:", error);
    }
  };

  const handleStartTest = () => {
    setShowConfirmDialog(false);
    if (audioSources.length > 0) {
      console.log("audioSources", audioSources);
      setCurrentAudioIndex(0); // Start playing the first audio
    } else {
      console.warn("No audio sources available");
    }
    setIsTimerRunning(true); // Start the timer
  };

  const handleCancelTest = () => {
    setShowConfirmDialog(false);
    router.push(`${ROUTES.LISTENING_HOME}`);
  };

  const handleSubmitTest = () => {
    handleSubmit();
  };

  const handleCancelSubmitTest = () => {
    setShowConfirmSubmitDialog(false);
    setShowGetInfoDialog(false);
  };

  // Check if all data is ready for starting the test
  const isDataReady = !isDataLoading && data && allQuestions.length > 0;

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
      parts: answers.parts,
    };

    // console.log("submit body: ", JSON.stringify(body));

    try {
      const response = await (isRetake
        ? SubmitService.updateSubmitTest(body)
        : SubmitService.submitTest(body));
      toast({
        title: "Thời gian đã hết",
        description: "Bài thi đã được tự động nộp",
      });
      const jsonData = JSON.stringify(response, null, 2);
      localStorage.setItem("listeningTestAnswers", jsonData);
      router.push(`${ROUTES.LISTENING_STATISTIC}/${id}`);
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
    isRetake,
    router,
  ]);

  useEffect(() => {
    if (!timeLeft || !isTimerRunning) return;

    const [minutes, seconds] = timeLeft.split(":").map(Number);
    let totalSeconds = minutes * 60 + seconds;

    if (totalSeconds <= 0) {
      setTimeLeft("00:00");
      setProgress(0);
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
        setProgress(0);
        handleAutoSubmit(); // Auto-submit when time is up
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTimerRunning, handleAutoSubmit]);

  return (
    <div className="relative bg-gray-100 min-h-screen w-full">
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
                {/* {isDataLoading && (
                  <div className="flex items-center justify-center mb-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FA812F]"></div>
                    <span className="ml-2 text-sm text-gray-600">
                      Đang tải dữ liệu bài thi...
                    </span>
                  </div>
                )} */}
                <div>
                  <strong className="uppercase">IELTS Listening Test</strong>
                  <p>&ensp; &#8226; Time approximately 60 minutes.</p>
                </div>
                <div className="mt-3">
                  <strong className="uppercase">
                    Instructions to candidates:
                  </strong>
                  <p>&ensp; &#8226; Answer all the questions.</p>
                  <p>
                    &ensp; &#8226; You can change your answer at anytime during
                    the test.
                  </p>
                </div>
                <div className="mt-3">
                  <strong className="uppercase">
                    Information for candidates:
                  </strong>
                  <p>&ensp; &#8226; There are questions in the test.</p>
                  <p>&ensp; &#8226; Each question carry one mark.</p>
                  <p>&ensp; &#8226; You will hear each section once.</p>
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
                  disabled={!isDataReady}
                  className={`px-4 py-2 rounded-md transition ${
                    isDataReady
                      ? "bg-[#FA812F] text-white hover:bg-[#e06b1f]"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isDataLoading ? "Đang tải..." : "Bắt đầu"}
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

      {/* Answer Full Questions Dialog */}
      <AnimatePresence>
        {showCheckFullAnsDialog && (
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
                Vui lòng trả lời đầy đủ các câu hỏi
              </h2>
              <p className="text-gray-600 mb-6">
                Bạn đã trả lời{" "}
                {passages.reduce(
                  (acc, passage) => acc + passage.answeredQuestions,
                  0
                )}{" "}
                / {allQuestions.length} câu hỏi trong đoạn văn này. Vui lòng đảm
                bảo bạn đã trả lời tất cả các câu hỏi trước khi nộp bài.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowCheckFullAnsDialog(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 flex items-center justify-between bg-white py-2 px-4 shadow-sm z-10">
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
          <div className="text-sm text-gray-600">Listening Test</div>
        </div>
        <div className="flex items-center">
          <div className="relative hidden lg:flex flex-row items-center mr-5">
            <div
              className={`w-36 flex justify-center items-center ${
                passages.length === 1 ||
                (passages.length === 2 && selectedPassage === 2) ||
                (passages.length === 3 && selectedPassage === 3) ||
                selectedPassage === 4
                  ? "border border-[#FA812F]"
                  : "hidden"
              } rounded-lg my-2 py-2 px-4 mr-4 bg-[#FA812F] text-white cursor-pointer`}
              onClick={() => {
                if (
                  isLogin &&
                  passages.reduce(
                    (acc, passage) => acc + passage.answeredQuestions,
                    0
                  ) === allQuestions.length
                ) {
                  setShowConfirmSubmitDialog(true);
                } else if (
                  !isLogin &&
                  passages.reduce(
                    (acc, passage) => acc + passage.answeredQuestions,
                    0
                  ) === allQuestions.length
                ) {
                  setShowGetInfoDialog(true);
                } else {
                  setShowCheckFullAnsDialog(true);
                }
              }}
            >
              <div
                className={`font-medium text-md justify-center items-center ${
                  passages.length === 1 ||
                  (passages.length === 2 && selectedPassage === 2) ||
                  (passages.length === 3 && selectedPassage === 3) ||
                  selectedPassage === 4
                    ? "flex"
                    : "hidden"
                }`}
              >
                Nộp bài
              </div>
            </div>
            <div>
              {(() => {
                const passage = passages.find(
                  (passage) => selectedPassage === passage.id
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
                        choosenPassage={selectedPassage === passage.id}
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
                    choosenPassage={selectedPassage === passage.id}
                    onClick={() => {
                      handlePassageSelect(passage.id);
                      setIsPassageProgressBarOpen(!isPassageProgressBarOpen);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="w-40 flex flex-row items-center">
            <div className="text-sm flex flex-col items-center mr-3">
              <div>Đã làm</div>
              <div className="font-semibold">
                <span
                  className={`${
                    passages.reduce(
                      (acc, passage) => acc + passage.answeredQuestions,
                      0
                    ) === allQuestions.length
                      ? "text-[#FA812F]"
                      : ""
                  }`}
                >
                  {passages.reduce(
                    (acc, passage) => acc + passage.answeredQuestions,
                    0
                  )}
                </span>
                <span className="text-[#FA812F]">/{allQuestions.length}</span>
              </div>
            </div>
            <div>
              <div className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
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
              <div className="text-xs mt-1">Audio: {currentAudio}</div>
            </div>
          </div>
          <div
            className="text-gray-400 hover:text-gray-600 ml-4 cursor-pointer"
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
      <div className="fixed top-[0] bottom-[0] left-0 right-0 overflow-y-auto mt-14 pb-16 lg:pb-5">
        <div className=" mx-auto w-full lg:w-[65%] p-3 lg:p-4 pt-7 lg:pt-9 pb-5 lg:pb-0">
          {questions.reduce((acc: JSX.Element[], question, index) => {
            if (question.q_type === "MP") {
              const mpQuestions = questions
                .filter((q) => q.q_type === "MP")
                .map((q) => ({
                  id: q.id,
                  question: q.question,
                  options: q.options,
                  isMultiple: q.isMultiple,
                  selectedOptions: q.selectedOptions,
                }));
              if (index === questions.findIndex((q) => q.q_type === "MP")) {
                acc.push(
                  <div key={`mp-${index}`} className="mb-4">
                    <QuizHeader
                      title={`Questions ${mpQuestions[0].id} - ${
                        mpQuestions[mpQuestions.length - 1].id
                      }`}
                      subtitle="Choose the correct answer"
                    />
                    {/* <div className="border border-gray-200 pt-6 pb-1 bg-white rounded-lg">
                      {mpQuestions.map((q) => (
                        <QuizQuestion
                          key={q.id}
                          id={q.id}
                          question={q.question}
                          options={q.options}
                          isMultiple={q.isMultiple}
                          selectedOptions={q.selectedOptions}
                          onSelectOption={(option) =>
                            handleSelectOption(q.id, option)
                          }
                        />
                      ))}
                    </div> */}

                    <div className="border border-gray-200 rounded-lg pt-6 pb-1 grid grid-cols-1 lg:grid-cols-2 gap-4 bg-white">
                      {/* {mpQuestions.map((q) => (
                            <QuizQuestion
                              key={q.id}
                              id={q.id}
                              question={q.question}
                              options={q.options}
                              isMultiple={q.isMultiple}
                              selectedOptions={q.selectedOptions}
                              onSelectOption={(option) =>
                                handleSelectOption(q.id, option)
                              }
                            />
                          ))} */}

                      {/* Left Column - First Half of Questions */}
                      <div className="space-y-4">
                        {mpQuestions
                          .slice(0, Math.ceil(mpQuestions.length / 2))
                          .map((q) => (
                            <QuizQuestion
                              key={q.id}
                              id={q.id}
                              question={q.question}
                              options={q.options}
                              isMultiple={q.isMultiple}
                              selectedOptions={q.selectedOptions}
                              onSelectOption={(option) =>
                                handleSelectOption(q.id, option)
                              }
                            />
                          ))}
                      </div>

                      {/* Right Column - Second Half of Questions */}
                      <div className="space-y-4">
                        {mpQuestions
                          .slice(Math.ceil(mpQuestions.length / 2))
                          .map((q) => (
                            <QuizQuestion
                              key={q.id}
                              id={q.id}
                              question={q.question}
                              options={q.options}
                              isMultiple={q.isMultiple}
                              selectedOptions={q.selectedOptions}
                              onSelectOption={(option) =>
                                handleSelectOption(q.id, option)
                              }
                            />
                          ))}
                      </div>
                    </div>
                  </div>
                );
              }
            } else if (question.q_type === "FB") {
              const fbQuestions = questions
                .filter((q) => q.q_type === "FB")
                .map((q) => ({
                  id: q.id,
                  start_passage: q.start_passage || "",
                  end_passage: q.end_passage || "",
                  selectedAnswer: q.selectedOptions || "",
                }));
              if (index === questions.findIndex((q) => q.q_type === "FB")) {
                acc.push(
                  <div key={`fb-${index}`} className="mb-6">
                    <ShortAnswerQuiz
                      title={`Questions ${fbQuestions[0].id} - ${
                        fbQuestions[fbQuestions.length - 1].id
                      }`}
                      subtitle=""
                      instructions="Write your answers in the boxes provided."
                      questions={fbQuestions.map((q) => ({
                        ...q,
                        selectedAnswer: Array.isArray(q.selectedAnswer)
                          ? q.selectedAnswer.join(", ")
                          : q.selectedAnswer,
                      }))}
                      onAnswerChange={handleFillInAnswer}
                    />
                  </div>
                );
              }
            } else if (question.q_type === "MH") {
              const mhQuestions = questions
                .filter((q) => q.q_type === "MH")
                .map((q) => ({
                  q_type: "MH" as const,
                  part_id: parseInt(q.question_id),
                  heading: q.heading || "",
                  answer: "",
                  options: q.options,
                  paragraph_id: q.paragraph_id || "",
                  id: q.id,
                  question_id: q.question_id, // Add this for unified approach
                }));
              if (index === questions.findIndex((q) => q.q_type === "MH")) {
                const startQ = mhQuestions[0].id;
                const endQ = mhQuestions[mhQuestions.length - 1].id;
                const savedAnswers = getSavedAnswers(mhQuestions, "MH"); // Use unified function
                acc.push(
                  <div key={`mh-${index}`} className="mb-6">
                    <MatchingHeadings
                      questions={mhQuestions}
                      savedAnswers={savedAnswers} // Pass saved answers
                      handleSelectOption={(paragraphId, option) => {
                        const questionId = questions.find(
                          (q) => q.paragraph_id === paragraphId
                        )?.id;
                        if (questionId) {
                          handleSelectOption(questionId, option);
                        }
                      }}
                      startQuestion={startQ}
                      endQuestion={endQ}
                    />
                  </div>
                );
              }
            } else if (question.q_type === "MF") {
              const mfQuestions = questions
                .filter((q) => q.q_type === "MF")
                .map((q) => ({
                  q_type: "MF" as const,
                  part_id: parseInt(q.question_id),
                  feature: q.feature || "",
                  answer: "",
                  options: q.options,
                  id: q.id,
                  question_id: q.question_id, // Add this for unified approach
                }));
              if (index === questions.findIndex((q) => q.q_type === "MF")) {
                const startQ = mfQuestions[0].id;
                const endQ = mfQuestions[mfQuestions.length - 1].id;
                const savedAnswers = getSavedAnswers(mfQuestions, "MF"); // Use unified function
                acc.push(
                  <div key={`mf-${index}`} className="mb-6">
                    <MatchingFeatures
                      questions={mfQuestions}
                      savedAnswers={savedAnswers} // Pass saved answers
                      handleSelectOption={(statementId, option) => {
                        handleSelectOption(statementId, option);
                      }}
                      startQuestion={startQ}
                      endQuestion={endQ}
                    />
                  </div>
                );
              }
            } else if (question.q_type === "TFNG") {
              const tfngQuestions = questions
                .filter((q) => q.q_type === "TFNG")
                .map((q) => ({
                  q_type: "TFNG" as const,
                  part_id: q.question_id,
                  sentence: q.sentence || "",
                  answer: "",
                  id: q.id,
                  question_id: q.question_id, // Add this for unified approach
                }));
              if (index === questions.findIndex((q) => q.q_type === "TFNG")) {
                const firstQuestion = questions.find(
                  (q) => q.q_type === "TFNG"
                );
                const startQ = firstQuestion
                  ? firstQuestion.id
                  : questions.findIndex((q) => q.q_type === "TFNG") + 1;
                const endQ = startQ + tfngQuestions.length - 1;
                const savedAnswers = getSavedAnswers(tfngQuestions, "TFNG"); // Use unified function
                acc.push(
                  <div key={`tfng-${index}`} className="mb-6">
                    <TrueFalseNotGiven
                      questions={tfngQuestions as any}
                      savedAnswers={savedAnswers} // Pass saved answers
                      handleSelectOption={(statementId, option) => {
                        handleSelectOption(statementId, option);
                      }}
                      startQuestion={startQ}
                      endQuestion={endQ}
                    />
                  </div>
                );
              }
            }
            return acc;
          }, [])}
        </div>
      </div>

      {/* Bottom Navigation */}
      {/* <div className="fixed bottom-[8.5%] left-0 right-0 z-20"></div> */}

      <div className="fixed bottom-0 left-0 right-0 !z-10">
        <div className="translate-y-[60%] sm:translate-y-[50%] lg:translate-y-[50%]">
          <TimeProgressBar progress={progress} timeLeft={timeLeft || "00:00"} />
        </div>
        {/* <div className="hidden lg:flex flex-wrap justify-center mt-0 gap-1 w-full bg-white mx-auto pb-2 pt-5 border-b border-gray-200">
          {passageQuestionNumbers.map((questionNum) => {
            const isAnswered = getAnsweredStatus(questionNum);
            return (
              <button
                key={questionNum}
                onClick={() => {
                  scrollToSection(`listening-question-${questionNum}`);
                }}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-xs ${
                  isAnswered
                    ? "bg-[#FA812F] text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {questionNum}
              </button>
            );
          })}
        </div> */}

        {/* NAVIGATION DESKTOP  */}
        <div className="hidden lg:flex bg-white justify-between items-center p-2 border-t border-gray-200 h-6"></div>
        {/* <div className="hidden lg:flex bg-white justify-between items-center p-2 border-t border-gray-200">
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
              Passage {selectedPassage - 1}
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
              passages.length === 1 ||
              (passages.length === 2 && selectedPassage === 2) ||
              (passages.length === 3 && selectedPassage === 3) ||
              selectedPassage === 4
                ? "hidden"
                : "border border-[#FA812F]"
            } rounded-lg my-2 py-2 px-4 bg-white mr-4 cursor-pointer`}
            onClick={handleNextPassage}
          >
            <div
              className={`text-[#FA812F] font-medium text-md justify-center items-center ${
                passages.length === 1 ||
                (passages.length === 2 && selectedPassage === 2) ||
                (passages.length === 3 && selectedPassage === 3) ||
                selectedPassage === 4
                  ? "hidden"
                  : "flex"
              }`}
            >
              Passage {selectedPassage + 1}
            </div>
          </div>

          <div
            className={`w-36 flex justify-center items-center ${
              passages.length === 1 ||
              (passages.length === 2 && selectedPassage === 2) ||
              (passages.length === 3 && selectedPassage === 3) ||
              selectedPassage === 4
                ? "border border-[#FA812F]"
                : "hidden"
            } rounded-lg my-2 py-2 px-4 mr-4 bg-[#FA812F] text-white cursor-pointer`}
            onClick={() => {
              if (
                isLogin &&
                passages.reduce(
                  (acc, passage) => acc + passage.answeredQuestions,
                  0
                ) === allQuestions.length
              ) {
                setShowConfirmSubmitDialog(true);
              } else if (
                !isLogin &&
                passages.reduce(
                  (acc, passage) => acc + passage.answeredQuestions,
                  0
                ) === allQuestions.length
              ) {
                setShowGetInfoDialog(true);
              } else {
                setShowCheckFullAnsDialog(true);
              }
            }}
          >
            <div
              className={`font-medium text-md justify-center items-center ${
                passages.length === 1 ||
                (passages.length === 2 && selectedPassage === 2) ||
                (passages.length === 3 && selectedPassage === 3) ||
                selectedPassage === 4
                  ? "flex"
                  : "hidden"
              }`}
            >
              Nộp bài
            </div>
          </div>
        </div> */}

        {/* NAVIGATION MOBILE  */}
        <div className="lg:hidden bg-white flex justify-center items-center py-2 pt-5 border-t border-gray-200">
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

          {/* SUBMIT BUTTON  */}
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

          {/* <div className="lg:hidden absolute bg-[#FA812F] rounded-full bottom-[0%] right-[5%] -translate-y-24 z-30">
            <div
              className="p-3.5"
              onClick={() => setSwitchReading(!switchReading)}
            >
              {switchReading ? (
                <Grid2x2Check color="white" />
              ) : (
                <FileText color="white" />
              )}
            </div>
          </div> */}
        </div>
      </div>

      {/* POPUP MENU QUESTIONS  */}
      <AnimatePresence>
        {isPopupOpen && passages && passages.length > 0 && (
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
              passages={passages}
              getAnsweredStatus={getAnsweredStatus}
              onSubmit={() => setShowConfirmSubmitDialog(true)}
              onQuestionSelect={handleQuestionSelect}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListeningTestClient;
