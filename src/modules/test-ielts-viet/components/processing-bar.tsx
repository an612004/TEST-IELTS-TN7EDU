import React from "react";

interface PassageProgressBarProps {
  passageNumber: number;
  currentQuestion: number;
  totalQuestions: number;
  choosenPassage?: boolean;
  onClick?: () => void;
}

const PassageProgressBar: React.FC<PassageProgressBarProps> = ({
  passageNumber,
  currentQuestion,
  totalQuestions,
  choosenPassage,
  onClick,
}) => {
  const progressPercentage = (currentQuestion / totalQuestions) * 100;
  const isAnswered = currentQuestion > 0;

  return (
    <div
      className={`w-36 border ${
        choosenPassage ? "border-orange-500" : "border-gray-300"
      } rounded-lg py-2 px-4 bg-white mr-0 cursor-pointer`}
      onClick={onClick}
    >
      <div
        className={`${
          choosenPassage ? "text-orange-500" : "text-gray-500"
        } font-medium text-sm mb-1 text-center`}
      >
        Task {passageNumber}
      </div>
      <div className="flex items-center">
        <div
          className={`flex-grow h-2 rounded-full ${
            isAnswered
              ? "bg-orange-100"
              : choosenPassage
              ? "bg-orange-100"
              : "bg-gray-200"
          } overflow-hidden`}
        >
          <div
            className={`h-full ${
              isAnswered && choosenPassage
                ? "bg-orange-500"
                : choosenPassage
                ? "bg-orange-500"
                : "bg-gray-400"
            } rounded-full`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default PassageProgressBar;
