import { deleteData, fetchData, patchData } from "@/lib/fetch-util";
import type {
  ChangePasswordFormData,
  ProfileFormData,
} from "@/routes/user/profile";
import type { User } from "@/types";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

const queryKey: QueryKey = ["user"];

export const useUserProfileQuery = () => {
  return useQuery({
    queryKey,
    queryFn: () => fetchData<User>("/users/profile"),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      patchData<{ message: string }>("/users/change-password", data),
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ProfileFormData>) =>
      patchData<User>("/users/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data?: { password?: string }) =>
      deleteData<{ message: string }>("/users/profile", data),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
