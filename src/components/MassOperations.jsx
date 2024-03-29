import React, { Component } from "react";
import accountingApi from "../services/accountingApi";
import firmApi from "../services/firmApi";
import MonthSelector from "./common/monthSelector";
import YearSelector from "./common/yearSelector";
import ItalianDateRenderer from "./common/date";
import Checkbox from "./common/checkbox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { ConfirmButton, DeleteButton, DownloadButton2 } from "./common/buttons";
import _ from 'lodash'
import { Link } from "react-router-dom";
import Collapse from "./common/collapse"

class MassOperation extends Component {
	state = {
		feeYear: null,
		feeMonth: null,
		feeKeepEmpty: false,
		incompleteFee: [],
		expiringDelegations: [],
		accountingJobRunning: false,
		accountingFeeRunning: false,
		accountingBolloRunning: false,
		delegationJobRunning: false,
		journal: null,
		bolloJournal: null,
		feeJournal: null
	};

	componentDidMount() {
		accountingApi.getInvoiceJournal().then( response => {
			const {data} = response;
			this.setState({journal: data });
		});

		accountingApi.getBolloJournal().then(({data}) => {
			this.setState({bolloJournal: data})
		});

		accountingApi.getFeeJournal().then(({data}) => {
			this.setState({feeJournal: data})
		});

		accountingApi.getIncompleteFee().then(response => {
			const {data} = response;
			this.setState({incompleteFee:data});
		});

		accountingApi.getExpiringDelegationsAccounting().then(response =>{
			const {data} = response;
			this.setState({expiringDelegations:data});
		});
	}

	render() {
		return (
			<div>
				{this.createAdeJobRunner()}
				{this.createFeeExport()}
				{this.createIncompleteFee()}
				{this.createJournal()}
				{this.createFeeJournal()}
				{this.createBolloJournal()}
				{this.createExpiringDelegations()}
			</div>
		);
	}

	createFeeExport() {
		let {
			feeYear: year,
			feeMonth: month,
			feeKeepEmpty: keepEmpty
		} = this.state;
		const currentYear = new Date().getFullYear();
		year = year === null ? new Date().getFullYear() : year;
		month = month === null ? new Date().getMonth() + 1 : month;

		return (
			<table className="table table-sm">
				<tbody>
					<tr>
						<td>
							<b>Esportazione corrispettivi</b>
						</td>
						<td>
							<YearSelector
								from={2020}
								to={currentYear}
								current={year}
								onYearChanged={(year) =>
									this.setState({ feeYear: year })
								}
							/>
						</td>
						<td>
							<MonthSelector
								selected={month}
								lang={"it"}
								onMonthChanged={(month) =>
									this.setState({ feeMonth: month })
								}
							/>
						</td>
						<td>
							<Checkbox
								name="feeKeepEmpty"
								label="Includi vuoti"
								value={this.state.feeKeepEmpty}
								onChecked={(newValue) =>
									this.setState({ feeKeepEmpty: newValue })
								}
							/>
						</td>
						<td>
							<a
								href={accountingApi.getFirmFeeDownload(
									year,
									month,
									keepEmpty
								)}
							>
								<button className="btn btn-primary">
									<FontAwesomeIcon icon={faDownload} />
									Scarica PDF
								</button>
							</a>
						</td>
					</tr>
				</tbody>
			</table>
		);
	}

	createIncompleteFee() {
		let {incompleteFee: incomplete} = this.state;
		let body = <div>
			{incomplete.map(inc => <span><Link to={"/firm/" + inc.id}>{inc.name}</Link><br /></span>)}
		</div>
		let title = `Corrispettivi incompleti (${incomplete.length})`;
		return <Collapse id="fee_incomplete" title={title} body={body} />
	}

	onClickStartAccountingJob = async () => {
		this.setState({ accountingJobRunning: true });
		try {
			await accountingApi.runAccountingJob();
			toast.info("Job completato correttamente");
		} catch (e) {
			console.error(e);
			toast.error(
				"Si è verificato un errore durante l'esecuzione del job. Controllare il log del servizio"
			);
		} finally {
			this.setState({ accountingJobRunning: false });
		}
	}

	onClickStartFeeJob = async () => {
		this.setState({ accountingFeeRunning: true });
		try {
			await accountingApi.runFeeJob();
			toast.info("Job completato correttamente");
		} catch (e) {
			console.error(e);
			toast.error(
				"Si è verificato un errore durante l'esecuzione del job. Controllare il log del servizio"
			);
		} finally {
			this.setState({ accountingFeeRunning: false });
		}
	}

	onClickStartBolloJob = async () => {
		this.setState({ accountingBolloRunning: true });
		try {
			await accountingApi.runBolloJob();
			toast.info("Job completato correttamente");
		} catch (e) {
			console.error(e);
			toast.error(
				"Si è verificato un errore durante l'esecuzione del job. Controllare il log del servizio"
			);
		} finally {
			this.setState({ accountingBolloRunning: false });
		}
	}

	onClickStartDelegationJob = () => {
		this.setState({delegationJobRunning: true});
		firmApi.updateDelegations()
		.then(() => {
			toast.info("Aggiornamento deleghe terminato");
		})
		.catch(() => {
			toast.error("Si è verificato un errore durante l'aggiornamento delle deleghe");
		})
		.finally(() => {
			this.setState({delegationJobRunning: false});
		})
	}

	createAdeJobRunner() {
		const { accountingJobRunning, delegationJobRunning, accountingFeeRunning, accountingBolloRunning } = this.state;
		return (
			<table className="table table-sm">
				<tbody>
					<tr>
						<td>
							<b>Importa da Fatture e Corrispettivi</b>
						</td>
						<td>
							<div>
							<ConfirmButton
								disabled={accountingJobRunning}
								onClick={this.onClickStartAccountingJob}
								text={accountingJobRunning ? "Importazione in corso" : "Tutti"}
							/>
							&nbsp;&nbsp;
							<ConfirmButton
								disabled={accountingFeeRunning || accountingJobRunning}
								onClick={this.onClickStartFeeJob}
								text={accountingFeeRunning || accountingJobRunning ? "Importazione in corso" : "Corrispettivi"}
							/>
							&nbsp;&nbsp;
							<ConfirmButton
								disabled={accountingBolloRunning || accountingJobRunning}
								onClick={this.onClickStartBolloJob}
								text={accountingBolloRunning || accountingJobRunning ? "Importazione in corso" : "Bollo"}
							/>
							</div>
							
						</td>
					</tr>
					<tr>
						<td><b>Aggiorna deleghe Agenzia delle Entrate</b></td>
						<td>
							<ConfirmButton text={delegationJobRunning ? "Aggiornamento in corso" : "Avvia"}
								action={this.onClickStartDelegationJob} 
								disabled={delegationJobRunning}
							/>
						</td>
					</tr>
				</tbody>
			</table>
		);
	}

	createJournal() {
		const {journal} = this.state;
		if (journal === null) {
			return "";
		}
		let title = `Fatture da importare (${journal.length})`
		let body = this.renderJournal(journal);
		if (journal.length === 0) return <div></div>;
		return <Collapse id="invoice_journal" title={title} body={body} />;
	}

	createBolloJournal() {
		const {bolloJournal:journal} = this.state;
		if (journal === null) {
			return "";
		}
		let title = `Bolli scaricati (${journal.length})`
		let body = this.renderBolloJournal(journal);
		if (journal.length === 0) return <div></div>;
		return <Collapse id="invoice_bollo_journal" title={title} body={body} />;
	}

	createFeeJournal() {
		const {feeJournal:journal} = this.state;
		if (journal === null) {
			return "";
		}
		let count = journal.length;
		let title = `Corrispettivi aggiornati (${count})`
		let body = this.renderFeeJournal(journal);
		if (count === 0) return <div></div>;
		return <Collapse id="invoice_fee_journal" title={title} body={body} />;
	}

	renderJournal(journal) {
		let rowIndex = 0;
		return (
			<table className="table table-sm">
				<tbody>
				{ 
					journal.map(journalEntry => {
						return 	(
						<tr key={"row_" + (rowIndex++)}>
							<td><Link to={"/firm/" + journalEntry.firmId}>{journalEntry.firmId} - {journalEntry.firmName}</Link></td>
							<td>{journalEntry.date}</td>
							<td>{journalEntry.count} fatture (Inviate: {journalEntry.sent} - Ricevute: {journalEntry.received})</td>
							<td><DeleteButton onClick = {() => this.removeJournalEntry(journalEntry)}/></td>
						</tr>
						)
					})
				}
				</tbody>
			</table>
		);
	}

	renderFeeJournal(journal) {
		let rowIndex = 0;
		return (
			<table className="table table-sm">
				<tbody>
				{ 
					journal.map(journalEntry => {
						return 	(
						<tr key={"row_" + (rowIndex++)}>
							<td><Link to={"/firm/" + journalEntry.firmId}>{journalEntry.firmId} - {journalEntry.firmName}</Link></td>
							<td>{journalEntry.month}/{journalEntry.year}</td>
							<td><DeleteButton onClick = {() => this.removeJournalFeeEntry(journalEntry)}/></td>
						</tr>
						)
					})
				}
				</tbody>
			</table>
		);
	}

	renderBolloJournal(journal) {
		let rowIndex = 0;
		return (
			<table className="table table-sm">
				<tbody>
				{ 
					journal.map(journalEntry => {
						const {firmId, year, trimestre, firmName } = journalEntry;
						return 	(
						<tr key={"row_bolloj_" + (rowIndex++)}>
							<td><Link to={"/firm/" + firmId}>{firmId} - {firmName}</Link></td>
							<td>Anno {year} - Trimestre {trimestre}</td>
							<td>
								<DownloadButton2 text="F24" href={accountingApi.getBolloDownloadUrl(firmId, year, trimestre)}></DownloadButton2>
								<DeleteButton onClick = {() => this.removeBolloJournalEntry(journalEntry)}/>
							</td>
						</tr>
						)
					})
				}
				</tbody>
			</table>
		);
	}

	removeJournalEntry(entry) {
		accountingApi.removeInvoiceJournal(entry).then((response) => {
			const journal = {...this.state.journal}
			const newJournal = _.filter(journal, (i) => i !== entry);
			this.setState({journal: newJournal});
		}).catch((reason) => {
			toast.error(reason);
		});
	}

	removeJournalFeeEntry(entry) {
		accountingApi.removeFeeInvoiceJournal(entry).then((response) => {
			const journal = {...this.state.feeJournal}
			const newJournal = _.filter(journal, (i) => i !== entry);
			this.setState({feeJournal: newJournal});
		}).catch((reason) => {
			toast.error(reason);
		});
	}

	removeBolloJournalEntry(entry) {
		accountingApi.removeBolloInvoiceJournal(entry).then((response) => {
			const journal = {...this.state.bolloJournal}
			const newJournal = _.filter(journal, (i) => i !== entry);
			this.setState({bolloJournal: newJournal});
		}).catch((reason) => {
			toast.error(reason);
		});
	}

	createExpiringDelegations() {
		const {expiringDelegations: delegations} = this.state;
		if (delegations === null || delegations.length === 0) {
			return "";
		}
		let title = `Delega fattura elettronica in scadenza (${delegations.length})`;
		let body = <table className="table table-sm">
			{delegations.map(delegation => <tr><td><Link to={"/firm/" + delegation.id}>{delegation.name}</Link></td><td><ItalianDateRenderer date={delegation.expire} /></td></tr>)}
		</table>
		return <Collapse id="expiring_delegations_invoice" title={title} body={body} />
	}
}

export default MassOperation;
