import type { WorkspaceForm } from "@/components/workspace/create-workspace";
import { postData } from "@/lib/fetch-util";
import {useMutation ,useQuery} from "@tanstack/react-query";
import { fetchData } from '@/lib/fetch-util';

export const useCreateWorkspace = () => {
    return useMutation({
        mutationFn: async (data: WorkspaceForm) => postData("/workspaces", data),
    });
};

export const useGetWorkspaceQuery =() =>{
    return useQuery({
        queryKey : ["workspaces"],
        queryFn: async () => fetchData("/workspaces"),
    })
} 