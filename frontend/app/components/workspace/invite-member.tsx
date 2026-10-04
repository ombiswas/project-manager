import type { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { inviteMemberSchema } from "@/lib/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Check, Copy, Mail } from "lucide-react";
import { Label } from "../ui/label";
import { useInviteMemberMutation } from "@/hooks/use-workspace";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/fetch-util";

interface InviteMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}
export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

const ROLES = ["admin", "member", "viewer"] as const;

export const InviteMemberDialog = ({
  isOpen,
  onOpenChange,
  workspaceId,
}: InviteMemberDialogProps) => {
  const [inviteTab, setInviteTab] = useState("email");
  const [linkCopied, setLinkCopied] = useState(false);

  const form = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const { mutate, isPending } = useInviteMemberMutation();

  const onSubmit = async (data: InviteMemberFormData) => {
    if (!workspaceId) return;

    mutate(
      {
        workspaceId,
        ...data,
      },
      {
        onSuccess: () => {
          toast.success("Invite sent successfully");
          form.reset();
          setInviteTab("email");
          onOpenChange(false);
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error, "Failed to send invite"));
        },
      }
    );
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/workspace-invite/${workspaceId}`
    );
    setLinkCopied(true);

    setTimeout(() => {
      setLinkCopied(false);
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#141517] border border-[#212327] rounded-[8px] text-white">
        <DialogHeader className="pb-2">
          <p className="caption-mono text-[10px] text-[#7d8187]">MEMBERSHIP</p>
          <DialogTitle className="text-xl font-normal tracking-[-0.5px] text-white">
            Invite to Workspace
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="email"
          value={inviteTab}
          onValueChange={setInviteTab}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="email" disabled={isPending}>
              Send Email
            </TabsTrigger>
            <TabsTrigger value="link" disabled={isPending}>
              Share Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <div className="grid gap-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
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
                            {...field}
                            placeholder="colleague@company.com"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                          Assign Role
                        </FormLabel>
                        <FormControl>
                          <div className="flex gap-2 flex-wrap pt-1">
                            {ROLES.map((role) => (
                              <button
                                key={role}
                                type="button"
                                onClick={() => field.onChange(role)}
                                className={cn(
                                  "px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-[1px] border transition-colors",
                                  field.value === role
                                    ? "bg-white text-[#0a0a0a] border-white font-normal"
                                    : "bg-[#1a1c20] text-[#7d8187] border-[#212327] hover:border-[#363a3f] hover:text-white"
                                )}
                              >
                                {role}
                              </button>
                            ))}
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button className="mt-6 w-full" disabled={isPending}>
                    <Mail className="w-4 h-4 mr-2" />
                    {isPending ? "Sending..." : "Send Invitation"}
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent>

          <TabsContent value="link">
            <div className="space-y-4 pt-1">
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                  Invite Link
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    readOnly
                    value={`${window.location.origin}/workspace-invite/${workspaceId}`}
                    className="font-mono text-xs"
                  />
                  <Button
                    onClick={handleCopyInviteLink}
                    disabled={isPending}
                    variant="outline"
                    className="shrink-0"
                  >
                    {linkCopied ? (
                      <>
                        <Check className="mr-1.5 h-3.5 w-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-[#7d8187]">
                Anyone with this unique link can join this workspace as a
                member.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
