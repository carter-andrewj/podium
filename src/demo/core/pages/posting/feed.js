import React, { Component } from 'react';
import { Map, is, fromJS } from 'immutable';

import Send from './send';
import Thread from './thread';





class Feed extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				active: {},			// Currently displayed threads
				pending: {			// Next update of threads
					"threads": {},
					"counter": 0
				}
			}))
		}
		this.showPosts = this.showPosts.bind(this);
	}


	updateState(up, callback) {
		this.setState(
			({data}) => { return {data: up(data)} },
			callback
		);
	}


	componentDidMount() {
		this.buildPosts(Map({}))
	}


	componentDidUpdate(lastProps) {
		if (!is(this.props.posts, lastProps.posts)) {
			this.buildPosts(lastProps.posts);
		}
	}


	buildPosts(lastPosts) {

		console.log("OVERALL THREADS:", this.props.posts.toJS());
		console.log("OUTPUT THREADS BEFORE:", this.state.data.get("active").toJS())

		const threads = this.props.posts
			.filter((thisPost, id) => {
				const lastPost = lastPosts.get(id);
				return (thisPost.get("content") && !is(thisPost, lastPost));
			})
			.reduce((result, post) => {
				const origin = post.get("origin");
				if (!result.getIn(["threads", origin])) {
					if (this.state.data.getIn(["active", origin])) {
						result = result.setIn(["threads", origin],
							this.state.data.getIn(["active", origin]))
					} else {
						result = result.setIn(["threads", origin], Map({
						  	"posts": Map({}),
							"time": 0
						}));
					}
				}
				return result
					.updateIn(["threads", origin, "posts"],
							  (p) => p.set(post.get("address"), post))
					.updateIn(["threads", origin, "time"],
							  (t) => Math.max(t, post.get("received")))
					.update("counter", (p) => p += 1);
			}, this.state.data.get("pending"));
		if (threads.get("counter") > 0) {
			this.updateState(state => state
				.set("pending", threads)
			);
			console.log("PENDING THREADS BEFORE:", this.state.data.get("pending").toJS())
		} else {
			console.log("PENDING THREADS BEFORE: (unchanged)")
		}

	}


	showPosts() {
		console.log("UPDATED ACTIVE THREADS")
		this.updateState(state => state
			.update("active",
				(a) => a.merge(state.getIn(["pending", "threads"])))
			.set("pending", Map({ counter: 0 }))
		);
	}


	render() {

		// Handle pending posts
		let waiting;
		if (this.state.data.getIn(["pending", "counter"]) > 0) {
			waiting = <div
				className="pending-posts card"
				onClick={this.showPosts.bind(this)}>
				{"show " + this.state.data.getIn(["pending", "counter"]) + " new posts"}
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
						reply={false}
						activeUser={this.props.activeUser}
						getProfileFromID={this.props.getProfileFromID}
						getTopicFromID={this.props.getTopicFromID}
						sendPost={this.props.sendPost}
					/>
				</div>
				{waiting}
				<div className="row">
					<div className="col-1"></div>
					<div className="col-10 input-col">
						{this.state.data
							.get("active")
							.map((thread, id) => thread.set("origin", id))
							.sort((a, b) => a.get("time") < b.get("time") ? 1 : -1)
							.map(thread => {
								console.log("THREAD: ", thread.toJS())
								return <Thread

									key={"thread-" + thread.get("origin")}
									thread={thread.get("origin")}

									activeUser={this.props.activeUser}

									users={this.props.users}
									posts={thread.get("posts")}

									getPost={this.props.getPost}
									sendPost={this.props.sendPost}

									getProfileFromID={this.props.getProfileFromID}
									getTopicFromID={this.props.getTopicFromID}
									
									promotePost={this.props.promotePost}
									reportPost={this.props.reportPost}

									amendPost={this.props.amendPost}
									retractPost={this.props.retractPost}

									setCoreMode={this.props.setCoreMode}

									followUser={this.props.followUser}
									unfollowUser={this.props.unfollowUser}

								/>
							})
							.toList()
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
