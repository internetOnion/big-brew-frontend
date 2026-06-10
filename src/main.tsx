import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";

import "@fontsource-variable/bricolage-grotesque/wght.css";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <MemoryRouter initialEntries={["/login"]}>
            <App />
        </MemoryRouter>
    </StrictMode>,
);
