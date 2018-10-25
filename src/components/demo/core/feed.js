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

	render() {

		//TODO - Sort posts

		// Build feed
		return (
			<div ref="feed" className="Feed container">
				<Send
					getProfileFromID={this.props.getProfileFromID}
					getTopicFromID={this.props.getTopicFromID}
					sendPost={this.props.sendPost}
				/>
				<div className="row">
					<div className="col-1"></div>
					<div className="col-10 input-col">
						{Object.keys(this.props.posts)
							.sort((a, b) => {
								const x = this.props.posts[a];
								const y = this.props.posts[b];
								return (x.created < y.created) ? 1 : -1;
							})
							.map(k => {
								const post = this.props.posts[k];
								const user = this.props.users[post.author];
								return <Post
									key={k}
									user={user}
									post={post}
									getPost={this.props.getPost}
								/>
							})
						}
						<div className="footer-spacer"></div>
					</div>
					<div className="col-1"></div>
				</div>
			</div>
		);

	}
}

export default Feed;
