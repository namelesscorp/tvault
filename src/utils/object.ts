export const isEmptyObject = (object: any) => {
	try {
		return Object.keys(object).length === 0;
	} catch (e) {
		console.error(e);
		return true;
	}
};
