import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
// import { Map, fromJS } from 'immutable';

import Status from './nav/status';
import Controls from './nav/controls';

import Search from './search/search';
// import SearchResults from './search/searchresults';

import Alerts from './alerts/alerts';
// import AlertsPage from './alerts/alertspage';

// import Profile from './pages/user/profile/profile';
// import Wallet from './pages/user/wallet/wallet';
// import Followers from './pages/user/followers/followers';
// import Following from './pages/user/following/following';
// import Integrity from './pages/user/integrity/integrity';

// import Feed from './pages/posting/feed';
// import Topics from './pages/topics/topics';
// import Governance from './pages/governance/governance';
// import Settings from './pages/settings/settings';

import Slider from './widgets/slider';
import Fader from './widgets/fader';




class _HUD extends Component {

	// constructor() {
	// 	super()
	// 	this.state = {
	// 		data: Map(fromJS({
	// 			mode: "feed"
	// 		}))
	// 	}
	// 	this.setCoreMode = this.setCoreMode.bind(this);
	// }

	// updateState(up, callback) {
	// 	this.setState(
	// 		({data}) => { return {data: up(data)} },
	// 		callback
	// 	);
	// }

	// setCoreMode(mode) {
	// 	this.updateState(state => state
	// 		.set("mode", mode)
	// 	);
	// }

	render() {

		// let content;
		// switch (this.state.data.get("mode")) {

		// 	// Show the user profile
		// 	case ("profile"):
		// 		content = <Profile

		// 			user={this.props.user}

		// 			posts={this.props.records.get("posts")}
		// 			users={this.props.records.get("users")}

		// 			getProfile={this.props.getProfile}
		// 			getPost={this.props.getPost}

		// 			promotePost={this.props.promotePost}
		// 			reportPost={this.props.reportPost}

		// 			amendPost={this.props.amendPost}
		// 			retractPost={this.props.retractPost}

		// 		/>;
		// 		break;

		// 	// Show wallet
		// 	case ("wallet"):
		// 		content = <Wallet />;
		// 		break;

		// 	// Show followers
		// 	case ("followers"):
		// 		content = <Followers

		// 			followerCount={this.props.user.get("followers")}
		// 			followers={this.props.records.get("followers")}
		// 			users={this.props.records.get("users")}

		// 			getProfile={this.props.getProfile}
		// 			followUser={this.props.followUser}
		// 			unfollowUser={this.props.unfollowUser}

		// 			setCoreMode={this.setCoreMode}

		// 		/>;
		// 		break;

		// 	// Show users being followed
		// 	case ("following"):
		// 		content = <Following />;
		// 		break;

		// 	// Show permissions
		// 	case ("integrity"):
		// 		content = <Integrity />;
		// 		break;



		// 	// Show topics
		// 	case ("topics"):
		// 		content = <Topics />;
		// 		break;			

		// 	// Show rulebook
		// 	case ("governance"):
		// 		content = <Governance />;
		// 		break;

		// 	// Show settings
		// 	case ("settings"):
		// 		content = <Settings />;
		// 		break;



		// 	// Show search results
		// 	case ("search"):
		// 		content = <SearchResults
		// 			search={this.props.search}
		// 			data={this.props.searchData}
		// 			setCoreMode={this.setCoreMode}
		// 		/>;
		// 		break;

		// 	// Show alerts
		// 	case ("alerts"):
		// 		content = <AlertsPage />;
		// 		break;



		// 	// Otherwise, show the post feed
		// 	default:
		// 		content = <Feed

		// 			activeUser={this.props.user}

		// 			users={this.props.records.get("users")}
		// 			posts={this.props.records.get("posts")}

		// 			sendPost={this.props.sendPost}
		// 			getPost={this.props.getPost}

		// 			getProfileFromID={this.props.getProfileFromID}
		// 			getTopicFromID={this.props.getTopicFromID}

		// 			promotePost={this.props.promotePost}
		// 			reportPost={this.props.reportPost}

		// 			amendPost={this.props.amendPost}
		// 			retractPost={this.props.retractPost}

		// 			followUser={this.props.followUser}
		// 			unfollowUser={this.props.unfollowUser}

		// 			setCoreMode={this.setCoreMode}

		// 		/>;

		// }



		return (
			<div ref="core" className="demo-core">

				<div className="content-holder">
					<div className="content-column">
						{this.props.children}
					</div>
				</div>

				<Slider
					direction="left"
					time={0.6}>
					<Status

						active={this.props.location.path}

						activeUser={this.props.activeUser}
						
					/>
				</Slider>

				<Slider
					direction="right"
					time={0.6}>
					<Controls

						active={this.props.location.path}

						throwPopup={this.props.throwPopup}
						signOut={this.props.signOut}

					/>
				</Slider>

				<Fader time={0.5} delay={0.5}>
					<Search

						search={this.props.search}

						target={this.props.searchData.get("target")}
						loading={this.props.searchData.get("loading")}
						results={this.props.searchData.get("quickresults")}

					/>
				</Fader>

				<Fader time={0.5} delay={0.5}>
					<Alerts
						alerts={this.props.alerts}
					/>
				</Fader>

			</div>
		);
	}

}


const HUD = withRouter(_HUD);

export default HUD;
