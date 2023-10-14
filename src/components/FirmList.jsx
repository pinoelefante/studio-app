import React, { Component } from "react";
import firmApi from "../services/firmApi";
import Table from "./common/table.jsx";
import { AddButton, DeleteButton } from "./common/buttons";
import MyModal from "./common/modal";
import $ from 'jquery';
import { Checkbox, Input } from "./common/form";
import { Link } from "react-router-dom";

class FirmList extends Component {
	state = { 
		firms: [], 
		addFirmData: {fiscalCode: "", vatNumber: "", soleProprietorship: true, name: ""} 
	};
	columns = [
		{ path: "name", label: "Denominazione", renderContent: (item) => <Link to={`/firm/${item.id}`}>{item.name}</Link> },
		{ path: "fiscalCode", label: "Codice Fiscale" },
		{ path: "vatNumber", label: "Partita IVA" },
		{
			key: "functions",
			label: "Funzioni",
			renderContent: (item) => <DeleteButton title="Cancella azienda" onClick={() => firmApi.deleteFirm(item.id).then(() => firmApi.getFirms().then(({data}) => this.setState({firms:data})))}/>,
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
		const { addFirmData } = this.state;
		const { soleProprietorship, vatNumber, name, fiscalCode } = addFirmData;
		return <>
			<AddButton text="Aggiungi" style={{float: "right", marginRight: "20px", marginBottom: "10px"}} onClick={() => $("#addModal").modal("show")}/>
			<Table
				data={firms}
				columns={this.columns}
				keyFields={["fiscalCode", "vatNumber"]}
				itemsPerPage={12}
			/>
			<MyModal id="addModal" 
				title="Aggiungi azienda" 
				confirmText="Salva"
				handleConfirm={(evt) => this.handleFirmSave(evt)}
				cancelText="Annulla"
				handleCancel={() => this.resetAddFirmForm() }
				message={
					<>
						<Input name="name" label="Denominazione" value={name} onChange={({currentTarget}) => { addFirmData.name = currentTarget.value; this.setState({addFirmData}) } } />
						<Input name="vatNumber" label="Partita IVA" value={vatNumber} onChange={({currentTarget}) => { addFirmData.vatNumber = currentTarget.value; this.setState({addFirmData}) } }/>
						<Checkbox name="soleProprietorship" label="Ditta individuale" checked={soleProprietorship} onChange={(evt) => {
								const newVal = !soleProprietorship;
								if (!newVal) {
									addFirmData.fiscalCode = addFirmData.vatNumber;
								} else {
									addFirmData.fiscalCode = "";
								}
								addFirmData.soleProprietorship = newVal;
								this.setState({addFirmData}); 
							}
						} 
						/>
						<Input name="fiscalCode" label="Codice fiscale" disabled={!soleProprietorship} value={soleProprietorship ? fiscalCode : vatNumber} onChange={({currentTarget}) => { addFirmData.fiscalCode = currentTarget.value; this.setState({addFirmData})} }/>
					</>
				}
			/>
		</>;
	}

	resetAddFirmForm() {
		const { addFirmData } = this.state;
		addFirmData.fiscalCode = "";
		addFirmData.name = "";
		addFirmData.soleProprietorship = true;
		addFirmData.vatNumber = "";
		this.setState({addFirmData});
	}

	handleFirmSave(evt) {
		const {addFirmData} = this.state;
		console.log(addFirmData);
		firmApi.createFirm(addFirmData).finally(() => {
			firmApi.getFirms().then(({data}) => this.setState({firms:data})).finally(() => this.resetAddFirmForm());
		});
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
