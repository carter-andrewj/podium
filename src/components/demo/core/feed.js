import React, { Component } from 'react';
import '../../../App.css';

import Send from './send';
import Post from './posts/post';





class Feed extends Component {

	constructor() {
		super()
		this.state = {

		}
	}

	sendPost() {

	}

	render() {

		// Build feed
		return (
			<div ref="feed" className="Feed container">
				<Send sendPost={this.sendPost} />
				<div className="row">
					<div className="col-sm-12 input-col">
						{Object.keys(this.props.posts).map(k =>
							<Post
								key={k}
								post={this.props.posts[k]}
							/>
						)}
					</div>
				</div>
			</div>
		);

	}
}

export default Feed;
