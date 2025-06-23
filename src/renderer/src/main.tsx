import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const rootDom = document.getElementById("root");
if (!rootDom) throw new Error("root element not found");

createRoot(rootDom).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
