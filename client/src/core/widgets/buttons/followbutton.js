import React from 'react';
import ImmutableComponent from '../immutableComponent';

import LoadingToggle from './loadingtoggle';


class FollowButton extends ImmutableComponent {

	constructor() {
		super({
			following: undefined
		})
	}

	componentWillMount() {
		this.checkFollowing()
	}

	componentDidUpdate(lastProps) {
		if (this.getState("following") === undefined ||
				this.props.activeUser.address !== lastProps.activeUser.address) {
			this.checkFollowing()
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
			this.props.activeUser
				.follow(this.props.targetUser.address)
				.then(() => {
					if (this.props.callback) {
						this.props.callback()
					}
					resolve()
				})
				.catch(error => console.error(error))
		})
	}

	unfollow() {
		return new Promise((resolve, reject) => {
			this.props.activeUser
				.unfollow(this.props.targetUser.address)
				.then(() => {
					if (this.props.callback) {
						this.props.callback()
					}
					resolve()
				})
				.catch(error => console.error(error))
		})
	}

	render() {
		return (!this.props.activeUser || !this.props.targetUser) ?
			null :
			<LoadingToggle

				on={this.getState("following")}
				captionLocation={this.props.captionLocation}
				captionOffset={this.props.captionOffset}
				size={this.props.size}
				color="var(--green)"
				transparent={true}

				childrenOn={<i className="fas fa-eye button-icon" />}
				toggleOn={() => this.follow()}
				captionLoadingOn="following..."
				captionOn="unfollow?"

				childrenOff={<i className="fas fa-eye-slash button-icon" />}
				toggleOff={() => this.unfollow()}
				captionLoadingOff="unfollowing..."
				captionOff="follow"

			/>
	}
}

export default FollowButton;
