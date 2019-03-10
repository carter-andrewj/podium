import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import { List } from 'immutable';

import Post from './post';

import Expander from '../../components/animators/expander';
import MiniLoader from '../../components/miniLoader';



class PostThread extends ImmutableComponent {

	constructor() {
		super({
			ignoreStale: false
		})
	}


	immutableComponentWillMount() {
		this.props.require("thread")
	}


	completeThread() {
		this.updateState(
			state => state.set("filling", true),
			() => {
				this.props.require("fullThread")
					.then(() => this.updateState(
						state => state.set("filling", false)
					))
					.catch(console.error)
			}
		)
	}


	ignoreStale() {
		this.updateState(state => state.update("ignoreStale", x => !x))
	}


	render() {

		const parentage = this.props.thread || List()
		const thread = List([...parentage, this.props.post])
		const stale = this.props.stale && !this.getState("ignoreStale")

		// Render thread
		return !this.props.post ?
			null :
			<div className="thread-holder">
				<Expander time={1.0}>
					<div className="thread-card card hover-card">

						{thread
							.map((post, i) => {

								if (post && post.spacer) {

									if (this.getState("filling")) {
										return <div
											key={`${this.props.id}-spacer`}
											className="thread-spacer thread-spacer-loading">
											<MiniLoader size={1.5} />
										</div>
									} else {
										return <div
											key={`${this.props.id}-spacer`}
											className="thread-spacer thread-spacer-waiting"
											onClick={() => this.completeThread()}>
											{`${post.gap} more posts`}
										</div>
									}

								} else {

									return <div
										className={stale ? 
											"thread-card-inner thread-card-stale" :
											"thread-card-inner"
										}
										key={`post-${post.address}-holder`}>
										<Post

											key={"post-" + post.address}
											target={post}
											format="content"
											first={i === 0}
											suppressLabels={List(["reply"])}

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

							})
							.toList()
						}

						<div className={stale ?
								"thread-stale thread-stale-on" :
								"thread-stale thread-stale-off"
							}>
							<div className="thread-stale-text">
								out of date
							</div>
							<div className="thread-stale-buttons">
								<div
									className="thread-stale-button thread-stale-button-view"
									onClick={this.ignoreStale.bind(this)}>
									view anyway
								</div>
								<div
									className="thread-stale-button thread-stale-button-go"
									onClick={() => console.log("latest")}>
									go to latest
								</div>
							</div>
						</div>

					</div>
				</Expander>
			</div>

	}

}

export default PostThread;
