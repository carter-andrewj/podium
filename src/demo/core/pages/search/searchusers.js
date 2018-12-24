import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';

import Channel from 'demo/utils';

import Search from './search';
import ProfileCard from 'demo/core/pages/user/profile/profilecard';



class SearchUsers extends Component {

	constructor() {
		super();
		this.state = {
			data: Map(fromJS({
				index: {},
				users: {}
			}))
		}
		this.listUser = this.listUser.bind(this);
		this.getUsers = this.getUsers.bind(this);
		this.searchUsers = this.searchUsers.bind(this);
	}


	updateState(up, callback) {
		this.setState(
			({data}) => { return {data: up(data)} },
			callback
		);
	}


	componentDidMount() {
		this.getUsers();
	}


	async listUser(user) {
		return new Promise((resolve) => {
			this.props.getProfile(user.get("address"), false)
				.then(profile => {
					this.updateState(state => state
						.setIn(["index", user.get("id")], user)
						.setIn(["users", user.get("address")], profile)
					);
				});
		});
	}


	getUsers() {

		// Get full user roster
		//TODO - Switch to getHistory
		const roster = Channel.forUserRoster();
		roster.openNodeConnection();
		roster.dataSystem
			.getApplicationData(this.props.podium.get("id"))
			.subscribe({
				next: async item => {

					// Parse and store the user record
					const user = JSON.parse(item.data.payload);
					console.log("GET USERS", user, typeof user);
					await this.listUser(Map(user));

				},
				error: error => { console.error(error); }
			});

	}


	searchUsers(terms) {
		//TODO
		console.log(terms);
	}


	render() {
		//TODO - Remove the active user from the users shown
		//TODO - Delete user profiles created by this
		//		 component from the parent state when this
		//		 component unmounts
		return (
			<div ref="users" className="user-search">
				<Search
					placeholder="Find a user..."
					action={this.searchUsers}
				/>
				<div className="user-search-results">
					{this.state.data
						.get("users")
						.map((user, k) => <ProfileCard

							key={k}
							user={user}

							getProfile={this.props.getProfile}
							followUser={this.props.followUser}
							unfollowUser={this.props.unfollowUser}

							setCoreMode={this.props.setCoreMode}

						/>)
						.toList()
					}
				</div>
				<div className="footer-spacer"></div>
			</div>
		);
	}

}

export default SearchUsers;
