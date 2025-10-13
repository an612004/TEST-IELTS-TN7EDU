import { ROUTES } from "@/utils/routes";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

interface PopupMenuProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  answers: { [key: number]: string };
  onSelectTask: (taskId: number) => void;
  onSubmit: () => void;
}

const PopupMenu = ({
  isOpen,
  setIsOpen,
  answers,
  onSelectTask,
  onSubmit,
}: PopupMenuProps) => {
  const [selectedTab, setSelectedTab] = useState(0);

  // Function to count words
  const countWords = (input: string) => {
    const trimmedText = input.trim();
    if (!trimmedText) return 0;
    const words = trimmedText.split(/\s+/).filter((word) => word.length > 0);
    return words.length;
  };

  // Define tasks with their completion status and word count
  const tasks = [
    {
      id: 1,
      name: "Task 1",
      wordCount: countWords(answers[1] || ""),
      status:
        countWords(answers[1] || "") === 0
          ? "Not Started"
          : countWords(answers[1] || "") > 0 &&
            countWords(answers[1] || "") < 150
          ? "Not Enough Words"
          : "Done",
    },
    {
      id: 2,
      name: "Task 2",
      wordCount: countWords(answers[2] || ""),
      status:
        countWords(answers[2] || "") === 0
          ? "Not Started"
          : countWords(answers[2] || "") > 0 &&
            countWords(answers[2] || "") < 250
          ? "Not Enough Words"
          : "Done",
    },
  ];

  // Handle task selection
  const handleTaskSelect = (taskId: number) => {
    onSelectTask(taskId);
    setSelectedTab(taskId - 1);
    setIsOpen(false); // Close popup after selection
  };

  // Determine styling based on status
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-green-500 text-white";
      case "Not Enough Words":
        return "bg-red-500 text-white";
      case "Not Started":
      default:
        return "bg-gray-200 text-gray-700";
    }
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
          <div className="bg-white rounded-t-[40px] shadow-lg w-full mx-auto overflow-hidden">
            {/* Drag handle */}
            <div className="bg-black w-32 h-[4px] rounded-full mx-auto mt-3"></div>

            {/* Header */}
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

            {/* Instruction */}
            <div className="px-6 py-3">
              <p className="text-gray-700 text-xs">
                Review the status of your writing tasks and submit when ready.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              {tasks.map((task, index) => (
                <button
                  key={task.id}
                  className={`flex-1 py-3 text-center font-medium text-sm ${
                    selectedTab === index
                      ? "text-orange-500 border-b-2 border-orange-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setSelectedTab(index)}
                >
                  {task.name}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="w-full px-6 py-4">
              {tasks[selectedTab] && (
                <div className="mb-5">
                  <h3 className="text-sm font-bold mb-3">
                    {tasks[selectedTab].name}
                  </h3>
                  <div
                    className={`w-full h-12 rounded-md flex items-center justify-center text-sm font-medium cursor-pointer ${getStatusStyles(
                      tasks[selectedTab].status
                    )}`}
                    onClick={() => handleTaskSelect(tasks[selectedTab].id)}
                  >
                    {tasks[selectedTab].status}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Word Count: {tasks[selectedTab].wordCount}
                    {tasks[selectedTab].id === 1
                      ? " (Minimum 150 words)"
                      : " (Minimum 250 words)"}
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="w-full px-4 py-5">
              <div
                onClick={onSubmit}
                className="text-center w-full py-3 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 transition duration-150"
              >
                Submit
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PopupMenu;
