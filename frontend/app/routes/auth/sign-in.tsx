import { signInSchema } from '@/lib/schema';
import React from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, Links, useNavigate } from 'react-router';
import { useLoginMutation } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Loader, Loader2 } from 'lucide-react';
import { useAuth } from '@/provider/auth-context';

type SigninFormData = z.infer<typeof signInSchema>;

const SignIn = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const form = useForm<SigninFormData>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const { mutate, isPending } = useLoginMutation();

    const handleOnSubmit = (values: SigninFormData) => {
        mutate(values, {
            onSuccess: (data) => {
                login(data);
                console.log(data);
                toast.success("Login successfully");
                navigate("/dashboard");
            },
            onError: (error: any) => {
                const errorMessage = error.response?.data?.message || "An error occured";
                console.log(error);
                toast.error(errorMessage);
            }
        });
    };

    return <div className='min-h-screen flex items-center flex-col justify-center bg-muted/40 p-4'>
        <Card className='w-full max-w-md shadow-x1'>
            <CardHeader className='text-center mb-5'>
                <CardTitle className='text-2xl font-bold'>Welcome back!</CardTitle>
                <CardDescription className='text-muted-foreground text-sm'>Sign in to your account to continue</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleOnSubmit)} className='space-y-6'>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input type='email' placeholder='email@example.com' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <div className='flex justify-between items-center'>
                                        <FormLabel>Password</FormLabel>
                                        <Link to="/forgot-password" className='text-sm text-blue-600'>
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <FormControl>
                                        <Input type='password' placeholder='********' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type='submit' className='w-full' disabled={isPending}>
                            {isPending ? <Loader2 className='w-4 h-4 mr-2' /> : "Sign in"}
                        </Button>
                    </form>
                </Form>

                <CardFooter className='flex justify-center items-center mt-5'>
                    <div className='flex items-center justify-center'>
                        <p className='text-sm text-muted-foreground'>Don't have an account? {" "}<Link to="/sign-up">Sign up</Link></p>
                    </div>
                </CardFooter>
            </CardContent>
        </Card>
    </div>;

}

export default SignIn;