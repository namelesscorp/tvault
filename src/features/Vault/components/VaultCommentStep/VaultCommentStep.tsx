import { useCallback, useState } from "react";
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

	const [comment, setComment] = useState(wizard.comment || "");
	const [tags, setTags] = useState(wizard.tags || "");

	const next = useCallback(async () => {
		dispatch(vaultSetWizardState({ ...wizard, comment, tags }));
		navigate(RouteTypes.VaultCreateKeySource);
	}, [navigate, dispatch, wizard, comment, tags]);

	return (
		<div>
			<UISectionHeading icon={icons.lock} text={"Create"} />
			<p className="text-[20px] text-medium text-white text-center mt-[10px]">
				Step 1 / 6 — Comment and Tags
			</p>
			<div className="flex flex-col gap-[20px] p-[20px] bg-white/5 rounded-[10px] mt-[20px]">
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">
						Comment:
					</p>
					<UIInput
						value={comment}
						onChange={e => setComment(e.target.value)}
						placeholder="Enter comment"
						style={{ maxWidth: "50%" }}
					/>
				</div>
				<div className="flex flex-col gap-[10px]">
					<p className="text-[20px] text-white text-medium">Tags:</p>
					<UIInput
						value={tags}
						onChange={e => setTags(e.target.value)}
						placeholder="Enter tags"
						style={{ maxWidth: "50%" }}
					/>
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
					style={{ width: "fit-content" }}
				/>
			</div>
		</div>
	);
};

export { VaultCommentStep };
