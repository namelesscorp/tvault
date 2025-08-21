import { useCallback, useEffect, useState } from "react";
import type { ContainerInfoData } from "interfaces";
import { ResealData } from "../Vault.model";

export interface ContainerEditData {
	name: string;
	comment: string;
	tags: string[];
}

export const useContainerEdit = (containerInfo?: ContainerInfoData) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editData, setEditData] = useState<ContainerEditData>({
		name: containerInfo?.name || "",
		comment: containerInfo?.comment || "",
		tags: containerInfo?.tags || [],
	});

	useEffect(() => {
		if (containerInfo) {
			setEditData(prev => ({
				...prev,
				name: containerInfo.name || prev.name,
				comment: containerInfo.comment || prev.comment,
				tags: containerInfo.tags || prev.tags,
			}));
		}
	}, [containerInfo]);

	const startEdit = useCallback(() => {
		setIsEditing(true);
	}, []);

	const cancelEdit = useCallback(() => {
		setIsEditing(false);
		if (containerInfo) {
			setEditData({
				name: containerInfo.name || "",
				comment: containerInfo.comment || "",
				tags: containerInfo.tags || [],
			});
		}
	}, [containerInfo]);

	const saveEdit = useCallback(() => {
		setIsEditing(false);
	}, [editData]);

	const updateEditData = useCallback(
		(field: keyof ContainerEditData, value: any) => {
			setEditData(prev => ({
				...prev,
				[field]: value,
			}));
		},
		[],
	);

	const applyEditToResealData = useCallback(
		(resealData: ResealData): ResealData => {
			const updatedResealData = {
				...resealData,
				containerInfo: {
					...resealData.containerInfo,
					name: editData.name || resealData.containerInfo.name,
					comment:
						editData.comment || resealData.containerInfo.comment,
					tags:
						editData.tags.length > 0
							? editData.tags
							: resealData.containerInfo.tags,
				},
			};

			return updatedResealData;
		},
		[editData],
	);

	return {
		isEditing,
		editData,
		startEdit,
		cancelEdit,
		saveEdit,
		updateEditData,
		applyEditToResealData,
	};
};
