import React, { Component } from "react";
import firmApi from "../services/firmApi";
import TabPanel from "./common/tabpanel";
import InvoicesFrame from "./accounting/Invoices";
import FeesFrame from "./accounting/Fees";
import AccountingConfigurationFrame from "./accounting/AccountingConfiguration";

class FirmPage extends Component {
	state = { firm: null };

	async componentDidMount() {
		const { id } = this.props.match.params;
		const { firm } = this.state;
		if (firm === null) {
			const firmData = await this.loadFirm(id);
			this.setState({ firm: firmData });
		}
	}

	render() {
		const { firm } = this.state;
		if (!firm) {
			return "Loading firm";
		}
		const tabs = [
			{
				id: "invoice",
				content: <InvoicesFrame firm={firm} />,
				label: "Fatture",
				main: true,
			},
			{
				id: "fee",
				content: <FeesFrame firm={firm} />,
				label: "Corrispettivi",
			},
			{
				id: "accounting-conf",
				content: <AccountingConfigurationFrame firm={firm} />,
				label: "Configurazione",
			},
			// { id: "contact", content: "Contatti", label: "Contatti" },
		];
		return (
			<div>
				<h3>
					{firm.name} - {firm.fiscalCode} - {firm.vatNumber}
				</h3>
				<TabPanel tabs={tabs} />
			</div>
		);
	}

	async loadFirm(id) {
		const { data: firm } = await firmApi.getFirm(id);
		return firm;
	}
}

export default FirmPage;
