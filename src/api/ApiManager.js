import axios from "axios";

const API = "https://9d99-182-10-98-15.ngrok-free.app";

export const ApiManager = async (url, options = {}) => {
  const token = localStorage.getItem("pokus-token");

  try {
    const res = await axios({
      baseURL: API,
      url,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    });

    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
