import type { AxiosError } from "axios";
import { showToast } from "./show-toast";

type ApiError = {
  message?: string;
  errors?: { field: string; message: string }[];
};

export function useHandleErrors() {
  const handleAxiosErrors = function (error: AxiosError<ApiError>) {
    let errorMessage = "An unexpected error occurred. Please try again later.";

    if (error.response?.data) {
      const data = error.response.data;

      if (data.errors && data.errors.length > 0) {
        errorMessage = data.errors.map(e => `${e.field}: ${e.message}`).join("\n");
      } else if (data.message) {
        errorMessage = data.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    showToast("error", errorMessage);
  };

  return handleAxiosErrors;
}
