import React, { Component } from "react";
import accountingApi from "../../services/accountingApi";
import EditableInput, {
	booleanTransformerToString,
} from "./../common/editableInput";
import Select, { BooleanSelect } from "../common/select";
import Button, {
	ConfirmButton,
	CancelButton,
	IconButton,
} from "../common/buttons";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

class AccountingConfigurationFrame extends Component {
	state = {
		configuration: null,
		edit: false,
		editConfiguration: null,
		accounts: [],
		importing: false,
	};
	async componentDidMount() {
		let { configuration, accounts } = this.state;
		if (accounts.length === 0) {
			accounts = await this.loadAdeAccounts();
		}
		if (configuration === null) {
			configuration = await this.loadConfiguration();
		}
		this.setState({ configuration, accounts });
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
		const { data } = await accountingApi.getAccountingConfiguration(
			this.getFirm().id
		);
		return data;
	}

	async loadAdeAccounts() {
		const { data } = await accountingApi.getAdeAccounts();
		return data;
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
		this.setState({ importing: true });
		console.log("Import started");
		try {
			await accountingApi.runAccountingJob([this.getFirm().id]);
			toast.success("Job completato");
		} catch {
			toast.error(
				"Si è verificato un errore durante l'esecuzione del job"
			);
		} finally {
			this.setState({ importing: false });
		}
	};

	createPage() {
		const { edit } = this.state;
		var accounts = this.mapAccountsForSelect();
		return (
			<div>
				{edit ? (
					<div>
						<ConfirmButton
							text="Salva"
							action={() => this.exitEditMode(true)}
						/>
						<CancelButton
							text="Annulla"
							action={() => this.exitEditMode(false)}
						/>
					</div>
				) : (
					<div>
						<Button
							classes="btn-primary"
							content="Modifica"
							onClick={this.setEditMode}
						/>
					</div>
				)}
				{this.createEditableField(
					"Stato attivazione",
					"enabled",
					edit,
					booleanTransformerToString,
					undefined,
					() => this.createBooleanSelect("enabled")
				)}
				{!edit ? (
					<label>
						<IconButton
							icon={faPlay}
							classes="btn-success"
							onClick={this.startImport}
						/>
					</label>
				) : (
					<span />
				)}
				<h3>Agenzia delle Entrate</h3>
				{
					<label>
						Account
						{this.createSelect("adeAccount", accounts, edit, true)}
					</label>
				}
				{this.createEditableField(
					"Usa Partita IVA",
					"useVatNumber",
					edit,
					booleanTransformerToString,
					undefined,
					() => this.createBooleanSelect("useVatNumber")
				)}
				<h3>Fatture</h3>
				<h5>Dettagli fatture</h5>
				{this.createEditableField(
					"Fatture emesse",
					"invoiceGetSent",
					edit,
					booleanTransformerToString,
					undefined,
					() => this.createBooleanSelect("invoiceGetSent")
				)}
				{this.createEditableField(
					"Fatture ricevute",
					"invoiceGetReceived",
					edit,
					booleanTransformerToString,
					undefined,
					() => this.createBooleanSelect("invoiceGetReceived")
				)}
				{this.createEditableField(
					"Fatture non consegnate",
					"invoiceGetMissed",
					edit,
					booleanTransformerToString,
					undefined,
					() => this.createBooleanSelect("invoiceGetMissed")
				)}
				<h5>Download file</h5>
				{this.createEditableField(
					"Fatture emesse",
					"invoiceDownloadSent",
					edit,
					booleanTransformerToString,
					undefined,
					() => this.createBooleanSelect("invoiceDownloadSent")
				)}
				{this.createEditableField(
					"Fatture ricevute",
					"invoiceDownloadReceived",
					edit,
					booleanTransformerToString,
					undefined,
					() => this.createBooleanSelect("invoiceDownloadReceived")
				)}
				{this.createEditableField(
					"Fatture non consegnate",
					"invoiceDownloadMissed",
					edit,
					booleanTransformerToString,
					undefined,
					() => this.createBooleanSelect("invoiceDownloadMissed")
				)}
				<h3>Corrispettivi</h3>
				{this.createEditableField(
					"Stato",
					"feeEnabled",
					edit,
					booleanTransformerToString,
					undefined,
					() => this.createBooleanSelect("feeEnabled")
				)}
				<h3>Bollo</h3>
				{this.createEditableField(
					"Stato",
					"bolloEnabled",
					edit,
					booleanTransformerToString,
					undefined,
					() => this.createBooleanSelect("bolloEnabled")
				)}
			</div>
		);
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
