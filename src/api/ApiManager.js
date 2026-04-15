import axios from "axios";

const API = "http://127.0.0.1:8000";

export const ApiManager = async (url, options = {}) => {
  try {
    const res = await axios({
      baseURL: API,
      url,
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};