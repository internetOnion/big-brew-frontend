import { useState } from "react";
import api from "./api/api.ts";

const App = () => {
    const [status, setStatus] = useState("Unknown Status");
    const [setting, setSetting] = useState({});

    const getStatus = async () => {
        try {
            const { data } = await api.get("/health");
            setStatus(data.status);
        } catch (error) {
            console.error("Error fetching status:", error);
        }
    };

    const getSetting = async () => {
        try {
            const { data } = await api.get("/settings");
            setSetting(data);
        } catch (error) {
            console.error("Error fetching setting:", error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Health Status</h2>
            <p className="text-lg mb-4">{status}</p>
            <button
                onClick={getStatus}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
            >
                Get Status
            </button>

            <h2 className="text-xl font-bold mb-4">Setting</h2>
            <code className="text-lg">{JSON.stringify(setting, null, 2)}</code>
            <br className="mb-4" />

            <button
                onClick={getSetting}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
            >
                Get Setting
            </button>
        </div>
    );
};

export default App;
