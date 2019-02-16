import React from 'react';
import ImmutableComponent from '../../../widgets/immutableComponent';

import { timeform, formatNumber } from 'utils';

import ProfileFeed from './profilefeed';

import Post from '../../../posts/post';

import Button from '../../../widgets/buttons/button';
import FollowButton from '../../../widgets/buttons/followbutton';
import Gauge from '../../../widgets/gauges/gauge';




class ProfilePage extends ImmutableComponent {

	constructor() {
		super({
			mode: "posts",
			submode: "posts"
		})
	}


	componentDidUpdate() {
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

			const profile = this.props.profile
			const posts = this.props.posts
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

						header={<p className="profile-feed-title">
							<i className="fas fa-users profile-feed-title-icon" />
							<span className="profile-feed-title-text">
								{!followers ?
									<i className="fas fa-circle-notch profile-feed-title-loader" />
									: (followers.size === 0) ?
										"no followers" :
										(followers.size === 1) ?
											"1 follower" :
											`${followers.size} followers`
								}
							</span>
						</p>}

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

						header={<p className="profile-feed-title">
							<i className="fas fa-eye profile-feed-title-icon" />
							<span className="profile-feed-title-text">
								{!following ?
									<i className="fas fa-circle-notch profile-feed-title-loader" />
									: (following.size === 0) ?
										"following no one" :
										(following.size === 1) ?
											"following 1 user" :
											`following ${following.size} users`
								}
							</span>
						</p>}

					/>
					break;

				// Show this user's posts by default
				default:
					// filterCard = <div className="profile-feed-holder">
					// 	<div className="profile-filter card">
					// 		<div className="profile-filter-title">
					// 			<span className="fas fa-filter filter-title-icon"></span>
					// 		</div>
					// 		<div className="profile-filter-button">
					// 			<span className="fas fa-comment filter-icon"></span>
					// 		</div>
					// 		<div className="profile-filter-button">
					// 			<span className="fas fa-comments filter-icon"></span>
					// 		</div>
					// 		<div className="profile-filter-button">
					// 			<span className="fas fa-image filter-icon"></span>
					// 		</div>
					// 		<div className="profile-filter-button">
					// 			<span className="fas fa-bullhorn filter-icon"></span>
					// 		</div>
					// 		<div className="profile-filter-button">
					// 			<span className="fas fa-hashtag filter-icon"></span>
					// 		</div>
					// 		<div className="profile-filter-button">
					// 			<span className="fas fa-exclamation-triangle filter-icon"></span>
					// 		</div>
					// 		<div className="profile-filter-button">
					// 			<span className="fas fa-ban filter-icon"></span>
					// 		</div>
					// 		<div className="profile-filter-button">
					// 			<span className="fas fa-arrows-alt-v filter-icon"></span>
					// 		</div>
					// 		<div className="profile-filter-button">
					// 			<span className="fas fa-coins filter-icon"></span>
					// 		</div>
					// 		<div className="profile-filter-label">
					// 			<p className="profile-filter-text">label here
					// 			</p>
					// 		</div>
					// 	</div>
					// </div>
					content = <div className="profile-feed-holder">
						{posts ?
							posts
								.sort((a, b) => a.created < b.created ? 1 : -1)
								.map(post => <Post

									key={"post-" + post.address}
									post={post}

									podium={this.props.podium}
									activeUser={this.props.activeUser}

									getUser={this.props.getUser}
									
									getPost={this.props.getPost}
									sendPost={this.props.sendPost}

								/>)
								.toList()
							: null
						}
						<div className="footer-spacer"></div>
					</div>

			}

			return <div className="profile">
					<div className="profile-header card">
						<div className={activeUser ?
								"profile-picture-holder" :
								"profile-picture-holder profile-picture-holder-side"
							}>
							{!profile ?
								<div className="profile-picture-loading-box">
									<i className="fas fa-circle-notch profile-picture-loader" />
								</div>
								:
								<img
									className={activeUser ?
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
									className={(this.getState("mode") === "posts") ?
										"profile-stat-box profile-stat-box-on" :
										"profile-stat-box profile-stat-box-off"}
									onClick={() => this.setMode("posts")}>
									<p className="profile-stat">
										<i className="fas fa-comment profile-stat-icon" />
										{!posts ?
											<i className="fas fa-circle-notch profile-stat-loader" />
											:
											<span className="profile-stat-text">
												{formatNumber(posts.size)}
											</span>
										}
									</p>
								</div>
								<div
									className={(this.getState("mode") === "following") ?
										"profile-stat-box profile-stat-box-on" :
										"profile-stat-box profile-stat-box-off"}
									onClick={() => this.setMode("following")}>
									<p className="profile-stat">
										<i className="fas fa-eye profile-stat-icon" />
										{!following ?
											<i className="fas fa-circle-notch profile-stat-loader" />
											:
											<span className="profile-stat-text">
												{formatNumber(following.size)}
											</span>
										}
									</p>
								</div>
								<div
									className={(this.getState("mode") === "followers") ?
										"profile-stat-box profile-stat-box-on" :
										"profile-stat-box profile-stat-box-off"}
									onClick={() => this.setMode("followers")}>
									<p className="profile-stat">
										<i className="fas fa-users profile-stat-icon" />
										{!followers ?
											<i className="fas fa-circle-notch profile-stat-loader" />
											:
											<span className="profile-stat-text">
												{formatNumber(followers.size)}
											</span>
										}
									</p>
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

						{(activeUser && user && user.address !== activeUser.address) ?
							<div className="profile-button-holder">

								<div className="profile-button">
									<FollowButton

										activeUser={this.props.activeUser}
										targetUser={this.props.user}

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
										<i className="fas fa-reply profile-icon" />
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
					<div className="profile-feed">
						{content}
					</div>
				</div>
		
		} else {

			return <div>INVALID</div>

		}

	}
}

export default ProfilePage;
