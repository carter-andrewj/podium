import React, { Component } from 'react';
import '../../../../App.css';




class OwnedPost extends Component {

	constructor() {
		super()
		this.state = {

		}
	}

	render() {

		// Build feed
		return (
			<div className="owned-post">
				<div className="post-taxonomy owned-taxonomy">
					<p className="taxonomy-text">you</p>
				</div>
				{this.props.children}
			</div>
		);

	}
}

export default OwnedPost;
