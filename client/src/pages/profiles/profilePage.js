import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import { List, Map } from 'immutable';

import { timeform, formatNumber } from 'utils';

import ProfileFeed from './profileFeed';
import PostFeed from '../posts/postFeed';

import Button from '../../components/buttons/button';
import FollowButton from '../../components/buttons/followButton';
import Gauge from '../../components/gauges/gauge';

import Fader from '../../components/animators/fader';
import Slider from '../../components/animators/slider';

import MiniLoader from '../../components/miniLoader';



class ProfilePage extends ImmutableComponent {

	constructor() {
		super({
			mode: "posts",
			submode: "posts"
		})
	}


	immutableComponentDidUpdate() {
		if (this.props.profile) {
			const title = document.title.replace(/ /g,"").split("\u2022")
			var newTitle = `Podium - ${this.props.profile.get("name")}`
			if (title.length === 2) {
				newTitle = `${title[0]} \u2022 ${newTitle}`
			}
			document.title = newTitle
		}
	}


	setMode(mode) {
		this.updateState(state => state.set("mode", mode))
	}

	setSubMode(mode) {
		this.updateState(state => state.set("submode", mode))
	}


	render() {

		if (this.props.valid) {

			const user = this.props.user
			const activeUser = this.props.activeUser
			const me = user && activeUser && user.address === activeUser.address
			const mode = this.getState("mode")

			const profile = this.props.profile
			const posts = this.props.posts || List()
			const followers = this.props.followers
			const following = this.props.following

			// Create profile content
			let content;
			switch (this.getState("mode")) {

				case ("followers"):
					content = <ProfileFeed

						podium={this.props.podium}
						activeUser={this.props.activeUser}

						from="user"
						users={followers}
						
						getUser={this.props.getUser}
						getPost={this.props.getPost}

						followUser={this.props.followUser}
						unfollowUser={this.props.unfollowUser}

						footer="no more followers"

						transition={this.props.transition}
						exit={this.props.exit}

					/>
					break;

				case ("following"):
					content = <ProfileFeed

						podium={this.props.podium}
						activeUser={this.props.activeUser}

						from="user"
						users={following}
						
						getUser={this.props.getUser}
						getPost={this.props.getPost}

						followUser={this.props.followUser}
						unfollowUser={this.props.unfollowUser}

						footer="no more users"

						transition={this.props.transition}
						exit={this.props.exit}

					/>
					break;

				// Show this user's posts by default
				default:
					content = <div className="profile-feed-holder">
						<PostFeed

							posts={posts.map(p => Map({ target: p }))}
							format="card"

							podium={this.props.podium}
							activeUser={this.props.activeUser}
							balance={this.props.balance}

							getUser={this.props.getUser}
							followUser={this.props.followUser}
							unfollowUser={this.props.unfollowUser}
							
							getPost={this.props.getPost}
							sendPost={this.props.sendPost}

							transition={this.props.transition}
							exit={this.props.exit}

						/>
					</div>

			}

			return <div className="profile content">

				<div className="profile-header-holder">
					<Slider
						position="relative"
						offset={{ x: 0, y: -20 }}
						exit={this.props.exit}>
						<div className="profile-header card">
							<div className={(activeUser && !me) ?
									"profile-picture-holder" :
									"profile-picture-holder profile-picture-holder-side"
								}>
								{!profile ?
									<div className="profile-picture-loading-box">
										<MiniLoader size={3} color="white" />
									</div>
									:
									<img
										className={(activeUser && !me) ?
											"profile-picture" :
											"profile-picture profile-picture-side"
										}
										src={profile.get("pictureURL")}
										alt=""
									/>
								}
							</div>
							<div className="profile-name-holder">
								<p className="profile-name">
									{profile ? profile.get("name") : null}
								</p>
							</div>
							<div className="profile-id-holder">
								<p className="profile-id">
									{profile ?
										`@${profile.get("id")}\u2000\u2022\u2000` +
										`Joined: ${timeform(profile.get("created"))}`
										: null
									}
								</p>
							</div>
							<div className="profile-bio-holder">
								<p className="profile-bio">
									{profile ? profile.get("bio") : null}
								</p>
							</div>

							{profile ?
								<div className="profile-stat-holder">
									<div
										className={(mode === "posts") ?
											"profile-stat-box profile-stat-box-on" :
											"profile-stat-box profile-stat-box-off"}
										onClick={() => this.setMode("posts")}>
										<div className="profile-stat">
											<i className="fas fa-comment profile-stat-icon" />
											{!posts ?
												<div className="profile-stat-loader">
													<MiniLoader
														size={0.7}
														color={mode === "posts" ?
															"white" :
															"var(--dark-grey)"
														}
													/>
												</div>
												:
												<span className="profile-stat-text">
													{formatNumber(posts.size)}
												</span>
											}
										</div>
									</div>
									<div
										className={(mode === "following") ?
											"profile-stat-box profile-stat-box-on" :
											"profile-stat-box profile-stat-box-off"}
										onClick={() => this.setMode("following")}>
										<div className="profile-stat">
											<i className="fas fa-eye profile-stat-icon" />
											{!following ?
												<div className="profile-stat-loader">
													<MiniLoader
														size={0.7}
														color={mode === "following" ?
															"white" :
															"var(--dark-grey)"
														}
													/>
												</div>
												:
												<span className="profile-stat-text">
													{formatNumber(following.size)}
												</span>
											}
										</div>
									</div>
									<div
										className={(mode === "followers") ?
											"profile-stat-box profile-stat-box-on" :
											"profile-stat-box profile-stat-box-off"}
										onClick={() => this.setMode("followers")}>
										<div className="profile-stat">
											<i className="fas fa-users profile-stat-icon" />
											{!followers ?
												<div className="profile-stat-loader">
													<MiniLoader
														size={0.7}
														color={mode === "followers" ?
															"white" :
															"var(--dark-grey)"
														}
													/>
												</div>
												:
												<span className="profile-stat-text">
													{formatNumber(followers.size)}
												</span>
											}
										</div>
									</div>
								</div>
								: null
							}

							{profile ?
								<div className="profile-gauge-holder">
									{activeUser ?
										<div className="profile-gauge">
											<Gauge
												value={0.285}
												icon="dna"
												caption="affinity"
												captionPosition="top"
											/>
										</div>
										: null
									}
									<div className="profile-gauge">
										<Gauge
											value={0.834}
											icon="balance-scale"
											caption="integrity"
											captionPosition="top"
										/>
									</div>
								</div>
								: null
							}

							{(activeUser && user && !me) ?
								<div className="profile-button-holder">

									<div className="profile-button">
										<FollowButton

											activeUser={this.props.activeUser}
											targetUser={this.props.user}

											followUser={this.props.followUser}
											unfollowUser={this.props.unfollowUser}

											captionLocation="right"
											captionOffset={0.8}

											callback={this.props.reload}

										/>
									</div>

									<div className="profile-button">
										<Button
											caption="mention"
											captionLocation="right"
											captionOffset={0.8}
											onClick={() => console.log("mention")}>
											<i className="fas fa-at profile-icon" />
										</Button>
									</div>

									<div className="profile-button">
										<Button
											caption="message"
											captionLocation="right"
											captionOffset={0.8}
											onClick={() => console.log("message")}>
											<i className="fas fa-envelope profile-icon" />
										</Button>
									</div>

									<div className="profile-button">
										<Button
											caption="report"
											captionLocation="right"
											captionOffset={0.8}
											color="var(--red)"
											onClick={() => console.log("report")}>
											<i className="fas fa-exclamation-triangle profile-icon" />
										</Button>
									</div>

								</div>

								:null
						}

						</div>
					</Slider>
				</div>

				<div className="profile-feed content-row">
					<Fader exit={this.props.exit}>
						{content}
					</Fader>
				</div>

			</div>
		
		} else {

			return <div>INVALID</div>

		}

	}
}

export default ProfilePage;
