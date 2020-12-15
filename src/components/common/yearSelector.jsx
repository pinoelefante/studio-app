import React, { Component } from "react";
import _ from "lodash";
import Select from "./select";

class YearSelector extends Component {
	render() {
		const { from, to, current, onYearChanged } = this.props;
		const values = this.createValues(from, to);
		return (
			<Select
				values={values}
				hasEmpty={false}
				selected={current}
				onChangeHandler={onYearChanged}
			/>
		);
	}

	createValues(from, to) {
		return _.range(from, to + 1, 1).map((n) => {
			return { label: n, value: n };
		});
	}
}

export default YearSelector;
