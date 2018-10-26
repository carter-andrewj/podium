import React, { Component } from 'react';
import '../../../../App.css';




class ReportPost extends Component {

	constructor() {
		super()
		this.state = {

		}
	}

	render() {

		// Build feed
		return (
			<div className="report-post">
				{this.props.children}
			</div>
		);

	}
}

export default ReportPost;
