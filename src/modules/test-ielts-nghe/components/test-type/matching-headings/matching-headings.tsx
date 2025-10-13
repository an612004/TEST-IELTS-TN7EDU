import React, { useState, useEffect, useRef } from "react";

interface MatchingHeadingsQuestion {
  q_type: "MH";
  part_id: number;
  heading: string;
  answer: string;
  options: string[];
  paragraph_id: string; // A, B, C, etc.
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
  onHeadingSelect: (paragraphId: string, headingId: string) => void;
  headings: string[];
  headingIds: string[];
  isLastQuestion?: boolean; // Add this prop to identify the last question
}

const Paragraph: React.FC<ParagraphProps> = ({
  id,
  index,
  questionNumber,
  selectedHeading,
  onHeadingSelect,
  headings,
  headingIds,
  isLastQuestion = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle body scrolling when dropdown is open
  useEffect(() => {
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
    onHeadingSelect(id, headingId);
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
      <div className="relative" ref={containerRef}>
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
            <div
              ref={dropdownRef}
              className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 !z-[999] w-[90%] max-w-md bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-auto"
            >
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
  savedAnswers?: Record<string, string>; // Add this prop
  passageNumber?: number;
  paragraphRange?: string;
  questionRange?: string;
  startQuestion?: number;
  endQuestion?: number;
}

export default function MatchingHeadings({
  questions,
  handleSelectOption,
  savedAnswers = {}, // Add this prop with default value
  passageNumber = 2,
  paragraphRange = "A-G",
  questionRange = "14-20",
  startQuestion,
  endQuestion,
}: MatchingHeadingsProps) {
  const [answers, setAnswers] =
    useState<Record<string, string | null>>(savedAnswers); // Initialize with savedAnswers

  // Add useEffect to update local state when savedAnswers change
  useEffect(() => {
    setAnswers(savedAnswers);
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
  const paragraphs = questions.map((q, index) => ({
    id: q.paragraph_id,
    index,
    selectedHeading: answers[q.paragraph_id] || null,
  }));

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

  const handleHeadingSelect = (paragraphId: string, headingId: string) => {
    // Find the heading text for the selected ID
    let selectedHeading = headingId;

    // If headingId is just an ID (like "i", "ii", etc.), find the corresponding text
    if (headingId.length <= 5) {
      // Just checking if it's a short ID
      const index = headingIds.indexOf(headingId);
      if (index !== -1 && index < headings.length) {
        // Just pass the heading text, not the ID + text
        selectedHeading = headings[index];
      }
    }

    setAnswers((prev) => ({
      ...prev,
      [paragraphId]: selectedHeading,
    }));

    // Pass just the text to the parent component
    handleSelectOption(paragraphId, selectedHeading);
  };

  // Update the rendering to show the heading with its ID
  return (
    <div className="w-full">
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
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
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
          {paragraphs.map((paragraph) => {
            // Find the index of this heading in the headings array to get its ID
            const headingIndex = headings.indexOf(
              paragraph.selectedHeading || ""
            );
            const displayId =
              headingIndex !== -1 ? headingIds[headingIndex] : "";

            return (
              <div
                key={paragraph.id}
                className="border border-gray-200 rounded-md p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <span className="text-[#FA812F] font-bold mr-2">
                      {getQuestionNumber(paragraph.index)}.
                    </span>
                    <span className="text-gray-700">
                      Paragraph {paragraph.id}
                    </span>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-md ${
                      paragraph.selectedHeading
                        ? "bg-[#f8f2ef] text-[#FA812F] border border-[#FA812F]"
                        : "bg-gray-100 text-gray-500 border border-gray-300"
                    }`}
                  >
                    {paragraph.selectedHeading ? displayId : "Not selected"}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {headingIds.map((id) => {
                    // Get the index of this ID to find the corresponding heading
                    const index = headingIds.indexOf(id);
                    // Check if this heading is selected for this paragraph
                    const isSelected =
                      paragraph.selectedHeading === headings[index];

                    return (
                      <button
                        key={id}
                        onClick={() => handleHeadingSelect(paragraph.id, id)}
                        className={`px-3 py-1 rounded-md border ${
                          isSelected
                            ? "bg-[#f8f2ef] text-[#FA812F] border-[#FA812F]"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {id}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
