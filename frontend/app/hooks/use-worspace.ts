import type { WorkspaceForm } from "@/components/workspace/create-workspace";
import { postData } from "@/lib/fetch-util";
import {useMutation} from "@tanstack/react-query";

export const useCreateWorkspace = () => {
    return useMutation({
        mutationFn: async (data: WorkspaceForm) => postData("/workspaces", data),
    });
};