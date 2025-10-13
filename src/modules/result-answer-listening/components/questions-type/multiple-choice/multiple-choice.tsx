import React from "react";

interface ResultHeaderProps {
  title: string;
  subtitle: string;
}

interface ResultOptionProps {
  label: string;
  option: string;
  isSelected: boolean;
  isCorrect: boolean;
}

interface ResultQuestionProps {
  id: number;
  question: string;
  options: string[];
  selectedOptions: string | string[] | null;
  correctAnswer: string | string[];
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

export const ResultOption: React.FC<ResultOptionProps> = ({
  label,
  option,
  isSelected,
  isCorrect,
}) => (
  <div className="grid grid-cols-12 lg:flex lg:items-center mb-1">
    <div
      className={`col-span-2 w-5 h-5 flex items-center justify-center rounded-full mr-3 border ${
        isCorrect
          ? "border-green-500 bg-green-500"
          : isSelected
          ? "border-red-500 bg-red-500"
          : "border-gray-300"
      }`}
    >
      <span
        className={`font-medium ${
          isCorrect
            ? "text-green-500"
            : isSelected
            ? "text-red-500"
            : "text-gray-600"
        }`}
      >
        {/* {label} */}
      </span>
    </div>
    <div className="col-span-10">
      <span className="text-gray-700">{option}</span>
    </div>
  </div>
);

export const ResultQuestion: React.FC<ResultQuestionProps> = ({
  id,
  question,
  options,
  selectedOptions,
  correctAnswer,
  isCorrect,
}) => {
  const optionLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];

  // Determine if the question was answered
  const isAnswered =
    (Array.isArray(selectedOptions) && selectedOptions.length > 0) ||
    (typeof selectedOptions === "string" && selectedOptions !== "");

  return (
    <div
      className="mb-5 bg-white px-6 rounded-lg"
      id={`listening-question-result-${id}`}
    >
      <div className="flex mb-4 items-center">
        <span className="text-[#FA812F] text-xl font-bold mr-1">{id}. </span>
        <div>
          <p className="text-gray-800 text-lg">
            {question}
            {isAnswered && (
              <span
                className={`ml-2 font-medium ${
                  isCorrect ? "text-green-600" : "text-red-600"
                }`}
              >
                {isCorrect ? "Correct" : "Incorrect"}
              </span>
            )}
          </p>
          {!isAnswered && (
            <p className="text-red-500 text-sm font-medium">
              Unanswered question
            </p>
          )}
        </div>
      </div>

      {options.map((option, index) => (
        <ResultOption
          key={index}
          label={optionLabels[index]}
          option={option}
          isSelected={
            Array.isArray(selectedOptions)
              ? selectedOptions.includes(option)
              : selectedOptions === option
          }
          isCorrect={
            Array.isArray(correctAnswer)
              ? correctAnswer.includes(option)
              : correctAnswer === option
          }
        />
      ))}
    </div>
  );
};
