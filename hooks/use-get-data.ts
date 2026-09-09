import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useCallback, useEffect } from "react";
import api, { CustomAxiosRequestConfig } from "../lib/api";
import { useHandleErrors } from "../lib/handle-errors";

interface Props {
  url: string;
  skipAuth?: boolean;
  shouldFetch?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchOnMount?: boolean | "always";
}

interface UseGetDataResult<T> {
  isFetching: boolean;
  data: T | undefined;
  refetch: () => void;
  error: Error | null;
}

export const useGetData = <T>({ url, skipAuth = false, shouldFetch = true, staleTime = 5 * 60 * 1000, gcTime = 10 * 60 * 1000, refetchOnMount = true }: Props): UseGetDataResult<T> => {
  const handleErrors = useHandleErrors();

  const queryKey = [url];

  const queryFn = useCallback(async () => {
    try {
      const response = await api.get(url, {
        skipAuth,
      } as CustomAxiosRequestConfig);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || "An error occurred");
      } else {
        throw new Error((error as Error).message || "An unexpected error occurred");
      }
    }
  }, [url, skipAuth]);

  const { isFetching, error, data, refetch } = useQuery({
    queryKey,
    queryFn,
    staleTime,
    gcTime,
    refetchOnMount,
    refetchOnWindowFocus: true,
    enabled: shouldFetch,
  });

  useEffect(() => {
    if (error) {
      handleErrors(error as AxiosError<{ message?: string }>);
    }
  }, [error, handleErrors]);

  return { isFetching, data, refetch, error };
};
