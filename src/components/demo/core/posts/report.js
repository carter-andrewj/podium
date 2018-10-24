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
				<div className="post-taxonomy report-taxonomy">reported</div>
				{this.props.children}
			</div>
		);

	}
}

export default ReportPost;
