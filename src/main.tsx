import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import DrawerVisibilityProvider from "./store/context/DrawerVisibilityContext.tsx";
import { APIProvider } from "@vis.gl/react-google-maps";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_API_KEY || ""}>
                <DrawerVisibilityProvider>
                    <App />
                </DrawerVisibilityProvider>
            </APIProvider>
        </BrowserRouter>
    </StrictMode>
);
