import React, { Component } from 'react';
import '../../../App.css';

import Status from './status';
import Controls from './controls';
import Feed from './feed';
import Profile from './profile';
import Alerts from './alerts';
import Wallet from './wallet';
import Followers from './followers';
import Following from './following';
import Unlocks from './unlocks';
import Users from './users';
import Topics from './topics';
import Rulebook from './rulebook';
import Settings from './settings';
import Help from './help';
import SignOut from './signout';


class Core extends Component {

	constructor() {
		super()
		this.state = {
			mode: "feed"
		}
		this.setCoreMode = this.setCoreMode.bind(this);
	}

	setCoreMode(mode) {
		const state = this.state;
		state.mode = mode;
		this.setState(state);
	}

	// componentWillMount() {
	// 	const state = this.state;
	// 	state.data = this.props.data;
	// 	state.user = this.props.user;
	// }

	// componentWillReceiveProps(nextProps) {
	// 	if (_.isEqual(nextProps, this.props)) {
	// 		const state = this.state;
	// 		if (_.isEqual(nextProps.data, this.props.data)) {
	// 			console.log("CORE FOUND NEW DATA")
	// 			state.data = nextProps.data;
	// 		}
	// 		if (_.isEqual(nextProps.user, this.props.user)) {
	// 			console.log("CORE FOUND NEW USER DATA")
	// 			state.user = nextProps.user;
	// 		}
	// 		this.setState(state);
	// 	}
	// }

	render() {

		let content;
		switch (this.state.mode) {

			// Show the user profile
			case ("profile"):
				content = <Profile

					user={this.props.user}

					posts={this.props.data.posts}
					users={this.props.data.users}

					getProfile={this.props.getProfile}
					getPost={this.props.getPost}

				/>;
				break;

			// Show alerts
			case ("alerts"):
				content = <Alerts />;
				break;

			// Show wallet
			case ("wallet"):
				content = <Wallet />;
				break;

			// Show followers
			case ("followers"):
				content = <Followers

					followerCount={this.props.user.followers}
					followers={this.props.data.followers}
					users={this.props.data.users}

					getProfile={this.props.getProfile}
					followUser={this.props.followUser}
					unfollowUser={this.props.unfollowUser}

					setCoreMode={this.setCoreMode}

				/>;
				break;

			// Show users being followed
			case ("following"):
				content = <Following />;
				break;

			// Show unlocks
			case ("integrity"):
				content = <Unlocks />;
				break;


			// Show user search
			case ("users"):
				content = <Users

					podium={this.props.podium}
					users={this.props.data.users}

					getProfile={this.props.getProfile}
					followUser={this.props.followUser}
					unfollowUser={this.props.unfollowUser}

					setCoreMode={this.setCoreMode}

				/>;
				break;

			// Show topic search
			case ("topics"):
				content = <Topics />;
				break;

			// Show rulebook
			case ("rulebook"):
				content = <Rulebook />;
				break;

			// Show settings
			case ("settings"):
				content = <Settings />;
				break;

			// Show help
			case ("help"):
				content = <Help />;
				break;

			// Show signout confirmation
			case ("sign-out"):
				content = <SignOut />;
				break;

			// Otherwise, show the post feed
			default:
				content = <Feed

					users={this.props.data.users}
					posts={this.props.data.posts}

					sendPost={this.props.sendPost}
					getPost={this.props.getPost}

					getProfileFromID={this.props.getProfileFromID}
					getTopicFromID={this.props.getTopicFromID}

				/>;

		}

		return (
			<div ref="core" className="demo-core">
				<div className="container-fluid">
					<div className="row">
						<div className="col-3"></div>
						<div className="col-6 feed-core">
							{content}
						</div>
						<div className="col-3"></div>
					</div>
				</div>
				<Status
					user={this.props.user}
					profile={this.props.data.users[this.props.user.address]}
					setCoreMode={this.setCoreMode}
				/>
				<Controls
					setCoreMode={this.setCoreMode}
					signOut={this.props.signOut}
				/>
			</div>
		);
	}

}

export default Core;
