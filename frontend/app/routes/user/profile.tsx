import { BackButton } from "@/components/back-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  useChangePassword,
  useUpdateUserProfile,
  useUserProfileQuery,
} from "@/hooks/use-user";
import { useAuth } from "@/provider/auth-context";
import type { User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "@/components/loader";
import { AlertCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: z.string().min(8, { message: "New password is required" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Confirm password is required" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const profileSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  profilePicture: z.string().optional(),
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

import { ErrorState } from "@/components/error-state";
import { getErrorMessage } from "@/lib/fetch-util";

export type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const { data: user, isPending, isError, error: fetchError, refetch } = useUserProfileQuery() as {
    data: User | undefined;
    isPending: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
  };
  const { logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      profilePicture: user?.profilePicture || "",
    },
    values: {
      name: user?.name || "",
      profilePicture: user?.profilePicture || "",
    },
  });

  const { mutate: updateUserProfile, isPending: isUpdatingProfile } =
    useUpdateUserProfile();
  const {
    mutate: changePassword,
    isPending: isChangingPassword,
    error: passwordError,
  } = useChangePassword();

  const handlePasswordChange = (values: ChangePasswordFormData) => {
    changePassword(values, {
      onSuccess: () => {
        toast.success(
          "Password updated successfully. You will be logged out. Please login again."
        );
        form.reset();

        setTimeout(() => {
          logout();
          navigate("/sign-in");
        }, 3000);
      },
      onError: (err: unknown) => {
        toast.error(getErrorMessage(err, "Failed to update password"));
      },
    });
  };

  const handleProfileFormSubmit = (values: ProfileFormData) => {
    updateUserProfile(
      { name: values.name, profilePicture: values.profilePicture || "" },
      {
        onSuccess: (data: User) => {
          updateUser(data);
          toast.success("Profile updated successfully");
        },
        onError: (err: unknown) => {
          toast.error(getErrorMessage(err, "Failed to update profile"));
        },
      }
    );
  };

  if (isPending) return <Loader label="Loading profile information..." />;

  if (isError || !user) {
    return (
      <div className="space-y-4 py-8 px-4 md:px-0 max-w-4xl mx-auto">
        <BackButton />
        <ErrorState
          title="Failed to load profile"
          message={getErrorMessage(fetchError, "Could not fetch your profile data.")}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="px-4 md:px-0">
        <BackButton />
        <h3 className="text-xl font-normal tracking-tight text-ink mt-6">Profile Information</h3>
        <p className="caption-mono text-mute mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <Separator className="bg-hairline" />

      <Card className="bg-canvas-card border border-hairline rounded-[8px]">
        <CardHeader className="p-5 border-b border-hairline">
          <CardTitle className="text-base font-normal tracking-tight text-ink">Personal Information</CardTitle>
          <CardDescription className="caption-mono text-mute mt-0.5">Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(handleProfileFormSubmit)}
              className="grid gap-4"
            >
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-16 w-16 border border-hairline bg-canvas-soft">
                  <AvatarImage
                    src={
                      profileForm.watch("profilePicture") ||
                      user?.profilePicture
                    }
                    alt={user?.name}
                  />
                  <AvatarFallback className="text-base font-mono text-body">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full font-mono text-xs h-8"
                    onClick={() =>
                      document.getElementById("avatar-upload")?.click()
                    }
                  >
                    Change Avatar
                  </Button>
                </div>
              </div>
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="max-w-md">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-full bg-canvas-card border-hairline focus-visible:border-canvas-mid text-sm h-9" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-2 max-w-md">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email}
                  disabled
                  className="rounded-full bg-canvas-soft border-hairline text-mute cursor-not-allowed text-sm h-9"
                />
                <p className="caption-mono text-mute text-[11px]">
                  Your email address cannot be changed.
                </p>
              </div>
              <Button
                type="submit"
                className="w-fit rounded-full font-mono text-xs mt-2"
                disabled={isUpdatingProfile || isPending}
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="bg-canvas-card border border-hairline rounded-[8px]">
        <CardHeader className="p-5 border-b border-hairline">
          <CardTitle className="text-base font-normal tracking-tight text-ink">Security</CardTitle>
          <CardDescription className="caption-mono text-mute mt-0.5">Update your password.</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handlePasswordChange)}
              className="grid gap-4"
            >
              {passwordError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{getErrorMessage(passwordError, "Failed to update password")}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-3 max-w-md">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input
                          id="current-password"
                          type="password"
                          placeholder="********"
                          className="rounded-full bg-canvas-card border-hairline focus-visible:border-canvas-mid text-sm h-9"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="********"
                          className="rounded-full bg-canvas-card border-hairline focus-visible:border-canvas-mid text-sm h-9"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          id="confirm-password"
                          placeholder="********"
                          type="password"
                          className="rounded-full bg-canvas-card border-hairline focus-visible:border-canvas-mid text-sm h-9"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="mt-2 w-fit rounded-full font-mono text-xs"
                disabled={isPending || isChangingPassword}
              >
                {isPending || isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
