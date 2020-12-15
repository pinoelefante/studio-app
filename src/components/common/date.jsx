const ItalianDateRenderer = ({ date }) => {
	const toDate = new Date(date);
	const y = toDate.getFullYear();
	const m = toDate.getMonth() + 1;
	const d = toDate.getDate();
	return <p>{d + "/" + m + "/" + y}</p>;
};

export default ItalianDateRenderer;
