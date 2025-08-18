import { UIImgIcon } from "features/UI";

const UISectionHeading = ({ icon, text }: { icon: string; text: string }) => {
	return (
		<div className="flex items-center gap-[20px]">
			<UIImgIcon icon={icon} width={30} height={30} />
			<p className="text-[20px] text-white text-medium">{text}</p>
		</div>
	);
};

export { UISectionHeading };
