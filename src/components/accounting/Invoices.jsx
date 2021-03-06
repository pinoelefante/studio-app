import React, { Component } from "react";
import _ from "lodash";
import {
	faInfoCircle,
	faEye,
	faPaperclip,
	faExclamationCircle
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import accountingApi from "../../services/accountingApi";
import YearSelector from "../common/yearSelector";
import MonthSelector from "./../common/monthSelector";
import Table from "./../common/table";
import { DownloadButton, IconButton } from "../common/buttons";
import ItalianDateRenderer from "../common/date";

import VerticalSeparator from "../common/verticalSeparator";

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
			key: "deliveryDate",
			label: "Consegna",
			renderContent: (invoice) => (
				<InvoiceViewDate invoice={invoice} />
			),
		},
		{
			path: "invoiceDocumentType",
			label: "Tipo",
		},
		{
			key: "functions",
			renderContent: (inv) => {
				const firmId = this.props.firm.id;
				const invoiceId = inv.invoiceId;
				if (inv.hasFile) {
					const link = accountingApi.getFirmInvoiceDownload(
						firmId,
						invoiceId
					);
					return (
						<React.Fragment>
							<DownloadButton tooltip="Scarica XML" link={link} />

							<VerticalSeparator />

							<IconButton
								icon={faEye}
								classes="btn-success"
								tooltip="Visualizza"
								href={accountingApi.getInvoiceViewUrl(
									firmId,
									invoiceId
								)}
							/>
							{inv.hasAttachments ? (
								<span>
									<VerticalSeparator />

									<IconButton
										icon={faPaperclip}
										classes="btn-success"
										tooltip="Scarica allegati"
										href={accountingApi.getInvoiceAttachmentsUrl(
											firmId,
											invoiceId
										)}
									/>
								</span>
							) : (
								""
							)}
						</React.Fragment>
					);
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

class InvoiceViewDate extends Component {
	render() {
		const {invoice} = this.props;
		const {deliveryDate, presaVisione} = invoice;
		const date = deliveryDate === null ? (presaVisione !== null ? presaVisione : null) : deliveryDate;
		const missing = presaVisione !== null;
		return <React.Fragment>
			<ItalianDateRenderer date={date} />
			{missing ? <i
				data-toogle="tooltip"
				title="Presa visione"
				data-placement="left"
			>&nbsp;<FontAwesomeIcon icon={faExclamationCircle} size="sm" /></i> : ""}
		</React.Fragment>
	}
}