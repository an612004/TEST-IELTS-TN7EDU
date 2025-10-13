import { API } from "@/utils/api";

const getAll = async () => {
  try {
    const response = await fetch(API.GET_ALL_LATEST, {
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

// const getBlogById = async (blogId: string) => {
//   try {
//     const response = await fetch(`${API.GET_BLOG_BY_ID}/${blogId}`, {
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

export const LatestService = {
  getAll,
};
