import React, { useState } from "react";

interface AnswerState {
  parts: Array<{
    part_id: string;
    user_answers: Array<{
      question_id: string;
      answer: string[];
    }>;
    isComplete: boolean;
  }>;
}

interface QuizHeaderProps {
  title: string;
  subtitle: string;
}

interface QuizOptionProps {
  label: string;
  option: string;
  isSelected: boolean;
  isMultiple: boolean;
  onSelect: () => void;
}

interface QuizQuestionProps {
  id: number;
  question: string;
  options: string[];
  isMultiple: boolean;
  selectedOptions: string[] | string | null;
  onSelectOption: (option: string) => void;
}

export const QuizHeader: React.FC<QuizHeaderProps> = ({ title, subtitle }) => (
  <div className="bg-[#FA812F] text-white p-4 rounded-lg mb-4">
    <h1 className="flex flex-row justify-between items-center font-bold">
      <span className="text-base lg:text-lg">{title}</span>{" "}
      <span className="font-normal text-right text-base lg:text-base ml-2">
        {subtitle}
      </span>
    </h1>
  </div>
);

export const QuizOption: React.FC<QuizOptionProps> = ({
  label,
  option,
  isSelected,
  isMultiple,
  onSelect,
}) => (
  <div
    className="grid grid-cols-12 lg:flex lg:items-center mb-1 cursor-pointer"
    onClick={onSelect}
  >
    <div
      className={`col-span-2 w-5 h-5 flex items-center justify-center rounded-full mr-3 border ${
        isSelected
          ? "bg-[#FA812F] border-[#FA812F]"
          : "bg-gray-100 border-gray-300"
      }`}
    >
      <span
        className={`font-medium ${
          isSelected ? "text-[#FA812F]" : "text-gray-600"
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

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  id,
  question,
  options,
  isMultiple,
  selectedOptions,
  onSelectOption,
}) => {
  const optionLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];

  return (
    <div
      className="mb-5 bg-white px-6 rounded-lg"
      id={`listening-question-${id}`}
    >
      <div className="flex mb-4">
        <span className="text-[#FA812F] text-xl font-bold mr-1">{id}.</span>
        <p className="text-gray-800 text-lg">{question}</p>
      </div>

      {options.map((option, index) => (
        <QuizOption
          key={index}
          label={optionLabels[index]}
          option={option}
          isMultiple={isMultiple}
          isSelected={
            isMultiple
              ? Array.isArray(selectedOptions) &&
                selectedOptions.includes(option)
              : selectedOptions === option
          }
          onSelect={() => onSelectOption(option)}
        />
      ))}
    </div>
  );
};

export default function MultipleChoiceQuiz({
  questions,
  handleSelectOption,
}: {
  questions: QuizQuestionProps[];
  handleSelectOption: (questionId: number, option: string) => void;
}) {
  const [answers, setAnswers] = useState<AnswerState>({ parts: [] });

  return (
    <div className="w-full">
      {questions.map((question) => (
        <QuizQuestion
          key={question.id}
          id={question.id}
          question={question.question}
          options={question.options}
          isMultiple={question.isMultiple}
          selectedOptions={question.selectedOptions}
          onSelectOption={(option) => handleSelectOption(question.id, option)}
        />
      ))}
    </div>
  );
}
