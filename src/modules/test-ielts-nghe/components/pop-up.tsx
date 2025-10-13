import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PassageInfo {
  id: number;
  startQuestion: number;
  endQuestion: number;
  answeredQuestions: number;
}

interface PopupMenuProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  passages: PassageInfo[] | undefined;
  getAnsweredStatus: (questionNum: number) => boolean;
  onSubmit: () => void;
  onQuestionSelect: (questionNum: number) => void;
}

const PopupMenu = ({
  isOpen,
  setIsOpen,
  passages,
  getAnsweredStatus,
  onSubmit,
  onQuestionSelect,
}: PopupMenuProps) => {
  const [selectedTab, setSelectedTab] = useState(0);

  if (!passages || passages.length === 0) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed bottom-0 left-0 right-0 z-30"
          >
            <div className="bg-white rounded-t-[40px] shadow-lg w-full max-w-md mx-auto overflow-hidden">
              <div className="bg-black w-32 h-[4px] rounded-full mx-auto mt-3"></div>
              <div className="px-6 pb-0 pt-3 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Lưu ý</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="px-6 py-4 text-center">
                <p className="text-gray-700 text-sm">Loading sections...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Calculate total and answered questions for each passage
  const getPassageStats = (passage: PassageInfo) => {
    const totalQuestions = passage.endQuestion - passage.startQuestion + 1;
    // Recalculate answered questions dynamically to ensure accuracy
    const answeredQuestions = Array.from(
      { length: totalQuestions },
      (_, i) => passage.startQuestion + i
    ).filter((questionNum) => getAnsweredStatus(questionNum)).length;
    return { totalQuestions, answeredQuestions };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed bottom-0 left-0 right-0 z-30"
        >
          <div className="bg-white rounded-t-[40px] shadow-lg w-full max-w-md mx-auto overflow-hidden">
            <div className="bg-black w-32 h-[4px] rounded-full mx-auto mt-3"></div>
            <div className="px-6 pb-0 pt-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Review & Submit</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="px-6 py-3">
              <p className="text-gray-700 text-xs">
                Review and edit your answers for sections 1, 2, and 3. Green
                indicates answered questions.
              </p>
            </div>

            <div className="flex border-b">
              {passages.map((passage, index) => {
                const { answeredQuestions, totalQuestions } =
                  getPassageStats(passage);
                return (
                  <button
                    key={passage.id}
                    className={`flex-1 py-3 text-center font-medium text-sm ${
                      selectedTab === index
                        ? "text-orange-500 border-b-2 border-orange-500"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setSelectedTab(index)}
                  >
                    Section {passage.id}
                  </button>
                );
              })}
            </div>

            <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
              {passages.map((passage, index) => (
                <div
                  key={passage.id}
                  className={`mb-5 ${
                    selectedTab === index ? "block" : "hidden"
                  }`}
                >
                  <h3 className="text-sm font-bold mb-3">
                    SECTION {passage.id}
                  </h3>
                  <div className="grid grid-cols-5 gap-4">
                    {Array.from(
                      {
                        length: passage.endQuestion - passage.startQuestion + 1,
                      },
                      (_, i) => passage.startQuestion + i
                    ).map((questionNum) => (
                      <div
                        key={questionNum}
                        onClick={() => {
                          onQuestionSelect(questionNum);
                          setIsOpen(false); // Close popup after selection
                        }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer ${
                          getAnsweredStatus(questionNum)
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {questionNum}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-5 flex gap-3">
              <button
                onClick={() => {
                  onSubmit();
                  setIsOpen(false);
                }}
                className="flex-1 py-3 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 transition duration-150"
              >
                Submit
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PopupMenu;
