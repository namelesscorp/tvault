import { Action } from "redux";

export interface AppAction extends Action {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	payload: any;
}

function createAction<A extends AppAction>(type: A["type"]) {
	return (payload: A["payload"]): A =>
		({
			type,
			payload,
		}) as A;
}

export { createAction };
