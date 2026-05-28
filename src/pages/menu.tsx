import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function MenuPage() {
    const navigate = useNavigate();

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
                    <Button onClick={() => navigate("/pin")}>
                        Lock System
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
