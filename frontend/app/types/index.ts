export interface User  {
    _id : string;
    email : string;
    name : string;
    createdAt : Date;
    isEmailVerified : boolean;
    updatedAt : Date;
    profilePicture? : string;
}

export interface Workspace {
    _id: string;
    name: string;
    description?: string;
    owener: User | string;
    color: string;
    members: {
        user: User;
        role: 'owner' | 'admin' | 'member' | 'viewer';
        joinedAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}