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
		{
			keys: "services", label: "Servizi attivi", 
			renderContent: (item) => <FirmListEnabledServices firm={item} />
		}
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
				itemsPerPage={12}
			/>
		);
	}
}

export const FirmListEnabledServices = ({ firm }) => {
	const services = firm.services;
	if (!services || (!services.includes("FATTURE") && !services.includes("CORRISPETTIVI") && !services.includes("BOLLO"))) {
		return <></>
	}
	return <>
		<table>
			<tr>
				<td>{services.includes("FATTURE") ? renderSquare("F", "Fatture") : renderSquareEmpty()}</td>
				<td>{services.includes("CORRISPETTIVI") ? renderSquare("C", "Corrispettivi") : renderSquareEmpty()}</td>
				<td>{services.includes("BOLLO") ? renderSquare("B", "Bollo") : renderSquareEmpty()}</td>
			</tr>
		</table>
	</>

	function renderSquare(text, hoverText) {
		return <span style={{ padding: "5px" , minWidth: "80px", minHeight: "80px", maxWidth: "80px", maxHeight: "80px", border: "2px solid green", borderRadius: "4px" }} title={hoverText}>
			{text}
		</span>
	}

	function renderSquareEmpty() {
		return <span style={{ padding: "5px" , minWidth: "80px", minHeight: "80px", maxWidth: "80px", maxHeight: "80px", }}>
			&nbsp;
		</span>
	}
};

export default FirmList;
