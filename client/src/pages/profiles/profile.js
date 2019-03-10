import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import { Set, fromJS, is } from 'immutable';

import ProfilePage from './profilePage';
import ProfileCard from './profileCard';
import ProfileTooltip from './profileTooltip';
import ProfileTab from './profileTab';


const emptyState = {
	user: null,
	profile: null,
	posts: null,
	followers: null,
	following: null,
	required: Set(),
	valid: true
}


function placeholder(address) {
	return {
		address: address,
		placeholder: true
	}
}



class Profile extends ImmutableComponent {

	constructor() {
		super(emptyState)
		this.timer = null
		this.loadUser = this.loadUser.bind(this)
		this.loadUserFromID = this.loadUserFromID.bind(this)
		this.loadUserFromAddress = this.loadUserFromAddress.bind(this)
		this.setUser = this.setUser.bind(this)
		this.reloadUser = this.reloadUser.bind(this)
		this.autoUpdate = this.autoUpdate.bind(this)
		this.require = this.require.bind(this)
		this.loadRequirements = this.loadRequirements.bind(this)
		this.getRequirement = this.getRequirement.bind(this)
	}


	immutableComponentWillMount() {
		if (this.props.target) {
			this.loadUser()
		}
	}


	shouldImmutableComponentUpdate(nextProps, nextState) {
		if (!is(nextState, this.getState())) {
			return true
		}
		if (nextProps.exit !== this.props.exit) {
			return true
		}
		if (nextProps.from &&
				(nextProps.from === "address" || nextProps.from === "id")) {
			if (nextProps.target !== this.props.target) {
				return true
			}
		} else {
			if (nextProps.target && (!this.props.target ||
					!is(nextProps.target.cache, this.props.target.cache))) {
				return true
			}
		}
		return false
	}


	immutableComponentDidUpdate(lastProps) {
		if (lastProps.target !== this.props.target) {
			this.updateState(
				state => state.merge(fromJS(emptyState)),
				this.loadUser
			)
		}
	}


	loadUser() {
		if (this.props.from && this.props.from === "id") {
			this.loadUserFromID(this.props.target)
				.catch(this.invalidUser)
		} else if (this.props.from && this.props.from === "address") {
			this.loadUserFromAddress(this.props.target)
				.catch(this.invalidUser)
		} else {
			this.setUser(this.props.target)
				.catch(this.invalidUser)
		}
	}


	reloadUser(force = false) {
		return new Promise((resolve, reject) => {
			if (this.props.from && this.props.from === "id") {
				this.loadUserFromID(this.props.target, force)
					.then(resolve)
					.catch(reject)
			} else if (this.props.from && this.props.from === "address") {
				this.loadUserFromAddress(this.props.target, force)
					.then(resolve)
					.catch(reject)
			} else {
				this.loadUserFromAddress(this.props.target.address, force)
					.then(resolve)
					.catch(reject)
			}
		})
	}


	loadUserFromID(id, force = false) {
		return new Promise((resolve, reject) => {
			this.props.podium
				.isUser(id)
				.then(address => {
					if (address) {
						this.loadUserFromAddress(address, force)
							.then(resolve)
							.catch(reject)
					} else {
						reject(`Unknown User ID: ${id}`)
					}
				})
				.catch(reject)
		})
	}


	loadUserFromAddress(address, force = false) {
		return new Promise((resolve, reject) => {
			this.updateState(
				state => state.set("user", placeholder(address)),
				() => this.props.getUser(address, force)
					.then(user => this.setUser(user, force))
					.then(resolve)
					.catch(reject)
			)
		})
	}


	setUser(user, force = false) {
		return new Promise((resolve, reject) => {
			this.updateState(
				state => state.set("user", user),
				() => this.loadRequirements(force)
					.then(resolve)
					.catch(reject)
			)
		})
	}


	invalidUser(error) {
		console.error(error)
		this.updateState(state => state.set("valid", false))
	}




	autoUpdate(flag = true) {
		clearTimeout(this.timer)
		if (flag) {
			this.timer = setTimeout(
				() => this.reloadUser(true)
					.then(() => this.autoUpdate(true))
					.catch(console.error),
				3000
			)
		}
	}



	require() {
		return new Promise((resolve, reject) => {
			var requirements = Set(Array.prototype.slice.call(arguments))
			this.updateState(
				state => state.update(
					"required",
					r => r.union(requirements)
				),
				() => this.loadRequirements()
			)
		})
	}


	loadRequirements(force = false) {
		return new Promise((resolve, reject) => {
			if (this.getState("user") && !this.getState("user", "placeholder")) {
				const requirements = this.getState("required")
				var fetching = requirements
					.map(r => this.getRequirement(r, force))
					.toJS()
				if (requirements.length === 1) {
					resolve(fetching[0])
				} else {
					Promise.all(fetching)
						.then(resolve)
						.catch(reject)
				}
			} else {
				resolve()
			}
		})
	}


	getRequirement(id, force = false) {
		switch (id) {

			case "profile": return this.requireProfile(force)

			case "posts": return this.requirePosts(force)

			case "followers": return this.requireFollowers(force)
			case "following": return this.requireFollowing(force)

			default:
				console.error(`Unknown user requirement: ${id}`)
				return null

		}
	}


	requireProfile(force = false) {
		return new Promise((resolve, reject) => {
			this.getState("user")
				.profile(force)
				.then(profile => this.updateState(
					state => state.set("profile", profile),
					resolve
				))
				.catch(reject)
		})
	}


	requirePosts(force = false) {
		return new Promise((resolve, reject) => {
			this.getState("user")
				.postIndex(force)
				.then(posts => this.updateState(
					state => state.set("posts", posts),
					resolve
				))
				.catch(reject)
		})
	}


	requireFollowers(force = false) {
		return new Promise((resolve, reject) => {
			this.getState("user")
				.followerIndex(force)
				.then(followers => this.updateState(
					state => state.set("followers", followers),
					resolve
				))
				.catch(reject)
		})
	}


	requireFollowing(force = false) {
		return new Promise((resolve, reject) => {
			this.getState("user")
				.followingIndex(force)
				.then(following => this.updateState(
					state => state.set("following", following),
					resolve
				))
				.catch(reject)
		})
	}



	render() {

		let ProfileFormat;
		switch (this.props.format) {

			// Render as a card
			case("card"):
				ProfileFormat = ProfileCard
				break;

			// Render as an inset
			case("tooltip"):
				ProfileFormat = ProfileTooltip
				break;

			// Render as a tab
			case("tab"):
				ProfileFormat = ProfileTab
				break;

			// Render as full page by default
			default:
				ProfileFormat = ProfilePage

		}

		return <ProfileFormat

			podium={this.props.podium}
			activeUser={this.props.activeUser}
			balance={this.props.balance}

			side={this.props.side}

			valid={this.getState("valid")}
			require={this.require}
			autoUpdate={this.autoUpdate}
			reload={this.reloadUser}

			user={this.getState("user")}
			profile={this.getState("profile")}
			posts={this.getState("posts")}
			followers={this.getState("followers")}
			following={this.getState("following")}

			getUser={this.props.getUser}
			getPost={this.props.getPost}

			followUser={this.props.followUser}
			unfollowUser={this.props.unfollowUser}

			transition={this.props.transition}
			exit={this.props.exit}

		/>

	}


	immutableComponentWillUnmount() {
		clearTimeout(this.timer)
	}

}

export default Profile;
