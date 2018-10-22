import React, { Component } from 'react';
import '../../../../App.css';




class PostCore extends Component {

	constructor() {
		super()
		this.state = {

		}
	}

	render() {

		// Build feed
		return (
			<div className="post-core card">
				<div className="row">
					<div className="col-1 post-user">
						<img
							className="post-profilepic"
							src={this.props.post.user.picture}
							alt=""
						/>
					</div>
					<div className="col-10 post-middle">
						<p className="post-username">{this.props.post.user.name}</p>
						<p className="post-content">{this.props.post.content}</p>
					</div>
					<div className="col-1 post-buttons">
					</div>
				</div>
			</div>
		);

	}
}

export default PostCore;
