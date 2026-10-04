import { deleteData, fetchData, patchData } from "@/lib/fetch-util";
import { queryKeys } from "@/lib/query-keys";
import type {
  ChangePasswordFormData,
  ProfileFormData,
} from "@/routes/user/profile";
import type { User } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useUserProfileQuery = () => {
  return useQuery({
    queryKey: queryKeys.user.all,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
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
