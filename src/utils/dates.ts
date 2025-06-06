export const convertToTimestamp = (dateString: string): number => {
	return new Date(dateString).getTime() / 1000;
};
