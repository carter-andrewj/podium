import React, { Component } from 'react';





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
				{this.props.children}
			</div>
		);

	}
}

export default OwnedPost;
