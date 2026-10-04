import { signInSchema } from "@/lib/schema";
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
import { useLoginMutation } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/provider/auth-context";
import { getErrorMessage } from "@/lib/fetch-util";

type SigninFormData = z.infer<typeof signInSchema>;

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const form = useForm<SigninFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate, isPending } = useLoginMutation();

  const handleOnSubmit = (values: SigninFormData) => {
    mutate(values, {
      onSuccess: (data) => {
        login(data);
        toast.success("Login successfully");
        navigate("/dashboard");
      },
      onError: (error: unknown) => {
        toast.error(getErrorMessage(error, "An error occurred"));
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] py-12 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1.5">
          <p className="caption-mono text-xs text-[#7d8187]">AUTHENTICATION</p>
          <h1 className="text-2xl font-normal tracking-[-0.6px] text-white">
            Welcome back
          </h1>
          <p className="text-sm font-normal text-[#7d8187]">
            Sign in to your account to continue
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
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                          Password
                        </FormLabel>
                        <Link
                          to="/forgot-password"
                          className="text-xs text-[#7d8187] hover:text-white transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
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
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center border-t border-[#212327] pt-4">
              <p className="text-xs text-[#7d8187]">
                Don&apos;t have an account?{" "}
                <Link to="/sign-up" className="text-white hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
