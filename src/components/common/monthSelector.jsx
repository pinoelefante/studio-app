import React, { Component } from "react";
import Select from "./select";

class MonthSelector extends Component {
	labels = {
		it: [
			"Gennaio",
			"Febbraio",
			"Marzo",
			"Aprile",
			"Maggio",
			"Giugno",
			"Luglio",
			"Agosto",
			"Settembre",
			"Ottobre",
			"Novembre",
			"Dicembre",
		],
	};

	render() {
		let { selected, lang, onMonthChanged } = this.props;
		selected = selected ? selected : new Date().getMonth() + 1;
		const values = this.getValues(lang);
		return (
			<Select
				values={values}
				hasEmpty={false}
				selected={selected}
				onChangeHandler={onMonthChanged}
			/>
		);
	}

	getValues(lang) {
		if (!lang) lang = "it";
		const labels = this.labels[lang];
		const values = labels.map((l) => {
			return { label: l, value: labels.indexOf(l) + 1 };
		});
		return values;
	}
}

export default MonthSelector;
