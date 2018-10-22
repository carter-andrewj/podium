import React, { Component } from 'react';
import '../../../../App.css';

import PostCore from './postcore';



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
				<div className="post-taxonomy owned-taxonomy">you</div>
				<PostCore post={this.props.post} />
			</div>
		);

	}
}

export default OwnedPost;
