import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortDown, faSortUp } from "@fortawesome/free-solid-svg-icons";
import Pagination from "./pagination";
import { paginate } from "../../utils/paginate";

class TableHeader extends Component {
	raiseSort = (path) => {
		const sortColumn = { ...this.props.sortColumn };
		if (sortColumn.path === path) {
			sortColumn.order = sortColumn.order === "asc" ? "desc" : "asc";
		} else {
			sortColumn.path = path;
			sortColumn.order = "asc";
		}
		this.props.onSortColumn(sortColumn);
	};

	getStyle = (column) => {
		const { sortColumn } = this.props;
		if (sortColumn.path !== column.path) return "";
		if (sortColumn.order === "asc")
			return <FontAwesomeIcon icon={faSortUp} />;
		return <FontAwesomeIcon icon={faSortDown} />;
	};

	render() {
		const { columns } = this.props;
		return (
			<thead>
				<tr>
					{columns.map((c) => (
						<th
							className="clickable"
							key={"th_" + (c.path || c.key)}
							onClick={() => this.raiseSort(c.path)}
						>
							{c.label} {this.getStyle(c)}
						</th>
					))}
				</tr>
			</thead>
		);
	}
}

TableHeader.propsTypes = {
	columns: PropTypes.array.isRequired,
	sortedColumn: PropTypes.object,
	onSortColumn: PropTypes.func,
};

class TableBody extends Component {
	renderCell = (item, column) => {
		if (column.renderContent) return column.renderContent(item);
		if (column.content) return column.content;
		return _.get(item, column.path);
	};
	renderRowKey = (item, keys) => {
		return "tr_" + keys.map((k) => _.get(item, k)).join("_");
	};
	renderCellKey = (item, keys, col) => {
		const pathValue = col.path || Math.random() * 100000;
		return "td_" + pathValue + this.renderRowKey(item, keys);
	};
	render() {
		const { data, columns, keyFields } = this.props;
		return (
			<tbody>
				{data.map((item) => (
					<tr key={this.renderRowKey(item, keyFields)}>
						{columns.map((col) => (
							<td key={this.renderCellKey(item, keyFields, col)}>
								{this.renderCell(item, col)}
							</td>
						))}
					</tr>
				))}
			</tbody>
		);
	}
}

class Table extends Component {
	state = {
		sortColumn: {
			path: this.props.sortPath || this.props.columns[0].path,
			order: this.props.sortOrder || "asc",
		},
		currentPage: 1,
		itemsPerPage:
			this.props.itemsPerPage === undefined
				? 20
				: this.props.itemsPerPage,
	};

	handlePageChange = (page) => {
		this.setState({ currentPage: page });
	};

	handleSort = (column) => {
		if (column.path === undefined) {
			return;
		}
		this.setState({ sortColumn: column });
	};

	getItems = () => {
		const { sortColumn, currentPage, itemsPerPage } = this.state;
		const ordered = _.orderBy(
			this.props.data,
			[sortColumn.path],
			[sortColumn.order]
		);
		return paginate(ordered, currentPage, itemsPerPage);
	};

	render() {
		const { data, columns, keyFields } = this.props;
		const { sortColumn, itemsPerPage, currentPage } = this.state;
		const items = this.getItems();

		return (
			<React.Fragment>
				<table className="table table-sm table-striped table-hover">
					<TableHeader
						columns={columns}
						onSortColumn={this.handleSort}
						sortColumn={sortColumn}
					/>
					<TableBody
						data={items}
						columns={columns}
						keyFields={keyFields}
					/>
				</table>
				<Pagination
					itemsCount={data.length}
					itemsPerPage={itemsPerPage}
					currentPage={currentPage}
					onPageChange={this.handlePageChange}
				/>
			</React.Fragment>
		);
	}
}

export default Table;
