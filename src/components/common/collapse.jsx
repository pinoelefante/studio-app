import React, { Component } from "react";

class Collapse extends React.Component {
    render() { 
        const {
            id,
			title,
            body
		} = this.props;
        let headingLabelId = "heading_" + id;
        let collapseId = "collapse_" + id;
        let accordionId = "accordion_" + id;

        return <div class="accordion" id={accordionId}>
             <div className="card">
                <div className="card-header" id={headingLabelId}>
                    <h5 class="mb-0">
                        <button class="btn btn-link" type="button" data-toggle="collapse" data-target={"#" + collapseId} aria-expanded="true" aria-controls={collapseId}>{title}</button>
                    </h5>
                </div>

                <div id={collapseId} class="collapse show" aria-labelledby={headingLabelId} data-parent={"#" + accordionId}>
                    <div class="card-body">
                        {body}
                    </div>
                </div>
             </div>
            </div>;
    }
}
 
export default Collapse;