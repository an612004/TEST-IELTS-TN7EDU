import React from "react";

interface ResultMatchingHeadingsQuestionProps {
  id: number;
  paragraphId: string;
  selectedOption: string;
  correctOption: string;
  isCorrect: boolean;
  headings: string[];
  headingIds: string[];
}

export const ResultMatchingHeadingsQuestion: React.FC<
  ResultMatchingHeadingsQuestionProps
> = ({
  id,
  paragraphId,
  selectedOption,
  correctOption,
  isCorrect,
  headings,
  headingIds,
}) => {
  const selectedHeadingText = selectedOption
    ? headings[headingIds.indexOf(selectedOption)]
    : "No answer provided";

  const correctHeadingText = headings[headingIds.indexOf(correctOption)];

  return (
    <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex mb-3">
        <span className="text-[#FA812F] text-lg font-bold mr-2">{id}.</span>
        <p className="text-gray-800">Paragraph {paragraphId}</p>
        <span
          className={`ml-2 font-medium ${
            isCorrect ? "text-green-600" : "text-red-600"
          }`}
        >
          {isCorrect ? "Correct" : "Incorrect"}
        </span>
      </div>
      <div className="ml-8">
        <div className="mb-2">
          <span className="font-medium">Your answer: </span>
          <span className={isCorrect ? "text-green-600" : "text-red-600"}>
            {selectedOption} - {selectedHeadingText}
          </span>
        </div>
        {!isCorrect && (
          <div>
            <span className="font-medium">Correct answer: </span>
            <span className="text-green-600">
              {correctOption} - {correctHeadingText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

interface ResultMatchingHeadingsProps {
  questions: Array<{
    id: number;
    paragraphId: string;
    selectedOption: string;
    correctOption: string;
    isCorrect: boolean;
  }>;
  headings: string[];
  headingIds: string[];
  startQuestion?: number;
  endQuestion?: number;
  passageNumber?: number;
}

export const ResultMatchingHeadings: React.FC<ResultMatchingHeadingsProps> = ({
  questions,
  headings,
  headingIds,
  startQuestion = 14,
  endQuestion = 20,
  passageNumber = 2,
}) => {
  return (
    <div className="mb-6">
      <div className="bg-[#FA812F] text-white p-4 rounded-lg mb-4">
        <div className="flex flex-row justify-between items-baseline">
          <h1 className="text-base lg:text-lg font-bold mr-4">
            Questions {startQuestion} – {endQuestion}
          </h1>
          <div>
            <p className="text-right text-base lg:text-base mt-1">
              Choose the correct heading for each paragraph.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
        <div className="border border-gray-300 rounded-md p-4 mb-4">
          <h3 className="font-bold text-center text-lg mb-3">
            List of Headings
          </h3>
          <div className="space-y-1">
            {headings.map((heading, index) => (
              <div
                key={headingIds[index]}
                className="flex items-center p-2 mb-1 rounded-md"
              >
                <span className="font-medium mr-2 text-[#FA812F] w-6">
                  {headingIds[index]}
                </span>
                <span className="text-gray-700">{heading}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((question) => (
            <ResultMatchingHeadingsQuestion
              key={question.id}
              id={question.id}
              paragraphId={question.paragraphId}
              selectedOption={question.selectedOption}
              correctOption={question.correctOption}
              isCorrect={question.isCorrect}
              headings={headings}
              headingIds={headingIds}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
