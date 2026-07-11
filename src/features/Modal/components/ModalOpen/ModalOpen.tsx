import { open } from "@tauri-apps/plugin-dialog";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Fragment } from "react/jsx-runtime";
import { cn, getMountPathWithFallback, openPathUniversal } from "utils";
import { devError } from "utils";
import { modalSetOpen } from "features/Modal/state/Modal.actions";
import { useAppDispatch } from "features/Store";
import { useTheme } from "features/Theme";
import { UIButton, UIImgIcon, UIInput, UIPasswordField } from "features/UI";
import { useDecrypt } from "features/Vault/hooks/useDecrypt";
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

const MIN_SHARES = 2;

type TokenButtonVariant = "plain" | "green" | "red";

const TokenIconButton = ({
	icon,
	variant,
	onClick,
	disabled = false,
}: {
	icon: string;
	variant: TokenButtonVariant;
	onClick: () => void;
	disabled?: boolean;
}) => {
	const { resolved } = useTheme();
	const dark = resolved === "dark";

	const background =
		variant === "green"
			? dark
				? "#264B4F"
				: "#DAF4E0"
			: variant === "red"
				? dark
					? "#4A2E3F"
					: "#FEDBDA"
				: "transparent";

	const color =
		variant === "green"
			? dark
				? "#49DE80"
				: "#2E9253"
			: variant === "red"
				? dark
					? "#F87171"
					: "#E65757"
				: dark
					? "#9AC7FF"
					: "#1353A3";

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			style={{ backgroundColor: background }}
			className={cn(
				"flex items-center justify-center w-[40px] h-[40px] rounded-[10px] transition-all duration-300 cursor-pointer",
				{
					"opacity-50 cursor-default": disabled,
					"hover:opacity-80": !disabled,
				},
			)}>
			<UIImgIcon icon={icon} width={20} height={20} color={color} />
		</button>
	);
};

const ModalOpen = () => {
	const { resolved } = useTheme();
	const { formatMessage } = useIntl();
	const openWizardState = useSelector(selectVaultOpenWizardState);
	const recent = useSelector(selectVaultRecent);
	const dispatch = useAppDispatch();

	const { progress, done, error, run } = useDecrypt();

	const [shares, setShares] = useState<string[]>(
		openWizardState.shares && openWizardState.shares.length >= MIN_SHARES
			? openWizardState.shares
			: ["", "", ""],
	);
	const [tokenJsonPath, setTokenJsonPath] = useState<string>(
		openWizardState.tokenJsonPath ?? "",
	);

	const [hmac, setHmac] = useState("");
	const [password, setPassword] = useState("");
	const [masterToken, setMasterToken] = useState("");
	const [usedFolderPath, setUsedFolderPath] = useState("");

	const update = useCallback((idx: number, val: string) => {
		setShares(prev => prev.map((s, i) => (i === idx ? val : s)));
	}, []);

	const handleAddShare = useCallback(() => {
		setShares(prev => [...prev, ""]);
	}, []);

	const handleRemoveShare = useCallback(() => {
		setShares(prev =>
			prev.length <= MIN_SHARES ? prev : prev.slice(0, -1),
		);
	}, []);

	const handlePickTokenFile = useCallback(async () => {
		const file = await open({
			multiple: false,
			filters: [{ name: "JSON", extensions: ["json"] }],
		});
		if (typeof file === "string") setTokenJsonPath(file);
	}, []);

	const handleClearTokenFile = useCallback(() => setTokenJsonPath(""), []);

	const readyShares = useMemo(
		() => shares.filter(s => s.trim().length > 0),
		[shares],
	);
	const hasEnoughShares = useMemo(
		() => readyShares.length >= MIN_SHARES,
		[readyShares],
	);

	const isPassword = openWizardState.tokenType === "none";
	const isMaster = openWizardState.tokenType === "master";
	const isShare = openWizardState.tokenType === "share";

	const canUnlock = isShare
		? !!tokenJsonPath || hasEnoughShares
		: isMaster
			? masterToken.trim().length > 0
			: password.trim().length > 0;

	/**
	 * The wizard may arrive here without a mount dir (e.g. unlocking a card that
	 * was never opened before), so fall back to generating one.
	 */
	const resolveFolderPath = useCallback(async () => {
		const savedMountPath = recent.find(
			r => r.path === openWizardState.containerPath,
		)?.lastMountPath;
		const known =
			openWizardState.customMountDir ||
			savedMountPath ||
			openWizardState.mountDir;

		if (known) return known;

		return getMountPathWithFallback(
			savedMountPath,
			openWizardState.containerPath,
		);
	}, [openWizardState, recent]);

	const handleOpen = useCallback(async () => {
		if (isPassword) {
			dispatch(
				vaultSetOpenWizardState({
					...openWizardState,
					password: password,
				}),
			);
		}
		if (isMaster) {
			dispatch(
				vaultSetOpenWizardState({
					...openWizardState,
					masterToken: masterToken,
				}),
			);
		}
		if (isShare) {
			dispatch(
				vaultSetOpenWizardState({
					...openWizardState,
					shares: readyShares,
					tokenJsonPath: tokenJsonPath || undefined,
				}),
			);
		}

		const containerPath = openWizardState.containerPath;
		if (!containerPath) {
			toast.error(formatMessage({ id: "modal.open.error.noPath" }));
			return;
		}

		const folderPath = await resolveFolderPath();
		setUsedFolderPath(folderPath);

		const additionalPassword =
			openWizardState.integrityProvider === "hmac" ? hmac : undefined;

		try {
			if (isShare && tokenJsonPath) {
				await run({
					containerPath,
					folderPath,
					tokenReaderType: "file",
					tokenFormat: "json",
					tokenPath: tokenJsonPath,
					additionalPassword,
				});
				return;
			}

			const tokenFlag = isPassword
				? password
				: isMaster
					? masterToken
					: readyShares.join("|");

			await run({
				containerPath,
				folderPath,
				tokenReaderType: "flag",
				tokenFormat: "plaintext",
				tokenFlag,
				additionalPassword,
			});
		} catch (err) {
			devError(err);
		}
	}, [
		dispatch,
		formatMessage,
		hmac,
		isMaster,
		isPassword,
		isShare,
		masterToken,
		openWizardState,
		password,
		readyShares,
		resolveFolderPath,
		run,
		tokenJsonPath,
	]);

	useEffect(() => {
		if (!done || error) return;

		const containerPath = openWizardState.containerPath;
		if (!containerPath || !usedFolderPath) return;

		dispatch(
			vaultAddContainer({
				containerPath,
				mountDir: usedFolderPath,
			}),
		);
		dispatch(
			vaultAddRecentWithMountPath({
				path: containerPath,
				mountPath: usedFolderPath,
			}),
		);
		dispatch(modalSetOpen(false));
		(async () => {
			try {
				await openPathUniversal(usedFolderPath);
			} catch {}
		})();
	}, [done, error, dispatch, openWizardState, usedFolderPath]);

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
				<div className="flex items-center justify-between min-h-[40px]">
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
					{isShare && (
						<div className="flex items-center gap-[15px]">
							<TokenIconButton
								icon={icons.upload}
								variant="plain"
								onClick={handlePickTokenFile}
							/>
							<TokenIconButton
								icon={icons.plus}
								variant="green"
								onClick={handleAddShare}
								disabled={!!tokenJsonPath}
							/>
							<TokenIconButton
								icon={icons.minus}
								variant="red"
								onClick={handleRemoveShare}
								disabled={
									!!tokenJsonPath ||
									shares.length <= MIN_SHARES
								}
							/>
						</div>
					)}
				</div>
				<div className="flex flex-col gap-[20px] mt-[20px]">
					{isPassword && (
						<UIInput
							type="text"
							placeholder={formatMessage({
								id: "modal.open.placeholder.none",
							})}
							value={password}
							onChange={e => setPassword(e.target.value)}
						/>
					)}
					{isMaster && (
						<UIInput
							type="text"
							placeholder={formatMessage({
								id: "modal.open.placeholder.master",
							})}
							value={masterToken}
							onChange={e => setMasterToken(e.target.value)}
						/>
					)}
					{isShare &&
						(tokenJsonPath ? (
							<div className="flex items-center gap-[10px]">
								<UIInput value={tokenJsonPath} readOnly />
								<TokenIconButton
									icon={icons.minus}
									variant="red"
									onClick={handleClearTokenFile}
								/>
							</div>
						) : (
							<Fragment>
								{shares.map((s, idx) => (
									<UIInput
										key={idx}
										placeholder={formatMessage(
											{
												id: "modal.open.placeholder.share",
											},
											{ index: idx + 1 },
										)}
										value={s}
										onChange={e =>
											update(idx, e.target.value)
										}
										style={{ maxWidth: "100%" }}
									/>
								))}
							</Fragment>
						))}
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
						<UIPasswordField
							value={hmac}
							onChange={e => setHmac(e.target.value)}
							placeholder={formatMessage({
								id: "modal.open.placeholder.hmac",
							})}
						/>
					</div>
				)}
				<div className="flex flex-col gap-[20px] mt-[20px]">
					<UIButton
						text={formatMessage({ id: "common.unlock" })}
						icon={icons.unlock}
						color="#ffffff"
						noTheme
						center
						onClick={handleOpen}
						disabled={!canUnlock || (progress > 0 && !done)}
						style={{
							backgroundColor:
								resolved === "dark" ? "#2463EB" : "#3A73ED",
							color: "#ffffff",
						}}
					/>
					<p
						className={cn(
							"text-[16px] font-medium tracking-[-0.05em] text-center",
							{
								"text-black/70": resolved === "light",
								"text-white/70": resolved === "dark",
							},
						)}>
						{formatMessage({ id: "modal.open.bottom.text" })}
					</p>
				</div>
			</div>
		</div>
	);
};

export { ModalOpen };
