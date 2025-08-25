import { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RouteTypes } from "interfaces";
import { useAppDispatch } from "features/Store";
import { UIButton, UIInput, UISectionHeading } from "features/UI";
import { icons } from "~/assets/collections/icons";
import { vaultSetWizardState } from "../../state/Vault.actions";
import { selectVaultWizardState } from "../../state/Vault.selectors";

const VaultCommentStep = () => {
	const wizard = useSelector(selectVaultWizardState);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { formatMessage } = useIntl();

	const [comment, setComment] = useState(wizard.comment || "");
	const [tags, setTags] = useState(wizard.tags || "");

	const next = useCallback(async () => {
		dispatch(vaultSetWizardState({ ...wizard, comment, tags }));
		navigate(RouteTypes.VaultCreateKeySource);
	}, [navigate, dispatch, wizard, comment, tags]);

	return (
		<div>
			<UISectionHeading
				icon={icons.lock}
				text={formatMessage({ id: "title.create" })}
			/>
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				{formatMessage({ id: "vault.comment.step" })}
			</p>
			<div className="flex flex-col gap-[20px] p-[20px] bg-white/5 rounded-[10px] mt-[20px]">
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						{formatMessage({ id: "vault.comment.name" })}:
					</p>
					<UIInput
						value={comment}
						onChange={e => setComment(e.target.value)}
						placeholder={formatMessage({
							id: "vault.comment.commentPlaceholder",
						})}
						style={{ maxWidth: "50%" }}
					/>
				</div>
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						{formatMessage({ id: "vault.comment.tags" })}:
					</p>
					<UIInput
						value={tags}
						onChange={e => setTags(e.target.value)}
						placeholder={formatMessage({
							id: "vault.comment.tagsPlaceholder",
						})}
						style={{ maxWidth: "50%" }}
					/>
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
					style={{ width: "fit-content" }}
				/>
			</div>
		</div>
	);
};

export { VaultCommentStep };
