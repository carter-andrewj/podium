import React, { Component } from 'react';

import PostContent from '../postcontent';




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
				<PostContent post={this.props.retraction} />
				<div className="retraction-spacer"></div>
				{this.props.children}
			</div>
		);

	}
}

export default RetractedPost;
