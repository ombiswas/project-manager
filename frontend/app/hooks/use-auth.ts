import { postData } from "@/lib/fetch-util";
import type { SignupFormData } from "@/routes/auth/sign-up";
import { useMutation } from "@tanstack/react-query";

export const useSignUpMutation = () => {
    return useMutation({
        mutationFn: (data: SignupFormData) => postData("auth/register", data),
    });
};

export const useVerifyEmailMutation = () => {
    return useMutation({
        mutationFn: (data: { token: String }) =>
            postData("/auth/verify-email", data)
    });
};

export const useLoginMutation = () => {
    return useMutation({
        mutationFn: (data: { email: string, password: string }) =>
            postData("/auth/login", data)
    });
};