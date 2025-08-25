import { invoke } from "@tauri-apps/api/core";
import { join } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";
import { RouteTypes } from "interfaces";
import { useAppDispatch } from "features/Store";
import { UIButton, UIInput, UISectionHeading } from "features/UI";
import { icons } from "~/assets/collections/icons";
import { vaultSetWizardState } from "../../state/Vault.actions";
import {
	selectVaultContainersPath,
	selectVaultWizardState,
} from "../../state/Vault.selectors";

const schema = z.object({
	name: z.string().min(1, "vault.basic.error.name"),
	outputPath: z.string().min(1, "vault.basic.error.outputPath"),
	inputPath: z.string().min(1, "vault.basic.error.inputPath"),
});

const VaultBasicStep = () => {
	const { formatMessage } = useIntl();
	const wizard = useSelector(selectVaultWizardState);
	const containersPath = useSelector(selectVaultContainersPath);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const [name, setName] = useState(wizard.name);
	const [outputPath, setOutputPath] = useState(wizard.outputPath);
	const [inputPath, setInputPath] = useState(wizard.inputPath);
	const [busy, setBusy] = useState(false);
	const [pathManuallyChanged, setPathManuallyChanged] = useState(false);

	useEffect(() => {
		setPathManuallyChanged(false);
	}, [wizard.name, wizard.outputPath, wizard.inputPath]);

	useEffect(() => {
		if (containersPath && !pathManuallyChanged && name.trim()) {
			const safeName = name.replace(/[<>:"/\\|?*]/g, "_");
			const newPath = `${containersPath}/${safeName}.tvlt`;
			setOutputPath(newPath);
		}
	}, [name, containersPath, pathManuallyChanged]);

	const pickSaveDir = useCallback(async () => {
		const dir = await open({ directory: true, multiple: false });
		if (typeof dir !== "string") return;
		const safe = (name || "vault").replace(/[<>:"/\\|?*]/g, "_");
		setOutputPath(await join(dir, `${safe}.tvlt`));
		setPathManuallyChanged(true);
	}, [name]);

	const pickSourceDir = useCallback(async () => {
		const dir = await open({ directory: true, multiple: false });
		if (typeof dir !== "string") return;
		setInputPath(dir);
	}, []);

	const next = useCallback(async () => {
		const parsed = schema.safeParse({ name, outputPath, inputPath });
		if (!parsed.success) {
			toast.error(formatMessage({ id: parsed.error.issues[0].message }));
			return;
		}
		setBusy(true);
		try {
			await invoke("check_container_path", { path: outputPath });
			dispatch(
				vaultSetWizardState({ ...wizard, name, outputPath, inputPath }),
			);
			navigate(RouteTypes.VaultCreateComment);
		} catch (e: unknown) {
			toast.error(formatMessage({ id: String(e) }));
		} finally {
			setBusy(false);
		}
	}, [name, outputPath, inputPath, dispatch, wizard, navigate]);

	return (
		<div>
			<UISectionHeading
				icon={icons.lock}
				text={formatMessage({ id: "title.create" })}
			/>
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				{formatMessage({ id: "vault.basic.step" })}
			</p>
			<div className="flex flex-col gap-[20px] p-[20px] bg-white/5 rounded-[10px] mt-[20px]">
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						{formatMessage({ id: "vault.basic.name" })}:
					</p>
					<UIInput
						value={name}
						onChange={e => setName(e.target.value)}
						placeholder={formatMessage({
							id: "common.namePlaceholder",
						})}
						style={{ maxWidth: "50%" }}
					/>
				</div>
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						{formatMessage({ id: "vault.basic.inputPath" })}:
					</p>
					<div className="flex items-center gap-[10px]">
						<UIInput
							value={inputPath}
							placeholder={formatMessage({
								id: "common.pathPlaceholder",
							})}
							autoComplete="off"
							style={{ maxWidth: "50%" }}
							readOnly
						/>
						<UIButton
							icon={icons.folder}
							text={formatMessage({ id: "common.browse" })}
							onClick={pickSourceDir}
							style={{ width: "fit-content" }}
						/>
					</div>
				</div>
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						{formatMessage({ id: "vault.basic.outputPath" })}:
					</p>
					<div className="flex items-center gap-[10px]">
						<UIInput
							value={outputPath}
							placeholder={formatMessage({
								id: "common.pathPlaceholder",
							})}
							style={{ maxWidth: "50%" }}
							onChange={e => {
								setOutputPath(e.target.value);
								setPathManuallyChanged(true);
							}}
						/>
						<UIButton
							icon={icons.folder}
							text={formatMessage({ id: "common.browse" })}
							onClick={pickSaveDir}
							style={{ width: "fit-content" }}
						/>
					</div>
				</div>
			</div>
			<div className="flex items-center gap-[10px] mt-[20px]">
				<UIButton
					icon={icons.back}
					text={formatMessage({ id: "common.back" })}
					onClick={() => navigate(-1)}
					style={{ width: "fit-content" }}
				/>
				<UIButton
					icon={icons.arrow_right}
					text={formatMessage({ id: "common.next" })}
					onClick={next}
					disabled={
						busy ||
						!name.trim() ||
						!inputPath.trim() ||
						!outputPath.trim()
					}
					style={{ width: "fit-content" }}
				/>
			</div>
		</div>
	);
};

export { VaultBasicStep };
