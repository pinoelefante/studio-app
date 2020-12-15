import React, { Component } from "react";
import PropTypes from "prop-types";

class Checkbox extends Component {
	render() {
		const { name, label, onChecked, value } = this.props;
		return (
			<div className="form-check form-check-inline">
				<input
					className="form-check-input"
					type="checkbox"
					name={name}
					id={name}
					value={value}
					onChange={({ currentTarget: i }) => onChecked(i.checked)}
					checked={value ? "checked" : ""}
				/>
				<label className="form-check-label" htmlFor={name}>
					{label}
				</label>
			</div>
		);
	}
}

Checkbox.propsTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	onChecked: PropTypes.func,
	value: PropTypes.bool.isRequired,
};

export default Checkbox;
