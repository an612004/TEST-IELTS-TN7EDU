import React, { useState, useEffect } from "react";

interface MatchingHeadingsQuestion {
  q_type: "MH";
  part_id: number;
  heading: string;
  answer: string;
  options: string[];
  paragraph_id: string; // A, B, C, etc.
  id?: number; // Add id property
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

interface HeadingItemProps {
  id: string;
  heading: string;
  isSelected: boolean;
  onSelect: () => void;
}

const HeadingItem: React.FC<HeadingItemProps> = ({
  id,
  heading,
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
    <span className="text-gray-700">{heading}</span>
  </div>
);

interface ParagraphProps {
  id: string;
  index: number;
  questionNumber: number; // The actual question number to display
  selectedHeading: string | null;
  onHeadingSelect: (
    paragraphId: string,
    headingId: string,
    headingText: string
  ) => void;
  headings: string[];
  headingIds: string[];
}

const Paragraph: React.FC<ParagraphProps> = ({
  id,
  index,
  questionNumber,
  selectedHeading,
  onHeadingSelect,
  headings,
  headingIds,
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

  const handleSelect = (headingId: string) => {
    const headingIndex = headingIds.indexOf(headingId);
    const headingText = headings[headingIndex];
    onHeadingSelect(id, headingId, headingText);
    setIsDropdownOpen(false);
  };

  // Find the selected heading text if there's a selection
  const selectedHeadingText = selectedHeading
    ? headings[headingIds.indexOf(selectedHeading)]
    : null;

  return (
    <div className="mb-4 bg-white p-0 rounded-lg mt-7">
      <div className="flex mb-3">
        <span className="text-[#FA812F] text-lg font-bold mr-2">
          {questionNumber}.
        </span>
        <p className="text-gray-800">Paragraph {id}</p>
      </div>
      <div className="relative">
        <div
          className={`border ${
            selectedHeading
              ? "border-[#FA812F] bg-[#f8f2ef]"
              : "border-gray-300"
          } rounded-md px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-gray-50`}
          onClick={toggleDropdown}
        >
          <span className="text-sm">
            {selectedHeading ? (
              <span>
                <span className="font-medium text-[#FA812F]">
                  {selectedHeading}
                </span>{" "}
                {selectedHeadingText}
              </span>
            ) : (
              "Select a heading"
            )}
          </span>
          <span
            className={`${
              selectedHeading ? "text-[#FA812F]" : "text-gray-500"
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
                Select a heading
                <button
                  className="absolute right-3 top-3 text-white"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  ✕
                </button>
              </div>
              {headingIds.map((headingId, index) => (
                <div
                  key={headingId}
                  className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer ${
                    selectedHeading === headingId ? "bg-[#f8f2ef]" : ""
                  }`}
                  onClick={() => handleSelect(headingId)}
                >
                  <span className="font-medium mr-3 text-[#FA812F] w-6">
                    {headingId}
                  </span>
                  <span className="text-base">{headings[index]}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface MatchingHeadingsProps {
  questions: MatchingHeadingsQuestion[];
  handleSelectOption: (paragraphId: string, option: string) => void;
  passageNumber?: number;
  paragraphRange?: string;
  questionRange?: string;
  startQuestion?: number;
  endQuestion?: number;
  savedAnswers?: Record<string, string>;
}

export default function MatchingHeadings({
  questions,
  handleSelectOption,
  passageNumber = 2,
  paragraphRange = "A-G",
  questionRange = "14-20",
  startQuestion,
  endQuestion,
  savedAnswers = {},
}: MatchingHeadingsProps) {
  const [answers, setAnswers] = useState<Record<string, string | null>>({});

  // Add useEffect to update local state when savedAnswers change
  useEffect(() => {
    if (Object.keys(savedAnswers).length > 0) {
      const updatedAnswers = { ...answers };

      // Update answers with saved values
      Object.entries(savedAnswers).forEach(([paragraphId, value]) => {
        updatedAnswers[paragraphId] = value;
      });

      setAnswers(updatedAnswers);
    }
  }, [savedAnswers]);

  // Extract unique headings from questions
  const headings = questions.length > 0 ? questions[0].options : [];
  const headingIds = [
    "i",
    "ii",
    "iii",
    "iv",
    "v",
    "vi",
    "vii",
    "viii",
    "ix",
    "x",
    "xi",
    "xii",
    "xiii",
    "xiv",
    "xv",
    "xvi",
    "xvii",
    "xviii",
    "xix",
    "xx",
    "xxi",
    "xxii",
    "xxiii",
    "xxiv",
  ].slice(0, headings.length);

  // Group questions by part_id
  const paragraphs = questions.map((q) => {
    // Use saved answers if available for this paragraph
    const savedAnswer = savedAnswers[q.paragraph_id];

    return {
      id: q.paragraph_id,
      index: questions.findIndex(
        (question) => question.paragraph_id === q.paragraph_id
      ),
      selectedHeading: answers[q.paragraph_id] || savedAnswer || null,
    };
  });

  // Use startQuestion and endQuestion props if provided, otherwise use questionRange
  const displayQuestionRange =
    startQuestion && endQuestion
      ? `${startQuestion}-${endQuestion}`
      : questionRange;

  // Calculate question numbers based on startQuestion if provided
  const getQuestionNumber = (index: number) => {
    if (startQuestion) {
      return startQuestion + index;
    }
    // Default behavior - extract from questionRange or use index + 1
    const rangeMatch = questionRange.match(/(\d+)-(\d+)/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1]);
      return start + index;
    }
    return index + 1;
  };

  const handleHeadingSelect = (
    paragraphId: string,
    headingId: string,
    headingText: string
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [paragraphId]: headingId,
    }));

    // Pass both the ID and full text to the parent component
    // const fullAnswer = `${headingId}: ${headingText}`;
    const fullAnswer = `${headingText}`;
    handleSelectOption(paragraphId, fullAnswer);
  };

  return (
    <div className="w-full mb-8">
      <div className="bg-[#FA812F] text-white p-4 rounded-lg mb-4">
        <div className="flex flex-row justify-between items-baseline">
          <h1 className="text-base lg:text-lg font-bold mr-4">
            Questions {displayQuestionRange}
          </h1>
          <div>
            <p className="text-right text-base lg:text-base mt-1">
              Choose the correct heading for each paragraph.
            </p>
          </div>
        </div>
      </div>
      {/* Instructions Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        {/* <p className="text-lg mb-3">
          Reading passage {passageNumber} has {paragraphs.length} paragraphs,{" "}
          {paragraphRange}.
        </p> */}
        <p className="mb-2 italic">
          Choose the correct heading for each paragraph from the list of
          headings below.
        </p>
        <p className="mb-4 italic">
          Write the correct number, i-xi, in boxes {displayQuestionRange} on
          your answer sheet.
        </p>

        <div className="border border-gray-300 rounded-md p-4 mb-4">
          <h3 className="font-bold text-center text-lg mb-3">
            List of Headings
          </h3>
          <div className="space-y-1">
            {headings.map((heading, index) => {
              const headingId = headingIds[index];
              return (
                <HeadingItem
                  key={headingId}
                  id={headingId}
                  heading={heading}
                  isSelected={Object.values(answers).includes(headingId)}
                  onSelect={() => {}} // Just for display
                />
              );
            })}
          </div>
        </div>
        <div className="space-y-3">
          {paragraphs.map((paragraph, idx) => (
            <Paragraph
              key={paragraph.id}
              id={paragraph.id}
              index={paragraph.index}
              questionNumber={getQuestionNumber(idx)}
              selectedHeading={paragraph.selectedHeading}
              onHeadingSelect={handleHeadingSelect}
              headings={headings}
              headingIds={headingIds}
            />
          ))}
        </div>
      </div>

      {/* Paragraphs Section */}
    </div>
  );
}

/* 
Example usage:

import MatchingHeadings from "src/modules/test-ielts-doc/components/test-type/matching-headings/matching-headings";

// Sample data structure
const matchingHeadingsQuestions = [
  {
    q_type: 'MH',
    part_id: 1,
    heading: "Paragraph A",
    answer: "i",
    options: [
      "Why better food helps students' learning",
      "Becoming the headmaster of Msekeni",
      "Surprising use of school premises",
      "Global perspective",
      "Why students were undernourished",
      "Surprising academic outcome",
      "An innovative program to help girls",
      "How food program is operated",
      "How food program affects school attendance",
      "None of the usual reasons",
      "How to maintain academic standard"
    ],
    paragraph_id: "A"
  },
  {
    q_type: 'MH',
    part_id: 1,
    heading: "Paragraph B",
    answer: "v",
    options: [
      "Why better food helps students' learning",
      "Becoming the headmaster of Msekeni",
      "Surprising use of school premises",
      "Global perspective",
      "Why students were undernourished",
      "Surprising academic outcome",
      "An innovative program to help girls",
      "How food program is operated",
      "How food program affects school attendance",
      "None of the usual reasons",
      "How to maintain academic standard"
    ],
    paragraph_id: "B"
  },
  // Add more paragraphs as needed...
];

// Handler function
const handleSelectOption = (paragraphId: string, option: string) => {
  console.log(`Selected option ${option} for paragraph ${paragraphId}`);
  // Update your state or send to API here
};

// Component usage
<MatchingHeadings 
  questions={matchingHeadingsQuestions}
  handleSelectOption={handleSelectOption}
  passageNumber={2}
  paragraphRange="A-G"
  questionRange="14-20"
/>
*/
