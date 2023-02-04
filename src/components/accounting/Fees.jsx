import React, { Component } from "react";
import accountingApi from "../../services/accountingApi";
import MonthSelector from "../common/monthSelector";
import YearSelector from "../common/yearSelector";
import Select from "../common/select";
import { IconButton } from "../common/buttons";
import _ from "lodash";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import ItalianDateRenderer from "../common/date";

class FeesFrame extends Component {
	render() {
		return this.populateTable();
	}

	onYearChanged = async (newYear) => {
		const { month, onPeriodChanged } = this.props;
		onPeriodChanged(newYear, month);
	};

	onMonthChanged = async (newMonth) => {
		const { year, onPeriodChanged } = this.props;
		onPeriodChanged(year, newMonth);
	};

	onPlaceChanged = (placeId) => {
		const { onPlaceChanged } = this.props;
		onPlaceChanged(parseInt(placeId));
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

	createDataAccoglienza = (date, diff) => {
		let classes = diff > 12 ? "late-fee" : "";
		return <span className={classes}>
			{
				date.map(dataAcc => <span><ItalianDateRenderer date={dataAcc} />&nbsp;</span>)
			}
		</span>;
		
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
							<th>Data invio</th>
						</tr>
					</thead>
					<tbody>
						{details.map((d) => (
							<tr key={"fee_" + d.date + "_" + d.amount}>
								<td>
									<ItalianDateRenderer date={d.date} />
								</td>
								<td>€ {d.amount}</td>
								<td>
								{
									this.createDataAccoglienza(d.dataAccoglienza, d.diffGiorni)
								}
							</td>
							</tr>
						))}
						<tr>
							<td>
								<b>Totale</b>
							</td>
							<td>
								<b>€ {total}</b>
							</td>
							<td>&nbsp;</td>
						</tr>
					</tbody>
				</table>
			</div>
		);
	}

	populateTable() {
		const { fees, places, selectedPlaceId, year, month, firm } = this.props;
		if (!fees) {
			// SHOW RELOAD BUTTON
			return <span>Non ci sono corrispettivi</span>;
		}
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
		if (this.hasFeeDetails(assigned) || this.hasFeeDetails(unassigned)) {
			const link = accountingApi.getFirmFeeDownload(
				year,
				month,
				true,
				firm.id
			);
			return (
				<div style={{ marginTop: "10px" }}>
					<IconButton
						icon={faDownload}
						text="Scarica PDF"
						href={link}
						classes="btn-primary"
					/>
				</div>
			);
		}
		return <span />;
	}
}

export default FeesFrame;
