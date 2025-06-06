import { Dashboard } from "~/features/Dashboard";

import styles from "./Main.module.scss";

const Main = () => {
	return (
		<h1 className={styles.main}>
			<Dashboard />
		</h1>
	);
};

export { Main };
