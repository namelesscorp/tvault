export const download = (url: string, filename: string) => {
	const link = document.createElement("a");
	link.href = url;
	link.setAttribute("download", filename);

	document.body.appendChild(link);

	link.click();

	if (link.parentNode) {
		link.parentNode.removeChild(link);
	}
};
