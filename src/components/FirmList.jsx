import React, { Component } from "react";
import firmApi from "../services/firmApi";
import Table from "./common/table.jsx";
import { OpenFirmButton } from "./common/buttons";

class FirmList extends Component {
	state = { firms: [] };
	columns = [
		{ path: "name", label: "Denominazione" },
		{ path: "fiscalCode", label: "Codice Fiscale" },
		{ path: "vatNumber", label: "Partita IVA" },
		{
			key: "functions",
			label: "Funzioni",
			renderContent: (item) => <OpenFirmButton firm={item} />,
		},
	];
	async componentDidMount() {
		const { data: firms } = await firmApi.getFirms();
		this.setState({ firms });
	}
	render() {
		const { firms } = this.state;
		return (
			<Table
				data={firms}
				columns={this.columns}
				keyFields={["fiscalCode", "vatNumber"]}
				itemsPerPage={15}
			/>
		);
	}
}

export default FirmList;
