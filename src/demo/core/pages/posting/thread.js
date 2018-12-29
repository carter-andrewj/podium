import React, { Component } from 'react';

import Post from './post';




class Thread extends Component {

	render() {

		//TODO - Filter data passed down to each post
		
		// Render thread
		return <div
			ref={"thread-" + this.props.root}
			className="thread-holder">
			<div className="thread-card card">
				{this.props.posts
					.map((post, id) => post)
					.sort((a, b) => a.get("depth") > b.get("depth") ? 1 : -1)
					.map((post) => <Post

						key={"post-" + post.get("address")}
						index={post.get("depth")}

						activeUser={this.props.activeUser}

						thread={this.props.origin}
						user={this.props.users.get(post.get("author"))}
						post={post}

						users={this.props.users}

						getProfileFromID={this.props.getProfileFromID}
						getTopicFromID={this.props.getTopicFromID}

						sendPost={this.props.sendPost}

						promotePost={this.props.promotePost}
						reportPost={this.props.reportPost}
						retractPost={this.props.retractPost}
						amendPost={this.props.amendPost}

						followUser={this.props.followUser}
						unfollowUser={this.props.unfollowUser}

						setCoreMode={this.props.setCoreMode}

					/>)
					.toList()
				}
			</div>
		</div>

	}

}

export default Thread;
