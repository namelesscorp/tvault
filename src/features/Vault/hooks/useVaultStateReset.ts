import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { vaultClearResealData } from "../state/Vault.actions";

export const useVaultStateReset = () => {
	const dispatch = useDispatch();

	useEffect(() => {
		const handleBeforeUnload = () => {
			dispatch(vaultClearResealData());
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [dispatch]);
};
