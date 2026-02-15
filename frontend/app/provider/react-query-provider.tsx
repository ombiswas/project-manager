import {QueryClient ,QueryClientProvider} from "@tanstack/react-query"
export const queryClient = new QueryClient()
import {Toaster} from "sonner"
import { AuthProvider } from "./auth-context"


const ReactQueryProvider = ({children} : {children : React.ReactNode}) =>{
    return(
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                {children}
                <Toaster position="top-center" richColors/>
            </AuthProvider>
            
        </QueryClientProvider>
    )
}
export default ReactQueryProvider