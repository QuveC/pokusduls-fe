import { ApiManager } from "./ApiManager";

export const completeSession = async ({ user_id, duration, method_type }) => {
  return await ApiManager("/session/complete", {
    method: "POST",
    data: { user_id, duration, method_type },
  });
};
