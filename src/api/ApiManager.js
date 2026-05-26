import axios from "axios";

const API = "http://127.0.0.1:8000";

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
