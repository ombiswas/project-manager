import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/provider/auth-context";
import { useUpdateUserProfile } from "@/hooks/use-user";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const profileSchema = z.object({
    name: z.string().min(1, "Name is required"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Settings = () => {
    const { user, updateUser } = useAuth();
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateUserProfile();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || "",
        },
    });

    useEffect(() => {
        if (user?.name) {
            form.setValue("name", user.name);
        }
    }, [user, form]);

    const onSubmit = (values: ProfileFormValues) => {
        updateProfile(values, {
            onSuccess: (data: any) => {
                // The backend returns the user object directly
                updateUser(data);
                toast.success("Profile updated successfully");
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || "Failed to update profile");
            }
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Details</CardTitle>
                            <CardDescription>
                                Manage your personal information and preferences.
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        {...form.register("name")}
                                        placeholder="Enter your name"
                                    />
                                    {form.formState.errors.name && (
                                        <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" value={user?.email || ""} disabled className="bg-muted/50 cursor-not-allowed" />
                                    <p className="text-sm text-muted-foreground">
                                        Your email address cannot be changed from the dashboard.
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isUpdating} className="mt-4">
                                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Decide what events you want to be notified about.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive email updates about project activities.
                                    </p>
                                </div>
                                <Checkbox defaultChecked />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Push Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive push notifications from your browser.
                                    </p>
                                </div>
                                <Checkbox />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="billing" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing and Subscription</CardTitle>
                            <CardDescription>
                                Manage your subscription plan and payment methods.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-md bg-secondary/50 p-4">
                                <div className="font-semibold">Current Plan: Free</div>
                                <div className="text-sm text-muted-foreground mt-2">
                                    You are currently on the free plan which includes basic features for up to 3 workspaces.
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline">Upgrade Plan</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Settings;
