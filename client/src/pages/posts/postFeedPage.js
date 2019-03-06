import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import PostFeed from './postFeed';
import Send from './send';

import Loader from '../../components/loader';
import Slider from '../../components/animators/slider';
import Fader from '../../components/animators/fader';




let timer;

class FeedPage extends ImmutableComponent {

	constructor() {
		super({
			"show": false,
			"lock": false
		})
		this.show = this.show.bind(this)
		this.hide = this.hide.bind(this)
		this.lock = this.lock.bind(this)
		this.unlock = this.unlock.bind(this)
	}


	immutableComponentDidMount() {
		document.title = "Podium"
	}


	show() {
		clearTimeout(timer)
		timer = setTimeout(
			() => this.updateState(state => state.set("show", true)),
			100
		)
	}

	hide() {
		clearTimeout(timer)
		this.updateState(state => state.set("show", false))
	}

	lock() {
		this.updateState(state => state.set("lock", true))
	}

	unlock() {
		this.updateState(state => state.set("lock", false))
	}


	render() {

		// Handle pending posts
		let pending;
		const pendCount = this.props.feedData.get("pending").size
		if (pendCount > 0) {
			pending = <div
				className="pending-posts card"
				onClick={() => this.props.publishPosts()}>
				{`show ${pendCount} new posts`}
			</div>
		}

		const threads = this.props.feedData.get("feed")
			.interleave(this.props.feedData.get("markers"))
			.flatten(2)

		// Build feed
		return (
			<div className="feedpage content">

				<div className="content-row content-firm">
					<Slider
						position="relative"
						offset={{ x: 0, y: -5 }}
						delayIn={0.3}
						exit={this.props.exit}>
						<div className="newpost-holder">
							<div
								className="newpost-capture"
								onMouseEnter={this.show.bind(this)}
								onMouseLeave={this.hide.bind(this)}>
								<div className="newpost card">
									<Send

										key="main"
										postKey="main"

										podium={this.props.podium}
										activeUser={this.props.activeUser}
										balance={this.props.balance}

										getUser={this.props.getProfile}

										sendPost={this.props.sendPost}

										open={this.getState("show") || this.getState("lock")}
										show={this.show}
										hide={this.hide}
										lock={this.lock}
										unlock={this.unlock}

									/>
								</div>
							</div>
						</div>
					</Slider>
				</div>

				<div className="content-row content-core">
					<Fader
						delayIn={1.0}
						exit={this.props.exit}>
						{threads.size === 0 ?

							// Display loading messages
							<div className="feed-core">
								<Loader message="loading feed" />
							</div>

							:
							
							<div className="feed-core">
								{pending}
								<PostFeed

									posts={threads}
									format="thread"
									from="address"

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
							</div>
						}
					</Fader>
				</div>

			</div>
		)
	}


	immutableComponentWillUnmount() {
		clearTimeout(timer)
	}

}

export default FeedPage;
