import { API } from "@/utils/api";

const submitTest = async (payload: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const response = await fetch(API.SUBMIT_TEST, {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    const responseData = await response.json();
    return responseData.data;
  } catch (error: any) {
    console.error("========= Error Create Submit:", error);
    return false;
  }
};

const updateSubmitTest = async (payload: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const response = await fetch(API.UPDATE_SUBMIT_TEST, {
      method: "PUT",
      headers: myHeaders,
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    const responseData = await response.json();
    return responseData.data;
  } catch (error: any) {
    console.error("========= Error Update Submit:", error);
    return false;
  }
};

export const SubmitService = {
  submitTest,
  updateSubmitTest,
};
