import { useState } from "react";

import { EntropyCanvas } from "features/EntropyCanvas";

import { VaultBasicInfo } from "../../Vault.model";
import { VaultBasicStep } from "../VaultBasicStep";

const VaultCreate = () => {
	const [stage, setStage] = useState<"entropy" | "basic" | "next">("entropy");
	const [basicInfo, setBasicInfo] = useState<VaultBasicInfo>();

	if (stage === "entropy")
		return (
			<section className="flex flex-col items-center mt-8">
				<h1 className="text-lg font-semibold mb-2">
					Дайте нам немного случайности
				</h1>
				<EntropyCanvas onReady={() => setStage("basic")} />
			</section>
		);

	if (stage === "basic")
		return (
			<section className="flex flex-col items-center mt-8">
				<h1 className="text-lg font-semibold mb-4">
					Шаг 1 / 4 — имя и путь
				</h1>
				<VaultBasicStep
					onNext={data => {
						setBasicInfo(data);
						setStage("next"); // здесь позже будет k/n-step
					}}
				/>
			</section>
		);

	/* заглушка следующих шагов */
	return <pre className="mt-8">{JSON.stringify(basicInfo, null, 2)}</pre>;
};

export { VaultCreate };
