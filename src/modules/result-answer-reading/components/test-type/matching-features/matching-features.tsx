import React from "react";

interface ResultMatchingFeaturesQuestionProps {
  id: number;
  text: string;
  selectedOption: string;
  correctOption: string;
  isCorrect: boolean;
  countries: string[];
  countryIds: string[];
}

export const ResultMatchingFeaturesQuestion: React.FC<
  ResultMatchingFeaturesQuestionProps
> = ({
  id,
  text,
  selectedOption,
  correctOption,
  isCorrect,
  countries,
  countryIds,
}) => {
  const selectedCountryText = selectedOption
    ? countries[countryIds.indexOf(selectedOption)]
    : "No answer provided";

  const correctCountryText = countries[countryIds.indexOf(correctOption)];

  return (
    <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex mb-3">
        <span className="text-[#FA812F] text-lg font-bold mr-2">{id}.</span>
        <p className="text-gray-800">{text}</p>
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
            {selectedOption} - {selectedCountryText}
          </span>
        </div>
        {!isCorrect && (
          <div>
            <span className="font-medium">Correct answer: </span>
            <span className="text-green-600">
              {correctOption} - {correctCountryText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

interface ResultMatchingFeaturesProps {
  questions: Array<{
    id: number;
    text: string;
    selectedOption: string;
    correctOption: string;
    isCorrect: boolean;
  }>;
  countries: string[];
  countryIds: string[];
  startQuestion?: number;
  endQuestion?: number;
}

export const ResultMatchingFeatures: React.FC<ResultMatchingFeaturesProps> = ({
  questions,
  countries,
  countryIds,
  startQuestion = 34,
  endQuestion = 40,
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
              Match each statement with the correct option.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
        {/* <h3 className="font-bold text-lg mb-3">
          Matching Features (Questions {startQuestion}-{endQuestion})
        </h3> */}

        <div className="border border-gray-300 rounded-md p-4 mb-4">
          <h3 className="font-bold text-center text-lg mb-3">
            List of Countries
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            {countries.map((country, index) => (
              <div
                key={countryIds[index]}
                className="flex items-center p-2 mb-1 rounded-md"
              >
                <span className="font-medium mr-2 text-[#FA812F] w-6">
                  {countryIds[index]}
                </span>
                <span className="text-gray-700">{country}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((question) => (
            <ResultMatchingFeaturesQuestion
              key={question.id}
              id={question.id}
              text={question.text}
              selectedOption={question.selectedOption}
              correctOption={question.correctOption}
              isCorrect={question.isCorrect}
              countries={countries}
              countryIds={countryIds}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
