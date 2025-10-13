import { API } from "@/utils/api";

const getAll = async () => {
  try {
    const response = await fetch(API.GET_ALL_FULLTEST, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error: any) {
    console.error("========= Error Get All Blog:", error);
    return false;
  }
};

const getFullTestById = async (id: string) => {
  try {
    const response = await fetch(`${API.GET_FULL_TEST_BY_ID}/${id}`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error: any) {
    console.error("========= Error Fetching Full test by ID:", error);
    return false;
  }
};

// const getAuthorById = async (authorId: string) => {
//   try {
//     const response = await fetch(`${API.GET_AUTHOR_BY_ID}/${authorId}`, {
//       method: "GET",
//       redirect: "follow",
//     });

//     if (!response.ok) {
//       throw new Error(`Failed - Status: ${response.status}`);
//     }
//     const data = await response.json();
//     return data.data;
//   } catch (error: any) {
//     console.error("========= Error Fetching Blog by ID:", error);
//     return false;
//   }
// };

export const FullTestService = {
  getAll,
  getFullTestById,
};
