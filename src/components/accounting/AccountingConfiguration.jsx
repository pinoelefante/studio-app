import React, { Component } from "react";
import accountingApi from "../../services/accountingApi";
import ItalianDateRenderer from "../common/date";
import EditableInput, {
	booleanTransformerToIcon,
} from "./../common/editableInput";
import Select, { BooleanSelect } from "../common/select";
import { ConfirmButton, CancelButton, IconButton } from "../common/buttons";
import { faPlay, faEdit } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import firmApi from "../../services/firmApi";
import _ from "lodash";

class AccountingConfigurationFrame extends Component {
	state = {
		configuration: null,
		edit: false,
		editConfiguration: null,
		accounts: [],
		importing: false,
		cassetto: null,
		fatturaElettronica: null,
		downloadRules: {byType:[], bySectional:[], byInvoiceId:[], byDocumentType:[], storageDownload: false, downloadAll: false}
	};
	async componentDidMount() {
		let { configuration, accounts } = this.state;
		if (accounts.length === 0) {
			accounts = await this.loadAdeAccounts();
		}
		if (configuration === null) {
			configuration = await this.loadConfiguration();
		}
		const delegations = await this.loadDelegations();
		const cassetto = this.getDelegationType(delegations, 'CASSETTO');
		const fatturaElettronica = this.getDelegationType(delegations, 'FATTURE');
		const downloadRules = await this.getDownloadRules();
		this.setState({ configuration, accounts, cassetto, fatturaElettronica, downloadRules });
	}
	render() {
		const { configuration } = this.state;
		if (configuration === null) {
			return "Caricamento in corso";
		}
		return this.createPage();
	}

	getFirm() {
		return this.props.firm;
	}

	async loadConfiguration() {
		const {onConfigurationChanged} = this.props;
		const { data } = await accountingApi.getAccountingConfiguration(
			this.getFirm().id
		);
		onConfigurationChanged(data);
		return data;
	}

	async loadAdeAccounts() {
		const { data } = await accountingApi.getAdeAccounts();
		return data;
	}

	async loadDelegations() {
		const {data} = await firmApi.getDelegations(this.getFirm().id);
		return data;
	}

	async getDownloadRules() {
		const {data} = await accountingApi.getInvoiceDownloadRules(this.getFirm().id);
		return data;
	}

	getDelegationType(data, type) {
		return _.find(data, elem => elem.type === type);
	}

	setEditMode = () => {
		const editConf = { ...this.state.configuration };
		this.setState({ edit: true, editConfiguration: editConf });
	};

	exitEditMode = async (save) => {
		if (save) {
			const conf = this.state.editConfiguration;
			const {
				status,
			} = await accountingApi.createAccountingConfiguration(
				this.getFirm().id,
				conf
			);
			if (status < 200 || status >= 300) {
				console.error(
					"Si è verificato un errore durante l'aggiornamento"
				);
			} else {
				const c = await this.loadConfiguration();
				this.setState({ configuration: c });
			}
		}
		this.setState({ edit: false });
	};

	startImport = async () => {
		const { onImportComplete } = this.props;
		this.setState({ importing: true });
		toast.info("Job avviato");
		try {
			await accountingApi.runAccountingJob([this.getFirm().id]);
			toast.success("Job completato");
			if (onImportComplete) {
				onImportComplete();
			}
		} catch {
			toast.error(
				"Si è verificato un errore durante l'esecuzione del job"
			);
		} finally {
			this.setState({ importing: false });
		}
	};

	createPage() {
		const { edit, importing, fatturaElettronica, cassetto, downloadRules } = this.state;
		var accounts = this.mapAccountsForSelect();
		return (
			<div className="container">
				<div className="row justify-content-end">
					<div className="col-2">
						{!edit ? (
							<div>
								<IconButton
									icon={faEdit}
									classes="btn-success"
									onClick={this.setEditMode}
								/>
							</div>
						) : (
							<span />
						)}
					</div>
				</div>
				<div className="row">
					<h3>Agenzia delle Entrate</h3>
				</div>
				<div className="row">
					<div className="col">
						{this.createEditableField(
							"Stato attivazione",
							"enabled",
							edit,
							booleanTransformerToIcon,
							undefined,
							() => this.createBooleanSelect("enabled")
						)}
					</div>
					<div className="col">
						<label>
							Account
							{this.createSelect(
								"adeAccount",
								accounts,
								edit,
								true
							)}
						</label>
					</div>
					<div className="col">
						{this.createEditableField(
							"Usa Partita IVA",
							"useVatNumber",
							edit,
							booleanTransformerToIcon,
							undefined,
							() => this.createBooleanSelect("useVatNumber")
						)}
					</div>
				</div>
				<div className="row">
					<h3>Fatture</h3>
				</div>
				<div className="row">
					<h5>Dettagli fatture</h5>
				</div>
				<div className="row">
					<div className="col">
						{this.createEditableField(
							"Fatture emesse",
							"invoiceGetSent",
							edit,
							booleanTransformerToIcon,
							undefined,
							() => this.createBooleanSelect("invoiceGetSent")
						)}
					</div>
					<div className="col">
						{this.createEditableField(
							"Fatture ricevute",
							"invoiceGetReceived",
							edit,
							booleanTransformerToIcon,
							undefined,
							() => this.createBooleanSelect("invoiceGetReceived")
						)}
					</div>
					<div className="col">
						{this.createEditableField(
							"Fatture non consegnate",
							"invoiceGetMissed",
							edit,
							booleanTransformerToIcon,
							undefined,
							() => this.createBooleanSelect("invoiceGetMissed")
						)}
					</div>
				</div>

				<div className="row">
					<h5>Download fatture</h5>
				</div>
				<div className="row">
					<div className="col">
						{this.createEditableField(
							"Fatture emesse",
							"invoiceDownloadSent",
							edit,
							booleanTransformerToIcon,
							undefined,
							() =>
								this.createBooleanSelect("invoiceDownloadSent")
						)}
					</div>
					<div className="col">
						{this.createEditableField(
							"Fatture ricevute",
							"invoiceDownloadReceived",
							edit,
							booleanTransformerToIcon,
							undefined,
							() =>
								this.createBooleanSelect(
									"invoiceDownloadReceived"
								)
						)}
					</div>
					<div className="col">
						{this.createEditableField(
							"Fatture non consegnate",
							"invoiceDownloadMissed",
							edit,
							booleanTransformerToIcon,
							undefined,
							() =>
								this.createBooleanSelect(
									"invoiceDownloadMissed"
								)
						)}
					</div>
				</div>

				<div className="row">
					<h3>Altro</h3>
				</div>

				<div className="row">
					<div className="col">
						{this.createEditableField(
							"Corrispettivi",
							"feeEnabled",
							edit,
							booleanTransformerToIcon,
							undefined,
							() => this.createBooleanSelect("feeEnabled")
						)}
					</div>
					<div className="col">
						{this.createEditableField(
							"Bollo",
							"bolloEnabled",
							edit,
							booleanTransformerToIcon,
							undefined,
							() => this.createBooleanSelect("bolloEnabled")
						)}
					</div>
					<div className="col"></div>
				</div>
				<div className="row justify-content-center">
					<div className="col-2">
						{edit ? (
							<div>
								<ConfirmButton
									text="Salva"
									action={() => this.exitEditMode(true)}
								/>
								<span>&nbsp;</span>
								<CancelButton
									text="Annulla"
									action={() => this.exitEditMode(false)}
								/>
							</div>
						) : (
							<IconButton
								icon={faPlay}
								text="Avvia import"
								classes="btn-success"
								onClick={this.startImport}
								disabled={importing}
							/>
						)}
					</div>
				</div>
				{
					cassetto != null || fatturaElettronica != null ? this.createDelegationsComponent(cassetto, fatturaElettronica) : <React.Fragment />
				}
				{
					this.createDownloadRulesComponent(downloadRules)
				}
			</div>
		);
	}

	createDelegationsComponent(cassetto, fatturaElettronica) {
		return (
			<div>
				<div className="row">
					<h3>Deleghe attive</h3>
				</div>
				<table className="table table-sm">
					<thead>
						<tr>
							<th>Delega</th>
							<th>Scadenza</th>
						</tr>
					</thead>
					<tbody>
					{cassetto != null ? 
					<tr>
						<td>Cassetto fiscale</td>
						<td><ItalianDateRenderer date={cassetto.endDate} /></td>
					</tr>
						: ""}
					{fatturaElettronica != null ? 
					<tr>
						<td>Fatturazione elettronica</td>
						<td><ItalianDateRenderer date={fatturaElettronica.endDate} /></td>
					</tr>
						: ""}
					</tbody>
				</table>
			</div>
		);

	}

	createDownloadRulesComponent(downloadRules) {
		//{byType:[], bySectional:[], byInvoiceId:[], byDocumentType:[], storageDownload: false, downloadAll: false}
		return <div>
			<div className="row">
				<h3>Regole download</h3>
			</div>
			<p>Scarica tutte: {downloadRules.downloadAll ? <b>SI</b>: <b>NO</b>}</p>	
			<p>Scarica tutte per conservare: {downloadRules.storageDownload ? <b>SI</b> : <b>NO</b> }</p>
			{downloadRules.byType.map(byType => <p>Scarica per tipo: {byType.invoiceType}</p>)}
			{downloadRules.byDocumentType.map(byDType => <p>Scarica per tipo documento: <b>{byDType.invoiceType}</b> - <b>{byDType.invoiceDocumentType}</b></p>)}
			{downloadRules.bySectional.map(bySec => <p>Scarica per tipo documento: <b>{bySec.invoiceType}</b> - Separatore: <b>{bySec.separator}</b> Sezionale: <b>{bySec.sectional}</b> Posizione: <b>{bySec.sectionalIndex}</b> </p>)}
			{downloadRules.byInvoiceId.map(byId => <p>Scarica per id: <b>{byId.invoiceId}</b></p>)}
		</div>
	}

	mapAccountsForSelect() {
		const { accounts } = this.state;
		return accounts.map((v) => {
			return {
				label: v.id + " - " + v.fiscalCode,
				value: v.id.toString(),
			};
		});
	}

	createSelect(path, values, edit, hasEmpty = false) {
		const configuration = edit
			? { ...this.state.editConfiguration }
			: { ...this.state.configuration };
		const selectedValue = configuration[path] + "";
		return (
			<Select
				values={values}
				hasEmpty={hasEmpty}
				selected={selectedValue}
				onChangeHandler={(newValue) => {
					const { edit } = this.state;
					if (!edit) return;
					const conf = { ...this.state.editConfiguration };
					conf[path] = newValue;
					this.setState({ editConfiguration: conf });
				}}
				readonly={!edit}
			/>
		);
	}

	createBooleanSelect(path, edit = true) {
		const conf = { ...this.state.editConfiguration };
		return (
			<BooleanSelect
				currentValue={conf[path]}
				onChange={(v) => {
					const conf = { ...this.state.editConfiguration };
					conf[path] = v;
					if (edit) {
						this.setState({ editConfiguration: conf });
					} else {
						this.setState({ configuration: conf });
					}
				}}
			/>
		);
	}

	createEditableField(
		label,
		path,
		edit,
		roTransformer,
		editTransformer,
		editCreator = undefined
	) {
		const configuration = edit
			? { ...this.state.editConfiguration }
			: { ...this.state.configuration };
		return (
			<EditableInput
				name={path}
				label={label}
				value={configuration[path]}
				edit={edit}
				editValueTransformer={editTransformer}
				readValueTransformer={roTransformer}
				onValueChange={
					edit
						? (newVal) => {
								let conf = { ...this.state.editConfiguration };
								conf[path] = newVal;
								this.setState({
									editConfiguration: conf,
								});
						  }
						: undefined
				}
				editCreator={editCreator}
			/>
		);
	}
}

export default AccountingConfigurationFrame;
