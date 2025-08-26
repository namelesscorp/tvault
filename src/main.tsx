import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { App } from "features/App";
import { environmentEnv, environmentVersion } from "features/Environment";
import { store } from "features/Store";
import "assets/fonts/Inter/inter.css";
import "./index.css";

console.info(
	`%ctvault-single v${environmentVersion} ${environmentEnv.toUpperCase()} (built on ${BUILD_DATE})`,
	"background-color: #2e7d32; border-radius: 3px; color: #e8f5e9; padding: 2px 4px",
);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Provider store={store}>
			<App />
			<ToastContainer theme="dark" />
		</Provider>
	</StrictMode>,
);
