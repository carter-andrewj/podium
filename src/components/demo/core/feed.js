import React, { Component } from 'react';
import '../../../App.css';

import Send from './send';
import Post from './posts/post';





class Feed extends Component {

	constructor() {
		super()
		this.state = {
			ready: {},
			show: {}
		}
		this.readyPost = this.readyPost.bind(this);
		this.showPosts = this.showPosts.bind(this);
	}


	readyPost(address) {
		const state = this.state;
		if (Object.keys(this.state.show).length < 5) {
			state.show[address] = true;
		} else {
			state.ready[address] = true;
		}
		this.setState(state);
	}


	showPosts() {
		const state = this.state;
		Object.keys(this.state.ready).forEach(k => {
			state.show[k] = true;
		});
		state.ready = {};
		this.setState(state);
	}


	render() {

		// Handle pending posts
		const waiting = Object.keys(this.state.ready).length;
		let pending;
		if (waiting > 0) {
			pending = <div
				className="pending-posts card"
				onClick={this.showPosts.bind(this)}>
				{"show " + waiting + " new posts"}
			</div>
		}

		//TODO - Order posts by -received- timestamp, not -sent-

		//TODO - Show placeholder while no posts are in feed

		//TODO - Entry transition when new posts are loaded

		//TODO - Put "no more posts" at page footer

		// Build feed
		return (
			<div ref="feed" className="Feed container">
				<div className="send-box card">
					<Send
						getProfileFromID={this.props.getProfileFromID}
						getTopicFromID={this.props.getTopicFromID}
						sendPost={this.props.sendPost}
					/>
				</div>
				{pending}
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

									ready={this.state.show[post.address]}
									readyPost={this.readyPost}

									getPost={this.props.getPost}
									sendPost={this.props.sendPost}

									getProfileFromID={this.props.getProfileFromID}
									getTopicFromID={this.props.getTopicFromID}
									
									promotePost={this.props.promotePost}
									reportPost={this.props.reportPost}

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
