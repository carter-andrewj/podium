import React, { Component } from 'react';

import { List } from 'immutable';

import Profile from './profile';



class ProfileFeed extends Component {

	render() {
		return <div className="profile-feed-holder">
			<div className="profile-feed-left">
				{this.props.header ?
					<div className="card profile-feed-header">
						{this.props.header}
					</div>
					: null
				}
				{(this.props.users || List())
					.toList()
					.filter((_, i) => (i % 2) === 1)
					.map(target => <Profile

							key={(this.props.from === "user") ?
								target.address : target}

							podium={this.props.podium}
							activeUser={this.props.activeUser}

							from={this.props.from}
							target={target}
							
							getUser={this.props.getUser}
							getPost={this.props.getPost}

							format="card"
							side="left"

						/>
					)
					.toList()
				}
			</div>
			<div className="profile-feed-right">
				{(this.props.users || List())
					.toList()
					.filter((_, i) => (i % 2) === 0)
					.map(target => <Profile

							key={(this.props.from === "user") ?
								target.address : target}

							podium={this.props.podium}
							activeUser={this.props.activeUser}

							from={this.props.from}
							target={target}
							
							getUser={this.props.getUser}
							getPost={this.props.getPost}

							format="card"
							side="right"

						/>
					)
					.toList()
				}
			</div>
			<div className="footer-spacer" />
		</div>
	}
}

export default ProfileFeed;
