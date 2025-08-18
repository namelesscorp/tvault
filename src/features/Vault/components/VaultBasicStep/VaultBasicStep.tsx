import { invoke } from "@tauri-apps/api/core";
import { join } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";
import { RouteTypes } from "interfaces";
import { useAppDispatch } from "features/Store";
import { UIButton, UIInput, UISectionHeading } from "features/UI";
import { icons } from "~/assets/collections/icons";
import { vaultSetWizardState } from "../../state/Vault.actions";
import { selectVaultWizardState } from "../../state/Vault.selectors";

const schema = z.object({
	name: z.string().min(1, "Enter name"),
	outputPath: z.string().min(1, "Choose path to save"),
	inputPath: z.string().min(1, "Choose path to encrypt"),
});

const VaultBasicStep = () => {
	const wizard = useSelector(selectVaultWizardState);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const [name, setName] = useState(wizard.name);
	const [outputPath, setOutputPath] = useState(wizard.outputPath);
	const [inputPath, setInputPath] = useState(wizard.inputPath);
	const [busy, setBusy] = useState(false);

	const pickSaveDir = useCallback(async () => {
		const dir = await open({ directory: true, multiple: false });
		if (typeof dir !== "string") return;
		const safe = (name || "vault").replace(/[^a-z0-9_-]/gi, "_");
		setOutputPath(await join(dir, `${safe}.tvlt`));
	}, [name]);

	const pickSourceDir = useCallback(async () => {
		const dir = await open({ directory: true, multiple: false });
		if (typeof dir !== "string") return;
		setInputPath(dir);
	}, []);

	const next = useCallback(async () => {
		const parsed = schema.safeParse({ name, outputPath, inputPath });
		if (!parsed.success) {
			toast.error(parsed.error.issues[0].message);
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
			toast.error(String(e));
		} finally {
			setBusy(false);
		}
	}, [name, outputPath, inputPath, dispatch, wizard, navigate]);

	return (
		<div>
			<UISectionHeading icon={icons.lock} text={"Create"} />
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				Step 1 / 6 — Name and Paths
			</p>
			<div className="flex flex-col gap-[20px] p-[20px] bg-white/5 rounded-[10px] mt-[20px]">
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						Container name:
					</p>
					<UIInput
						value={name}
						onChange={e => setName(e.target.value)}
						placeholder="Enter name"
						style={{ maxWidth: "50%" }}
					/>
				</div>
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						Path to folder for encrypt:
					</p>
					<div className="flex items-center gap-[10px]">
						<UIInput
							value={inputPath}
							placeholder="Choose"
							style={{ maxWidth: "50%" }}
							readOnly
						/>
						<UIButton
							icon={icons.folder}
							text="Browse"
							onClick={pickSourceDir}
							style={{ width: "fit-content" }}
						/>
					</div>
				</div>
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						Path to save container:
					</p>
					<div className="flex items-center gap-[10px]">
						<UIInput
							value={outputPath}
							placeholder="Choose"
							style={{ maxWidth: "50%" }}
							onChange={e => setOutputPath(e.target.value)}
						/>
						<UIButton
							icon={icons.folder}
							text="Browse"
							onClick={pickSaveDir}
							style={{ width: "fit-content" }}
						/>
					</div>
				</div>
			</div>
			<div className="flex items-center gap-[10px] mt-[20px]">
				<UIButton
					icon={icons.back}
					text="Back"
					onClick={() => navigate(-1)}
					style={{ width: "fit-content" }}
				/>
				<UIButton
					icon={icons.arrow_right}
					text="Next"
					onClick={next}
					disabled={busy}
					style={{ width: "fit-content" }}
				/>
			</div>
		</div>
	);
};

export { VaultBasicStep };
