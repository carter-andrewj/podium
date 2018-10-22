import React, { Component } from 'react';
import '../../../../App.css';

import PostCore from './postcore';




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
				<PostCore post={this.props.post} />
			</div>
		);

	}
}

export default ReportPost;
