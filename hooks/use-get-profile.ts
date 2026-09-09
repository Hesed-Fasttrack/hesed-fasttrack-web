import { API_ENDPOINTS } from "@/lib/endpoints";
import type { User } from "@/types/auth";
import type { APIResponse } from "@/types/response";
import { useGetData } from "./use-get-data";

export const useGetProfile = function () {
  const { data, isFetching, error, refetch } = useGetData<APIResponse<User>>({
    url: API_ENDPOINTS.auth.getProfile,
  });

  return {
    profile: data?.data,
    isFetchingProfile: isFetching,
    errorProfile: error,
    refetchProfile: refetch,
  };
};
