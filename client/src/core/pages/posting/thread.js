import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';

import Post from './post';



const tempPost = Map({
	content: "",
	author: null
})


class Thread extends Component {


	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				posts: []
			}))
		}
	}


	updateState(up, callback) {
		this.setState(
			({data}) => { return { data: up(data)} },
			callback
		);
	}



	componentWillMount() {

		// Create initial population of empty posts
		const placeholders = this.props.posts
			.map(address => {
				if (typeof post === "string") {
					return tempPost.set("address", address)
				} else {
					return Map({
						type: "spacer",
						value: address
					})
				}
			}, Map())

		// Store placeholders in state and trigger
		// loading of posts
		this.updateState(
			state => state.set("posts", placeholders),
			() => this.props.posts
				.map((address, i) =>
					this.props.getPost(address, false)
						.then(post =>
							this.updateState(state => state
								.setIn(["posts", i], post)
							)
						)
				)

		)

	}


	render() {

		//TODO - Filter data passed down to each post
		
		// Render thread
		return <div className="thread-holder">
			<div className="thread-card card">
				{this.props.posts.map(post => {

					if (typeof post === "number") {

						return <div
							key={`${this.props.id}-spacer`}
							className="post-spacer">
							{`load ${post} posts`}
						</div>

					} else {

						return <Post

							key={`${this.props.id}-${post}`}
							post={post}

							activeUser={this.props.activeUser}
							getProfile={this.props.getProfile}

							getPost={this.props.getPost}
							sendPost={this.props.sendPost}

							promotePost={this.props.promotePost}
							reportPost={this.props.reportPost}
							retractPost={this.props.retractPost}
							amendPost={this.props.amendPost}

							followUser={this.props.followUser}
							unfollowUser={this.props.unfollowUser}

						/>

					}

				}).toList()}
			</div>
		</div>

	}

}

export default Thread;
