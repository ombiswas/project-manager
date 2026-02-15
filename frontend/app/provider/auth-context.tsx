import type {User } from "@/types"
import { create } from "domain";

import { Children, createContext, useState } from "react"

interface AuthContextType{
    user : User | null
    isAuthenticated : boolean;
    isLoading : boolean;
    login : (email : string , password : string) => Promise<void>;
    logout : () => Promise<void>

}
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider  = ({children} : {children : React.ReactNode}) =>{
    const [user , setUser] = useState<User | null>(null)
    const [isAuthenticated , setIsAuthenticated] = useState(false)
    const [isLoading , setIsLoading] = useState(true)

    return
}