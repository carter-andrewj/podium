import React, { Component } from 'react';
import '../../../../App.css';

import PostCore from './postcore';




class RetractedPost extends Component {

	constructor() {
		super()
		this.state = {

		}
	}

	render() {

		// Build feed
		return (
			<div className="owned-post">
				<div className="post-taxonomy owned-taxonomy">retraction</div>
				<PostCore post={this.props.retraction} />
				<div className="retraction-spacer"></div>
				<PostCore post={this.props.post} />
			</div>
		);

	}
}

export default RetractedPost;
