import { API } from "@/utils/api";

// const getAll = async () => {
//   try {
//     const response = await fetch(API.ACCOUNT.GET_ALL, {
//       method: "GET",
//     });
//     if (!response.ok) {
//       throw new Error(`Failed - Status: ${response.status}`);
//     }
//     const data = await response.json();
//     return data;
//   } catch (error: any) {
//     console.error("========= Error Get All Accounts:", error);
//     return false;
//   }
// };

// const updateAccount = async (id: any, payload: any) => {
//   try {
//     const myHeaders = new Headers();
//     myHeaders.append("Content-Type", "application/json");
//     const response = await fetch(`${API.ACCOUNT.UPDATE}/${id}`, {
//       method: "POST",
//       headers: myHeaders,
//       body: JSON.stringify(payload),
//       redirect: "follow",
//     });
//     if (!response.ok) {
//       throw new Error(`Failed - Status: ${response.status}`);
//     }

//     return true;
//   } catch (error: any) {
//     console.error("========= Error Update Account:", error);
//     return false;
//   }
// };

// const changePassword = async (id: any, payload: any) => {
//   try {
//     const myHeaders = new Headers();
//     myHeaders.append("Content-Type", "application/json");
//     const response = await fetch(`${API.ACCOUNT.CHANGE_PASSWORD}/${id}`, {
//       method: "POST",
//       headers: myHeaders,
//       body: JSON.stringify(payload),
//       redirect: "follow",
//     });
//     if (!response.ok) {
//       throw new Error(`Failed - Status: ${response.status}`);
//     }

//     return true;
//   } catch (error: any) {
//     console.error("========= Error Update Account:", error);
//     return false;
//   }
// };

const loginUserEmail = async (email: string, password: string) => {
  try {
    const response = await fetch(API.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      console.error(
        `Login failed - Status: ${response.status}`,
        JSON.stringify({ email, password })
      );
      throw new Error(`Đăng nhập thất bại - Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("========= Error Login:", error);
    throw error;
  }
};

const getUserById = async (id: string) => {
  try {
    const response = await fetch(`${API.GET_USER_BY_ID}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Login failed - Status: ${response.status}`);
      throw new Error(`Get Account Failed - Status: ${response.status}`);
    }

    const data = await response.json();

    return data.data;
  } catch (error) {
    console.error("========= Error Get Account:", error);
    throw error;
  }
};

const updateUser = async (id: string, payload: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const response = await fetch(`${API.UPDATE_USER}/${id}`, {
      method: "PUT",
      headers: myHeaders,
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    if (!response.ok) {
      console.error(`Login failed - Status: ${response.status}`);
      throw new Error(`Get Account Failed - Status: ${response.status}`);
    }

    const data = await response.json();

    return data.data;
  } catch (error) {
    console.error("========= Error Get Account:", error);
    throw error;
  }
};

const changePassword = async (id: any, payload: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const response = await fetch(`${API.CHANGE_PASSWORD}/${id}`, {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }

    return true;
  } catch (error: any) {
    console.error("========= Error Update Account:", error);
    return false;
  }
};

const getCompleteUserTestById = async (id: string) => {
  try {
    const response = await fetch(`${API.GET_COMPLETED_USER_TEST}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Login failed - Status: ${response.status}`);
      throw new Error(`Get Account Failed - Status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("========= Error Get Account:", error);
    throw error;
  }
};

const getCompleteTestById = async (id: string, user_id: string) => {
  try {
    const response = await fetch(`${API.GET_COMPLETED_TEST}/${id}/${user_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Login failed - Status: ${response.status}`);
      throw new Error(`Get Account Failed - Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("========= Error Get Account:", error);
    throw error;
  }
};

export const UserService = {
  loginUserEmail,
  getUserById,
  getCompleteUserTestById,
  getCompleteTestById,
  updateUser,
  changePassword,
};
