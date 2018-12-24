import React, { Component } from 'react';
import { Map, List, fromJS } from 'immutable';

import Popup from 'demo/core/widgets/popup';



class Report extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				charges: List([ Map({
					subject: null,	// address of reported post
					article: null,	// id of the article of the code violated
					content: "",	// text content of the report
				)}])
			}))
		}
	}

	render() {

		//TODO - Ask user to confirm cancel on popup close
		return (
			<div ref="report" className="report">
				<Popup onClose={this.props.cancelReport}>
					<div className="report-heading">
						Heading
					</div>
					<div className="report-subject">
						{this.props.children}
					</div>
					<div className="report-violations-box">
					</div>
					<div className="report-buttons">
						Cancel
						Send Report
						Add Violation
					</div>
				</Popup>
			</div>
		);
	}

}

export default Report;
