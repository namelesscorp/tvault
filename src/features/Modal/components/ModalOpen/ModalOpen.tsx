import { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { Fragment } from "react/jsx-runtime";
import { cn, openPathUniversal } from "utils";
import { useAppDispatch } from "features/Store";
import { useTheme } from "features/Theme";
import { UIButton, UIImgIcon, UIInput, UIPasswordField } from "features/UI";
import {
	vaultAddContainer,
	vaultAddRecentWithMountPath,
	vaultSetOpenWizardState,
} from "features/Vault/state/Vault.actions";
import {
	selectVaultOpenWizardState,
	selectVaultRecent,
} from "features/Vault/state/Vault.selectors";
import { icons } from "assets/collections/icons";
import { useDecrypt } from "features/Vault/hooks/useDecrypt";
import { modalSetOpen } from "features/Modal/state/Modal.actions";
import { devError } from "utils";

const ModalOpen = () => {
	const { resolved } = useTheme();
	const { formatMessage } = useIntl();
	const openWizardState = useSelector(selectVaultOpenWizardState);
	const recent = useSelector(selectVaultRecent);
	const dispatch = useAppDispatch();

	const { progress, done, error, run } = useDecrypt();

	const [shares, setShares] = useState<string[]>(
		openWizardState.shares && openWizardState.shares.length >= 2
			? openWizardState.shares
			: ["", ""],
	);

	const [hmac, setHmac] = useState("");
	const [password, setPassword] = useState("");
	const [masterToken, setMasterToken] = useState("");

	useEffect(() => {
		if (shares.length >= 2 && shares[shares.length - 1] !== "") {
			setShares(prev => [...prev, ""]);
		}
	}, [shares]);

	const update = useCallback((idx: number, val: string) => {
		setShares(prev => prev.map((s, i) => (i === idx ? val : s)));
	}, []);

	const handleAddShare = useCallback(() => {
		setShares(prev => [...prev, ""]);
	}, []);

	const handleRemoveShare = useCallback((idx: number) => {
		setShares(prev => {
			if (prev.length <= 2) return prev;
			return prev.filter((_, i) => i !== idx);
		});
	}, []);

	const readyShares = useMemo(
		() => shares.filter(s => s.trim().length > 0),
		[shares],
	);
	const hasEnoughShares = useMemo(
		() => readyShares.length >= 2,
		[readyShares],
	);

	const handleOpen = useCallback(async () => {
		if (openWizardState.tokenType === "none") {
			dispatch(
				vaultSetOpenWizardState({ ...openWizardState, password: password }),
			);
		}
		if (openWizardState.tokenType === "master") {
			dispatch(
				vaultSetOpenWizardState({
					...openWizardState,
					masterToken: masterToken,
				}),
			);
		}
		if (openWizardState.tokenType === "share") {
			dispatch(
				vaultSetOpenWizardState({ ...openWizardState, shares: readyShares }),
			);
		}

		const savedMountPath = recent.find(
			(r: any) => r.path === openWizardState.containerPath,
		)?.lastMountPath;
		const folderPath =
			openWizardState.customMountDir || savedMountPath || openWizardState.mountDir;
		const containerPath = openWizardState.containerPath;

		if (!containerPath || !folderPath) {
			return;
		}

		const isPassword = openWizardState.tokenType === "none";
		const isMaster = openWizardState.tokenType === "master";
		const isShare = openWizardState.tokenType === "share";

		try {
			if (isPassword) {
				await run({
					containerPath,
					folderPath,
					tokenReaderType: "flag",
					tokenFormat: "plaintext",
					tokenFlag: password,
					additionalPassword:
						openWizardState.integrityProvider === "hmac"
							? hmac
							: undefined,
				});
			} else if (isMaster) {
				await run({
					containerPath,
					folderPath,
					tokenReaderType: "flag",
					tokenFormat: "plaintext",
					tokenFlag: masterToken,
					additionalPassword:
						openWizardState.integrityProvider === "hmac"
							? hmac
							: undefined,
				});
			} else if (isShare) {
				const filtered = readyShares.filter(s => s.trim().length > 0);
				await run({
					containerPath,
					folderPath,
					tokenReaderType: "flag",
					tokenFormat: "plaintext",
					tokenFlag: filtered.join("|"),
					additionalPassword:
						openWizardState.integrityProvider === "hmac"
							? hmac
							: undefined,
				});
			}
		} catch (err) {
			devError(err);
		}
	}, [dispatch, hmac, masterToken, openWizardState, password, readyShares, recent, run]);

	useEffect(() => {
		if (done && !error) {
			const savedMountPath = recent.find(
				(r: any) => r.path === openWizardState.containerPath,
			)?.lastMountPath;
			const folderPath =
				openWizardState.customMountDir || savedMountPath || openWizardState.mountDir;
			const containerPath = openWizardState.containerPath;

			if (containerPath && folderPath) {
				dispatch(
					vaultAddContainer({
						containerPath,
						mountDir: folderPath,
					}),
				);
				dispatch(
					vaultAddRecentWithMountPath({ path: containerPath, mountPath: folderPath }),
				);
				dispatch(modalSetOpen(false));
				(async () => {
					try {
						await openPathUniversal(folderPath);
					} catch {}
				})();
			}
		}
	}, [done, error, dispatch, openWizardState, recent]);

	return (
		<div>
			<div
				className={cn(
					"w-full flex flex-col gap-[10px] border rounded-[10px] px-[15px] py-[10px]",
					{
						"bg-white/3": resolved === "dark",
						"bg-white/80": resolved === "light",
						"border-[#313A4F]": resolved === "dark",
						"border-black/70": resolved === "light",
					},
				)}>
				<div className="flex items-center gap-[10px]">
					<UIImgIcon
						icon={icons.key_2}
						width={28}
						height={28}
						color={resolved === "dark" ? "#49DE80" : "#2E9253"}
					/>
					<p
						className={cn(
							"text-[16px] font-semibold tracking-[-0.05em] ",
							{
								"text-white": resolved === "dark",
								"text-black/80": resolved === "light",
							},
						)}>
						{formatMessage({
							id: `modal.open.info.title.${openWizardState.tokenType}`,
						})}
					</p>
				</div>
				<p
					className={cn(
						"text-[16px] font-medium tracking-[-0.05em] ",
						{
							"text-white/70": resolved === "dark",
							"text-black/70": resolved === "light",
						},
					)}>
					{formatMessage({
						id: `modal.open.info.description.${openWizardState.tokenType}`,
					})}
				</p>
			</div>
			<div className="mt-[28px]">
				<div className="flex items-center justify-between">
					<p
						className={cn(
							"text-[20px] font-semibold leading-[120%] tracking-[-0.05em]",
							{
								"text-white": resolved === "dark",
								"text-black/80": resolved === "light",
							},
						)}>
						{formatMessage({
							id: `modal.open.title.${openWizardState.tokenType}`,
						})}
					</p>
				</div>
				<div className="flex flex-col gap-[20px] mt-[20px]">
					{openWizardState.tokenType === "none" && (
						<UIInput
							type="text"
							placeholder={formatMessage({
								id: "modal.open.placeholder.none",
							})}
							value={password}
							onChange={e => setPassword(e.target.value)}
						/>
					)}
					{openWizardState.tokenType === "master" && (
						<UIInput
							type="text"
							placeholder={formatMessage({
								id: "modal.open.placeholder.master",
							})}
							value={masterToken}
							onChange={e => setMasterToken(e.target.value)}
						/>
					)}
					{openWizardState.tokenType === "share" && (
						<Fragment>
							{shares.map((s, idx) => (
								<UIInput
									key={idx}
									placeholder={formatMessage(
										{ id: "modal.open.placeholder.share" },
										{ index: idx + 1 },
									)}
									value={s}
									onChange={e => update(idx, e.target.value)}
									style={{ maxWidth: "100%" }}
								/>
							))}
						</Fragment>
					)}
				</div>
				{openWizardState.integrityProvider === "hmac" && (
					<div className="flex flex-col gap-[15px] mt-[20px]">
					<p
						className={cn(
							"text-[20px] font-semibold leading-[120%] tracking-[-0.05em]",
							{
								"text-white": resolved === "dark",
								"text-black/80": resolved === "light",
							},
						)}>
						{formatMessage({
							id: `modal.open.title.hmac`,
						})}
					</p>
					<UIPasswordField value={hmac} onChange={e => setHmac(e.target.value)} placeholder={formatMessage({ id: "modal.open.placeholder.hmac" })} />
				</div>
				)}
				<div className="flex flex-col gap-[20px] mt-[20px]">
					<UIButton
						text={formatMessage({ id: "common.open" })}
						icon={icons.unlock}
						color="#ffffff"
						noTheme
						center
						onClick={handleOpen}
						disabled={progress > 0 && !done}
						style={{
							backgroundColor: resolved === "dark" ? "#2463EB" : "#3A73ED",
							color: "#ffffff",
						}}
					/>
					<p className={cn("text-[16px] font-medium tracking-[-0.05em] text-center", {
						"text-black/70": resolved === "light",
						"text-white/70": resolved === "dark",
					})}>
						{formatMessage({ id: "modal.open.bottom.text" })}
					</p>
				</div>
			</div>
		</div>
	);
};

export { ModalOpen };
