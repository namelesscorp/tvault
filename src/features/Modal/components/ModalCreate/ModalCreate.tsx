import { invoke } from "@tauri-apps/api/core";
import { join } from "@tauri-apps/api/path";
import { open, save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { Store } from "@tauri-apps/plugin-store";
import {
	ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
	cn,
	devError,
	formatTokenList,
	getLocalizedErrorMessage,
	toFileName,
} from "utils";
import { EntropyCanvas } from "features/EntropyCanvas";
import { useLocale } from "features/Localization";
import {
	modalSetBusy,
	modalSetIcon,
	modalSetOpen,
	modalSetTitle,
} from "features/Modal/state/Modal.actions";
import { useAppDispatch } from "features/Store";
import { useTheme } from "features/Theme";
import {
	UIButton,
	UIImgIcon,
	UIInput,
	UIPasswordField,
	UIProgress,
	UIToggle,
} from "features/UI";
import { SHAMIR_MAX_SHARES, TokenType } from "features/Vault/Vault.model";
import { useEncrypt } from "features/Vault/hooks/useEncrypt";
import {
	vaultResetWizardState,
	vaultSetWizardEncryptCompleted,
	vaultSetWizardState,
	vaultTrackRecentContainer,
} from "features/Vault/state/Vault.actions";
import { selectVaultWizardState } from "features/Vault/state/Vault.selectors";
import { icons } from "assets";

const GREEN = "#16853F";
const INFO_STORE = "app-settings.json";
const INFO_HIDDEN_KEY = "createInfoHidden";

enum CreateStep {
	Basic = "basic",
	Folders = "folders",
	Security = "security",
	Entropy = "entropy",
	Summary = "summary",
	Created = "created",
	Info = "info",
}

const randomSecret = () => {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return btoa(String.fromCharCode(...bytes));
};

/* ────────────────────────────  shared bits  ──────────────────────────── */

const Label = ({
	text,
	action,
}: {
	text: string;
	action?: { text: string; onClick: () => void };
}) => {
	return (
		<div className="flex items-center justify-between">
			<p
				className={cn(
					"text-[14px] font-semibold tracking-[-0.05em] text-fg",
				)}>
				{text}
			</p>
			{action && (
				<button
					type="button"
					onClick={action.onClick}
					className="flex items-center gap-[6px] cursor-pointer transition-all duration-200 hover:opacity-70">
					<UIImgIcon
						icon={icons.refresh}
						width={15}
						height={15}
						color={"var(--success-alt)"}
					/>
					<span
						className="text-[14px] font-semibold tracking-[-0.05em]"
						style={{
							color: "var(--success-alt)",
						}}>
						{action.text}
					</span>
				</button>
			)}
		</div>
	);
};

const Card = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => {
	return (
		<div
			className={cn(
				"w-full flex flex-col gap-[10px] border rounded-[10px] p-[15px] bg-surface border-line",
				className,
			)}>
			{children}
		</div>
	);
};

const CardHeading = ({
	icon,
	title,
	subtitle,
	iconColor,
	titleColor,
	right,
}: {
	icon: string;
	title: string;
	subtitle?: string;
	iconColor?: string;
	titleColor?: string;
	right?: ReactNode;
}) => {
	const { resolved } = useTheme();

	return (
		<div className="flex items-center justify-between gap-[20px]">
			<div className="flex items-center gap-[10px]">
				<UIImgIcon
					icon={icon}
					width={29}
					height={29}
					color={iconColor ?? "#538DD5"}
				/>
				<div className="flex flex-col gap-[2px]">
					<p
						className={cn(
							"text-[16px] font-semibold tracking-[-0.05em]",
							{
								"text-white":
									!titleColor && resolved === "dark",
								"text-black/80":
									!titleColor && resolved === "light",
							},
						)}
						style={titleColor ? { color: titleColor } : undefined}>
						{title}
					</p>
					{subtitle && (
						<p
							className={cn(
								"text-[14px] font-medium tracking-[-0.05em] text-muted",
							)}>
							{subtitle}
						</p>
					)}
				</div>
			</div>
			{right}
		</div>
	);
};

const Muted = ({ children }: { children: ReactNode }) => {
	return (
		<p
			className={cn(
				"text-[16px] font-medium tracking-[-0.05em] text-muted",
			)}>
			{children}
		</p>
	);
};

const Hint = ({ children }: { children: ReactNode }) => {
	return (
		<p
			className={cn(
				"text-[14px] font-medium tracking-[-0.05em] text-muted",
			)}>
			{children}
		</p>
	);
};

const RadioRow = ({
	selected,
	title,
	subtitle,
	onClick,
}: {
	selected: boolean;
	title: string;
	subtitle: string;
	onClick: () => void;
}) => {
	const accent = "var(--accent-blue)";

	return (
		<div
			className="flex items-center gap-[15px] cursor-pointer"
			onClick={onClick}>
			<span
				className="flex items-center justify-center w-[20px] h-[20px] rounded-full border-2 shrink-0 transition-all duration-300"
				style={{ borderColor: accent }}>
				{selected && (
					<span
						className="w-[10px] h-[10px] rounded-full"
						style={{ backgroundColor: accent }}
					/>
				)}
			</span>
			<div
				className={cn(
					"flex-1 flex flex-col gap-[2px] border rounded-[10px] px-[15px] py-[10px] transition-all duration-300 bg-surface border-line",
				)}>
				<p
					className={cn(
						"text-[16px] font-semibold tracking-[-0.05em] text-fg",
					)}>
					{title}
				</p>
				<p
					className={cn(
						"text-[14px] font-medium tracking-[-0.05em] text-muted",
					)}>
					{subtitle}
				</p>
			</div>
		</div>
	);
};

const Footer = ({
	onBack,
	onNext,
	nextText,
	nextIcon,
	nextDisabled = false,
	nextLoading = false,
}: {
	onBack?: () => void;
	onNext: () => void;
	nextText: string;
	nextIcon: string;
	nextDisabled?: boolean;
	nextLoading?: boolean;
}) => {
	const { formatMessage } = useIntl();

	return (
		<div className="flex items-center gap-[10px] mt-[20px]">
			{onBack && (
				<UIButton
					icon={icons.back}
					text={formatMessage({ id: "common.back" })}
					onClick={onBack}
					center
				/>
			)}
			<UIButton
				icon={nextIcon}
				text={nextText}
				onClick={onNext}
				disabled={nextDisabled}
				loading={nextLoading}
				color="#ffffff"
				noTheme
				center
				style={{
					backgroundColor: "var(--accent-blue)",
					color: "#ffffff",
				}}
			/>
		</div>
	);
};

/* ────────────────────────────  the modal  ──────────────────────────── */

const ModalCreate = () => {
	const { formatMessage } = useIntl();
	const { locale } = useLocale();
	const { resolved } = useTheme();
	const dispatch = useAppDispatch();
	const wizard = useSelector(selectVaultWizardState);

	const { progress, done, result, error, run } = useEncrypt(wizard);

	const [step, setStep] = useState<CreateStep>(CreateStep.Basic);
	const [running, setRunning] = useState(false);

	/* step 1 */
	const [name, setName] = useState(wizard.name);
	const [comment, setComment] = useState(wizard.comment);
	const [tagInput, setTagInput] = useState("");
	const [tags, setTags] = useState<string[]>(
		wizard.tags
			? wizard.tags
					.split(",")
					.map(t => t.trim())
					.filter(Boolean)
			: [],
	);

	/* step 2 */
	const [vaultFolder, setVaultFolder] = useState(
		wizard.outputPath ? wizard.outputPath.replace(/[\\/][^\\/]+$/, "") : "",
	);
	const [inputPath, setInputPath] = useState(wizard.inputPath);

	/* step 3 */
	const [tokenType, setTokenType] = useState<TokenType>(wizard.tokenType);
	const [password, setPassword] = useState(wizard.password ?? "");
	const [total, setTotal] = useState(String(wizard.n));
	const [threshold, setThreshold] = useState(String(wizard.k));
	const [hmacOn, setHmacOn] = useState(wizard.integrityProvider === "hmac");
	const [hmacPassword, setHmacPassword] = useState(
		wizard.additionalPassword ?? "",
	);

	const isPassword = tokenType === "none";
	const isShare = tokenType === "share";

	/* ── navigation guards ── */

	const canLeaveBasic = name.trim().length > 0;
	const canLeaveFolders = !!vaultFolder && !!inputPath;
	const canLeaveSecurity = useMemo(() => {
		if (hmacOn && !isPassword && !hmacPassword.trim()) return false;
		if (isPassword) return password.trim().length >= 8;
		if (isShare) {
			const n = Number(total);
			const k = Number(threshold);
			/** The core stores shares/threshold in one byte each: 2 – 255. */
			return (
				Number.isInteger(n) &&
				Number.isInteger(k) &&
				n >= 2 &&
				n <= SHAMIR_MAX_SHARES &&
				k >= 2 &&
				k <= n
			);
		}
		return true;
	}, [hmacOn, hmacPassword, isPassword, isShare, password, threshold, total]);

	/* ── step commits ── */

	const commitBasic = useCallback(() => {
		dispatch(
			vaultSetWizardState({
				...wizard,
				name: name.trim(),
				comment: comment.trim(),
				tags: tags.join(", "),
			}),
		);
		setStep(CreateStep.Folders);
	}, [comment, dispatch, name, tags, wizard]);

	const commitFolders = useCallback(async () => {
		/** The typed name lives on in the metadata; the file itself gets no spaces. */
		const outputPath = await join(vaultFolder, `${toFileName(name)}.tvlt`);

		/** Refuses to overwrite an existing container and pre-creates the parents. */
		try {
			await invoke("check_container_path", { path: outputPath });
		} catch (e: unknown) {
			toast.error(formatMessage({ id: String(e) }));
			return;
		}

		dispatch(
			vaultSetWizardState({
				...wizard,
				name: name.trim(),
				comment: comment.trim(),
				tags: tags.join(", "),
				outputPath,
				inputPath,
			}),
		);
		setStep(CreateStep.Security);
	}, [
		comment,
		dispatch,
		formatMessage,
		inputPath,
		name,
		tags,
		vaultFolder,
		wizard,
	]);

	const commitSecurity = useCallback(() => {
		const generated = !isPassword;

		dispatch(
			vaultSetWizardState({
				...wizard,
				tokenType,
				split: isShare,
				n: isShare ? Number(total) : wizard.n,
				k: isShare ? Number(threshold) : wizard.k,
				keySource: generated ? "generated" : "manual",
				password: isPassword ? password : undefined,
				passphrase: isPassword ? password : undefined,
				shareDest: "stdout",
				sharePath: "",
				integrityProvider: hmacOn && !isPassword ? "hmac" : "none",
				additionalPassword: hmacOn && !isPassword ? hmacPassword : "",
			}),
		);

		setStep(generated ? CreateStep.Entropy : CreateStep.Summary);
	}, [
		dispatch,
		hmacOn,
		hmacPassword,
		isPassword,
		isShare,
		password,
		threshold,
		tokenType,
		total,
		wizard,
	]);

	const handleEntropyReady = useCallback(() => {
		dispatch(
			vaultSetWizardState({ ...wizard, passphrase: randomSecret() }),
		);
		setStep(CreateStep.Summary);
	}, [dispatch, wizard]);

	const handleCreate = useCallback(async () => {
		setRunning(true);
		try {
			await run();
		} catch (e) {
			devError(e);
			setRunning(false);
		}
	}, [run]);

	/* ── encryption finished ── */

	/**
	 * `result` and `wizard` are fresh objects on every render, so they must stay
	 * out of the deps — the ref guard makes this run exactly once per encryption.
	 */
	const latest = useRef({ result, wizard });
	latest.current = { result, wizard };
	const savedRef = useRef(false);

	useEffect(() => {
		if (!done || error || savedRef.current) return;
		savedRef.current = true;

		const { result: res, wizard: state } = latest.current;

		setRunning(false);

		dispatch(
			vaultSetWizardEncryptCompleted({
				masterToken: res?.masterToken,
				shares: res?.shares,
				password: state.passphrase,
				additionalPassword: state.additionalPassword,
			}),
		);

		(async () => {
			try {
				const store = await Store.load("recent-containers.json");
				const KEY = "recent";
				const recent =
					(await store.get<
						{
							path: string;
							lastOpenedAt: number;
							lastMountPath?: string;
						}[]
					>(KEY)) ?? [];
				const filtered = recent.filter(
					r => r.path !== state.outputPath,
				);
				filtered.unshift({
					path: state.outputPath,
					lastOpenedAt: Date.now(),
				});
				await store.set(KEY, filtered.slice(0, 100));
				await store.save();
				dispatch(vaultTrackRecentContainer({ path: state.outputPath }));
			} catch (e) {
				devError(e);
			}
		})();

		setStep(CreateStep.Created);
	}, [done, error, dispatch]);

	useEffect(() => {
		dispatch(modalSetBusy(running));
	}, [running, dispatch]);

	useEffect(() => {
		if (error) {
			setRunning(false);
			toast.error(getLocalizedErrorMessage(error, formatMessage, locale));
		}
	}, [error, formatMessage, locale]);

	/* ── created screen data ── */

	const secretPassword = wizard.passphrase ?? "";
	const masterToken =
		result?.masterToken ?? wizard.encryptResult?.masterToken;
	const shares = result?.shares ?? wizard.encryptResult?.shares ?? [];

	const copy = useCallback(
		async (value: string) => {
			try {
				await navigator.clipboard.writeText(value);
				toast.success(formatMessage({ id: "common.copied" }));
			} catch (e) {
				devError(e);
			}
		},
		[formatMessage],
	);

	const downloadJson = useCallback(
		async (payload: Record<string, unknown>, suggested: string) => {
			try {
				const path = await save({
					defaultPath: suggested,
					filters: [{ name: "JSON", extensions: ["json"] }],
				});
				if (!path) return;
				await writeTextFile(path, JSON.stringify(payload, null, 2));
				toast.success(formatMessage({ id: "modal.create.saved" }));
			} catch (e) {
				devError(e);
				toast.error(formatMessage({ id: "modal.create.error.save" }));
			}
		},
		[formatMessage],
	);

	/* ── finish ── */

	const finish = useCallback(() => {
		dispatch(vaultResetWizardState());
		dispatch(modalSetOpen(false));
	}, [dispatch]);

	const handleDone = useCallback(async () => {
		let hidden = false;
		try {
			const store = await Store.load(INFO_STORE);
			hidden = (await store.get<boolean>(INFO_HIDDEN_KEY)) ?? false;
		} catch (e) {
			devError(e);
		}

		if (hidden) {
			finish();
			return;
		}

		dispatch(modalSetIcon(icons.book_open));
		dispatch(
			modalSetTitle(formatMessage({ id: "modal.create.info.title" })),
		);
		setStep(CreateStep.Info);
	}, [dispatch, finish, formatMessage]);

	const handleNeverShowAgain = useCallback(async () => {
		try {
			const store = await Store.load(INFO_STORE);
			await store.set(INFO_HIDDEN_KEY, true);
			await store.save();
		} catch (e) {
			devError(e);
		}
		finish();
	}, [finish]);

	/* ── pickers ── */

	const pickVaultFolder = useCallback(async () => {
		const dir = await open({ directory: true, multiple: false });
		if (typeof dir === "string") setVaultFolder(dir);
	}, []);

	const pickInputFolder = useCallback(async () => {
		const dir = await open({ directory: true, multiple: false });
		if (typeof dir === "string") setInputPath(dir);
	}, []);

	const addTag = useCallback(() => {
		const value = tagInput.trim();
		if (!value || tags.includes(value)) {
			setTagInput("");
			return;
		}
		setTags(prev => [...prev, value]);
		setTagInput("");
	}, [tagInput, tags]);

	/* ────────────────────────────  render  ──────────────────────────── */

	const subtitle = (id: string) => (
		<p
			className={cn(
				"text-[16px] font-medium tracking-[-0.05em] text-muted",
			)}>
			{formatMessage({ id })}
		</p>
	);

	if (step === CreateStep.Basic) {
		return (
			<div>
				{subtitle("modal.create.step1")}
				<div className="flex flex-col gap-[20px] mt-[20px]">
					<div className="flex flex-col gap-[10px]">
						<Label
							text={formatMessage({ id: "modal.create.name" })}
						/>
						<UIInput
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder={formatMessage({
								id: "modal.create.name.placeholder",
							})}
						/>
					</div>
					<div className="flex flex-col gap-[10px]">
						<Label
							text={formatMessage({ id: "modal.create.comment" })}
						/>
						<UIInput
							value={comment}
							onChange={e => setComment(e.target.value)}
							placeholder={formatMessage({
								id: "modal.create.comment.placeholder",
							})}
						/>
					</div>
					<div className="flex flex-col gap-[10px]">
						<Label
							text={formatMessage({ id: "modal.create.tags" })}
						/>
						<div className="flex items-center gap-[10px]">
							<UIInput
								value={tagInput}
								onChange={e => setTagInput(e.target.value)}
								onKeyDown={e => {
									if (e.key === "Enter") addTag();
								}}
								placeholder={formatMessage({
									id: "modal.create.tags.placeholder",
								})}
							/>
							<UIButton
								icon={icons.plus}
								text={formatMessage({ id: "common.add" })}
								onClick={addTag}
								color="#ffffff"
								noTheme
								center
								style={{
									width: "fit-content",
									backgroundColor: GREEN,
									color: "#ffffff",
								}}
							/>
						</div>
						{tags.length > 0 && (
							<div className="flex flex-wrap items-center gap-[10px]">
								{tags.map(tag => (
									<span
										key={tag}
										onClick={() =>
											setTags(prev =>
												prev.filter(t => t !== tag),
											)
										}
										className={cn(
											"flex items-center gap-[6px] h-[20px] px-[10px] rounded-[10px] text-[11px] font-bold tracking-[-0.05em] cursor-pointer transition-all duration-200 hover:opacity-70",
											{
												"bg-[#2C4163] text-[#60A5FA]":
													resolved === "dark",
												"bg-[#DCE9FF] text-[#1353A3]":
													resolved === "light",
											},
										)}>
										{tag}
										<UIImgIcon
											icon={icons.close}
											width={8}
											height={8}
											color={
												resolved === "dark"
													? "#60A5FA"
													: "#1353A3"
											}
										/>
									</span>
								))}
							</div>
						)}
					</div>
				</div>
				<Footer
					onNext={commitBasic}
					nextText={formatMessage({ id: "common.next" })}
					nextIcon={icons.arrow_right}
					nextDisabled={!canLeaveBasic}
				/>
			</div>
		);
	}

	if (step === CreateStep.Folders) {
		return (
			<div>
				{subtitle("modal.create.step2")}
				<div className="flex flex-col gap-[20px] mt-[20px]">
					<Card>
						<CardHeading
							icon={icons.folder}
							title={formatMessage({
								id: "modal.create.dataFolder.title",
							})}
						/>
						<Muted>
							{formatMessage({
								id: "modal.create.dataFolder.description",
							})}
						</Muted>
						<div className="flex flex-col gap-[10px] mt-[10px]">
							<Label
								text={formatMessage({
									id: "modal.create.dataFolder.label",
								})}
							/>
							<div className="flex items-center gap-[10px]">
								<UIInput
									value={inputPath}
									readOnly
									style={{ width: 275 }}
									placeholder={formatMessage({
										id: "modal.create.dataFolder.placeholder",
									})}
								/>
								<UIButton
									icon={icons.eye}
									text={formatMessage({
										id: "common.browse",
									})}
									onClick={pickInputFolder}
									color="#ffffff"
									noTheme
									style={{
										width: "fit-content",
										backgroundColor: GREEN,
										color: "#ffffff",
									}}
								/>
							</div>
						</div>
					</Card>
					<Card>
						<CardHeading
							icon={icons.folder_lock}
							title={formatMessage({
								id: "modal.create.vaultFolder.title",
							})}
						/>
						<Muted>
							{formatMessage({
								id: "modal.create.vaultFolder.description",
							})}
						</Muted>
						<div className="flex flex-col gap-[10px] mt-[10px]">
							<Label
								text={formatMessage({
									id: "modal.create.vaultFolder.label",
								})}
							/>
							<div className="flex items-center gap-[10px]">
								<UIInput
									value={vaultFolder}
									readOnly
									style={{ width: 275 }}
									placeholder={formatMessage({
										id: "modal.create.vaultFolder.placeholder",
									})}
								/>
								<UIButton
									icon={icons.eye}
									text={formatMessage({
										id: "common.browse",
									})}
									onClick={pickVaultFolder}
									color="#ffffff"
									noTheme
									style={{
										width: "fit-content",
										backgroundColor: GREEN,
										color: "#ffffff",
									}}
								/>
							</div>
						</div>
					</Card>
				</div>
				<Footer
					onBack={() => setStep(CreateStep.Basic)}
					onNext={commitFolders}
					nextText={formatMessage({ id: "common.next" })}
					nextIcon={icons.arrow_right}
					nextDisabled={!canLeaveFolders}
				/>
			</div>
		);
	}

	if (step === CreateStep.Security) {
		return (
			<div>
				{subtitle("modal.create.step3")}
				<div className="flex flex-col gap-[15px] mt-[20px]">
					<RadioRow
						selected={tokenType === "none"}
						title={formatMessage({ id: "modal.create.token.none" })}
						subtitle={formatMessage({
							id: "modal.create.token.none.description",
						})}
						onClick={() => setTokenType("none")}
					/>
					<RadioRow
						selected={tokenType === "master"}
						title={formatMessage({
							id: "modal.create.token.master",
						})}
						subtitle={formatMessage({
							id: "modal.create.token.master.description",
						})}
						onClick={() => setTokenType("master")}
					/>
					<RadioRow
						selected={tokenType === "share"}
						title={formatMessage({
							id: "modal.create.token.share",
						})}
						subtitle={formatMessage({
							id: "modal.create.token.share.description",
						})}
						onClick={() => setTokenType("share")}
					/>
				</div>

				{isPassword && (
					<div className="flex flex-col gap-[10px] mt-[20px]">
						<Label
							text={formatMessage({
								id: "modal.create.password",
							})}
							action={{
								text: formatMessage({ id: "common.generate" }),
								onClick: () => setPassword(randomSecret()),
							}}
						/>
						<UIPasswordField
							value={password}
							onChange={e => setPassword(e.target.value)}
							placeholder={formatMessage({
								id: "modal.create.password.placeholder",
							})}
						/>
					</div>
				)}

				{isShare && (
					<div className="grid grid-cols-2 gap-[10px] mt-[20px]">
						<div className="flex flex-col gap-[10px]">
							<Label
								text={formatMessage({
									id: "modal.create.totalShares",
								})}
							/>
							<UIInput
								value={total}
								onChange={e =>
									setTotal(e.target.value.replace(/\D/g, ""))
								}
								placeholder={formatMessage({
									id: "modal.create.totalShares.placeholder",
								})}
							/>
						</div>
						<div className="flex flex-col gap-[10px]">
							<Label
								text={formatMessage({
									id: "modal.create.threshold",
								})}
							/>
							<UIInput
								value={threshold}
								onChange={e =>
									setThreshold(
										e.target.value.replace(/\D/g, ""),
									)
								}
								placeholder={formatMessage({
									id: "modal.create.threshold.placeholder",
								})}
							/>
						</div>
					</div>
				)}

				{!isPassword && (
					<Card className="mt-[20px]">
						<CardHeading
							icon={icons.fingerprint}
							title={formatMessage({
								id: "modal.create.hmac.title",
							})}
							subtitle={formatMessage({
								id: "modal.create.hmac.description",
							})}
							iconColor={"var(--success-alt)"}
							right={
								<UIToggle
									checked={hmacOn}
									onChange={setHmacOn}
								/>
							}
						/>
					</Card>
				)}

				{hmacOn && !isPassword && (
					<div className="flex flex-col gap-[10px] mt-[20px]">
						<Label
							text={formatMessage({
								id: "modal.create.hmac.password",
							})}
							action={{
								text: formatMessage({ id: "common.generate" }),
								onClick: () => setHmacPassword(randomSecret()),
							}}
						/>
						<UIPasswordField
							value={hmacPassword}
							onChange={e => setHmacPassword(e.target.value)}
							placeholder={formatMessage({
								id: "modal.create.hmac.password.placeholder",
							})}
						/>
						<Hint>
							{formatMessage({ id: "modal.create.hmac.hint" })}
						</Hint>
					</div>
				)}

				<Footer
					onBack={() => setStep(CreateStep.Folders)}
					onNext={commitSecurity}
					nextText={formatMessage({ id: "common.next" })}
					nextIcon={icons.arrow_right}
					nextDisabled={!canLeaveSecurity}
				/>
			</div>
		);
	}

	if (step === CreateStep.Entropy) {
		return (
			<div>
				<div className="flex flex-col items-center gap-[5px]">
					<p
						className={cn(
							"text-[20px] font-semibold tracking-[-0.05em] text-fg",
						)}>
						{formatMessage({ id: "modal.create.entropy.title" })}
					</p>
					<Hint>
						{formatMessage({
							id: "modal.create.entropy.description",
						})}
					</Hint>
				</div>
				<div className="flex justify-center mt-[20px]">
					<EntropyCanvas
						onReady={handleEntropyReady}
						width={470}
						height={215}
					/>
				</div>
				<Footer
					onBack={() => setStep(CreateStep.Security)}
					onNext={handleEntropyReady}
					nextText={formatMessage({ id: "common.next" })}
					nextIcon={icons.arrow_right}
				/>
			</div>
		);
	}

	if (step === CreateStep.Summary) {
		const rows: [string, string][] = [
			[formatMessage({ id: "container.name" }), wizard.name],
			[
				formatMessage({ id: "container.token" }),
				formatMessage({ id: `modal.create.token.${wizard.tokenType}` }),
			],
			...(wizard.tokenType === "share"
				? ([
						[
							formatMessage({ id: "container.shares" }),
							String(wizard.n),
						],
						[
							formatMessage({ id: "container.threshold" }),
							String(wizard.k),
						],
					] as [string, string][])
				: []),
			...(wizard.tags
				? ([[formatMessage({ id: "container.tags" }), wizard.tags]] as [
						string,
						string,
					][])
				: []),
			...(wizard.comment
				? ([
						[
							formatMessage({ id: "container.comment" }),
							wizard.comment,
						],
					] as [string, string][])
				: []),
			[
				formatMessage({ id: "container.integrity" }),
				wizard.integrityProvider === "hmac" ? "HMAC-SHA256" : "—",
			],
			[
				formatMessage({ id: "container.containerPath" }),
				wizard.outputPath,
			],
			[formatMessage({ id: "container.folderPath" }), wizard.inputPath],
		];

		return (
			<div>
				<p
					className={cn(
						"text-[20px] font-semibold tracking-[-0.05em] text-fg",
					)}>
					{formatMessage({ id: "modal.create.summary.title" })}
				</p>
				<Card className="mt-[20px]">
					{rows.map(([label, value]) => (
						<div
							key={label}
							className="flex items-start justify-between gap-[20px]">
							<p
								className={cn(
									"text-[14px] font-medium tracking-[-0.05em] shrink-0 text-muted",
								)}>
								{label}:
							</p>
							<p
								className={cn(
									"text-[14px] font-medium tracking-[-0.05em] text-right min-w-0 [overflow-wrap:anywhere] text-fg",
								)}>
								{value || "—"}
							</p>
						</div>
					))}
				</Card>

				{running && (
					<UIProgress value={progress} className="mt-[20px]" />
				)}

				<Footer
					onBack={() =>
						setStep(
							wizard.keySource === "generated"
								? CreateStep.Entropy
								: CreateStep.Security,
						)
					}
					onNext={handleCreate}
					nextText={
						running
							? `${progress}%`
							: formatMessage({ id: "common.create" })
					}
					nextIcon={icons.arrow_right}
					nextLoading={running}
				/>
			</div>
		);
	}

	if (step === CreateStep.Created) {
		const green = "var(--success)";

		const actions = (onCopy: () => void, onDownload: () => void) => (
			<div className="flex items-center gap-[10px]">
				<UIImgIcon
					icon={icons.copy}
					width={24}
					height={24}
					color={resolved === "dark" ? "#9AC7FF" : "#1353A3"}
					pointer
					onClick={onCopy}
				/>
				<UIImgIcon
					icon={icons.download_2}
					width={24}
					height={24}
					color={green}
					pointer
					onClick={onDownload}
				/>
			</div>
		);

		return (
			<div>
				<p
					className={cn(
						"text-[20px] font-semibold tracking-[-0.05em] text-fg",
					)}>
					{formatMessage({ id: "modal.create.created.title" })}
				</p>

				<div className="flex flex-col gap-[20px] mt-[20px]">
					{wizard.tokenType === "none" && (
						<Card>
							<CardHeading
								icon={icons.key_2}
								title={formatMessage({
									id: "modal.create.created.password",
								})}
								iconColor={green}
								right={actions(
									() => copy(secretPassword),
									() =>
										downloadJson(
											{ password: secretPassword },
											`${toFileName(wizard.name)}.password.json`,
										),
								)}
							/>
							<UIPasswordField
								value={secretPassword}
								onChange={() => {}}
								disabled
							/>
							<Hint>
								{formatMessage({
									id: "modal.create.created.password.hint",
								})}
							</Hint>
						</Card>
					)}

					{wizard.tokenType === "master" && masterToken && (
						<Card>
							<CardHeading
								icon={icons.key_2}
								title={formatMessage({
									id: "modal.create.created.master",
								})}
								iconColor={green}
								right={actions(
									() => copy(masterToken),
									() =>
										downloadJson(
											{ master_token: masterToken },
											`${toFileName(wizard.name)}.master.json`,
										),
								)}
							/>
							<UIPasswordField
								value={masterToken}
								onChange={() => {}}
								disabled
							/>
							<Hint>
								{formatMessage({
									id: "modal.create.created.master.hint",
								})}
							</Hint>
						</Card>
					)}

					{wizard.tokenType === "share" && shares.length > 0 && (
						<Card>
							<CardHeading
								icon={icons.key_2}
								title={formatMessage({
									id: "modal.create.token.share",
								})}
								iconColor={green}
								right={actions(
									() => copy(formatTokenList(shares)),
									() =>
										downloadJson(
											{ token_list: shares },
											`${toFileName(wizard.name)}.shares.json`,
										),
								)}
							/>
							<div className="flex items-center justify-between">
								<Hint>
									{formatMessage(
										{
											id: "modal.create.created.totalShares",
										},
										{ count: shares.length },
									)}
								</Hint>
								<Hint>
									{formatMessage(
										{ id: "modal.create.created.required" },
										{ count: wizard.k },
									)}
								</Hint>
							</div>
							{shares.map((share, idx) => (
								<UIPasswordField
									key={idx}
									value={share}
									onChange={() => {}}
									disabled
								/>
							))}
							<Hint>
								{formatMessage(
									{ id: "modal.create.created.shares.hint" },
									{ count: wizard.k },
								)}
							</Hint>
						</Card>
					)}

					{wizard.integrityProvider === "hmac" && (
						<Card>
							<CardHeading
								icon={icons.fingerprint}
								title={formatMessage({
									id: "modal.create.created.hmac",
								})}
								iconColor={green}
								right={actions(
									() => copy(wizard.additionalPassword ?? ""),
									() =>
										downloadJson(
											{
												integrity_password:
													wizard.additionalPassword,
											},
											`${toFileName(wizard.name)}.integrity.json`,
										),
								)}
							/>
							<UIPasswordField
								value={wizard.additionalPassword ?? ""}
								onChange={() => {}}
								disabled
							/>
							<Hint>
								{formatMessage({
									id: "modal.create.created.hmac.hint",
								})}
							</Hint>
						</Card>
					)}
				</div>

				<div className="mt-[20px]">
					<UIButton
						text={formatMessage({ id: "common.done" })}
						onClick={handleDone}
						color="#ffffff"
						noTheme
						center
						style={{
							backgroundColor: "var(--accent-blue)",
							color: "#ffffff",
						}}
					/>
				</div>
			</div>
		);
	}

	/* Info */
	const PURPLE = "#C084FC";
	const notices = [
		"modal.create.info.notice.1",
		"modal.create.info.notice.2",
		"modal.create.info.notice.3",
		"modal.create.info.notice.4",
	];
	const next = [
		"modal.create.info.next.1",
		"modal.create.info.next.2",
		"modal.create.info.next.3",
		"modal.create.info.next.4",
	];

	const bullets = (keys: string[]) => (
		<ul className="flex flex-col gap-[8px] mt-[5px]">
			{keys.map(key => (
				<li
					key={key}
					className={cn(
						"flex gap-[10px] text-[14px] font-medium tracking-[-0.05em] text-fg",
					)}>
					<span>•</span>
					<span>{formatMessage({ id: key })}</span>
				</li>
			))}
		</ul>
	);

	return (
		<div>
			<div className="flex flex-col gap-[20px]">
				<Card>
					<CardHeading
						icon={icons.annotation_alert}
						title={formatMessage({
							id: "modal.create.info.notice.title",
						})}
						iconColor={PURPLE}
						titleColor={PURPLE}
					/>
					{bullets(notices)}
				</Card>
				<Card>
					<CardHeading
						icon={icons.chevron_right_double}
						title={formatMessage({
							id: "modal.create.info.next.title",
						})}
						iconColor={PURPLE}
						titleColor={PURPLE}
					/>
					{bullets(next)}
				</Card>
			</div>
			<div className="flex items-center gap-[10px] mt-[20px]">
				<UIButton
					text={formatMessage({ id: "modal.create.info.dontShow" })}
					onClick={handleNeverShowAgain}
					center
				/>
				<UIButton
					text={formatMessage({ id: "common.close" })}
					onClick={finish}
					color="#ffffff"
					noTheme
					center
					style={{
						backgroundColor: "var(--accent-blue)",
						color: "#ffffff",
					}}
				/>
			</div>
		</div>
	);
};

export { ModalCreate };
