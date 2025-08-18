const UICentered = ({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) => (
	<section className="flex flex-col items-center mt-8 gap-6">
		<h1 className="text-lg font-medium">{title}</h1>
		{children}
	</section>
);

export { UICentered };
