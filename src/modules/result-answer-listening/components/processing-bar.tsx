import React from "react";

interface QuestionStatus {
  questionId: number;
  isAnswered: boolean;
  isCorrect: boolean | null; // null if unanswered
}

interface PassageProgressBarProps {
  passageNumber: number;
  currentQuestion: number;
  totalQuestions: number;
  startQuestion: number;
  endQuestion?: number;
  choosenPassage?: boolean;
  onClick?: () => void;
  onQuestionClick?: (questionNum: number) => void;
  questionStatuses: QuestionStatus[];
}

const PassageProgressBar: React.FC<PassageProgressBarProps> = ({
  passageNumber,
  currentQuestion,
  totalQuestions,
  startQuestion,
  choosenPassage,
  onClick,
  onQuestionClick,
  questionStatuses,
}) => {
  const questionNumbers = Array.from(
    { length: totalQuestions },
    (_, index) => startQuestion + index
  );

  return (
    <div
      className={`w-[280px] rounded-lg py-1 px-1 bg-white mx-2 cursor-pointer`}
      onClick={onClick}
    >
      <div
        className={`${
          choosenPassage ? "text-[#FA812F]" : "text-gray-500"
        } font-medium text-xs my-2 text-center`}
      >
        PASSAGE {passageNumber}
      </div>
      <div className="flex flex-wrap gap-0.5 justify-start">
        {questionNumbers.map((question) => {
          const status = questionStatuses.find(
            (qs) => qs.questionId === question
          );
          const isAnswered = status?.isAnswered ?? false;
          const isCorrect = status?.isCorrect;

          const baseClasses =
            "w-9 h-9 rounded-md flex items-center justify-center text-xs font-bold";
          const colorClasses = isAnswered
            ? isCorrect
              ? "bg-green-100 border-2 border-green-500 text-green-700 hover:bg-green-200"
              : "bg-red-100 border-2 border-red-500 text-red-700 hover:bg-red-200"
            : "bg-yellow-100 border-2 border-yellow-500 text-yellow-700 hover:bg-yellow-200";
          const currentQuestionClasses =
            question === currentQuestion && choosenPassage
              ? "bg-white border-2 border-gray-600 text-gray-800"
              : "";

          return (
            <button
              key={question}
              className={`${baseClasses} ${colorClasses} ${currentQuestionClasses}`}
              onClick={(e) => {
                e.stopPropagation();
                onQuestionClick && onQuestionClick(question);
              }}
            >
              {question}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PassageProgressBar;
