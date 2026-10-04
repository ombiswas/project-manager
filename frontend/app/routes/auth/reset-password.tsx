import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useResetPasswordMutation } from '@/hooks/use-auth';
import { resetPasswordSchema } from '@/lib/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';
import { getErrorMessage } from '@/lib/fetch-util';

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

const ResetPassword = () => {
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const [isSuccess, setIsSuccess] = useState(false);
    const { mutate: resetPassword, isPending } = useResetPasswordMutation();

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        }
    });

    const onSubmit = (values: ResetPasswordFormData) => {
        if (!token) {
            toast.error("Invalid or missing token");
            return;
        }

        resetPassword(
            { ...values, token: token as string },
            {
                onSuccess: () => { setIsSuccess(true); },
                onError: (error: unknown) => {
                    toast.error(getErrorMessage(error, "Failed to reset password"));
                }
            });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] py-12 px-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-1.5">
                    <p className="caption-mono text-xs text-[#7d8187]">NEW CREDENTIALS</p>
                    <h1 className="text-2xl font-normal tracking-[-0.6px] text-white">Reset password</h1>
                    <p className="text-sm font-normal text-[#7d8187]">Enter your new password below</p>
                </div>

                <Card className="border border-[#212327] bg-[#141517] p-6 rounded-[8px] shadow-none">
                    <CardContent className="p-0">
                        <Link
                            to="/sign-in"
                            className="inline-flex items-center gap-2 text-xs text-[#7d8187] hover:text-white transition-colors mb-5"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to sign in</span>
                        </Link>

                        {isSuccess ? (
                            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                                <div className="w-12 h-12 rounded-full border border-[#212327] bg-[#1a1c20] flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-lg font-normal tracking-[-0.4px] text-white">
                                    Password reset successful
                                </h2>
                                <p className="text-xs text-[#7d8187] max-w-xs">
                                    Your password has been updated. You can now sign in with your new credentials.
                                </p>
                                <Link to="/sign-in" className="w-full pt-2">
                                    <Button variant="default" className="w-full">
                                        Sign In
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        name="newPassword"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                                                    New Password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="password" placeholder="••••••••" />
                                                </FormControl>
                                                <FormMessage className="text-xs text-[#ff7a17]" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        name="confirmPassword"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                                                    Confirm Password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="password" placeholder="••••••••" />
                                                </FormControl>
                                                <FormMessage className="text-xs text-[#ff7a17]" />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full mt-2 h-10" disabled={isPending}>
                                        {isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            "Update Password"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ResetPassword;