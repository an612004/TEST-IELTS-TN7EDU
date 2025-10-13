import React from "react";

interface PassageProgressBarProps {
  passageNumber: number;
  currentQuestion?: number;
  totalQuestions: number;
  startQuestion?: number;
  endQuestion?: number;
  choosenPassage?: boolean;
  onClick?: () => void;
  onQuestionClick?: (questionNum: number) => void;
  questionStatuses: {
    questionId: number;
    isAnswered: boolean;
    isCorrect: boolean | null;
  }[];
}

const PassageProgressBarMobile: React.FC<PassageProgressBarProps> = ({
  passageNumber,
  totalQuestions,
  choosenPassage,
  onClick,
  questionStatuses,
}) => {
  // Calculate the number of correct answers
  const correctAnswers = questionStatuses.reduce((count, status) => {
    return status.isAnswered && status.isCorrect ? count + 1 : count;
  }, 0);

  return (
    <div className="mr-4">
      <div className="w-full flex justify-center">
        <div
          className={`w-11 h-11 border-2 ${
            choosenPassage ? "border-[#FA812F]" : "border-gray-300"
          } rounded-full bg-white cursor-pointer flex items-center justify-center`}
          onClick={onClick}
        >
          <span
            className={`${
              choosenPassage ? "text-[#FA812F]" : "text-gray-500"
            } font-medium text-[9px]`}
          >
            {correctAnswers}/{totalQuestions}
          </span>
        </div>
      </div>
      <div
        className={`${
          choosenPassage ? "text-[#FA812F]" : "text-gray-500"
        } font-bold text-[9px] text-center`}
      >
        Section {passageNumber}
      </div>
    </div>
  );
};

export default PassageProgressBarMobile;
