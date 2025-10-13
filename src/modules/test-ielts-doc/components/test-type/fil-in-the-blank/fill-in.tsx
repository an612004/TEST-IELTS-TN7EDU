import React from "react";

interface ShortAnswerQuestionProps {
  id: number;
  start_passage: string;
  end_passage: string;
  selectedAnswer: string;
  onAnswerChange: (questionId: number, answer: string) => void;
}

export const ShortAnswerQuestion: React.FC<ShortAnswerQuestionProps> = ({
  id,
  start_passage,
  end_passage,
  selectedAnswer,
  onAnswerChange,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAnswerChange(id, e.target.value);
  };
  return (
    <div className="flex py-3" id={`reading-question-${id}`}>
      <div className="flex items-center">
        <span className="text-[#FA812F] text-xl font-bold mr-3">{id}</span>
        <span className="text-[#FA812F] mr-3">→</span>
      </div>
      <div className="w-full flex-wrap flex flex-row items-center">
        <p className="text-gray-800">{start_passage}</p>
        <input
          type="text"
          className="w-1/2 lg:w-1/3 border border-gray-300 rounded-lg px-4 py-2 mx-3 focus:outline-none focus:ring-2 focus:ring-[#FA812F] focus:border-transparent"
          placeholder="Your answer here"
          value={selectedAnswer}
          onChange={handleInputChange}
        />
        <p className="text-gray-800">{end_passage}</p>
      </div>
    </div>
  );
};

interface ShortAnswerQuizProps {
  title: string;
  subtitle?: string;
  instructions: string;
  questions: Array<{
    id: number;
    start_passage: string;
    end_passage: string;
    selectedAnswer: string;
  }>;
  onAnswerChange: (questionId: number, answer: string) => void;
}

export const ShortAnswerQuiz: React.FC<ShortAnswerQuizProps> = ({
  title,
  instructions,
  questions,
  onAnswerChange,
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-[#FA812F] text-white p-4 rounded-lg mb-4">
        <div className="flex flex-row justify-between items-baseline">
          <h1 className="text-base lg:text-lg font-bold mr-4">{title}</h1>
          <div>
            <p className="text-right text-base lg:text-base mt-1">
              {instructions}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        {questions.map((question) => (
          <ShortAnswerQuestion
            key={question.id}
            id={question.id}
            start_passage={question.start_passage}
            end_passage={question.end_passage}
            selectedAnswer={question.selectedAnswer}
            onAnswerChange={onAnswerChange}
          />
        ))}
      </div>
    </div>
  );
};
