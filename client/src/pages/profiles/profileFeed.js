import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import { List } from 'immutable';

import Profile from './profile';

import MiniLoader from '../../components/miniLoader';

import Config from 'config';



class ProfileFeed extends ImmutableComponent {

	constructor() {
		super({
			show: 0,
			profileCount: 0,
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
		if (this.props.users && (!lastProps.users ||
				this.props.users.size !== lastProps.users.size)) {
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
		if (this.props.users) {
			const userCount = this.props.users.size
			const complete = this.getState("show") >= userCount
			this.updateState(state => state
				.set("userCount", userCount)
				.set("complete", complete)
			)
		} else {
			this.updateState(state => state
				.set("userCount", 0)
				.set("complete", false)
			)
		}
	}


	render() {

		const show = this.getState("show")
		const label = this.props.label || ["user", "users"]
		const users = (this.props.users || List()).toList().take(show)

		return <div className="profile-feed-holder">

			<div className="profile-feed">

				<div className="profile-feed-left">
					{users
						.filter((_, i) => (i % 2) === 0)
						.map(target => <Profile

								key={(this.props.from === "user") ?
									target.address : target}

								podium={this.props.podium}
								activeUser={this.props.activeUser}
								balance={this.props.balance}

								from={this.props.from}
								target={target}
								
								getUser={this.props.getUser}
								getPost={this.props.getPost}

								followUser={this.props.followUser}
								unfollowUser={this.props.unfollowUser}

								format="card"
								side="left"

								transition={this.props.transition}
								exit={this.props.exit}

							/>
						)
						.toList()
					}
				</div>

				<div className="profile-feed-right">
					{users
						.filter((_, i) => (i % 2) === 1)
						.map(target => <Profile

								key={(this.props.from === "user") ?
									target.address : target}

								podium={this.props.podium}
								activeUser={this.props.activeUser}
								balance={this.props.balance}

								from={this.props.from}
								target={target}
								
								getUser={this.props.getUser}
								getPost={this.props.getPost}

								followUser={this.props.followUser}
								unfollowUser={this.props.unfollowUser}

								format="card"
								side="right"

								transition={this.props.transition}
								exit={this.props.exit}

							/>
						)
						.toList()
					}
					
				</div>
			</div>
			
			<div className="feed-spacer" />

			<div
				ref={ref => this.footer = ref}
				className="footer-spacer">
				{(!this.getState("complete") || !this.props.users) ?
					<MiniLoader color="white" size={2.0} />
					:
					<p className="footer-text background-text">
						{this.getState("userCount") > 0 ?
							`no more ${label[1]}` :
							`no ${label[1]}`
						}
					</p>
				}
			</div>

		</div>
	}
}

export default ProfileFeed;
