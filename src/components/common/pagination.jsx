import React, { Component } from "react";
import _ from "lodash";

class Pagination extends Component {
	getClasses = (page) => {
		let classes = "page-item";
		return page === this.props.currentPage ? classes + " active" : classes;
	};
	render() {
		const { itemsCount, itemsPerPage, onPageChange } = this.props;
		let pages = Math.ceil(itemsCount / itemsPerPage);
		if (pages < 2) return null;
		return (
			<nav>
				<ul className="pagination m-4">
					{_.range(1, pages + 1).map((n) => (
						<li key={"page_" + n} className={this.getClasses(n)}>
							<button
								className="page-link"
								onClick={() => onPageChange(n)}
							>
								{n}
							</button>
						</li>
					))}
				</ul>
			</nav>
		);
	}
}

export default Pagination;
