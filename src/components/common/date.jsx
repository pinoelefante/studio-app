const ItalianDateRenderer = ({ date }) => {
	if (date === null) {
		return <p>-</p>;
	}
	const toDate = new Date(date);
	const y = toDate.getFullYear();
	const m = toDate.getMonth() + 1;
	const d = toDate.getDate();
	return <span>{d + "/" + m + "/" + y}</span>;
};

export default ItalianDateRenderer;
