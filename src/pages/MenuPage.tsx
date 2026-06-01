import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";

const MenuPage = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLock = () => {
        logout();
        navigate(ROUTES.PIN);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Menu / POS</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                        Welcome to the POS system! You have successfully
                        unlocked with your PIN.
                    </p>
                    <Button onClick={handleLock}>Lock System</Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default MenuPage;
