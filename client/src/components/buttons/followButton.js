import React from 'react';
import ImmutableComponent from '../immutableComponent';

import Button from './button';
import MiniLoader from '../miniLoader';


class FollowButton extends ImmutableComponent {

	constructor() {
		super({
			following: undefined,
			loading: false
		})
	}

	immutableComponentDidMount() {
		this.checkFollowing()
	}

	immutableComponentDidUpdate(lastProps) {
		if (this.props.targetUser && this.props.activeUser &&
				(!lastProps.activeUser || !lastProps.targetUser ||
				 this.props.activeUser.address !== lastProps.activeUser.address ||
				 this.props.targetUser.address !== lastProps.targetUser.address)) {
			this.updateState(
				state => state.set("following", undefined),
				this.checkFollowing
			)
		}
	}

	checkFollowing() {
		if (this.props.activeUser && this.props.targetUser) {
			this.props.activeUser
				.isFollowing(this.props.targetUser.address)
				.then(result => this.updateState(state =>
					state.set("following", result)
				))
				.catch(error => console.error)
		}
	}


	follow() {
		return new Promise((resolve, reject) => {
			this.updateState(
				state => state.set("loading", true),
				() => this.props
					.followUser(this.props.targetUser.address)
					.then(() => Promise.all([
						this.props.getUser(this.props.targetUser.address),
						this.props.getUser(this.props.activeUser.address)
					]))
					.then(() => this.updateState(
						state => state
							.set("loading", false)
							.set("following", true),
						() => {
							if (this.props.callback) { this.props.callback() }
							resolve()
						}
					))
					.catch(console.error)
			)
		})
	}

	unfollow() {
		return new Promise((resolve, reject) => {
			this.updateState(
				state => state.set("loading", true),
				() => this.props
					.unfollowUser(this.props.targetUser.address)
					.then(() => Promise.all([
						this.props.getUser(this.props.targetUser.address),
						this.props.getUser(this.props.activeUser.address)
					]))
					.then(() => this.updateState(
						state => state
							.set("loading", false)
							.set("following", false),
						() => {
							if (this.props.callback) { this.props.callback() }
							resolve()
						}
					))
					.catch(console.error)
			)
		})
	}


	render() {

		const ready = !(this.getState("following") === undefined)
		const following = this.getState("following")
		const loading = this.getState("loading")

		return (!this.props.activeUser || !this.props.targetUser) ?
			null :
			<Button

				caption={!ready ?
					null :
					loading ?
						(following ? "unfollowing..." : "following...") :
						(following ? "unfollow" : "follow")
				}
				captionLocation={this.props.captionLocation}
				captionOffset={this.props.captionOffset}

				size={this.props.size}
				color={ready ? "var(--green)" : "var(--dark-grey)"}
				transparent={!following}
				filled={following}

				disabled={!ready}
				onClick={(!ready || loading) ?
					null :
					following ?
						this.unfollow.bind(this) :
						this.follow.bind(this)
				}

				children={(!ready || loading) ?
					<div className="button-loader">
						<MiniLoader size={0.7} />
					</div>
					:
					<i className="fas fa-eye button-icon" />
				}
				childrenHighlight={following ?
					<i className="fas fa-eye-slash button-icon" />
					: null
				}

			/>
	}
}

export default FollowButton;
