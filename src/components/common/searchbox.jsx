import React, { Component } from "react";

const SearchBox = ({ value, onChange }) => {
	return (
		<input
			type="text"
			className="form-control"
			name="query"
			placeholder="Cerca..."
			value={value}
			onChange={(e) => onChange(e.currentTarget.value)}
		/>
	);
};

export default SearchBox;
