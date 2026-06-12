import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "@/contexts/AuthContext";

const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default useAuth;
export { useAuth };
