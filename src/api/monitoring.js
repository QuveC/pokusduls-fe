import { ApiManager } from "./ApiManager";

export const detectFrame = async (base64Image) => {
  return await ApiManager("/monitoring/detect-frame", {
    method: "POST",
    data: { image: base64Image },
  });
};
