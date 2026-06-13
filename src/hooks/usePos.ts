import { useContext } from "react";
import { POSContext } from "@/contexts/POSContext";

const usePOS = () => {
    const ctx = useContext(POSContext);
    if (!ctx) throw new Error("usePOS must be used within POSProvider");
    return ctx;
};

export default usePOS;
export { usePOS };
