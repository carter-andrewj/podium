import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import FollowButton from '../../components/buttons/followButton';

import MiniLoader from '../../components/miniLoader';


class ProfileTooltip extends ImmutableComponent {


	immutableComponentWillMount() {
		this.props.require("profile")
	}

	//TODO - Add bio on mouseover

	render() {
		return <div className="profiletip card">

			<div className="profiletip-picture-holder">
				{this.props.profile ?
					<img
						className="profiletip-picture"
						src={this.props.profile.get("pictureURL")}
						alt=""
					/>
					:
					<div className="profiletip-picture-loading-box">
						<MiniLoader color="white" />
					</div>
				}
			</div>

			{this.props.profile ?
				<div className="profiletip-name">
					<p className="profiletip-name-text">
						{this.props.profile.get("name")}
					</p>
				</div>
				: null
			}

			{this.props.profile ?
				<div className="profiletip-bio">
					<p className="profiletip-bio-text">
						{this.props.profile.get("bio")}
					</p>
				</div>
				: null
			}

			<div className="profiletip-buttons">

				<div className="profiletip-button">
					<FollowButton

						activeUser={this.props.activeUser}
						targetUser={this.props.user}

						getUser={this.props.getUser}
						followUser={this.props.followUser}
						unfollowUser={this.props.unfollowUser}

						captionLocation="left"
						captionOffset={0.8}
						size={1.6}
						
						callback={this.props.reload}

					/>
				</div>

			</div>

		</div>
	}

}

export default ProfileTooltip;
