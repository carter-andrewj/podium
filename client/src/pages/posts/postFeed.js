import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import Post from './post';



class PostFeed extends ImmutableComponent {

	render() {

		const size = this.props.posts.size
		const format = this.props.format
		const labeling = this.props.label || ["post", "posts"]
		const label = (size === 1) ? labeling[0] : labeling[1]

		return <div className="postfeed">

			{this.props.posts
				.map((post, i) => {

					if (post.get("marker")) {

						if (!post.get("show")) {
							return null
						} else if (post.get("type") === "you") {
							return <div
								className="feed-marker"
								key={`post-${format}-marker-${size - i}`}>
								<p className="background-text">
									you posted
								</p>
							</div>
						} else {
							return <div
								className="feed-marker"
								key={`post-${format}-marker-${size - i}`}>
								<p className="background-text">
									{post.get("value") === 1 ?
										`added ${post.get("value")} new ${labeling[0]}` :
										`added ${post.get("value")} new ${labeling[1]}`
									}
								</p>
							</div>
						}

					} else {

						return <Post

							key={`post-${format}-${size - i}-${post.get("target")}`}
							id={`post-${format}-${size - i}-${post.get("target")}`}

							format={format}
							from={this.props.from}
							post={post.get("target")}

							podium={this.props.podium}
							activeUser={this.props.activeUser}
							balance={this.props.balance}

							getUser={this.props.getUser}
							followUser={this.props.followUser}
							unfollowUser={this.props.unfollowUser}

							getPost={this.props.getPost}
							sendPost={this.props.sendPost}

							transition={this.props.transition}
							exit={this.props.exit}

						/>

					}
				})
				.toList()
			}

			<div className="feed-spacer" />
			<div className="footer-spacer">
				<p className="footer-text background-text">
					{size > 0 ?
						`no more ${label}` :
						`no ${label}`
					}
				</p>
			</div>

		</div>
	}

}

export default PostFeed;
