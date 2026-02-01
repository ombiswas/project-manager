import { signInSchema } from '@/lib/schema';
import React from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {z} from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, Links } from 'react-router';

type SigninFormData = z.infer<typeof signInSchema>;

const SignIn = () => {
    const form = useForm<SigninFormData>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const handleOnSubmit = (values: SigninFormData) => {
        console.log(values);
    }

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
                        <Button type='submit' className='w-full'>Sign In</Button>
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