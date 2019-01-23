import React, { Component } from 'react';
import { Route, Switch, Redirect } from "react-router-dom";

import { fromJS, Map, List } from 'immutable';

import Podix from '@carter_andrewj/podix';


import HUD from './core/HUD';
import Loader from './core/loader';

import LobbyHUD from './lobby/lobbyHUD';
import Lobby from './lobby/lobby';
import Register from './lobby/register';

import Feed from './core/pages/posting/feed';
import PostPage from './core/pages/posting/postpage';

import TopicFeed from './core/pages/topics/topicfeed';
import TopicPage from './core/pages/topics/topicpage';

import Governance from './core/pages/governance/governance';
import RulePage from './core/pages/governance/rulepage';

import Settings from './core/pages/settings/settings';

import ProfilePage from './core/pages/user/profile/profilepage';
import Wallet from './core/pages/user/wallet/wallet';
import Followers from './core/pages/user/followers/followers';
import Following from './core/pages/user/following/following';
import Integrity from './core/pages/user/integrity/integrity';
import AlertsPage from './core/alerts/alertspage';

import Profile from './core/user/profile';

import SearchPage from './core/search/searchpage';
import SearchCard from './core/search/searchcard';

import Error404 from './core/404';




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
	alerts: {}
}))

const emptyUser = Map(fromJS({
	identity: null,
	address: "",
	posts: 0,
	pending: 0,
	followers: [],
	following: [],
	alerts: 0,
	integrity: 0.5,
	balance: {
		pod: 0,
		aud: 0,
		rad: 0
	},
	emblems: [],
	profile: {}
}))

const emptySearch = Map(fromJS({
	"loading": false,
	"pending": 0,
	"target": "",
	"results": {},
	"quickresults": {},
	"error": null
}))


const emptyPost = Map(fromJS({

	created: null,		// Timestamp of the post's creation
	latest: null,		// Timestamp of the last update to this post

	spentPOD: 0,		// POD spent to create the post
	spentAUD: 0,		// AUD spent to create the post
	content: "",		// Content of the post
	ammended: null,		// History of ammendments to this post
	retracted: null,	// The retraction notice on this post, if any

	address: "",		// Address of this post in the ledger
	author: "",			// Address of the user who authored this post in the ledger
	promoters: [],		// Addresses of all users who promoted this post into the
						//		active user's feed, if any

	mentions: [],		// Addresses of any users mentioned in the post
	topics: [],			// Addresses of any topics mentioned in the post
	media: [],			// Addresses of any media featured in the post

	replies: [],		// Addresses to immediate (i.e. 1 generation) replies to this post

	reports: [],		// Address of reports for this post
	sanctions: [],		// Addresses for any sanctions applied as a result of this post

	promotions: 0,		// Count of total promotions of this post
	promoPOD: 0,		// Total POD spent promoting this post
	promoAUD: 0,		// Total AUD spent promoting this post
	
	parent: "",			// Address of the post replied to by this post, if any
	grandparent: "",	// Address of the post replied to by this post's parent, if any
						// 		used in thread curation to allow the thread builder to
						//		look 2 posts back in time without loading additional data
	origin: "",			// Address of the first post in this reply chain
	depth: 0,			// Number of replies between this post and the origin post
	
	feed: false,		// Flag denoting if this post should be published to the feed
	owned: false,		// This post was authored by the active user
	followed: false,	// This post was authored by someone the active user follows
	following: false,	// This post was authored by someone following the active user
	
	processed: null,	// The ID of the updated that last processed this post (to
						// 		avoid multiple sub-threads with the same origin being
						//		published ad-nauseum, each feed process will process
						//		every thread, but may not publish every post. This allows
						//		for such skipped posts to be published as new posts
						//		in a later feed refresh.)
	published: null,	// The ID of the update that last surfaced this post in the feed
	updated: true,		// Flags whether the post has updated since its last appearance
						// 		in the feed
	
	pending: false,		// Flag for the active user's posts to indicate whether the
						// 		record has been stored on the ledger or has been placed
						//		in state via optimistic update
	failed: false		// As above, flag for denoting if the optimistically-updated
						// 		post failed to write to the ledger

}))


class Podium extends Component {

	constructor() {
		super()

		this.state = {
			data: Map(fromJS({

				demomenu: false,

				podium: null,

				user: emptyUser,
				records: emptyRecs,

				feed: {
					threads: [],
					published: 0,
					next: 0,
					pending: 0
				},

				search: emptySearch

			}))
		}

		this.search = this.search.bind(this);

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
		this.publishPosts = this.publishPosts.bind(this);

	}



// STATE MANAGEMENT

	updateState(up, callback) {
		this.setState(
			({data}) => { return {data: up(data)} },
			callback
		);
	}

	getState() {
		const args = Array.prototype.slice.call(arguments)
		if (args.length === 1) {
			return this.state.data.get(args[0])
		} else {
			return this.state.data.getIn([...args])
		}
	}




// INTITIAL SETUP

	componentWillMount() {

		// Get local config in dev mode
		//DEV MODE
		const server = "http://localhost:3000";
		fetch(server)
			.then(response => {
				if (!response.ok) {
					throw new Error("Server Offline")
				} else {
					fetch(server + "/config")
						.then(response => response.json())
						.then(config => {
							this.updateState(state => state
								.set("podium", new Podix(config))
							)
						})
				}
			});
		//DEV MODE

		// Initialize podium module (live)
		//podium = new Podix(config);



		//TODO - Handle errors in radix setup, lack
		//		 off connection, etc...

	}



	//REMOVE BEFORE DEPLOYMENT
	componentDidMount() {
		//this.signIn("test", "password")
	}
	//REMOVE BEFORE DEPLOYMENT




// UTILITIES

	// setMode(mode) {
	// 	this.updateState(state => state.set("mode", mode));
	// }





// TASK MANAGEMENT

	// newTask(id, title, steps) {
	// 	if (steps > 0) {
	// 		this.updateState(state => state
	// 			.setIn(["tasks", id], Map({
	// 				id: id,
	// 				title: title,
	// 				maxstep: steps,
	// 				step: 0,
	// 				complete: false,
	// 				error: null
	// 			}))
	// 		);
	// 	}
	// }

	// async stepTask(id) {
	// 	return new Promise((resolve) => {
	// 		this.updateState(state => state
	// 			.updateIn(
	// 				["tasks", id, "step"],
	// 				(v) => v + 1
	// 			),
	// 			resolve
	// 		);
	// 	})
	// }

	// completeTask(id) {
	// 	this.updateState(state => state
	// 		.setIn(["tasks", id, "complete"], true)
	// 	);
	// }

	// endTask(id) {
	// 	this.updateState(state => state
	// 		.deleteIn(["tasks", id])
	// 	);
	// }

	// failTask(id, error) {
	// 	this.updateState(state => state
	// 		.setIn(["tasks", id, "error"], error)
	// 	);
	// }




// SEARCH

	search(target, fullpage) {
		return new Promise((resolve, reject) => {

			// Check search string length
			if (target.length <= 3) {

				// Clear results if search target falls below 3 characters
				this.updateState(state => state
					.set("search", emptySearch),
					resolve
				)

			// Otherwise, perform search
			} else {
			
				//TODO - Sanitize search string

				// Log search target
				this.updateState(state => state
					.setIn(["search", "loading"], true)
					.setIn(["search", "target"], target)
					.setIn(["search", "error"], null)
					.updateIn(["search", "pending"], (p) => p + 1)
					.updateIn(["search", "results"],
						(l) => l.filter((_, id) => id.includes(target)))
					.updateIn(["search", "quickresults"],
						(l) => l.filter((_, id) => id.includes(target)))
				)

				//TODO - Limit maximum number of search
				//		 results returned by default and
				//		 require an explicit call to
				//		 retrieve more than (e.g.) 10

				//TODO - Curate/sort results

				// Perform search
				fetch(`${this.getState("podium").server}/search?target=${target}`)
					.then(results => results.json())
					.then(results => {

						// Trigger load of each result's profile
						results = fromJS(results)
						const pending = results.map(r => {
							return new Promise((resolve, reject) =>  {
								this.getProfile(r.get("address"), false, false)
									.then(profile => {
										console.log(r.toJS(), profile.toJS());
										const id = r.get("id")
										if (id.includes(target)) {
											this.updateState(state => state
												.updateIn(["search", "quickresults"],
													(l) => l.set(id, <SearchCard
														key={id}
														profile={profile}
														goToProfile={this.goToProfile}
														followUser={this.followUser}
														unfollowUser={this.unfollowUser}
														addToPost={this.addToPost}
													/>))
												.updateIn(["search", "results"],
													(l) => l.set(id, <Profile
														key={id}
														profile={profile}
														goToProfile={this.goToProfile}
														followUser={this.followUser}
														unfollowUser={this.unfollowUser}
														goToPost={this.goToPost}
													/>)),
												resolve
											)
										} else {
											resolve()
										}
									})
									.catch(error => reject(error))
							})
						})

						if (pending.size === 0) {
							return
						} else {
							return Promise.all(pending)
						}

					})
					.then(() => {
						this.updateState(state => state
							.updateIn(["search", "pending"],
								(p) => Math.max(0, p - 1))
							.setIn(["search", "loading"],
								state.getIn(["search", "pending"]) > 1 &&
								state.getIn(["search", "target"]) !== ""),
							resolve
						)
					})

					//TODO - Handle search results page in case of
					//		 error (besides empty results)
					.catch(error => reject(error))
			}
		})
	}




// ACTIVE USER MANAGEMENT

	async registerUser(
			id,
			pw,
			name,
			bio,
			picture,
			ext
		) {
		return new Promise((resolve, reject) => {
			this.getState("podium")
				.createUser(id, pw, name, bio, picture, ext)
				.then(() => this.signIn(id, pw))
				.catch(error => reject(error))
		});
	}


	async signIn(id, pw) {
		//TODO - Allow user to cache encrypted key locally
		//		 for faster sign-in
		//TODO - Sign in before finding all followers, etc..
		return new Promise((resolve, reject) => {
			this.getState("podium")
				.identity(id, pw, true)
				.then(result => resolve(this.initSession.bind(this)))
				.catch(error => reject(error))
		});
	}


	initSession() {

		// Get account for this user identity
		const address = this.getState("podium").user.account.getAddress();

		// Store in state
		this.updateState(state => state
			.set("mode", "core")
			.set("user", emptyUser)
			.setIn(["user", "address"], address)
		);

		// Load profile data
		this.getProfile(address).then(profile => {
			this.updateState(state => state
				.setIn(["user", "profile"], profile)
			)
		})

		// Load user's posts and alerts
		this.getState("podium").listenPosts(address, this.receivePost)
		this.getState("podium").listenAlerts(address, this.receiveAlert)
		this.getState("podium").listenFollow(address, this.receiveFollowing)

	}


	signOut() {
		this.getState("podium").clearUser();
		this.updateState(state => state
			.set("user", {})
			.set("records", emptyRecs)
			.set("mode", "lobby")
		);
	}




// HANDLE NEW DATA

	receivePost(post) {

		// Add post record to state
		const postType = post.get("type")
		switch (postType) {

			// Load post record from reference record
			case ("reference"):
				this.getPost(post.get("address"))
				break;

			// Load promoted post from promotion record
			case ("promoted"):
				this.buildPromotion(post)
				break;

			// Otherwise, build the post from the record
			default:
				this.buildPost(post)

		}

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
		const address = following.get("address")
		this.updateState(state => state
			.updateIn(["user", "following"], f => f.push(address))
		);

		// Get the user's profile info
		this.getProfile(following.get("address"))
			.then(() => this.updateState(state => state
				.setIn(["records", "users", address, "following"], true)	
			))

		// Subscribe for posts from this user
		this.getState("podium").listenPosts(address, this.receivePost)

	}




// USERS

	async getProfile(target, fromID=false, store=true) {

		return new Promise((resolve, reject) => {

				// Check if profile has already been stored
				let current;
				if (fromID) {
					current = this.state.data
						.getIn(["records", "users"])
						.filter((user) => user.get("id") === target)
						.first()
					if (current) { resolve(current) }
				} else {
					current = this.state.data
						.getIn(["records", "users", target]);
					if (current) { resolve(current) }
				}

				console.log("fetching profile", target, fromID)

				// Retrieve the latest profile information for the
				// provided address
				this.getState("podium")
					.fetchProfile(target, fromID)
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


	goToProfile(address) {
		this.updateState(state => state
			.set("subjectUser", address)
			.set("mode", "profile")
		)
	}


	clearProfile() {
		this.updateState(state => state
			.set("subjectUser", null)
		)
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

		return new Promise((resolve, reject) => this.getState("podium")
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


	addToPost(address) {
		console.log("Adding id for user with address ", address, " to current post string.")
	}


	async getPost(address, store=true) {
		return new Promise((resolve, reject) => {

			// Check if post has already been stored
			const current = this.state.data
				.getIn(["records", "posts", address]);
			if (current) {

				// Return existing post
				resolve(current)

			} else {

				// Retrieve the latest post information for the
				// provided address
				this.getState("podium")
					.fetchPost(address)
					.then(post => resolve(this.buildPost(post, store)))
					.catch(error => reject(error))

			}

		});
	}


	buildPost(newPost, store) {
		return new Promise((resolve, reject) => {

			console.log("Building Post:", newPost.get("content"))

			// Unpack post
			const address = newPost.get("address")
			const author = newPost.get("author")

			// Check and update current posts
			let post;
			const oldPost = this.getState("records", "post", address)
			if (oldPost) {
				post = oldPost
					.mergeDeep(newPost)
					.set("updated", true)
			} else {
				post = emptyPost.mergeDeep(newPost);
			}

			// Set flags for this post
			if (author === this.state.data.getIn(["user", "address"])) {
				post = post
					.set("owned", true)
					.set("feed", true)
			}
			if (author in this.state.data.getIn(["user", "following"])) {
				post = post
					.set("following", true)
					.set("feed", true)
			}
			post.set("follower",
				(author in this.state.data.getIn(["user", "followers"])))
			//TODO - Other classifications (reactions, reports, etc...)

			// Load post's author
			// - We don't store the author in the call to getProfile to ensure
			//   a fully atomic, single update with both post and author
			let profile = this.getProfile(author, false, false)

			// Pre-emptively load preceeding and origin posts for replies
			let parent;
			let origin;
			if (post.get("depth") > 0 && post.get("forFeed")) {
				parent = this.getPost(post.get("parent"))
				if (post.get("depth") !== 1) {
					origin = this.getPost(post.get("origin"))
				}
			}

			//TODO - Pre-emptively load mentions and topics

			// Wait for all dependencies to resolve
			Promise
				.all([parent, origin, profile])
				.then(([parentPost, originPost, profile]) => {
					if (store) {

						// Store post in state, if required
						this.updateState(state => state
							.updateIn(["feed", "pending"],
								p => post.get("feed") ? p + 1 : p)
							.setIn(["records", "posts", address], post)
							.setIn(["records", "users", author], profile),
							() => resolve(post)
						)

					} else {

						// Otherwise, store supporting data
						// in the post itself and return
						post = post.set("author", profile)
						if (parentPost) {
							post.set("parent", parentPost)
						}
						if (originPost) {
							post.set("origin", originPost)
						}
						resolve(post)

					}
				})
				.catch(error => reject(error))

		})

	}


	async publishPosts() {

		// Get next feed id
		const nextFeed = this.getState("feed", "next")

		// Get post records
		const allPosts = this.getState("records", "posts")

		// Get posts for publishin
		const processGroup = allPosts

			// Strip post keys
			.valueSeq()

			// Select all "in-feed" posts (i.e. those from the
			// active user, users they follow, or via promotions)
			// that are either not in the current feed, or not
			// up-to-date in that feed
			.filter(post => post.get("feed") && post.get("updated"))


		console.log("All Posts:", allPosts.toJS())
		console.log("Eligible Posts:", processGroup.toJS())


		// Curate threads
		const publishGroup = processGroup

			// Sort posts by the most recently updated
			.sort((a, b) => (a.get("latest") < b.get("latest")) ? 1 : -1)

			// Group these posts into threads by origin
			.groupBy(post => post.get("origin"))

			// Process each potential thread
			.map(posts => posts

				// Filter out posts that are either not in the same
				// subthread as the most recent post, or which are
				// more than 2 generations removed from the last
				// "in-feed" post
				.filter((post, i) =>
					i === 0 ||
					post.get("address") === posts[i-1].get("parent") ||
					(i > 1 && post.get("address") === posts[i-2].get("grandparent"))
				)

				// Reduce each thread down to a list of
				// addresses for each post therein
				.reduce((thread, post, i) => {

					// Get post address
					const address = post.get("address")

					// Always select latest post
					if (i === 0) {
						return thread.push(address)

					// Return consecutive posts unaltered
					} else if (post[i-1].get("parent") === address) {
						return thread.push(address)

					// Return placeholders for missing posts
					} else {
						return thread
							.push(post.get("parent"))
							.push(address)
					}

				}, List())

			)

			// Add the origin post to each thread, if required.
			// Where a gap exists between the last post and the
			// thread origin, return an integer representing
			// the number of missing posts.
			.map(thread => {
				console.log("final", thread.toJS())
				const last = allPosts.get(thread.last())
				const origin = last.get("origin");
				const depth = last.get("depth");
				if (origin !== last.get("address")) {
					if (depth > 1) {
						return thread.push(depth-1).push(origin)
					} else {
						return thread.push(origin)
					}
				} else {
					return thread
				}
			})

			// Reverse each thread, so the origin appears first
			.map(thread => thread.reverse())
			.toList()


		// Check if there are posts to publish
		if (publishGroup.size > 0) {
			this.updateState(state => state

				// Store feed
				.setIn(["feed", "pending"], 0)
				.updateIn(["feed", "next"], f => f + 1)
				.updateIn(["feed", "published"], p => p + publishGroup.size)
				.updateIn(["feed", "threads"], t => t.concat(publishGroup))

				// Log which posts have been published
				.updateIn(["records", "posts"], posts => {
					processGroup.forEach(post => {
						posts = posts.setIn(
							[post.get("address"), "processed"],
							nextFeed
						)
					})
					publishGroup.flatten().forEach(address => {
						posts = posts
							.setIn([address, "published"], nextFeed)
							.setIn([address, "updated"], false)
					})
					return posts
				})
			)
		}

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
			this.getState("podium")
				.createTopic(
					id, name, description,
					this.state.data.getIn(["user", "address"])
				)
				.then(topic => resolve(topic))
				.catch(error => reject(error))
		});

	}



	async getTopic(target, fromID=false, store=true) {

		// Retreives the record for a topic with the
		// provided address.

		return new Promise((resolve, reject) => {

			// Check if topic has already been stored
			let current;
			if (fromID) {
				current = this.state.data
					.getIn(["records", "topics"])
					.filter((topic) => topic.get("id") === target)
					.first()
				if (current) { resolve(current) }
			} else {
				current = this.state.data
					.getIn(["records", "topics", target]);
				if (current) { resolve(current) }
			}

			// Otherwise retreive topic from the ledger
			this.getState("podium").fetchTopic(target, fromID)
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
			this.getState("podium")
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

		const demoMenu = <div
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



		// Route to main post feed
		const FeedRoute = <Route
			exact
			path="/"
			render={props => <Feed {...props}

				activeUser={this.getState("user")}
				getProfile={this.getProfile}

				feedData={this.getState("feed")}

				posts={this.getState("records", "posts")}
				sendPost={this.sendPost}
				getPost={this.getPost}
				publishPosts={this.publishPosts}

				promotePost={this.promotePost}
				reportPost={this.reportPost}
				amendPost={this.amendPost}
				retractPost={this.retractPost}

				followUser={this.followUser}
				unfollowUser={this.unfollowUser}

				getTopic={this.getTopic}

			/>}
		/>

		// Route to a post with a given >address<
		const PostRoute = <Route
			path="/post/:address"
			render={props => <PostPage {...props}

				postAddress={props.match.params.address}

				getPost={this.getPost}

			/>}
		/>


		// Route to the profile page of the user
		// with the given >address<
		const ProfileRoute = <Route
			path="/user/:address"
			render={props => <ProfilePage {...props}

				userAddress={props.match.params.address}

				posts={this.getState("records", "posts")}
				users={this.getState("records", "users")}

				getProfile={this.getProfile}

				getPost={this.getPost}
				promotePost={this.promotePost}
				reportPost={this.reportPost}
				amendPost={this.amendPost}
				retractPost={this.retractPost}

			/>}
		/>

		// Route to the wallet page of the active user
		const WalletRoute = <Route
			path="/wallet"
			render={props => <Wallet {...props}

			/>}
		/>

		// Route to the followers page of the active user
		const FollowersRoute = <Route
			path="/followers"
			render={props => <Followers {...props}

				
				users={this.getState("records", "users")}
				getProfile={this.getProfile}

				followers={this.getState("records", "followers")}
				followUser={this.followUser}
				unfollowUser={this.unfollowUser}

			/>}
		/>

		// Route to the following page of the active user
		const FollowingRoute = <Route
			path="/following"
			render={props => <Following {...props}

				following={this.getState("records", "following")}
				users={this.getState("records", "users")}

			/>}
		/>

		// Route to the integrity page of the active user
		const IntegrityRoute = <Route
			path="/integrity"
			render={props => <Integrity {...props}

			/>}
		/>

		// Route to the Alerts page of the active user
		const AlertsRoute = <Route
			path="/alerts"
			render={props => <AlertsPage {...props}

			/>}
		/>


		// Route to the topic curation page
		const TopicFeedRoute = <Route
			path="/topics"
			render={props => <TopicFeed {...props}

			/>}
		/>

		// Route to the details page for a specific
		// topic with the given >address<
		const TopicRoute = <Route
			path="/topic/:address"
			render={props => <TopicPage {...props}

				topicAddress={props.match.params.address}

				getTopic={this.getTopic}

			/>}
		/>


		// Route to the main governance page
		const GovernanceRoute = <Route
			path="/governance"
			render={props => <Governance {...props}

			/>}
		/>

		// Route to the details page for a specific
		// rule with the given >address<
		const RuleRoute = <Route
			path="/governance/rules/:address"
			render={props => <RulePage {...props}

				ruleAddress={props.match.params.address}

			/>}
		/>


		// Route to the settings page
		const SettingsRoute = <Route
			path="/settings"
			render={props => <Settings {...props}

			/>}
		/>


		// Route to the search results page
		const SearchRoute = <Route
			path="/search"
			render={props => <SearchPage {...props}

			/>}
		/>



		// Route to the main lobby
		const LobbyRoute = <Route
			exact
			path="/"
			render={props => <Lobby {...props}

			/>}
		/>

		// Route to the registration page
		const RegisterRoute = <Route
			path="/register"
			render={props => <Register {...props}

			/>}
		/>


		return <div ref="podium" className="podium">
			<div className="backdrop"></div>
			{!this.getState("podium")?

				<Loader /> :

				this.getState("podium").user ? 

					<HUD

						activeUser={this.getState("user")}

						search={this.search}
						searchData={this.getState("search")}

						followUser={this.followUser}
						unfollowUser={this.unfollowUser}

						alerts={this.getState("records", "alerts")}

						throwPopup={this.throwPopup}
						signOut={this.signOut}

						>
						<Switch>

							{FeedRoute}
							{PostRoute}
							
							{ProfileRoute}
							{WalletRoute}
							{FollowersRoute}
							{FollowingRoute}
							{IntegrityRoute}
							{AlertsRoute}

							{TopicFeedRoute}
							{TopicRoute}

							{GovernanceRoute}
							{RuleRoute}

							{SettingsRoute}

							{SearchRoute}
							
							<Route component={Error404} />

						</Switch>
					</HUD>

					:

					<LobbyHUD

						signIn={this.signIn}

						>
						<Switch>

							{LobbyRoute}
							{RegisterRoute}

							{ProfileRoute}
							{TopicRoute}
							{PostRoute}

							{RuleRoute}

							<Redirect to="/" />

						</Switch>
					</LobbyHUD>

			}

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

	}




// CLEAN UP

	componentWillUnmount() {

		// Close connections
		this.getState("podium").cleanUp();

	}



}

export default Podium;