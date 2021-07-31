const ItalianDateRenderer = ({ date }) => {

	function getValue(v) {
		if (v < 10)
			return "0" + v;
		return v;
	}

	if (date === null) {
		return <p>-</p>;
	}
	const toDate = new Date(date);
	const y = getValue(toDate.getFullYear());
	const m = getValue(toDate.getMonth() + 1);
	const d = getValue(toDate.getDate());
	return <span>{d + "/" + m + "/" + y}</span>;
};

export default ItalianDateRenderer;
