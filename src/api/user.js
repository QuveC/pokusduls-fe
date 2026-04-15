import { ApiManager } from "./apiManager";

export const registerUser = async (data) => {
  return await ApiManager("/register", {
    method: "POST",
    data,
  });
};

export const loginUser = async (data) => {
  return await ApiManager("/login", {
    method: "POST",
    data,
  });
};