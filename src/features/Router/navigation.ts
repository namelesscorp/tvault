import type { NavigateFunction, To } from "react-router-dom";

// Bridge that lets code rendered outside the router context (e.g. the global
// Modal, which is a sibling of <RouterProvider>) trigger navigation. The router
// registers its navigate function via setAppNavigate from inside the tree.
let navigateRef: NavigateFunction | null = null;

export const setAppNavigate = (fn: NavigateFunction | null) => {
	navigateRef = fn;
};

export const appNavigate = (to: To) => {
	navigateRef?.(to);
};
