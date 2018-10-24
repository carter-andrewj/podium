import React, { Component } from 'react';
import '../../../App.css';

import Channel from '../utils';

import Search from './search';
import UserCard from './usercard';



class Users extends Component {

	constructor() {
		super();
		this.state = {
			index: [],
			users: {}
		}
		this.listUser = this.listUser.bind(this);
		this.getUsers = this.getUsers.bind(this);
		this.searchUsers = this.searchUsers.bind(this);
	}


	componentDidMount() {
		this.getUsers();
	}


	async listUser(user) {
		return new Promise((resolve) => {
			this.props.getProfile(user.address, false)
				.then(profile => {
					const state = this.state;
					state.index[user.id] = user;
					state.users[user.address] = profile;
					this.setState(state, resolve);
				});
		});
	}


	getUsers() {

		// Get full user roster
		//TODO - Switch to getHistory
		const roster = Channel.forUserRoster();
		roster.openNodeConnection();
		roster.dataSystem
			.getApplicationData(this.props.podium.id)
			.subscribe({
				next: async item => {

					// Parse and store the user record
					const user = JSON.parse(item.data.payload);
					await this.listUser(user);

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
					{Object.keys(this.state.users).map(k => 
						<UserCard

							key={k}
							user={this.state.users[k]}

							getProfile={this.props.getProfile}
							followUser={this.props.followUser}
							unfollowUser={this.props.unfollowUser}

							setCoreMode={this.props.setCoreMode}

						/>
					)}
				</div>
				<div className="footer-spacer"></div>
			</div>
		);
	}

}

export default Users;
