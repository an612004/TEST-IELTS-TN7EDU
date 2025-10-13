import React from "react";

interface PassageProgressBarProps {
  passageNumber: number;
  currentQuestion: number;
  totalQuestions: number;
  choosenPassage?: boolean;
  onClick?: () => void;
}

const PassageProgressBarMobile: React.FC<PassageProgressBarProps> = ({
  passageNumber,
  currentQuestion,
  totalQuestions,
  choosenPassage,
  onClick,
}) => {
  const progressPercentage = (currentQuestion / totalQuestions) * 100;

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
            {currentQuestion}/{totalQuestions}
          </span>
        </div>
      </div>
      <div
        className={`${
          choosenPassage ? "text-[#FA812F]" : "text-gray-500"
        } font-bold text-[9px]`}
      >
        Section {passageNumber}
      </div>
    </div>
  );
};

export default PassageProgressBarMobile;
