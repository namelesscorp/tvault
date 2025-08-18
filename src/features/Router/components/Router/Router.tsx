import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ROUTER_BASE_PATH, routes } from "../../Router.model";

const Router: React.FC = () => {
	const router = createBrowserRouter(routes, { basename: ROUTER_BASE_PATH });

	return <RouterProvider router={router} />;
};

export { Router };
