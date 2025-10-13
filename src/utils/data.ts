// READING
const passageQuestions2 = [
  // Passage 1: Questions 1-13
  [
    {
      q_type: "MP",
      question_data: [
        {
          id: 1,
          question: "Question 1",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 2,
          question: "Multiple Question 2",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: true,
        },
        {
          id: 3,
          question: "Question 3",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 4,
          question: "Question 4",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 5,
          question: "Multiple Question 5",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: true,
        },
        {
          id: 6,
          question: "Question 6",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 7,
          question: "Question 7",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
      ],
    },
    {
      q_type: "FI",
      question_data: [
        { id: 8, start_passage: "start ", end_passage: " end " },
        { id: 9, start_passage: "start ", end_passage: " end " },
        { id: 10, start_passage: "start ", end_passage: " end " },
        { id: 11, start_passage: "start ", end_passage: " end " },
        { id: 12, start_passage: "start ", end_passage: " end " },
        { id: 13, start_passage: "start ", end_passage: " end " },
      ],
    },
  ],
  // Passage 2: Questions 14-26
  [
    {
      q_type: "FI",
      question_data: [
        { id: 14, start_passage: "start ", end_passage: " end " },
        { id: 15, start_passage: "start ", end_passage: " end " },
        { id: 16, start_passage: "start ", end_passage: " end " },
        { id: 17, start_passage: "start ", end_passage: " end " },
        { id: 18, start_passage: "start ", end_passage: " end " },
        { id: 19, start_passage: "start ", end_passage: " end " },
        { id: 20, start_passage: "start ", end_passage: " end " },
      ],
    },
    {
      q_type: "MP",
      question_data: [
        {
          id: 21,
          question: "Question 21",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 22,
          question: "Question 22",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 23,
          question: "Question 23",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 24,
          question: "Question 24",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 25,
          question: "Question 25",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 26,
          question: "Question 26",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
      ],
    },
  ],
  // Passage 3: Questions 27-40
  [
    {
      q_type: "FI",
      question_data: [
        { id: 27, start_passage: "start ", end_passage: " end " },
        { id: 28, start_passage: "start ", end_passage: " end " },
        { id: 29, start_passage: "start ", end_passage: " end " },
        { id: 30, start_passage: "start ", end_passage: " end " },
        { id: 31, start_passage: "start ", end_passage: " end " },
        { id: 32, start_passage: "start ", end_passage: " end " },
        { id: 33, start_passage: "start ", end_passage: " end " },
      ],
    },
    {
      q_type: "MP",
      question_data: [
        {
          id: 34,
          question: "Question 34",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 35,
          question: "Question 35",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 36,
          question: "Question 36",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 37,
          question: "Question 37",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 38,
          question: "Question 38",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 39,
          question: "Question 39",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 40,
          question: "Question 40",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
      ],
    },
  ],
];

// LISTENING
const sectionQuestionLis = [
  // Passage 1: Questions 1-10
  [
    {
      q_type: "MP",
      question_data: [
        {
          id: 1,
          question: "Question 1",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 2,
          question: "Multiple Question 2",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: true,
        },
        {
          id: 3,
          question: "Question 3",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 4,
          question: "Question 4",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 5,
          question: "Multiple Question 5",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: true,
        },
        {
          id: 6,
          question: "Question 6",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 7,
          question: "Question 7",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 8,
          question: "Multiple Question 5",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: true,
        },
        {
          id: 9,
          question: "Question 6",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 10,
          question: "Question 7",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
      ],
    },
  ],
  // Passage 2: Questions 11-20
  [
    {
      q_type: "FI",
      question_data: [
        { id: 11, start_passage: "start ", end_passage: " end " },
        { id: 12, start_passage: "start ", end_passage: " end " },
        { id: 13, start_passage: "start ", end_passage: " end " },
        { id: 14, start_passage: "start ", end_passage: " end " },
        { id: 15, start_passage: "start ", end_passage: " end " },
      ],
    },
    {
      q_type: "MP",
      question_data: [
        {
          id: 16,
          question: "Question 21",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 17,
          question: "Question 22",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 18,
          question: "Question 23",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 19,
          question: "Question 24",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 20,
          question: "Question 25",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
      ],
    },
  ],
  // Passage 3: Questions 21-30
  [
    {
      q_type: "MP",
      question_data: [
        {
          id: 21,
          question: "Question 34",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 22,
          question: "Question 35",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 23,
          question: "Question 36",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 24,
          question: "Question 37",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 25,
          question: "Question 38",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 26,
          question: "Question 39",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
        {
          id: 27,
          question: "Question 40",
          choice: ["Choice 1", "Choice 2", "Choice 3"],
          isMultiple: false,
        },
      ],
    },
    {
      q_type: "FI",
      question_data: [
        { id: 28, start_passage: "start ", end_passage: " end " },
        { id: 29, start_passage: "start ", end_passage: " end " },
        { id: 30, start_passage: "start ", end_passage: " end " },
      ],
    },
  ],
  // Passage 4: Questions 31-40
  [
    {
      q_type: "FI",
      question_data: [
        { id: 31, start_passage: "start ", end_passage: " end " },
        { id: 32, start_passage: "start ", end_passage: " end " },
        { id: 33, start_passage: "start ", end_passage: " end " },
        { id: 34, start_passage: "start ", end_passage: " end " },
        { id: 35, start_passage: "start ", end_passage: " end " },
        { id: 36, start_passage: "start ", end_passage: " end " },
        { id: 37, start_passage: "start ", end_passage: " end " },
        { id: 38, start_passage: "start ", end_passage: " end " },
        { id: 39, start_passage: "start ", end_passage: " end " },
        { id: 40, start_passage: "start ", end_passage: " end " },
      ],
    },
  ],
];

export const DATA = {
  passageQuestions2,
  sectionQuestionLis,
};
