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

  return (
    <div
      className={`w-36 border ${
        choosenPassage ? "border-[#FA812F]" : "border-gray-300"
      } rounded-lg py-2 px-4 bg-white mr-4 cursor-pointer`}
      onClick={onClick}
    >
      <div
        className={`${
          choosenPassage ? "text-[#FA812F]" : "text-gray-500"
        } font-medium text-sm mb-1`}
      >
        Section {passageNumber}
      </div>
      <div className="flex items-center">
        <span
          className={`${
            choosenPassage ? "text-[#FA812F]" : "text-gray-500"
          } font-medium mr-2 text-xs`}
        >
          {currentQuestion}/{totalQuestions}
        </span>
        <div
          className={`flex-grow h-2 rounded-full ${
            choosenPassage ? "bg-red-100" : "bg-gray-200"
          } overflow-hidden`}
        >
          <div
            className={`h-full ${
              choosenPassage ? "bg-[#FA812F]" : "bg-gray-400"
            } rounded-full`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default PassageProgressBar;
