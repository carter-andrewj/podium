import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import { List } from 'immutable';

import Profile from './profile';



class ProfileFeed extends ImmutableComponent {

	render() {
		return <div className="profile-feed-holder">
			<div className="profile-feed-left">
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
			<div className="feed-spacer" />
			<div className="footer-spacer">
				<p className="footer-text background-text">
					{this.props.footer}
				</p>
			</div>
		</div>
	}
}

export default ProfileFeed;
