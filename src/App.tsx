import { useState } from "react";
import api from "./api/api.ts";
import { ENDPOINTS } from "./api/endpoints.ts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/ui/loginform";
import { Routes, Route, Link } from "react-router-dom";

const App = () => {
    const [status, setStatus] = useState("Unknown Status");
    const [setting, setSetting] = useState({});

    const getStatus = async () => {
        try {
            const { data } = await api.get(ENDPOINTS.HEALTH);
            setStatus(data.status);
        } catch (error) {
            console.error("Error fetching status:", error);
        }
    };

    const getSetting = async () => {
        try {
            const { data } = await api.get(ENDPOINTS.SETTINGS);
            setSetting(data);
        } catch (error) {
            console.error("Error fetching setting:", error);
        }
    };

    return (
        <div className="container mx-auto p-4 flex flex-col gap-6">
            {/* Navigation Menu */}
            <nav className="flex gap-4 p-2 bg-slate-100 rounded-md">
                <Link
                    to="/"
                    className="text-blue-600 hover:underline font-medium"
                >
                    Dashboard
                </Link>
                <Link
                    to="/settings"
                    className="text-blue-600 hover:underline font-medium"
                >
                    Settings
                </Link>
                <Link
                    to="/login"
                    className="text-blue-600 hover:underline font-medium"
                >
                    Login
                </Link>
            </nav>

            {/* Route Definitions */}
            <Routes>
                {/* Home/Dashboard Page */}
                <Route
                    path="/"
                    element={
                        <Card>
                            <CardHeader>
                                <CardTitle>Health Status</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <p className="text-lg">{status}</p>
                                <Button onClick={getStatus}>Get Status</Button>
                            </CardContent>
                        </Card>
                    }
                />

                {/* Settings Page */}
                <Route
                    path="/settings"
                    element={
                        <Card>
                            <CardHeader>
                                <CardTitle>Setting</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <code className="text-sm">
                                    {JSON.stringify(setting, null, 2)}
                                </code>
                                <Button onClick={getSetting}>
                                    Get Setting
                                </Button>
                            </CardContent>
                        </Card>
                    }
                />

                {/* Login Page */}
                <Route path="/login" element={<LoginForm />} />
            </Routes>
        </div>
    );
};

export default App;
