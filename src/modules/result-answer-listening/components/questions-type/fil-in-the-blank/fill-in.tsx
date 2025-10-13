import React from "react";

interface ResultHeaderProps {
  title: string;
  subtitle: string;
}

interface ResultShortAnswerQuestionProps {
  id: number;
  start_passage: string;
  end_passage: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export const ResultHeader: React.FC<ResultHeaderProps> = ({
  title,
  subtitle,
}) => (
  <div className="bg-[#FA812F] text-white p-4 rounded-lg mb-4">
    <h1 className="flex flex-row justify-between items-center text-lg font-bold">
      <span>{title}</span>
      <span className="font-normal text-base ml-2">{subtitle}</span>
    </h1>
  </div>
);

export const ResultShortAnswerQuestion: React.FC<
  ResultShortAnswerQuestionProps
> = ({
  id,
  start_passage,
  end_passage,
  selectedAnswer,
  correctAnswer,
  isCorrect,
}) => {
  return (
    <div
      className="flex py-3 items-center border border-gray-200 mb-4 px-5 rounded-lg bg-white"
      id={`listening-question-result-${id}`}
    >
      <div className="flex items-center">
        <span className="text-[#FA812F] text-xl font-bold mr-3">{id}</span>
        <span className="text-[#FA812F] mr-3">→</span>
      </div>
      <div className="w-full flex flex-row items-center">
        <p className="text-gray-800">{start_passage}</p>
        <div
          className={`border rounded-lg px-4 py-2 mx-3 ${
            isCorrect
              ? "border-green-500 bg-green-50"
              : "border-red-500 bg-red-50"
          }`}
        >
          <span
            className={`font-medium ${
              isCorrect ? "text-green-600" : "text-red-600"
            }`}
          >
            {selectedAnswer || "No answer provided"}
          </span>
          {!isCorrect && (
            <div className="text-green-600 font-medium mt-1">
              Correct: {correctAnswer}
            </div>
          )}
        </div>
        <p className="text-gray-800">{end_passage}</p>
      </div>
    </div>
  );
};
