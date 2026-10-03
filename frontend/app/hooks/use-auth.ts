import { postData } from "@/lib/fetch-util";
import type { SignupFormData } from "@/routes/auth/sign-up";
import type { AuthResponse, User } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const useSignUpMutation = () => {
    return useMutation({
        mutationFn: (data: SignupFormData) => postData<{ message: string; user?: User }>("/auth/register", data),
    });
};

export const useVerifyEmailMutation = () => {
    return useMutation({
        mutationFn: (data: { token: string }) =>
            postData<{ message: string }>("/auth/verify-email", data)
    });
};

export const useLoginMutation = () => {
    return useMutation({
        mutationFn: (data: { email: string; password: string }) =>
            postData<AuthResponse>("/auth/login", data)
    });
};

export const useForgotPasswordMutation = () => {
    return useMutation({
        mutationFn: (data: { email: string }) =>
            postData<{ message: string }>("/auth/reset-password-request", data)
    });
};

export const useResetPasswordMutation = () => {
    return useMutation({
        mutationFn: (data: {
            token: string;
            newPassword: string;
            confirmPassword: string;
        }) =>
            postData<{ message: string }>("/auth/reset-password", data)
    });
};