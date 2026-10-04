import { signUpSchema } from "@/lib/schema";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import { useSignUpMutation } from "@/hooks/use-auth";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/fetch-util";

export type SignupFormData = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const navigate = useNavigate();
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      confirmPassword: "",
    },
  });

  const { mutate, isPending } = useSignUpMutation();

  const handleOnSubmit = (values: SignupFormData) => {
    mutate(values, {
      onSuccess: () => {
        toast.success("Email Verification Required", {
          description:
            "Please check your email for a verification link. If you don't see it, please check your spam folder.",
        });

        form.reset();
        navigate("/sign-in");
      },
      onError: (error: unknown) => {
        toast.error(getErrorMessage(error, "Failed to create account"));
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] py-12 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1.5">
          <p className="caption-mono text-xs text-[#7d8187]">REGISTRATION</p>
          <h1 className="text-2xl font-normal tracking-[-0.6px] text-white">
            Create an account
          </h1>
          <p className="text-sm font-normal text-[#7d8187]">
            Enter your credentials to get started
          </p>
        </div>

        <Card className="border border-[#212327] bg-[#141517] p-6 rounded-[8px] shadow-none">
          <CardContent className="p-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleOnSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs text-[#ff7a17]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@company.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-[#ff7a17]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-[#ff7a17]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-[#ff7a17]" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full mt-2 h-10"
                  disabled={isPending}
                >
                  {isPending ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center border-t border-[#212327] pt-4">
              <p className="text-xs text-[#7d8187]">
                Already have an account?{" "}
                <Link to="/sign-in" className="text-white hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
