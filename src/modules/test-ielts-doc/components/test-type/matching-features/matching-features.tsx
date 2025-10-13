import React, { useState, useEffect } from "react";

interface MatchingFeaturesQuestion {
  q_type: "MF";
  part_id: number;
  feature: string;
  answer: string;
  options: string[];
  id?: number;
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

interface CountryItemProps {
  id: string;
  country: string;
  isSelected: boolean;
  onSelect: () => void;
}

const CountryItem: React.FC<CountryItemProps> = ({
  id,
  country,
  isSelected,
  onSelect,
}) => (
  <div
    className={`flex items-center p-2 mb-1 rounded-md cursor-pointer ${
      isSelected ? "border-[#fad2b6] border bg-[#f8f2ef]" : "border-gray-200"
    }`}
    onClick={onSelect}
  >
    <span className="font-medium mr-2 text-[#FA812F] w-6">{id}</span>
    <span className="text-gray-700">{country}</span>
  </div>
);

interface StatementProps {
  id: number;
  text: string;
  selectedCountry: string | null;
  onCountrySelect: (
    statementId: number,
    countryId: string,
    countryText: string
  ) => void;
  countries: string[];
  countryIds: string[];
}

const Statement: React.FC<StatementProps> = ({
  id,
  text,
  selectedCountry,
  onCountrySelect,
  countries,
  countryIds,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Handle body scrolling when dropdown is open
  React.useEffect(() => {
    if (isDropdownOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSelect = (countryId: string) => {
    const countryIndex = countryIds.indexOf(countryId);
    const countryText = countries[countryIndex];
    onCountrySelect(id, countryId, countryText);
    setIsDropdownOpen(false);
  };

  // Find the selected country text if there's a selection
  const selectedCountryText = selectedCountry
    ? countries[countryIds.indexOf(selectedCountry)]
    : null;

  return (
    <div className="mb-4 bg-white p-0 rounded-lg">
      <div className="flex mb-3">
        <span className="text-[#FA812F] text-lg font-bold mr-2">{id}.</span>
        <p className="text-gray-800">{text}</p>
      </div>
      <div className="relative ml-8">
        <div
          className={`border ${
            selectedCountry
              ? "border-[#FA812F] bg-[#f8f2ef]"
              : "border-gray-300"
          } rounded-md px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-gray-50`}
          onClick={toggleDropdown}
        >
          <span className="text-sm">
            {selectedCountry ? (
              <span>
                <span className="font-medium text-[#FA812F]">
                  {selectedCountry}
                </span>{" "}
                {selectedCountryText}
              </span>
            ) : (
              "Select a country"
            )}
          </span>
          <span
            className={`${
              selectedCountry ? "text-[#FA812F]" : "text-gray-500"
            } bg-gray-100 rounded-full px-1`}
          >
            {isDropdownOpen ? "▲" : "▼"}
          </span>
        </div>

        {isDropdownOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-30 !z-[998]"
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 !z-[999] w-[90%] max-w-md bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-auto">
              <div className="sticky top-0 bg-[#FA812F] text-white p-3 font-semibold text-center">
                Select a country
                <button
                  className="absolute right-3 top-3 text-white"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  ✕
                </button>
              </div>
              {countryIds.map((countryId, index) => (
                <div
                  key={countryId}
                  className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer ${
                    selectedCountry === countryId ? "bg-[#f8f2ef]" : ""
                  }`}
                  onClick={() => handleSelect(countryId)}
                >
                  <span className="font-medium mr-3 text-[#FA812F] w-6">
                    {countryId}
                  </span>
                  <span className="text-base">{countries[index]}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface MatchingFeaturesProps {
  questions: MatchingFeaturesQuestion[];
  handleSelectOption: (statementId: number, option: string) => void;
  startQuestion?: number;
  endQuestion?: number;
  savedAnswers?: Record<string, string>;
}

export default function MatchingFeatures({
  questions,
  handleSelectOption,
  startQuestion = 34,
  endQuestion = 40,
  savedAnswers = {},
}: MatchingFeaturesProps) {
  const [answers, setAnswers] = useState<Record<string, string | null>>({});

  // Add useEffect to update local state when savedAnswers change
  useEffect(() => {
    if (Object.keys(savedAnswers).length > 0) {
      const updatedAnswers = { ...answers };

      // Update answers with saved values
      Object.entries(savedAnswers).forEach(([questionId, value]) => {
        updatedAnswers[questionId] = value;
      });

      setAnswers(updatedAnswers);
    }
  }, [savedAnswers]);

  // Extract unique countries from questions
  const countries = questions.length > 0 ? questions[0].options : [];
  const countryIds = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].slice(
    0,
    countries.length
  );

  // Generate statement IDs and map questions
  const statements = questions.map((q, index) => {
    const questionId = q.id?.toString();
    // Use saved answers if available for this question
    const savedAnswer = questionId && savedAnswers[questionId];

    return {
      id: startQuestion + index,
      text: q.feature,
      selectedCountry:
        answers[(startQuestion + index).toString()] || savedAnswer || null,
    };
  });

  const handleCountrySelect = (
    statementId: number,
    countryId: string,
    countryText: string
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [statementId.toString()]: countryId,
    }));

    // Pass both the ID and full text to the parent component
    // const fullAnswer = `${countryId}: ${countryText}`;
    const fullAnswer = `${countryText}`;
    handleSelectOption(statementId, fullAnswer);
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
              Match each statement with the correct option.
            </p>
          </div>
        </div>
      </div>
      {/* Instructions Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        {/* <p className="text-lg font-semibold mb-3">
          Questions {startQuestion} – {endQuestion}
        </p> */}
        <p className="mb-2">
          Look at the following statements (Questions {startQuestion}-
          {endQuestion}) and the list of countries below.
        </p>
        <p className="mb-2">
          Match each statement with the correct country, A-J.
        </p>
        {/* <p className="mb-4">
          Write the correct letter, A-J, in boxes {startQuestion}-{endQuestion}{" "}
          on your answer sheet.
          <br />
          <span className="font-semibold">NB</span> You may use any letter more
          than once.
        </p> */}

        <div className="border border-gray-300 rounded-md p-4 mb-4">
          <h3 className="font-bold text-center text-lg mb-3">
            List of Countries
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            {countries.map((country, index) => {
              const countryId = countryIds[index];
              return (
                <CountryItem
                  key={countryId}
                  id={countryId}
                  country={country}
                  isSelected={Object.values(answers).includes(countryId)}
                  onSelect={() => {}} // Just for display
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-5 mt-8">
          {statements.map((statement) => (
            <Statement
              key={statement.id}
              id={statement.id}
              text={statement.text}
              selectedCountry={statement.selectedCountry}
              onCountrySelect={handleCountrySelect}
              countries={countries}
              countryIds={countryIds}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* 
Example usage:

import MatchingFeatures from "src/modules/test-ielts-doc/components/test-type/matching-features/matching-features";

// Sample data structure
const matchingFeaturesQuestions = [
  {
    q_type: 'MF',
    part_id: 1,
    feature: "It helped other countries develop their own film industry.",
    answer: "A",
    options: [
      "France",
      "Germany",
      "USA",
      "Denmark",
      "Sweden",
      "Japan",
      "Russia",
      "Italy",
      "Britain",
      "China"
    ]
  },
  {
    q_type: 'MF',
    part_id: 1,
    feature: "It was the biggest producer of films.",
    answer: "C",
    options: [
      "France",
      "Germany",
      "USA",
      "Denmark",
      "Sweden",
      "Japan",
      "Russia",
      "Italy",
      "Britain",
      "China"
    ]
  },
  {
    q_type: 'MF',
    part_id: 1,
    feature: "It was first to develop the 'feature' film.",
    answer: "I",
    options: [
      "France",
      "Germany",
      "USA",
      "Denmark",
      "Sweden",
      "Japan",
      "Russia",
      "Italy",
      "Britain",
      "China"
    ]
  },
  // Add more statements as needed...
];

// Handler function
const handleSelectOption = (statementId: number, option: string) => {
  console.log(`Selected option ${option} for statement ${statementId}`);
  // Update your state or send to API here
};

// Component usage
<MatchingFeatures 
  questions={matchingFeaturesQuestions}
  handleSelectOption={handleSelectOption}
  startQuestion={34}
  endQuestion={40}
/>
*/
