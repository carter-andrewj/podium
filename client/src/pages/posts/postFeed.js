import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import Post from './post';

import MiniLoader from '../../components/miniLoader';

import Config from 'config';



class PostFeed extends ImmutableComponent {

	constructor() {
		super({
			show: 0,
			postCount: 0,
			complete: false
		})
		this.onScroll = this.onScroll.bind(this)
		this.checkComplete = this.checkComplete.bind(this)
	}


	immutableComponentDidMount() {
		this.resetFeed()
		window.addEventListener('scroll', this.onScroll, false)
	}

	onScroll() {
		if (!this.getState("complete") && !this.getState("pause")) {
			const current = window.innerHeight + window.scrollY
			const threshold = this.footer.getBoundingClientRect().top
			if (current > threshold) {
				this.updateState(
					state => state
						.update("show", s => s += Config.feed.stepLength)
						.set("pause", true),
					() => {
						this.timer = setTimeout(
							() => this.updateState(
								state => state.set("pause", false),
								this.onScroll
							),
							5000
						)
						this.checkComplete()
					}
				)
			}
		}
	}

	immutableComponentDidUpdate(lastProps) {
		if (this.props.posts.size !== lastProps.posts.size) {
			this.resetFeed()
		}
	}


	resetFeed() {
		this.updateState(state => state
			.set("show", Config.feed.startLength),
			this.checkComplete
		)
	}


	checkComplete() {
		const postCount = this.props.posts
			.filter(p => !p.get("marker"))
			.size
		const complete = this.getState("show") >= postCount
		this.updateState(state => state
			.set("postCount", postCount)
			.set("complete", complete)
		)
	}


	render() {

		const show = this.getState("show")
		var full = false

		const size = this.props.posts.size
		const format = this.props.format
		const label = this.props.label || ["post", "posts"]

		let postCount = 0;
		return <div className="postfeed">

			{this.props.posts
				.map((post, i) => {

					if (full) {
						return null
					} else if (post.get("marker")) {

						if (!post.get("show")) {
							return null

						} else if (post.get("type") === "custom") {
							return <div
								className="feed-marker"
								key={`post-${format}-marker-${size - i}`}>
								<p className="background-text">
									{post.get("value")}
								</p>
							</div>

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
										`added ${post.get("value")} new ${label[0]}` :
										`added ${post.get("value")} new ${label[1]}`
									}
								</p>
							</div>
						}

					} else {

						postCount += 1
						if (postCount >= show) { full = true }

						return <Post

							key={`post-${format}-${size - i}-${post.get("target")}`}
							id={`post-${format}-${size - i}-${post.get("target")}`}

							format={format}
							from={this.props.from}
							target={post.get("target")}

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
			<div
				className="footer-spacer"
				ref={ref => this.footer = ref}>
				{(full || !this.props.posts) ?
					<MiniLoader color="white" size={2.0} />
					:
					<p className="footer-text background-text">
						{size > 0 ?
							`no more ${label[1]}` :
							`no ${label[1]}`
						}
					</p>
				}
			</div>

		</div>
	}


	immutableComponentWillUnmount() {
		window.removeEventListener('scroll', this.onScroll, false)
	}

}

export default PostFeed;
