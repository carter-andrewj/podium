import React, { Component } from 'react';


import Thread from './thread';
// import Send from './send';
import Send from '../../posts/send';

import Slider from '../../widgets/animators/slider';


class Feed extends Component {


	componentDidMount() {
		document.title = "Podium"
	}


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

		// Build feed
		return (
			<div ref="feed" className="feedpage">
				<Slider
					position="relative"
					offset={{ x: 0, y: -5 }}
					time={0.5}
					delayIn={0.5}>
					<Send
						reply={false}
						podium={this.props.podium}
						activeUser={this.props.activeUser}
						getUser={this.props.getProfile}
						sendPost={this.props.sendPost}
					/>
				</Slider>
				[everything else here]
				{this.props.initializing ?

					// Display loading messages
					"Loading"
					
					:
					
					<div className="feed-core">
						{pending}
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
							.reverse()
							.toList()
						}
						<div className="footer-spacer"></div>
					</div>
				}
			</div>
		);

	}
}

export default Feed;
