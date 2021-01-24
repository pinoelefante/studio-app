import React, { Component } from "react";
import firmApi from "../services/firmApi";
import accountingApi from "../services/accountingApi";
import TabPanel from "./common/tabpanel";
import InvoicesFrame from "./accounting/Invoices";
import FeesFrame from "./accounting/Fees";
import AccountingConfigurationFrame from "./accounting/AccountingConfiguration";

class FirmPage extends Component {
	state = {
		firm: null,
		firmPlaces: null,
		firmConfiguration: null,
		fees: null,
		feesCurrentPlace: null,
		feesYear: null,
		feesMonth: null,
		invoices: null,
		invoicesYear: null,
		invoicesMonth: null,
		invoiceType: null,
	};

	async componentDidMount() {
		await this.reload();
	}

	render() {
		const { firm } = this.state;
		if (!firm) {
			return "Loading firm";
		}
		const tabs = this.createTabs();
		return (
			<div>
				<h3>
					{firm.name} - {firm.fiscalCode} - {firm.vatNumber}
				</h3>
				<TabPanel tabs={tabs} />
			</div>
		);
	}

	createTabs() {
		const { firm, firmConfiguration } = this.state;
		const tabs = [];
		const {
			invoiceGetSent,
			invoiceGetReceived,
			invoiceGetMissed,
		} = firmConfiguration;

		if (invoiceGetSent || invoiceGetReceived || invoiceGetMissed) {
			const {
				invoices,
				invoiceType,
				invoicesYear,
				invoicesMonth,
			} = this.state;
			tabs.push({
				id: "invoice",
				content: (
					<InvoicesFrame
						firm={firm}
						onPeriodChanged={(year, month) =>
							this.onInvoicePeriodChanged(year, month)
						}
						onTypeChanged={(type) =>
							this.onInvoiceTypeChanged(type)
						}
						invoices={invoices}
						invoiceType={invoiceType}
						year={invoicesYear}
						month={invoicesMonth}
					/>
				),
				label: "Fatture",
				main: true,
			});
		}

		if (firmConfiguration.feeEnabled) {
			tabs.push({
				id: "fee",
				content: (
					<FeesFrame
						firm={firm}
						fees={this.state.fees}
						places={this.state.firmPlaces}
						selectedPlaceId={this.state.feesCurrentPlace}
						year={this.state.feesYear}
						month={this.state.feesMonth}
						onPeriodChanged={(year, month) =>
							this.onFeePeriodChanged(year, month)
						}
						onPlaceChanged={(newPlace) =>
							this.setState({ feesCurrentPlace: newPlace })
						}
					/>
				),
				label: "Corrispettivi",
				main: tabs.length === 0,
			});
		}

		tabs.push({
			id: "accounting-conf",
			content: (
				<AccountingConfigurationFrame
					firm={firm}
					onImportComplete={this.onImportJobComplete}
				/>
			),
			label: "Configurazione",
			main: tabs.length === 0,
		});

		return tabs;
	}

	async loadFirm(id) {
		const { data: firm } = await firmApi.getFirm(id);
		return firm;
	}

	async loadPlaces(firm) {
		const { data } = await firmApi.getFirmPlaces(firm.id);
		return data;
	}

	async loadConfiguration(firm) {
		const { data } = await accountingApi.getAccountingConfiguration(
			firm.id
		);
		return data;
	}

	async loadFees(year, month, firm = undefined) {
		if (!firm) {
			firm = this.state.firm;
		}
		const { data: fees } = await accountingApi.getFees(
			year,
			month,
			true,
			false,
			firm.id
		);
		return fees;
	}

	onFeePeriodChanged = async (newYear, newMonth) => {
		const fees = await this.loadFees(newYear, newMonth);
		this.setState({ feesYear: newYear, feesMonth: newMonth, fees });
	};

	onPlaceChanged = (newPlace) => {
		this.setState({ feesCurrentPlace: newPlace });
	};

	async loadInvoices(year, month, type = "sent", firm = undefined) {
		if (!firm) {
			firm = this.state.firm;
		}
		const { data } = await accountingApi.getInvoice(
			firm.id,
			year,
			month,
			type === "sent"
		);
		return data;
	}

	onInvoicePeriodChanged = async (year, month) => {
		const { invoiceType, firm } = this.state;
		const invoices = await this.loadInvoices(
			year,
			month,
			invoiceType,
			firm
		);
		this.setState({ invoices, invoicesYear: year, invoicesMonth: month });
	};

	onInvoiceTypeChanged = async (invoiceType) => {
		const { invoicesYear, invoicesMonth, firm } = this.state;
		const invoices = await this.loadInvoices(
			invoicesYear,
			invoicesMonth,
			invoiceType,
			firm
		);
		this.setState({ invoices, invoiceType });
	};

	onImportJobComplete = async () => {
		console.log("Import job complete callback");
		await this.reload();
	};

	async reload() {
		const { id: firmId } = this.props.match.params;
		let {
			invoicesYear,
			invoicesMonth,
			invoiceType,
			feesYear,
			feesMonth,
			firm,
			firmPlaces,
			firmConfiguration,
		} = this.state;

		const firmData = firm ?? (await this.loadFirm(firmId));
		const places = firmPlaces ?? (await this.loadPlaces(firmData));
		const selectedPlaceId = places.length > 0 ? places[0].id : null;
		const firmConfig =
			firmConfiguration ?? (await this.loadConfiguration(firmData));
		feesYear = feesYear ?? new Date().getFullYear();
		feesMonth = feesMonth ?? new Date().getMonth() + 1;
		const fees = await this.loadFees(feesYear, feesMonth, firmData);
		invoicesYear = invoicesYear ?? new Date().getFullYear();
		invoicesMonth = invoicesMonth ?? new Date().getMonth() + 1;
		invoiceType = invoiceType ?? "sent";
		const invoices = await this.loadInvoices(
			invoicesYear,
			invoicesMonth,
			invoiceType,
			firmData
		);

		this.setState({
			firm: firmData,
			firmPlaces: places,
			feesCurrentPlace: selectedPlaceId,
			feesYear,
			feesMonth,
			firmConfiguration: firmConfig,
			fees,
			invoices,
			invoicesYear,
			invoicesMonth,
			invoiceType,
		});
	}
}

export default FirmPage;
