import { ApolloProvider } from "@apollo/client/react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import client from "./api/apolloClient.ts";
import App from "./App.tsx";
import "./index.css";
import DrawerVisibilityProvider from "./store/context/DrawerVisibilityContext.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ApolloProvider client={client}>
            <BrowserRouter>
                <APIProvider apiKey={import.meta.env.VITE_GOOGLE_API_KEY || ""}>
                    <DrawerVisibilityProvider>
                        <App />
                    </DrawerVisibilityProvider>
                </APIProvider>
            </BrowserRouter>
        </ApolloProvider>
    </StrictMode>
);
