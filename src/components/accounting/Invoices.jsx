import React, { Component } from "react";
import accountingApi from "../../services/accountingApi";
import YearSelector from "../common/yearSelector";
import MonthSelector from "./../common/monthSelector";
import Table from "./../common/table";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DownloadButton } from "../common/buttons";
import ItalianDateRenderer from "../common/date";
import _ from "lodash";

class InvoicesFrame extends Component {
	columns = [
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
						this.props.firm.id,
						inv.invoiceId
					);
					return <DownloadButton link={link} />;
				}
				return <span></span>;
			},
		},
	];
	render() {
		return this.renderTable();
	}
	onMonthChanged = async (month) => {
		const { year, onPeriodChanged } = this.props;
		onPeriodChanged(year, month);
	};
	onYearChanged = async (year) => {
		const { month, onPeriodChanged } = this.props;
		onPeriodChanged(year, month);
	};
	getTotal() {
		const { invoices } = this.props;
		let total = 0;
		_.forEach(invoices, (i) => {
			const invTot = i.tax + i.taxable;
			if (this.isNotaCredito(i)) {
				total -= invTot;
			} else {
				total += invTot;
			}
		});
		return Math.round((total + Number.EPSILON) * 100) / 100;
	}
	isNotaCredito(inv) {
		return inv.documentType === "Nota di credito";
	}
	renderTable() {
		const {
			onTypeChanged,
			invoiceType,
			invoices,
			year,
			month,
		} = this.props;
		const sent = invoiceType === "sent";
		const currentYear = new Date().getFullYear();
		return (
			<React.Fragment>
				<table>
					<tbody>
						<tr>
							<td>
								<YearSelector
									from={2019}
									to={currentYear}
									current={year}
									onYearChanged={this.onYearChanged}
								/>
							</td>
							<td>
								<MonthSelector
									lang="it"
									selected={month}
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
											onClick={() =>
												onTypeChanged("sent")
											}
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
											onClick={() =>
												onTypeChanged("received")
											}
										/>
										Ricevute
									</label>
								</div>
							</td>
							<td>
								<p>Totale: {this.getTotal()}</p>
							</td>
						</tr>
					</tbody>
				</table>

				<Table
					data={invoices}
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
