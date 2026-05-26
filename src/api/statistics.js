import { ApiManager } from "./ApiManager";

export const getStatistics = async (user_id) => {
  return await ApiManager(`/statistics/${user_id}`);
};

export const updateStatistics = async (user_id, { xp_gained = 0, session_completed = true } = {}) => {
  return await ApiManager(`/statistics/${user_id}/update`, {
    method: "POST",
    data: { xp_gained, session_completed },
  });
};
