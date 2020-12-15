import React, { Component } from "react";
import accountingApi from "../../services/accountingApi";
import YearSelector from "../common/yearSelector";
import MonthSelector from "./../common/monthSelector";
import Table from "./../common/table";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DownloadButton } from "../common/buttons";
import ItalianDateRenderer from "../common/date";

class InvoicesFrame extends Component {
	state = {
		year: new Date().getFullYear(),
		month: new Date().getMonth() + 1,
		sent: true,
		invoices: null,
	};
	columns = [
		//{ path: "invoiceType", label: "" },
		{ path: "invoiceNumber", label: "Num." },
		{ path: "documentType", label: "Tipo documento" },
		{
			path: "invoiceDate",
			label: "Data fattura",
			renderContent: (invoice) => (
				<ItalianDateRenderer date={invoice.invoiceDate} />
			),
		},
		{ path: "clientSupplierDescription", label: "Denominazione" },
		{ path: "clientSupplierVatNumber", label: "Partiva IVA" },
		{
			label: "Totale",
			key: "total",
			renderContent: (invoice) => <InvoiceTotal invoice={invoice} />,
		},
		{
			path: "deliveryDate",
			label: "Consegna",
			renderContent: (invoice) => (
				<ItalianDateRenderer date={invoice.deliveryDate} />
			),
		},
		{
			path: "invoiceDocumentType",
			label: "Tipo",
		},
		{
			key: "functions",
			renderContent: (inv) => {
				if (inv.hasFile) {
					const link = accountingApi.getFirmInvoiceDownload(
						this.getFirmId(),
						inv.invoiceId
					);
					return <DownloadButton link={link} />;
				}
				return <span></span>;
			},
		},
	];
	async componentDidMount() {
		const { year, month, invoices, sent } = this.state;
		if (invoices === null) {
			const invoices = await this.loadInvoices(year, month, sent);
			this.setState({ invoices });
		}
	}
	render() {
		const { invoices } = this.state;
		if (invoices === null) return "Caricamento delle fatture in corso";
		return this.renderTable();
	}
	getFirmId() {
		return this.props.firm.id;
	}
	async loadInvoices(year, month, sent) {
		const { data: invoices } = await accountingApi.getInvoice(
			this.getFirmId(),
			year,
			month,
			sent
		);
		return invoices;
	}
	onMonthChanged = async (month) => {
		const { year, sent } = this.state;
		const invoices = await this.loadInvoices(year, month, sent);
		this.setState({ month, invoices });
	};
	onYearChanged = async (year) => {
		const { month, sent } = this.state;
		const invoices = await this.loadInvoices(year, month, sent);
		this.setState({ year, invoices });
	};
	setEmesse = async () => {
		const { year, month } = this.state;
		const invoices = await this.loadInvoices(year, month, true);
		this.setState({ invoices, sent: true });
	};
	setRicevute = async () => {
		const { year, month } = this.state;
		const invoices = await this.loadInvoices(year, month, false);
		this.setState({ invoices, sent: false });
	};
	setSent = async (status) => {
		const { year, month } = this.state;
		const invoices = await this.loadInvoices(year, month, status);
		this.setState({ invoices, sent: status });
	};
	renderTable() {
		const { sent } = this.state;
		const currentYear = new Date().getFullYear();
		return (
			<React.Fragment>
				<table>
					<tbody>
						<tr>
							<td>
								<YearSelector
									from={2020}
									to={currentYear}
									current={currentYear}
									onYearChanged={this.onYearChanged}
								/>
							</td>
							<td>
								<MonthSelector
									lang="it"
									onMonthChanged={this.onMonthChanged}
								/>
							</td>
							<td>
								<div
									className="btn-group btn-group-toggle"
									data-toggle="buttons"
								>
									<label
										className={
											"btn " +
											(sent
												? "btn-secondary"
												: "btn-outline-dark")
										}
									>
										<input
											type="radio"
											name="options"
											onClick={() => this.setSent(true)}
										/>
										Emesse
									</label>
									<label
										className={
											"btn " +
											(!sent
												? "btn-secondary"
												: "btn-outline-dark")
										}
									>
										<input
											type="radio"
											name="options"
											onClick={() => this.setSent(false)}
										/>
										Ricevute
									</label>
								</div>
							</td>
						</tr>
					</tbody>
				</table>

				<Table
					data={this.state.invoices}
					columns={this.columns}
					keyFields={["invoiceType", "invoiceId"]}
					itemsPerPage={15}
					sortPath={sent ? "invoiceNumber" : "invoiceDate"}
					sortOrder="desc"
				/>
			</React.Fragment>
		);
	}
}

export default InvoicesFrame;

class InvoiceTotal extends Component {
	render() {
		const { invoice } = this.props;
		const total = invoice.taxable + invoice.tax;
		const totalRound = Math.round((total + Number.EPSILON) * 100) / 100;
		return (
			<p>
				€ {totalRound} {this.getTooltip(invoice)}
			</p>
		);
	}

	getTooltip(invoice) {
		return (
			<i
				data-toogle="tooltip"
				title={this.getTooltipText(invoice)}
				data-placement="left"
			>
				<FontAwesomeIcon icon={faInfoCircle} size="sm" />
			</i>
		);
	}

	getTooltipText(invoice) {
		const tooltipText =
			"Imponibile " + invoice.taxable + "  IVA " + invoice.tax;
		return tooltipText;
	}
}
