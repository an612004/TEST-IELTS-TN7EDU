import React, { useState, useEffect } from "react";

interface TrueFalseNotGivenQuestion {
  q_type: "TFNG";
  part_id: string;
  sentence: string;
  answer: string;
  id?: number; // Add id property
  question_id?: string; // Add question_id property
}

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

type AnswerOption = "TRUE" | "FALSE" | "NOT GIVEN";

interface StatementProps {
  id: number;
  text: string;
  selectedAnswer: AnswerOption | null;
  onAnswerSelect: (statementId: number, answer: AnswerOption) => void;
}

const Statement: React.FC<StatementProps> = ({
  id,
  text,
  selectedAnswer,
  onAnswerSelect,
}) => {
  const options: AnswerOption[] = ["TRUE", "FALSE", "NOT GIVEN"];

  return (
    <div className="mb-6">
      <div className="flex mb-3">
        <span className="text-[#FA812F] text-lg font-bold mr-3">{id}</span>
        <p className="text-gray-800">{text}</p>
      </div>
      <div className="flex space-x-4 ml-8">
        {options.map((option) => (
          <button
            key={option}
            className={`px-4 py-2 rounded-md border ${
              selectedAnswer === option
                ? "bg-[#f8f2ef] border-[#FA812F] text-[#FA812F] font-medium"
                : "border-gray-300 text-gray-700"
            }`}
            onClick={() => onAnswerSelect(id, option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

interface TrueFalseNotGivenProps {
  questions: TrueFalseNotGivenQuestion[];
  handleSelectOption: (statementId: number, option: string) => void;
  savedAnswers?: Record<string, string>; // Add this prop
  startQuestion?: number;
  endQuestion?: number;
  passageNumber?: number;
}

export default function TrueFalseNotGiven({
  questions,
  handleSelectOption,
  savedAnswers = {}, // Add this prop with default value
  startQuestion = 1,
  endQuestion = 6,
  passageNumber = 1,
}: TrueFalseNotGivenProps) {
  const [answers, setAnswers] = useState<Record<string, AnswerOption | null>>(
    // Convert savedAnswers to the correct type
    Object.entries(savedAnswers).reduce((acc, [key, value]) => {
      if (value === "TRUE" || value === "FALSE" || value === "NOT GIVEN") {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, AnswerOption | null>)
  );

  // Add useEffect to update local state when savedAnswers change
  useEffect(() => {
    // Convert savedAnswers to the correct type
    const typedAnswers = Object.entries(savedAnswers).reduce(
      (acc, [key, value]) => {
        if (value === "TRUE" || value === "FALSE" || value === "NOT GIVEN") {
          acc[key] = value as AnswerOption;
        }
        return acc;
      },
      {} as Record<string, AnswerOption | null>
    );

    setAnswers(typedAnswers);
  }, [savedAnswers]);

  // Generate statement IDs and map questions
  const statements = questions.map((q, index) => {
    const questionId = q.id?.toString();
    // Use saved answers if available for this question
    const savedAnswer =
      questionId && (savedAnswers[questionId] as AnswerOption | undefined);

    return {
      id: startQuestion + index,
      text: q.sentence,
      selectedAnswer:
        answers[(startQuestion + index).toString()] || savedAnswer || null,
    };
  });

  const handleAnswerSelect = (statementId: number, answer: AnswerOption) => {
    setAnswers((prev) => ({
      ...prev,
      [statementId.toString()]: answer,
    }));
    handleSelectOption(statementId, answer);
  };

  return (
    <div className="w-full">
      <div className="bg-[#FA812F] text-white p-4 rounded-lg mb-4">
        <div className="flex flex-row justify-between items-baseline">
          <h1 className="text-base lg:text-lg font-bold mr-4">
            Questions {startQuestion} – {endQuestion}
          </h1>
          <div>
            <p className="text-right text-base lg:text-base mt-1">
              True - False - Not Given
            </p>
          </div>
        </div>
      </div>
      {/* Instructions Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <p className="mb-5 italic">
          In boxes {startQuestion}-{endQuestion} on your answer sheet, write
        </p>

        <div className="ml-8 mb-6">
          <div className="flex mb-2">
            <span className="font-bold text-gray-800 w-32">TRUE</span>
            <span className="text-gray-700">
              if the statement agrees with the information
            </span>
          </div>
          <div className="flex mb-2">
            <span className="font-bold text-gray-800 w-32">FALSE</span>
            <span className="text-gray-700">
              if the statement contradicts the information
            </span>
          </div>
          <div className="flex mb-2">
            <span className="font-bold text-gray-800 w-32">NOT GIVEN</span>
            <span className="text-gray-700">
              if there is no information on this
            </span>
          </div>
        </div>

        <div className="space-y-6 mt-8">
          {statements.map((statement) => (
            <Statement
              key={statement.id}
              id={statement.id}
              text={statement.text}
              selectedAnswer={statement.selectedAnswer}
              onAnswerSelect={handleAnswerSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
