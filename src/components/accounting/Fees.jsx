import React, { Component } from "react";
import accountingApi from "../../services/accountingApi";
import firmApi from "../../services/firmApi";
import MonthSelector from "../common/monthSelector";
import YearSelector from "../common/yearSelector";
import Select from "../common/select";
import _ from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import ItalianDateRenderer from "../common/date";

class FeesFrame extends Component {
	state = {
		fees: null,
		places: null,
		selectedPlaceId: null,
		year: new Date().getFullYear(),
		month: new Date().getMonth() + 1,
	};

	async componentDidMount() {
		let { year, month, selectedPlaceId } = this.state;
		let { fees } = this.state;
		// load places
		const places = await this.loadPlaces();
		// load fees
		if (fees === null) {
			fees = await this.loadFees(year, month);
		}
		if (places && places.length > 0) {
			selectedPlaceId = places[0].id;
		}
		this.setState({ fees, places, selectedPlaceId });
	}

	render() {
		const { fees } = this.state;
		if (fees === null) {
			return "Caricamento in corso";
		} else if (fees.length > 0) {
			return this.populateTable(fees);
		} else {
			return "Non ci sono corrispettivi";
		}
	}

	getFirm = () => {
		return this.props.firm;
	};

	async loadPlaces() {
		const firm = this.getFirm();
		const { data } = await firmApi.getFirmPlaces(firm.id);
		return data;
	}

	async loadFees(year, month) {
		const firm = this.getFirm();
		if (!firm) return;
		const { data: fees } = await accountingApi.getFees(
			year,
			month,
			true,
			false,
			firm.id
		);
		return fees;
	}

	onYearChanged = async (newYear) => {
		const { month } = this.state;
		const fees = await this.loadFees(newYear, month);
		this.setState({ year: newYear, fees });
	};

	onMonthChanged = async (newMonth) => {
		const { year } = this.state;
		const fees = await this.loadFees(year, newMonth);
		this.setState({ month: newMonth, fees });
	};

	onPlaceChanged = (placeId) => {
		this.setState({ selectedPlaceId: parseInt(placeId) });
	};

	createPlaceValues(places) {
		return places.map((p) => {
			return { label: p.name, value: p.id };
		});
	}

	hasFeeDetails(fees) {
		return !(
			fees === undefined ||
			fees === null ||
			fees.details === undefined ||
			fees.details === null ||
			fees.details.length === 0
		);
	}

	createFeeTable(fees, showIfEmpty = false, title = "") {
		if (!this.hasFeeDetails(fees)) {
			return showIfEmpty ? (
				<p>Non ci sono corrispettivi per questo mese</p>
			) : (
				<span />
			);
		}
		const { details, total } = fees;
		console.log("Fee details", details);
		return (
			<div>
				<p>
					<b>{title}</b>
				</p>
				<table className="table table-sm">
					<thead>
						<tr>
							<th>Data</th>
							<th>Valore</th>
						</tr>
					</thead>
					<tbody>
						{details.map((d) => (
							<tr key={"fee_" + d.date + "_" + d.amount}>
								<td>
									<ItalianDateRenderer date={d.date} />
								</td>
								<td>€ {d.amount}</td>
							</tr>
						))}
						<tr>
							<td>
								<b>Totale</b>
							</td>
							<td>
								<b>€ {total}</b>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		);
	}

	populateTable(fees) {
		if (!fees) {
			// SHOW RELOAD BUTTON
			return <span />;
		}
		const { places, selectedPlaceId, year, month } = this.state;
		const firm = this.getFirm();
		const assigned = _.find(fees, (f) => f.placeId === selectedPlaceId);
		const unassigned = _.filter(fees, (f) => f.id === null);
		const currentYear = new Date().getFullYear();
		return (
			<div>
				<table>
					<tbody>
						<tr>
							<td>
								<label htmlFor="yearSelector">Anno</label>
								<YearSelector
									from={2020}
									to={currentYear}
									current={currentYear}
									onYearChanged={this.onYearChanged}
								/>
							</td>
							<td>
								<label htmlFor="monthSelector">Mese</label>
								<MonthSelector
									lang="it"
									onMonthChanged={this.onMonthChanged}
								/>
							</td>
							<td>
								{places && places.length <= 1 ? (
									<span />
								) : (
									<div>
										<label>Sede</label>
										<Select
											values={this.createPlaceValues(
												places
											)}
											hasEmpty={false}
											selected={selectedPlaceId}
											onChangeHandler={
												this.onPlaceChanged
											}
										/>
									</div>
								)}
							</td>
						</tr>
					</tbody>
				</table>
				{this.createDownloadButton(
					assigned,
					unassigned,
					year,
					month,
					firm
				)}
				{this.createFeeTable(assigned, true, null)}
				{this.createFeeTable(
					unassigned,
					false,
					"Non assegnati ad una sede"
				)}
			</div>
		);
	}

	createDownloadButton(assigned, unassigned, year, month, firm) {
		if (this.hasFeeDetails(assigned) || this.hasFeeDetails(unassigned))
			return (
				<div style={{ marginTop: "10px" }}>
					<a
						href={accountingApi.getFirmFeeDownload(
							year,
							month,
							firm.id
						)}
					>
						<button className="btn btn-primary">
							<FontAwesomeIcon icon={faDownload} />
							Scarica PDF
						</button>
					</a>
				</div>
			);
		return <span />;
	}
}

export default FeesFrame;
