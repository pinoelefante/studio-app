import React, { Component } from "react";

class TabPanel extends Component {
	render() {
		const { tabs } = this.props;
		return (
			<React.Fragment>
				<ul className="nav nav-tabs" role="tablist">
					{tabs.map((tab) => this.renderTab(tab))}
				</ul>
				<div style={{ padding: "10px" }} className="tab-content">
					{tabs.map((tab) => this.renderContent(tab))}
				</div>
			</React.Fragment>
		);
	}

	renderTab(tab) {
		const { id, label, main } = tab;
		return (
			<li key={id} className="nav-item">
				<a
					className={this.getTabClass(tab)}
					id={`${id}-tab`}
					data-toggle="tab"
					href={`#${id}`}
					role="tab"
					aria-controls={id}
					aria-selected={main ? "true" : "false"}
				>
					{label}
				</a>
			</li>
		);
	}

	renderContent(tab) {
		const { id, content } = tab;
		return (
			<div
				key={id}
				className={this.getContentClass(tab)}
				id={id}
				role="tabpanel"
				aria-labelledby={`${id}-tab`}
			>
				{content}
			</div>
		);
	}

	getTabClass(tab) {
		const { main } = tab;
		let classes = "nav-link";
		return main ? classes + " active" : classes;
	}

	getContentClass(tab) {
		const { main } = tab;
		let classes = "tab-pane fade";
		return main ? classes + " show active" : classes;
	}
}

export default TabPanel;
