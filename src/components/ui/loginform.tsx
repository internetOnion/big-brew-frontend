import { useState } from "react";
import { Delete } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginForm() {
    const [pin, setPin] = useState("");

    const handleNumber = (num: string) => {
        if (pin.length < 6) {
            setPin((prev) => prev + num);
        }
    };

    const handleDelete = () => {
        setPin((prev) => prev.slice(0, -1));
    };

    const handleLogin = () => {
        if (pin.length === 6) {
            if (pin === "123456") {
                alert("Login Successful");
            } else {
                alert("Incorrect PIN");
                setPin("");
            }
        }
    };

    const keypad = [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "",
        "0",
        "del",
    ];

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
            <Card className="w-[360px] rounded-[2rem] border-0 bg-white shadow-xl">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-semibold">
                        Enter your PIN
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        6-digit secure access
                    </p>
                </CardHeader>

                <CardContent className="space-y-8">
                    {/* iPhone Style PIN Dots */}
                    <div className="flex justify-center gap-4">
                        {[...Array(6)].map((_, index) => (
                            <div
                                key={index}
                                className={`h-4 w-4 rounded-full border-2 transition-all duration-200 ${
                                    index < pin.length
                                        ? "bg-black border-black scale-110"
                                        : "border-zinc-300 bg-transparent"
                                }`}
                            />
                        ))}
                    </div>

                    {/* Number Pad */}
                    <div className="grid grid-cols-3 gap-3">
                        {keypad.map((key, index) => {
                            if (key === "") {
                                return <div key={index} />;
                            }

                            if (key === "del") {
                                return (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        className="h-16 rounded-2xl text-lg"
                                        onClick={handleDelete}
                                    >
                                        <Delete className="h-5 w-5" />
                                    </Button>
                                );
                            }

                            return (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className="h-16 rounded-2xl text-2xl font-medium"
                                    onClick={() => handleNumber(key)}
                                >
                                    {key}
                                </Button>
                            );
                        })}
                    </div>

                    <Button
                        className="h-14 w-full rounded-2xl"
                        onClick={handleLogin}
                        disabled={pin.length !== 6}
                    >
                        Login
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
