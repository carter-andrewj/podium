import React, { Component } from 'react';
import { fromJS, Map } from 'immutable';

import Sanitizer from 'sanitize';


import Podix from '@carter_andrewj/podix';

import Settings from 'settings';

import Lobby from './lobby/lobby';
import Core from './core/core';
import Loading from './core/widgets/loading';
import Tasks from './core/widgets/tasks/tasks';



let podium;

const emptyRecs = Map(fromJS({
	posts: {},
	users: {
		none: {
			id: "placeholder",
			name: "Place Holder",
			bio: "I am a normal human person.",
			picture: "./images/profile-placeholder.png",
			created: (new Date()).getTime(),
			updated: (new Date()).getTime(),
			address: "none"
		}
	},
	topics: {},
	alerts: {},
	following: {},
	followers: {}
}))

const emptyUser = Map(fromJS({
	identity: null,
	address: "none",
	posts: 0,
	pending: 0,
	followers: 0,
	following: 0,
	alerts: 0,
	integrity: 0.5,
	balance: {
		pod: 0,
		aud: 0,
		rad: 0
	},
	emblems: []
}))


class Podium extends Component {

	constructor() {
		super()

		this.state = {
			data: Map(fromJS({

				offline: false,
				demomenu: false,

				mode: "lobby",
				settings: Settings,

				user: {},
				records: emptyRecs,

				tasks: {}

			}))
		}

		this.setMode = this.setMode.bind(this);

		this.newTask = this.newTask.bind(this);
		this.stepTask = this.stepTask.bind(this);
		this.completeTask = this.completeTask.bind(this);
		this.endTask = this.endTask.bind(this);
		this.failTask = this.failTask.bind(this);

		this.signIn = this.signIn.bind(this);
		this.signOut = this.signOut.bind(this);
		this.registerUser = this.registerUser.bind(this);

		this.receivePost = this.receivePost.bind(this);
		this.receiveAlert = this.receiveAlert.bind(this);
		this.receiveFollowing = this.receiveFollowing.bind(this);

		this.getProfile = this.getProfile.bind(this);

		this.followUser = this.followUser.bind(this);
		this.unfollowUser = this.unfollowUser.bind(this);

		this.createTopic = this.createTopic.bind(this);
		this.getTopic = this.getTopic.bind(this);
		this.deleteTopic = this.deleteTopic.bind(this);

		this.sendPost = this.sendPost.bind(this);
		this.getPost = this.getPost.bind(this);

	}



// STATE MANAGEMENT

	updateState(up, callback) {
		this.setState(
			({data}) => { return {data: up(data)} },
			callback
		);
	}




// INTITIAL SETUP

	componentWillMount() {

		// Initialize podium module (live)
		//podium = new Podix();

		// Inisitalize podium mode (dev)
		podium = new Podix({
			"Universe": "alphanet",
			"ApplicationID": "podiumDEV-0",
			"API": "localhost:3000",
			"MediaStore": "media.podium-network.com",
			"Timeout": 30,
			"Lifetime": 0,
			"FileLimit": "5mb"
		}, true)

		//TODO - Handle errors in radix setup, lack
		//		 off connection, etc...

	}





// UTILITIES

	setMode(mode) {
		this.updateState(state => state.set("mode", mode));
	}





// TASK MANAGEMENT

	newTask(id, title, steps) {
		if (steps > 0) {
			this.updateState(state => state
				.setIn(["tasks", id], Map({
					id: id,
					title: title,
					maxstep: steps,
					step: 0,
					complete: false,
					error: null
				}))
			);
		}
	}

	async stepTask(id) {
		return new Promise((resolve) => {
			this.updateState(state => state
				.updateIn(
					["tasks", id, "step"],
					(v) => v + 1
				),
				resolve
			);
		})
	}

	completeTask(id) {
		this.updateState(state => state
			.setIn(["tasks", id, "complete"], true)
		);
	}

	endTask(id) {
		this.updateState(state => state
			.deleteIn(["tasks", id])
		);
	}

	failTask(id, error) {
		this.updateState(state => state
			.setIn(["tasks", id, "error"], error)
		);
	}




// SEARCH

	search(target) {
		return new Promise((resolve, reject) => {
			const cleanTarget = Sanitizer.value(target, "string");
			fetch(`https://${podium.server}/search?target=${cleanTarget}`)
				.then(results => {
					if (results.length === 0) {
						reject(new Error("no match found"))
					} else {
						resolve(results)
					}
				})
				.catch(error => reject(error))
		})
	}




// ACTIVE USER MANAGEMENT

	async registerUser(
			id,
			pw,
			name,
			bio,
			picture
		) {
		return new Promise((resolve, reject) => {
			podium
				.createUser(id, pw, name, bio, picture, true)
				.then(result => resolve(this.initSession.bind(this)))
				.catch(error => reject(error))
		});
	}


	async signIn(id, pw) {
		//TODO - Allow user to cache encrypted key locally
		//		 for faster sign-in
		//TODO - Sign in before finding all followers, etc..
		return new Promise((resolve, reject) => {
			podium
				.setUser(id, pw)
				.then(result => resolve(this.initSession.bind(this)))
				.catch(error => reject(error))
		});
	}


	initSession() {

		// Get account for this user identity
		const address = podium.user.account.getAddress();

		// Store in state
		this.updateState(state => state
			.set("mode", "core")
			.set("user", emptyUser)
			.setIn(["user", "address"], address)
		);

		// Load profile data
		this.getProfile(address)

		// Load user's posts and alerts
		podium.listenPosts(address, this.receivePost)
		podium.listenAlerts(address, this.receiveAlert)
		podium.listenFollow(address, this.receiveFollowing)

	}


	signOut() {
		this.updateState(state => state
			.set("user", {})
			.set("records", emptyRecs)
			.set("mode", "lobby")
		);
	}




// HANDLE NEW DATA

	receivePost(post) {

		// Add post record to state
		post.set("pending", false);
		this.updateState(state => {
			var newState = state
				.updateIn(["records", "posts", post.get("address")],
					(p) => (!p) ?
						post : (post.get("type") === "post-ref") ?
							p : p.mergeDeep(post)
					);
			if (post.get("author") === state.getIn(["user", "address"])) {
				newState = newState
					.updateIn(["user", "posts"], (p) => p += 1)
					.updateIn(["user", "pending"], (p) => p -= 1)
			}
			return newState;
		});

		//TODO - Load original if post was promoted

		// Retreive the post content
		this.getPost(post.get("address"));

	}


	receiveAlert(alert) {

		// Add alert record to state
		this.updateState(state => state
			.updateIn(["user", "alerts"], (v) => v += 1)
			.updateIn(["records", "alerts", alert.get("address")],
				(a) => (a) ?
					a.mergeDeep(alert) :
					alert
			)
		);

		//TODO - Pre-emptively load alert subject matter

	}


	receiveFollowing(following) {

		//TODO - Validate relation record for this follower record

		// Add record to state
		this.updateState(state => state
			.updateIn(["user", "following"], (v) => v += 1)
			.updateIn(["records", "following", following.get("address")],
				(f) => (f) ?
					f.mergeDeep(following) :
					following
			)
			.setIn(["records", "users", following.get("address"), "following"],
				   true)
		);

		// Get the user's profile info
		this.getProfile(following.get("address"));

		// Subscribe for posts from this user
		podium.listenPosts(
			following.get("address"),
			this.receivePost
		)

	}




// USERS

	async getProfile(target, id=false, store=true) {

		return new Promise((resolve, reject) => {

				// Check if profile has already been stored
				let current;
				if (id) {
					current = this.state.data
						.getIn(["records", "users"])
						.filter((user) => user.get("id") === target)
						.first()
					if (current.size > 0) { resolve(current) }
				} else {
					current = this.state.data
						.getIn(["records", "users", target]);
					if (current) { resolve(current) }
				}

				// Retrieve the latest profile information for the
				// provided address
				podium
					.fetchProfile(target, id)
					.then(profile => {

						//TODO - Load integrity and balances for this user
						profile.set("integrity", 0.5);
						profile.set("affinity", 0.5);
						profile.set("pod", 0);
						profile.set("aud", 0);

						// Add this profile to the app state or return the result
						if (store) {
							this.updateState(state => state
								.updateIn(["records", "users", profile.get("address")],
									(u) => (u) ? 
										u.mergeDeep(profile) :
										profile
								),
								() => { resolve(profile); }
							);
						} else {
							resolve(profile);
						}

					})
					.catch(error => reject(error));

			});

	}




// POSTING

	async sendPost(content, parent) {

		// Packages and stores a new post. Each post is stored
		// in one location, created from the posting user's
		// address and the number of posts they have sent.
		// That address is then indexed in the user's post
		// archive and in the user's current outgoing reaction
		// pool, as well as the archive of any topics the post
		// references. Finally, alerts are sent to any
		// users mentioned in the new post.

		//TODO - Add post to reaction pool

		//TODO - Handle links so posts can be cross-referenced
		//		by the articles to which they refer and by the
		//		parent sites.

		return new Promise((resolve, reject) => podium
			.createPost(content, [], parent)
			.then((post) => {
				post.set("pending", true);
				this.updateState(state => state
					.setIn(["records", "posts", post.get("address")], post)
					.updateIn(["user", "pending"], (p) => p += 1)
				)
			})
			.catch(error => reject(error))
		);

	}


	async getPost(address, store=true) {
		return new Promise((resolve, reject) => {

			// Check if post has already been stored
			const current = this.state.data
				.getIn(["records", "posts", address]);
			if (current) { resolve(current); }

			// Retrieve the latest post information for the
			// provided address
			podium
				.fetchPost(address)
				.then(post => {

					// Set post flags for this user
					const author = post.get("author");
					post
						.set("owned", (author === this.state.data.getIn(["user", "address"])))
						.set("following", (author in this.state.data.getIn(["records", "following"])))
						//TODO - Other classifications

					// Load post's author
					// - We don't store the author in the call to getProfile to ensure
					//   a fully atomic, single update with both post and author
					this.getProfile(author, false, false)
						.then(profile => {

							// Add this profile to the app state
							// or return the result
							if (store) {
								this.updateState(
									state => state
										.updateIn(["records", "posts", address],
											(p) => (p) ? p.mergeDeep(post) : post)
										.updateIn(["records", "users", post.author],
											(u) => (u) ? u.mergeDeep(profile) : profile),
									() => { resolve(post); }
								);
							} else {
								post.set("author", profile);
								resolve(post);
							}

						});

				})
				.catch(error => reject(error))

		});
	}


	async promotePost(address) {
		console.log("PROMOTED POST ", address);
	}

	async reportPost(address) {
		console.log("REPORTED POST ", address);
	}

	async amendPost(address, content) {
		console.log("AMEND POST ", address, content);
	}

	async retractPost(address, content) {
		console.log("RETRACT POST, ", address, content);
	}


	


// ALERTS





// TOPICS

	async createTopic(id, name, description) {

		// Adds a new topic by generating a storage
		// channel from its ID and registering that
		// channel with the main storage index.

		return new Promise((resolve, reject) => {
			podium
				.createTopic(
					id, name, description,
					this.state.data.getIn(["user", "address"])
				)
				.then(topic => resolve(topic))
				.catch(error => reject(error))
		});

	}



	async getTopic(target, id=false, store=false) {

		// Retreives the record for a topic with the
		// provided address.

		return new Promise((resolve, reject) => {

			// Check if topic has already been stored
			let current;
			if (id) {
				current = this.state.data
					.getIn(["records", "topics"])
					.filter((topic) => topic.get("id") === target)
					.first()
				if (current.size > 0) { resolve(current) }
			} else {
				current = this.state.data
					.getIn(["records", "topics", target]);
				if (current) { resolve(current) }
			}

			// Otherwise retreive topic from the ledger
			podium.fetchTopic(target, id)
				.then(topic => {
					if (store) {
						this.updateState(
							state => state.updateIn(
								["records", "topics", topic.get("address")],
								(t) => (t) ? t.mergeDeep(topic) : topic
							),
							() => { resolve(topic); }
						);
					} else {
						resolve(topic);
					}
				})
				.catch(error => reject(error))
		})

	}


	async deleteTopic() {

	}






// FOLLOWING/FOLLOWERS

	async followUser(follow) {

		// Records the currently active user as following the
		// provided <user>. The transaction takes three parts:
		// 	- Creating a record of the active user in the 
		//    target user's 'followers' address
		//  - Creating a record of the target user in the
		//    active user's 'following' address
		//  - Creating a relationship record between the two
		//    users. This is used to track the state of the
		//    relationship and allow efficient unfollowing
		//    without requiring an anti-follow record to be
		//	  stored in both other locations, whose size
		//    (in atoms) could grow quite large.

		//TODO - Check active user is not already following
		//		 the target user
		//TODO - Check active user has the required permissions
		//		 to follow target user

		return new Promise((resolve, reject) => {
			podium
				.followUser(
					this.state.data.getIn(["user", "address"]),
					follow
				)
				.then(result => resolve(result))
				.catch(error => reject(error))
		});

	}


	async unfollowUser(user) {

		// Update relation record between the target user and
		// the active user

		// Remove the target user from the app state

	}



// DEMO OPTIONS

	toggleDemoMenu() {
		this.updateState(state => state
			.update("demomenu", (x) => !x)
		);
	}




// RENDER

	render() {

		let content;
		switch (this.state.data.get("mode")) {

			case ("lobby"):
				content = <Lobby
					podium={this.state.data.get("podium")}
					registerUser={this.registerUser}
					signIn={this.signIn}
				/>
				break;

			case ("loading"):
				content = <Loading />;
				break;

			default:
				content = <Core

					podium={this.state.data.get("podium")}
					user={this.state.data.get("user")}
					records={this.state.data.get("records")}

					search={this.search}

					getProfile={this.getProfile}
					getTopic={this.getTopic}

					followUser={this.followUser}
					unfollowUser={this.unfollowUser}

					sendPost={this.sendPost}
					getPost={this.getPost}
					promotePost={this.promotePost}
					reportPost={this.reportPost}
					amendPost={this.amendPost}
					retractPost={this.retractPost}

					throwPopup={this.throwPopup}

					signOut={this.signOut}

				/>

		}

		let demoMenu = <div
			className={(this.state.data.get("demomenu")) ? 
				"card demo-menu demo-menu-open" :
				"card demo-menu demo-menu-closed"}>
			<p className="demo-menu-title">
				Demo Menu
			</p>
			<p className="demo-menu-option"
				onClick={()=> window.location.href =
					"mailto:andrew@podium-network.com" +
						"?subject=Re:%20Podium%20Demo%20-%20Feedback"
				}>
				<span className="fas fa-envelope demo-menu-icon"></span>
				Send Feedback
			</p>
			<p className="demo-menu-option"
				onClick={() => window.open(
					"https://www.podium-network.com",
					"_blank"
				)}>
				<span className="fas fa-sign-out-alt demo-menu-icon"></span>
				Podium Homepage
			</p>
		</div>
		
		return (
			<div ref="podium" className="podium">
				{content}
				<Tasks
					tasks={this.state.data.get("tasks")}
					endTask={this.endTask}
				/>
				{demoMenu}
					<div
						className="red-button demo-button card"
						onClick={this.toggleDemoMenu.bind(this)}>
						{(this.state.data.get("demomenu")) ?
							<span className="fas fa-times demo-button-icon"></span> :
							<span className="fas fa-magic demo-button-icon"></span>
						}
					</div>
			</div>
		);
	}




// CLEAN UP

	componentWillUnmount() {

		// Close connections
		podium.cleanUp();

	}



}

export default Podium;