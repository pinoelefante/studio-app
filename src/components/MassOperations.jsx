import React, { Component } from "react";
import accountingApi from "../services/accountingApi";
import firmApi from "../services/firmApi";
import MonthSelector from "./common/monthSelector";
import YearSelector from "./common/yearSelector";
import Checkbox from "./common/checkbox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { ConfirmButton, DeleteButton } from "./common/buttons";
import _ from 'lodash'
import { Link } from "react-router-dom";

class MassOperation extends Component {
	state = {
		feeYear: null,
		feeMonth: null,
		feeKeepEmpty: false,
		incompleteFee: [],
		accountingJobRunning: false,
		accountingFeeRunning: false,
		delegationJobRunning: false,
		journal: null
	};

	componentDidMount() {
		accountingApi.getInvoiceJournal().then( response => {
			const {data} = response;
			this.setState({journal: data });
		});

		accountingApi.getIncompleteFee().then(response => {
			const {data} = response;
			this.setState({incompleteFee:data});
		})
	}

	render() {
		return (
			<div>
				{this.createAdeJobRunner()}
				{this.createFeeExport()}
				{this.createJournal()}
			</div>
		);
	}

	createFeeExport() {
		let {
			feeYear: year,
			feeMonth: month,
			feeKeepEmpty: keepEmpty,
			incompleteFee: incomplete
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
					<tr>
						<td><b>Corrispettivi incompleti ({incomplete.length})</b></td>
						<td colSpan="2">
							{incomplete.map(inc => <span><Link to={"/firm/" + inc.id}>{inc.name}</Link><br /></span>)}
						</td>
					</tr>
				</tbody>
			</table>
		);
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
		const { accountingJobRunning, delegationJobRunning, accountingFeeRunning } = this.state;
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
								disabled={accountingFeeRunning}
								onClick={this.onClickStartFeeJob}
								text={accountingFeeRunning ? "Importazione in corso" : "Corrispettivi"}
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
		return <React.Fragment>
			<h4>Fatture da importare</h4>
			{
				journal !== null ? this.renderJournal(journal) : "Non ci sono dati da importare"
			}
		</React.Fragment>;
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
							<td>{journalEntry.count} fatture</td>
							<td><DeleteButton onClick = {() => this.removeJournalEntry(journalEntry)}/></td>
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
}

export default MassOperation;
