import { ApiManager } from "./ApiManager";

export const sendChatMessage = async ({ user_id, message }) => {
  return await ApiManager("/chat/send", {
    method: "POST",
    data: { user_id, message },
  });
};
