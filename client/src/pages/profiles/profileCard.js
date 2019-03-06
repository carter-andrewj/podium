import React from 'react';
import { Link } from 'react-router-dom';
import ImmutableComponent from '../../components/immutableComponent';

import FollowButton from '../../components/buttons/followButton';

import Gauge from '../../components/gauges/gauge';
import MiniLoader from '../../components/miniLoader';



class ProfileCard extends ImmutableComponent {

	render() {

		// Check if user is loaded
		return <div
			className={(this.props.side === "left") ?
				"card profilecard profilecard-left" :
				"card profilecard profilecard-right"}
			onClick={() => {
				if (this.profileLink) {
					this.props.transition(() => this.profileLink.click())
				}
			}}
			>
			{this.props.profile ?
				<Link
					to={`/user/${this.props.profile.get("id")}`}
					innerRef={ref => this.profileLink = ref}
					style={{ display: "none" }}
				/>
				: null
			}
			<div className="profilecard-top">

				<div className={(this.props.side === "left") ?
						"profilecard-picture-holder profilecard-picture-holder-left" :
						"profilecard-picture-holder profilecard-picture-holder-right"
					}>
					{this.props.profile ? 
						<img
							className={(this.props.side === "left") ?
								"profilecard-picture profilecard-picture-left" :
								"profilecard-picture profilecard-picture-right"
							}
							src={this.props.profile.get("pictureURL")}
							alt=""
						/>
						:
						<div className="profilecard-picture-loading-box">
							<MiniLoader size={1.2} color="white" />
						</div>
					}
				</div>

				{this.props.profile ?
					<div className={(this.props.side === "left") ?
							"profilecard-gauges profilecard-gauges-left" :
							"profilecard-gauges profilecard-gauges-right"
						}>
						<div className="profilecard-gauge-holder">
							<Gauge
								value={0.234}
								icon="balance-scale"
								caption="integrity"
								captionPosition="bottom"
							/>
						</div>
						{this.props.activeUser ?
							<div className="profilecard-gauge-holder">
								<Gauge
									value={0.785}
									icon="dna"
									caption="affinity"
									captionPosition="top"
								/>
							</div>
							: null
						}
					</div>
					: null
				}

				{this.props.user ?
					<div className={(this.props.side === "left") ?
							"profilecard-buttons profilecard-buttons-left" :
							"profilecard-buttons profilecard-buttons-right"
						}>

						{this.props.activeUser ?
							<div className="profile-button">
								<FollowButton

									activeUser={this.props.activeUser}
									targetUser={this.props.user}

									followUser={this.props.followUser}
									unfollowUser={this.props.unfollowUser}

									captionLocation={this.props.side}
									captionOffset={1.4}

									callback={this.props.reload}

								/>
							</div>
							: null
						}

					</div>
					: null
				}

			</div>

			{this.props.profile ?
				<div className="profilecard-content-holder">
					<div className="profilecard-name">
						<p className="profilecard-name-text">
							{this.props.profile.get("name")}
						</p>
					</div>
					<div className="profilecard-id">
						<p className="profilecard-id-text">
							@{this.props.profile.get("id")}
						</p>
					</div>
					<div className="profilecard-bio-holder">
						<p className="profilecard-bio">
							{this.props.profile.get("bio")}
						</p>
					</div>
				</div>
				: null
			}
		</div>

	}

}

export default ProfileCard;
