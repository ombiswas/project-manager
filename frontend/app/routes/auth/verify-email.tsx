import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CheckCircle, Loader, XCircle } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useVerifyEmailMutation } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/fetch-util';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");
    const [isSuccess, setIsSuccess] = useState(false);
    const { mutate, isPending: isVerifying } = useVerifyEmailMutation();

    useEffect(() => {
        if (token) {
            mutate(
                { token },
                {
                    onSuccess: () => {
                        setIsSuccess(true);
                    },
                    onError: (error: unknown) => {
                        const errorMessage = getErrorMessage(error, "Email verification failed");
                        setIsSuccess(false);
                        toast.error(errorMessage);
                    }
                }
            );
        }
    }, [searchParams, token, mutate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] py-12 px-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-1.5">
                    <p className="caption-mono text-xs text-[#7d8187]">VERIFICATION</p>
                    <h1 className="text-2xl font-normal tracking-[-0.6px] text-white">Email Verification</h1>
                    <p className="text-sm font-normal text-[#7d8187]">
                        {isVerifying ? "Verifying your email address..." : isSuccess ? "Your email has been confirmed" : "Verification encountered an issue"}
                    </p>
                </div>

                <Card className="border border-[#212327] bg-[#141517] p-6 rounded-[8px] shadow-none">
                    <CardContent className="p-0">
                        <div className="flex flex-col justify-center items-center py-6 text-center space-y-3">
                            {isVerifying ? (
                                <>
                                    <div className="w-12 h-12 rounded-full border border-[#212327] bg-[#1a1c20] flex items-center justify-center">
                                        <Loader className="w-5 h-5 text-white animate-spin" />
                                    </div>
                                    <h3 className="text-base font-normal text-white">Verifying email...</h3>
                                    <p className="text-xs text-[#7d8187]">
                                        Please wait while we verify your token.
                                    </p>
                                </>
                            ) : isSuccess ? (
                                <>
                                    <div className="w-12 h-12 rounded-full border border-[#212327] bg-[#1a1c20] flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-base font-normal text-white">Email Verified</h3>
                                    <p className="text-xs text-[#7d8187]">
                                        Your email has been verified successfully.
                                    </p>

                                    <div className="pt-2 w-full">
                                        <Link to="/sign-in" className="w-full block">
                                            <Button variant="default" className="w-full">Back to Sign in</Button>
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full border border-[#212327] bg-[#1a1c20] flex items-center justify-center">
                                        <XCircle className="w-6 h-6 text-[#ff7a17]" />
                                    </div>
                                    <h3 className="text-base font-normal text-white">Verification Failed</h3>
                                    <p className="text-xs text-[#7d8187]">
                                        Your email verification link has expired or is invalid.
                                    </p>

                                    <div className="pt-2 w-full">
                                        <Link to="/sign-in" className="w-full block">
                                            <Button variant="outline" className="w-full">Back to Sign in</Button>
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default VerifyEmail;