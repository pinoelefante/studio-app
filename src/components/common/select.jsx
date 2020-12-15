import React, { Component } from "react";

class Select extends Component {
	onChangeHandler = null;

	onChangeEvent = (e) => {
		const newValue = e.currentTarget.value;
		if (this.onChangeHandler) {
			this.onChangeHandler(newValue);
		}
	};
	render() {
		const {
			values,
			hasEmpty,
			selected,
			onChangeHandler,
			readonly,
		} = this.props;
		this.onChangeHandler = onChangeHandler;
		return (
			<select
				className="form-control"
				defaultValue={selected}
				onChange={this.onChangeEvent}
				disabled={readonly ? true : false}
			>
				{hasEmpty ? <option key="emptyValue" value=""></option> : ""}
				{values.map((v) => (
					<option key={"opt_" + v.value} value={v.value}>
						{v.label}
					</option>
				))}
			</select>
		);
	}
}

export const BooleanSelect = ({ currentValue, onChange }) => {
	const values = [
		{ label: "ATTIVO", value: true },
		{ label: "DISATTIVO", value: false },
	];
	return (
		<Select
			values={values}
			selected={currentValue}
			onChangeHandler={onChange}
			hasEmpty={false}
		/>
	);
};

export default Select;
