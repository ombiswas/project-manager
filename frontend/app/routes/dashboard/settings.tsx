import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
import type { User } from "@/types";
import { getErrorMessage } from "@/lib/fetch-util";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { mutate: updateProfile, isPending: isUpdating } =
    useUpdateUserProfile();

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
      onSuccess: (data: User) => {
        updateUser(data);
        toast.success("Profile updated successfully");
      },
      onError: (err: unknown) => {
        toast.error(getErrorMessage(err, "Failed to update profile"));
      },
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-normal tracking-tight text-ink">
            Settings
          </h1>
          <p className="caption-mono text-mute mt-1">
            Manage your account and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-sm">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card className="bg-canvas-card border border-hairline rounded-[8px]">
            <CardHeader className="p-5 border-b border-hairline">
              <CardTitle className="text-base font-normal tracking-tight text-ink">
                Profile Details
              </CardTitle>
              <CardDescription className="caption-mono text-mute mt-0.5">
                Manage your personal information and preferences.
              </CardDescription>
            </CardHeader>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2 max-w-md">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Enter your name"
                    className="rounded-full bg-canvas-card border-hairline focus-visible:border-canvas-mid text-sm h-9"
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-accent-sunset font-mono">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2 max-w-md">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="rounded-full bg-canvas-soft border-hairline text-mute cursor-not-allowed text-sm h-9"
                  />
                  <p className="caption-mono text-mute text-[11px]">
                    Your email address cannot be changed from the dashboard.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="px-5 py-4 border-t border-hairline">
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-full font-mono text-xs"
                >
                  {isUpdating && (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="bg-canvas-card border border-hairline rounded-[8px]">
            <CardHeader className="p-5 border-b border-hairline">
              <CardTitle className="text-base font-normal tracking-tight text-ink">
                Notification Preferences
              </CardTitle>
              <CardDescription className="caption-mono text-mute mt-0.5">
                Decide what events you want to be notified about.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between rounded-[6px] border border-hairline bg-canvas-soft/40 p-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-normal text-ink">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-mute font-light">
                    Receive email updates about project activities.
                  </p>
                </div>
                <Checkbox defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-[6px] border border-hairline bg-canvas-soft/40 p-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-normal text-ink">
                    Push Notifications
                  </Label>
                  <p className="text-xs text-mute font-light">
                    Receive push notifications from your browser.
                  </p>
                </div>
                <Checkbox />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <Card className="bg-canvas-card border border-hairline rounded-[8px]">
            <CardHeader className="p-5 border-b border-hairline">
              <CardTitle className="text-base font-normal tracking-tight text-ink">
                Billing and Subscription
              </CardTitle>
              <CardDescription className="caption-mono text-mute mt-0.5">
                Manage your subscription plan and payment methods.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="rounded-[6px] bg-canvas-soft border border-hairline p-4">
                <div className="caption-mono text-ink">Current Plan: Free</div>
                <div className="text-xs text-mute mt-1.5 font-light leading-relaxed">
                  You are currently on the free plan which includes basic
                  features for up to 3 workspaces.
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-5 py-4 border-t border-hairline">
              <Button
                variant="outline"
                className="rounded-full font-mono text-xs"
              >
                Upgrade Plan
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
