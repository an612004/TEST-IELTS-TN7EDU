import React, { useState, useEffect, useRef } from "react";

interface MatchingFeaturesQuestion {
  q_type: "MF";
  part_id: number;
  feature: string;
  answer: string;
  options: string[];
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
  onCountrySelect: (statementId: number, countryId: string) => void;
  countries: string[];
  countryIds: string[];
  isLastQuestion?: boolean; // Add this prop to identify the last question
}

const Statement: React.FC<StatementProps> = ({
  id,
  text,
  selectedCountry,
  onCountrySelect,
  countries,
  countryIds,
  isLastQuestion = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // We don't need to check position anymore since dropdown is centered
  useEffect(() => {
    // Add a class to prevent body scrolling when dropdown is open
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
    onCountrySelect(id, countryId);
    setIsDropdownOpen(false);
  };

  // Find the index of the selected country in the countries array to get its ID
  const countryIndex = countries.indexOf(selectedCountry || "");
  const displayId = countryIndex !== -1 ? countryIds[countryIndex] : "";

  return (
    <div className="mb-4 bg-white p-0 rounded-lg">
      <div className="flex mb-3">
        <span className="text-[#FA812F] text-lg font-bold mr-2">{id}.</span>
        <p className="text-gray-800">{text}</p>
      </div>
      <div className="relative ml-8" ref={containerRef}>
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
                <span className="font-medium text-[#FA812F]">{displayId}</span>{" "}
                {selectedCountry}
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
            <div
              ref={dropdownRef}
              className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 !z-[999] w-[90%] max-w-md bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-auto"
            >
              <div className="sticky top-0 bg-[#FA812F] text-white p-3 font-semibold text-center">
                Select an option
                <button
                  className="absolute right-3 top-3 text-white"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  ✕
                </button>
              </div>
              {countryIds.map((countryId, index) => {
                // Check if this country is selected
                const isSelected = selectedCountry === countries[index];

                return (
                  <div
                    key={countryId}
                    className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer ${
                      isSelected ? "bg-[#f8f2ef]" : ""
                    }`}
                    onClick={() => handleSelect(countryId)}
                  >
                    <span className="font-medium mr-3 text-[#FA812F] w-6">
                      {countryId}
                    </span>
                    <span className="text-base">{countries[index]}</span>
                  </div>
                );
              })}
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
  savedAnswers?: Record<string, string>; // Add this prop
  startQuestion?: number;
  endQuestion?: number;
}

export default function MatchingFeatures({
  questions,
  handleSelectOption,
  savedAnswers = {}, // Add this prop with default value
  startQuestion = 34,
  endQuestion = 40,
}: MatchingFeaturesProps) {
  const [answers, setAnswers] =
    useState<Record<string, string | null>>(savedAnswers);

  // Add useEffect to update local state when savedAnswers change
  useEffect(() => {
    setAnswers(savedAnswers);
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

  const handleCountrySelect = (statementId: number, countryId: string) => {
    // Find the country text for the selected ID
    let selectedCountry = countryId;

    // If countryId is just an ID (like "A", "B", etc.), find the corresponding text
    if (countryId.length === 1) {
      // Just checking if it's a single letter ID
      const index = countryIds.indexOf(countryId);
      if (index !== -1 && index < countries.length) {
        // Just pass the country text, not the ID + text
        selectedCountry = countries[index];
      }
    }

    setAnswers((prev) => ({
      ...prev,
      [statementId.toString()]: selectedCountry,
    }));

    // Pass just the text to the parent component
    handleSelectOption(statementId, selectedCountry);
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
        <p className="mb-2">
          Look at the following statements (Questions {startQuestion}-
          {endQuestion}) and the list of countries below.
        </p>
        <p className="mb-2">
          Match each statement with the correct country, A-J.
        </p>

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
          {statements.map((statement, index) => (
            <Statement
              key={statement.id}
              id={statement.id}
              text={statement.text}
              selectedCountry={statement.selectedCountry}
              onCountrySelect={handleCountrySelect}
              countries={countries}
              countryIds={countryIds}
              isLastQuestion={index === statements.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
