import React, { Component } from 'react';
import { Map, fromJS, is } from 'immutable';

import Thread from './thread';
import Send from './send';






class Feed extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				pending: 0,		// Total posts waiting to be published
				published: 0,	// Total published posts
				next: 0,		// ID of the next feed
				feeds: []		// Stored feed components (to preserve ordering)
			}))
		}
	}


	updateState(up, callback) {
		this.setState(
			({data}) => { return { data: up(data)} },
			callback
		);
	}


	componentDidMount() {

		// Automatically publish posts
		if (this.props.feedData.get("published") < 10) {
			this.props.publishPosts()
		}

	}


	componentDidUpdate(lastProps) {

		// Auto-publish on updates if feed is empty
		if (!is(this.props.feedData, lastProps.feedData) &&
				this.props.feedData.get("published") < 10) {
			this.props.publishPosts()
		}

	}


	// buildPosts(lastPosts) {
	// 	const threads = this.props.posts
	// 		.filter((thisPost, id) => {
	// 			const lastPost = lastPosts.get(id);
	// 			return (thisPost.get("content") && !is(thisPost, lastPost));
	// 		})
	// 		.reduce((result, post) => {
	// 			const origin = post.get("origin");
	// 			if (!result.getIn(["threads", origin])) {
	// 				if (this.state.data.getIn(["active", origin])) {
	// 					result = result.setIn(["threads", origin],
	// 						this.state.data.getIn(["active", origin]))
	// 				} else {
	// 					result = result.setIn(["threads", origin], Map({
	// 					  	"posts": Map({}),
	// 						"time": 0
	// 					}));
	// 				}
	// 			}
	// 			return result
	// 				.updateIn(["threads", origin, "posts"],
	// 						  (p) => p.set(post.get("address"), post))
	// 				.updateIn(["threads", origin, "time"],
	// 						  (t) => Math.max(t, post.get("received")))
	// 				.update("counter", (p) => p += 1);
	// 		}, this.state.data.get("pending"));
	// 	if (threads.get("counter") > 0) {
	// 		this.updateState(state => state
	// 			.set("pending", threads)
	// 		);
	// 	}
	// }


	// showPosts() {
	// 	// this.updateState(state => state
	// 	// 	.set("pending", 0)
	// 	// 	.update("feeds", f => f.push(<Feed

	// 	// 		key={`feed-${state.next}`}
	// 	// 		feedID={state.next}

	// 	// 		activeUser={this.props.activeUser}
	// 	// 		getProfile={this.props.getProfile}

	// 	// 		posts={this.props.posts}

	// 	// 		getPost={this.props.getPost}
	// 	// 		sendPost={this.props.sendPost}
	// 	// 		publishPosts={this.props.publishPosts}
				
	// 	// 		promotePost={this.props.promotePost}
	// 	// 		reportPost={this.props.reportPost}
	// 	// 		amendPost={this.props.amendPost}
	// 	// 		retractPost={this.props.retractPost}

	// 	// 		followUser={this.props.followUser}
	// 	// 		unfollowUser={this.props.unfollowUser}

	// 	// 	/>))
	// 	// 	.update("next", n => n + 1)
	// 	// );
	// }


	render() {

		// Handle pending posts
		let pending;
		const pendCount = this.props.feedData.get("pending")
		if (pendCount > 0) {
			pending = <div
				className="pending-posts card"
				onClick={() => this.props.publishPosts()}>
				{`show ${pendCount} new posts`}
			</div>
		}

		//TODO - Auto-publish posts if the feed is empty

		//TODO - Show placeholder while no posts are in feed

		//TODO - Entry transition when new posts are loaded

		//TODO - Put "no more posts" at page footer

		console.log(this.props.feedData.toJS())

		// Build feed
		return (
			<div ref="feed" className="feedpage">
				<div className="send-box card">
					<Send
						reply={false}
						activeUser={this.props.activeUser}
						getProfile={this.props.getProfile}
						getTopic={this.props.getTopic}
						sendPost={this.props.sendPost}
					/>
				</div>
				{pending}
				<div className="feed-core">
					{this.props.feedData
						.get("threads")
						.map((thread, i) => <Thread

							key={`thread-${i}`}
							id={`thread-${i}`}

							activeUser={this.props.activeUser}
							getProfile={this.props.getProfile}

							posts={thread}

							getPost={this.props.getPost}
							sendPost={this.props.sendPost}
							
							promotePost={this.props.promotePost}
							reportPost={this.props.reportPost}
							amendPost={this.props.amendPost}
							retractPost={this.props.retractPost}

							followUser={this.props.followUser}
							unfollowUser={this.props.unfollowUser}

						/>)
						.toList()
					}
					<div className="footer-spacer"></div>
				</div>
			</div>
		);

	}
}

export default Feed;
