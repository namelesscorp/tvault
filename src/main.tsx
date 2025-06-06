import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import { App } from "features/App";
import { environmentEnv, environmentVersion } from "features/Environment";
import { store } from "features/Store";

import "./index.css";

console.info(
	`%ctvault-client v${environmentVersion} ${environmentEnv.toUpperCase()} (built on ${BUILD_DATE})`,
	"background-color: #2e7d32; border-radius: 3px; color: #e8f5e9; padding: 2px 4px",
);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Provider store={store}>
			<Theme accentColor="indigo" grayColor="sand" radius="large">
				<App />
			</Theme>
		</Provider>
	</StrictMode>,
);
