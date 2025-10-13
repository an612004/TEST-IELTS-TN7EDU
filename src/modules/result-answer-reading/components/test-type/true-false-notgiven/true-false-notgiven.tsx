import React from "react";

type AnswerOption = "TRUE" | "FALSE" | "NOT GIVEN";

interface ResultTrueFalseNotGivenQuestionProps {
  id: number;
  text: string;
  selectedAnswer: AnswerOption | null;
  correctAnswer: AnswerOption;
  isCorrect: boolean;
}

export const ResultTrueFalseNotGivenQuestion: React.FC<
  ResultTrueFalseNotGivenQuestionProps
> = ({ id, text, selectedAnswer, correctAnswer, isCorrect }) => {
  return (
    <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex mb-3">
        <span className="text-[#FA812F] text-lg font-bold mr-3">{id}</span>
        <p className="text-gray-800">{text}</p>
        {selectedAnswer ? (
          <span
            className={`ml-2 font-medium ${
              isCorrect ? "text-green-600" : "text-red-600"
            }`}
          >
            {isCorrect ? "Correct" : "Incorrect"}
          </span>
        ) : (
          <span className="ml-2 font-medium text-red-600">Unanswered</span>
        )}
      </div>
      <div className="flex space-x-4 ml-8">
        {["TRUE", "FALSE", "NOT GIVEN"].map((option) => (
          <div
            key={option}
            className={`px-4 py-2 rounded-md border ${
              selectedAnswer === option
                ? isCorrect
                  ? "bg-[#f0f9f0] border-green-500 text-green-700 font-medium"
                  : "bg-[#fef1f1] border-red-500 text-red-700 font-medium"
                : correctAnswer === option
                ? "bg-[#f0f9f0] border-green-500 text-green-700 font-medium"
                : "border-gray-300 text-gray-500"
            }`}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};

interface ResultTrueFalseNotGivenProps {
  questions: Array<{
    id: number;
    text: string;
    selectedAnswer: AnswerOption | null;
    correctAnswer: AnswerOption;
    isCorrect: boolean;
  }>;
  startQuestion?: number;
  endQuestion?: number;
  passageNumber?: number;
}

export const ResultTrueFalseNotGiven: React.FC<
  ResultTrueFalseNotGivenProps
> = ({ questions, startQuestion = 1, endQuestion = 6, passageNumber = 1 }) => {
  return (
    <div className="mb-6">
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
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
        {/* <h3 className="font-bold text-lg mb-3">
          True/False/Not Given (Questions {startQuestion}-{endQuestion})
        </h3> */}

        <div className="mb-4">
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

        <div className="space-y-4 mt-6">
          {questions.map((question) => (
            <ResultTrueFalseNotGivenQuestion
              key={question.id}
              id={question.id}
              text={question.text}
              selectedAnswer={question.selectedAnswer}
              correctAnswer={question.correctAnswer}
              isCorrect={question.isCorrect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
