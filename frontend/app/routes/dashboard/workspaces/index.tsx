
import { Loader } from '@/components/loader';
import { CreateWorkspace } from '@/components/workspace/create-workspace';
import { useGetWorkspaceQuery } from '@/hooks/use-worspace';
import type { Workspace } from '@/types';
import { useQueries, useQuery } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import React, { useState } from 'react'


const Workspaces = () =>{
    const [isCreatingWorkspace , setIsCreatingWorkspace] = useState(false);
    const {data : workspaces , isLoading} =  useGetWorkspaceQuery() as{
        data: Workspace[];
        isLoading : boolean;
    }

        if(isLoading){
            return <Loader/>;
        }
    
    return (
    <>
        <div className='space-y-8'>
            <div className='flex items-center justify-between'>
                <h2 className='text-xl md:text-3xl font-bold'>Workspaces</h2>
                <button onClick={() =>setIsCreatingWorkspace(true)}>
                    <PlusCircle className='size-4 mr-2'/>
                    New workspace
                </button>
            </div>
        </div>

        <CreateWorkspace
        isCreatingWorkspace ={isCreatingWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
        />

    </>
    )
}
export default Workspaces  

