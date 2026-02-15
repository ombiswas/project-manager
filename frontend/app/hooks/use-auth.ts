import { postData } from "@/lib/fetch-util";
import type { SignupFormData } from "@/routes/auth/sign-up";
import { useMutation } from "@tanstack/react-query";

export const useSignUpMutation = () =>{
    return useMutation({
        mutationFn : (data : SignupFormData) => postData("auth/register " , data),   
    })
}