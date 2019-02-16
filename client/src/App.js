import React, { Component } from 'react';
import { Route, Switch, Redirect } from "react-router-dom";

import { fromJS, Map, List } from 'immutable';

import { PodiumClient } from '@carter_andrewj/podix';

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

import Profile from './core/pages/user/profile/profile';
import Wallet from './core/pages/user/wallet/wallet';
import Followers from './core/pages/user/followers/followers';
import Following from './core/pages/user/following/following';
import Integrity from './core/pages/user/integrity/integrity';

import AlertsPage from './core/alerts/alertspage';
import SearchPage from './core/search/searchpage';

import Error404 from './core/404';



let alerter;

const emptyRecs = Map(fromJS({
	posts: {},
	users: {},
	topics: {},
	alerts: {}
}))


const emptySearch = Map(fromJS({
	"loading": false,
	"pending": 0,
	"target": "",
	"results": {},
	"error": null
}))


// const emptyPost = Map(fromJS({

// 	created: null,		// Timestamp of the post's creation
// 	latest: null,		// Timestamp of the last update to this post

// 	spentPOD: 0,		// POD spent to create the post
// 	spentAUD: 0,		// AUD spent to create the post
// 	content: "",		// Content of the post
// 	ammended: null,		// History of ammendments to this post
// 	retracted: null,	// The retraction notice on this post, if any

// 	address: "",		// Address of this post in the ledger
// 	author: "",			// Address of the user who authored this post in the ledger
// 	promoters: [],		// Addresses of all users who promoted this post into the
// 						//		active user's feed, if any

// 	mentions: [],		// Addresses of any users mentioned in the post
// 	topics: [],			// Addresses of any topics mentioned in the post
// 	media: [],			// Addresses of any media featured in the post

// 	replies: [],		// Addresses to immediate (i.e. 1 generation) replies to this post

// 	reports: [],		// Address of reports for this post
// 	sanctions: [],		// Addresses for any sanctions applied as a result of this post

// 	promotions: 0,		// Count of total promotions of this post
// 	promoPOD: 0,		// Total POD spent promoting this post
// 	promoAUD: 0,		// Total AUD spent promoting this post
	
// 	parent: "",			// Address of the post replied to by this post, if any
// 	grandparent: "",	// Address of the post replied to by this post's parent, if any
// 						// 		used in thread curation to allow the thread builder to
// 						//		look 2 posts back in time without loading additional data
// 	origin: "",			// Address of the first post in this reply chain
// 	depth: 0,			// Number of replies between this post and the origin post
	
// 	feed: false,		// Flag denoting if this post should be published to the feed
// 	owned: false,		// This post was authored by the active user
// 	followed: false,	// This post was authored by someone the active user follows
// 	following: false,	// This post was authored by someone following the active user
	
// 	processed: null,	// The ID of the updated that last processed this post (to
// 						// 		avoid multiple sub-threads with the same origin being
// 						//		published ad-nauseum, each feed process will process
// 						//		every thread, but may not publish every post. This allows
// 						//		for such skipped posts to be published as new posts
// 						//		in a later feed refresh.)
// 	published: null,	// The ID of the update that last surfaced this post in the feed
// 	updated: true,		// Flags whether the post has updated since its last appearance
// 						// 		in the feed
	
// 	pending: false,		// Flag for the active user's posts to indicate whether the
// 						// 		record has been stored on the ledger or has been placed
// 						//		in state via optimistic update
// 	failed: false		// As above, flag for denoting if the optimistically-updated
// 						// 		post failed to write to the ledger

// }))


const emptyFeed = Map(fromJS({
	threads: [],
	published: 0,
	next: 0,
	pending: 0
}))


class App extends Component {

	constructor() {
		super()

		this.state = {
			data: Map(fromJS({

				demomenu: false,

				podium: null,
				initializing: false,

				activeUser: null,

				records: emptyRecs,

				feed: emptyFeed,

				search: emptySearch,

				alerts: {}

			}))
		}

		this.search = this.search.bind(this)
		this.resetSearch = this.resetSearch.bind(this)

		this.signIn = this.signIn.bind(this)
		this.signOut = this.signOut.bind(this)
		this.registerUser = this.registerUser.bind(this)

		this.getAlerts = this.getAlerts.bind(this)

		this.receiveAlert = this.receiveAlert.bind(this)
		this.receiveFollow = this.receiveFollow.bind(this)

		this.getUser = this.getUser.bind(this)
		this.loadUser = this.loadUser.bind(this)
		this.saveUser = this.saveUser.bind(this)

		this.sendPost = this.sendPost.bind(this)
		this.getPost = this.getPost.bind(this)
		this.loadPost = this.loadPost.bind(this)
		this.savePost = this.savePost.bind(this)
		this.publishPosts = this.publishPosts.bind(this)

	}



// STATE MANAGEMENT

	updateState(up, callback) {
		this.setState(
			({data}) => { return { data: up(data)} },
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
		new PodiumClient()
			.connect({ ServerURL: "http://localhost:3000" })
		//	.connect({ ServerURL: "https://api.podium-network.com"})
			.then(podium => {
				//podium.setDebug(true)
				this.updateState(state => state
					.set("podium", podium)
				)
			})
			.catch(error => console.error(error))

		//TODO - Handle errors in radix setup, lack
		//		 off connection, etc...

	}




// SEARCH

	search(target) {
		return new Promise((resolve, reject) => {

			// Check search string length
			if (target.length < 3) {

				// Clear results if search target falls below 3 characters
				this.resetSearch()
				resolve()

			// Otherwise, perform search
			} else {
			
				//TODO - Sanitize search string

				console.log("new search", target, this.getState("search", "pending"))

				// Log search target
				this.updateState(state => state
					.setIn(["search", "loading"], true)
					.setIn(["search", "target"], target)
					.setIn(["search", "error"], null)
					.updateIn(["search", "pending"], p => p + 1)
					.updateIn(["search", "results"], results => results
						.filter(r => r.get("id").includes(target))
					)
				)

				//TODO - Limit maximum number of search
				//		 results returned by default and
				//		 require an explicit call to
				//		 retrieve more than (e.g.) 10

				//TODO - Curate/sort results

				this.getState("podium")
					.search(target)
					.then(results => {

						// Exclude results if the search
						// string has changed before return
						const currentTarget = this.getState("search", "target")
						var userList = results
							.filter(r => r.get("id").includes(currentTarget))
							.toList()

						// Update state with new results
						this.updateState(state => state
							.setIn(["search", "results"], userList)
							.updateIn(["search", "pending"],
								(p) => Math.max(0, p - 1))
							.setIn(["search", "loading"],
								state.getIn(["search", "pending"]) > 1 &&
								state.getIn(["search", "target"]) !== ""),
							() => {
								console.log("finished search", target, this.getState("search", "pending"))
								resolve()
							}
						)

					})
					.catch(error => console.error(error))

			}
		})
	}


	resetSearch() {
		this.updateState(state => state.set("search", emptySearch))
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
				.then(resolve)
				.catch(reject)
		})
	}


	async signIn(id, pw) {
		//TODO - Allow user to cache encrypted key locally
		//		 for faster sign-in
		return new Promise((resolve, reject) => {
			this.getState("podium")
				.activeUser(id, pw)
				.then(activeUser => resolve(
					() => this.initSession(activeUser)
				))
				.catch(reject)
		})
	}


	initSession(user) {

		// Store active user
		this.updateState(state => state
			.set("initializing", true)
			.set("activeUser", user)
			.setIn(["records", "users", user.address], user)
		)

		// Load profile data
		user.profile(true)
			.catch(error => console.error(error))

		// Load users following the active user
		user.followerIndex(true)
			.catch(error => console.error(error))

		// Load users followed by the active user
		user.followingIndex(true)
			.then(followed => {
				followed.map(this.receiveFollow)
				user.onFollow(this.receiveFollow)
			})
			.catch(console.error)

		// Load user's posts and alerts
		user.postIndex(true)
			.then(posts => Promise.all(posts.map(this.getPost)))
			.then(() => user.onPost(p =>
				this.getPost(p)
					.catch(console.error)
			))
			.catch(console.error)

		// Check for alerts
		this.getAlerts(true)
		alerter = setInterval(this.getAlerts, 5000)

		// Give the loader some time to pre-load posts before publishing feed
		var counter = 0;
		let watcher = setInterval(() => {
			if (this.getState("feed", "pending") > 10 || counter >= 100) {
				clearInterval(watcher)
				this.updateState(state => state.set("initializing", false))
				this.publishPosts()
			} else {
				counter += 1
			}
		}, 100)

	}


	signOut() {
		clearInterval(alerter)
		this.updateState(state => state
			.set("activeUser", null)
			.set("records", emptyRecs)
		);
	}





// ALERTS

	getAlerts(seen=false) {
		this.getState("activeUser")
			.alerts(seen)
			.then(alerts => {
				const newAlerts = alerts
					.filter(a => !this.getState("alerts", a.get("id")))
					.reduce(
						(n, a) => n.set("id", a.set("surfaced", false)),
						Map({})
					)
				this.updateState(state => state
					.update("alerts", a => a.merge(newAlerts))
				)
			})
			.catch(error => console.error(error))
	}





// HANDLE NEW DATA

	receiveAlert(alert) {

		// Add alert record to state
		this.updateState(state => state
			.updateIn(["records", "alerts"],
				alerts => alerts
					.push(alert)
					.sortBy(a => a.get("created"))
			)
		)

	}


	receiveFollow(address) {

		// Confirm user is followed
		this.getState("activeUser")
			.isFollowing(address)
			.then(following => {
				if (following) {
					this.getUser(address)
						.then(user => user.onPost(this.getPost))
						.catch(error => console.error(error))
				}
			})
			.catch(error => console.error(error))

	}




// USERS

	getUser(address, preload=true) {
		return new Promise((resolve, reject) => {
			let currentUser = this.getState("records", "users", address)
			if (currentUser) {
				if (preload) {
					this.loadUser(currentUser)
						.then(resolve)
						.catch(reject)
				} else {
					currentUser.withProfile()
						.then(resolve)
						.catch(reject)
				}
			} else {
				var user = this.getState("podium").user(address)
				if (preload) {
					this.loadUser(user)
						.then(resolve)
						.catch(reject)
				} else {
					user.withProfile()
						.then(this.saveUser)
						.then(resolve)
						.catch(reject)
				}
			}
		})
	}


	loadUser(user, force = false) {
		return new Promise((resolve, reject) => {
			user.load(force)
				.then(this.saveUser)
				.then(resolve)
				.catch(reject)
		})
	}


	saveUser(user) {
		return new Promise((resolve, reject) => {
			this.updateState(state => state
				.setIn(["records", "users", user.address], user),
				() => resolve(user)
			)
		})
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

		return new Promise((resolve, reject) => {
			this.getState("activeUser")
				.createPost(content, Map(), parent.address)
				.then(post => {
					this.loadPost(post)
					resolve(post)
				})
				.catch(error => reject(error))
		})

	}


	addToPost(address) {
		console.log("Adding id for user with address ",
			address, " to current post string.")
	}


	getPost(address, preload = true) {
		return new Promise((resolve, reject) => {
			let currentPost = this.getState("records", "posts", address)
			if (currentPost) {
				if (preload) {
					this.loadPost(currentPost)
						.then(resolve)
						.catch(reject)
				} else {
					currentPost.withContent()
						.then(this.savePost)
						.then(resolve)
						.catch(reject)
				}
			} else {
				var post = this.getState("podium").post(address)
				if (preload) {
					this.loadPost(post)
						.then(resolve)
						.catch(reject)
				} else {
					post.withContent()
						.then(this.savePost)
						.then(resolve)
						.catch(reject)
				}
			}
		})
	}


	loadPost(post, force = false) {
		return new Promise((resolve, reject) => {
			post.load(force)
				.then(loadedPost => {
					// Build post
					return this.savePost(loadedPost)
				})
				.then(resolve)
				.catch(reject)
		})
	}


	savePost(post) {
		return new Promise((resolve, reject) => {
			this.updateState(state => state
				.setIn(["records", "posts", post.address], post),
				() => resolve(post)
			)
		})
	}


	// buildPost(newPost, store) {
	// 	return new Promise((resolve, reject) => {

	// 		console.log("Building Post:", newPost.get("content"))

	// 		// Unpack post
	// 		const address = newPost.get("address")
	// 		const author = newPost.get("author")

	// 		// Check and update current posts
	// 		let post;
	// 		const oldPost = this.getState("records", "post", address)

	// 		// Check if post is an update on any existing post
	// 		if (!oldPost || oldPost.get("latest") !== newPost.get("latest")) {

	// 			// Resolve post discrepancies
	// 			if (oldPost) {
	// 				post = oldPost
	// 					.mergeDeep(newPost)
	// 					.set("updated", true)
	// 			} else {
	// 				post = emptyPost.mergeDeep(newPost);
	// 			}

	// 			// Set flags for this post
	// 			if (author === this.getState("user").address) {
	// 				post = post
	// 					.set("owned", true)
	// 					.set("feed", true)
	// 			}
	// 			if (author in this.getState("userData", "following")) {
	// 				post = post
	// 					.set("following", true)
	// 					.set("feed", true)
	// 			}
	// 			post.set("follower",
	// 				(author in this.getState("user", "followers")))
	// 			//TODO - Other classifications (reactions, reports, etc...)

	// 			// Load post's author
	// 			// - We don't store the author in the call to getProfile to ensure
	// 			//   a fully atomic, single update with both post and author
	// 			let profile = this.getProfile(author, false, false)

	// 			// Pre-emptively load preceeding and origin posts for replies
	// 			let parent;
	// 			let origin;
	// 			if (post.get("depth") > 0 && post.get("forFeed")) {
	// 				parent = this.getPost(post.get("parent"))
	// 				if (post.get("depth") !== 1) {
	// 					origin = this.getPost(post.get("origin"))
	// 				}
	// 			}

	// 			//TODO - Pre-emptively load mentions and topics

	// 			// Wait for all dependencies to resolve
	// 			Promise
	// 				.all([parent, origin, profile])
	// 				.then(([parentPost, originPost, profile]) => {
	// 					if (store) {

	// 						// Store post in state, if required
	// 						this.updateState(state => state
	// 							.updateIn(["feed", "pending"],
	// 								p => post.get("feed") ? p + 1 : p)
	// 							.setIn(["records", "posts", address], post)
	// 							.setIn(["records", "users", author], profile),
	// 							() => resolve(post)
	// 						)

	// 					} else {

	// 						// Otherwise, store supporting data
	// 						// in the post itself and return
	// 						post = post.set("author", profile)
	// 						if (parentPost) {
	// 							post.set("parent", parentPost)
	// 						}
	// 						if (originPost) {
	// 							post.set("origin", originPost)
	// 						}
	// 						resolve(post)

	// 					}
	// 				})
	// 				.catch(error => reject(error))

	// 		}

	// 	})

	// }


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
			.filter(post => post.feed && post.updated)


		// Curate threads
		const publishGroup = processGroup

			// Sort posts by the most recently updated
			.sort((a, b) => (a.latest > b.latest) ? 1 : -1)

			// Group these posts into threads by origin
			.groupBy(post => post.originAddress)

			// Process each potential thread
			.map(posts => posts

				// Filter out posts that are either not in the same
				// subthread as the most recent post, or which are
				// more than 2 generations removed from the last
				// "in-feed" post
				.filter((post, i) => {
					if (i === 0) {
						return true
					} else if (i === 1) {
						return post.address === posts.get(i - 1).parentAddress
					} else {
						return post.address === posts.get(i - 2).grandparent
					}
				})

				// Reduce each thread down to a list of
				// addresses for each post therein
				.reduce((thread, post, i) => {

					// Always select latest post
					if (i === 0) {
						return thread.push(post.address)

					// Return consecutive posts unaltered
					} else if (posts[i - 1].parent === post.address) {
						return thread.push(post.address)

					// Return placeholders for missing posts
					} else {
						return thread
							.push(post.parentAddress)
							.push(post.address)
					}

				}, List())

			)

			// Add the origin post to each thread, if required.
			// Where a gap exists between the last post and the
			// thread origin, return an integer representing
			// the number of missing posts.
			.map(thread => {
				const last = allPosts.get(thread.last())
				const origin = last.originAddress;
				const depth = last.depth;
				if (origin !== last.address) {
					if (depth > 1) {
						return thread.push(depth - 1).push(origin)
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
							[post.address, "processed"],
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




// DEMO OPTIONS

	toggleDemoMenu() {
		this.updateState(state => state
			.update("demomenu", (x) => !x)
		);
	}




// RENDER

	render() {

		const demoMenu = <div
			className={(this.getState("demomenu")) ? 
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

				podium={this.getState("podium")}
				activeUser={this.getState("activeUser")}
				getUser={this.getUser}

				initializing={this.getState("initializing")}
				feedData={this.getState("feed")}

				posts={this.getState("records", "posts")}
				getPost={this.getPost}
				sendPost={this.sendPost}
				publishPosts={this.publishPosts}

			/>}
		/>

		// Route to a post with a given >address<
		const PostRoute = <Route
			path="/post/:address"
			render={props => <PostPage {...props}

				activeUser={this.getState("activeUser")}

				postAddress={props.match.params.address}

				getPost={this.getPost}

			/>}
		/>


		// Route to the profile page of the user
		// with the given >address<
		const ProfileRoute = <Route
			path="/user/:id"
			render={props => <Profile {...props}

				podium={this.getState("podium")}
				activeUser={this.getState("activeUser")}

				from="id"
				target={props.match.params.id}

				getPost={this.getPost}
				getUser={this.getUser}

				format="page"

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
				
				activeUser={this.getState("activeUser")}

				users={this.getState("records", "users")}

			/>}
		/>

		// Route to the following page of the active user
		const FollowingRoute = <Route
			path="/following"
			render={props => <Following {...props}

				activeUser={this.getState("activeUser")}

				users={this.getState("records", "users")}

			/>}
		/>

		// Route to the integrity page of the active user
		const IntegrityRoute = <Route
			path="/integrity"
			render={props => <Integrity {...props}

				activeUser={this.getState("activeUser")}

			/>}
		/>

		// Route to the Alerts page of the active user
		const AlertsRoute = <Route
			path="/alerts"
			render={props => <AlertsPage {...props}

				activeUser={this.getState("activeUser")}

			/>}
		/>


		// Route to the topic curation page
		const TopicFeedRoute = <Route
			path="/topics"
			render={props => <TopicFeed {...props}

				activeUser={this.getState("activeUser")}

			/>}
		/>

		// Route to the details page for a specific
		// topic with the given >address<
		const TopicRoute = <Route
			path="/topic/:address"
			render={props => <TopicPage {...props}

				topicAddress={props.match.params.address}
				activeUser={this.getState("activeUser")}

				getTopic={this.getTopic}

			/>}
		/>


		// Route to the main governance page
		const GovernanceRoute = <Route
			path="/governance"
			render={props => <Governance {...props}

				activeUser={this.getState("activeUser")}

			/>}
		/>

		// Route to the details page for a specific
		// rule with the given >address<
		const RuleRoute = <Route
			path="/governance/rules/:address"
			render={props => <RulePage {...props}

				ruleAddress={props.match.params.address}
				activeUser={this.getState("activeUser")}

			/>}
		/>


		// Route to the settings page
		const SettingsRoute = <Route
			path="/settings"
			render={props => <Settings {...props}

				activeUser={this.getState("activeUser")}

			/>}
		/>


		// Route to the search results page
		const SearchRoute = <Route
			path="/search"
			render={props => <SearchPage {...props}

				podium={this.getState("podium")}
				activeUser={this.getState("activeUser")}

				getUser={this.getUser}

				search={this.search}
				resetSearch={this.resetSearch}

				loading={this.getState("search", "loading")}
				target={this.getState("search", "target")}
				results={this.getState("search", "results")}

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
				podium={this.getState("podium")}
			/>}
		/>


		return <div ref="podium" className="app podium">
			<div className="backdrop"></div>
			{!this.getState("podium") ?

				<Loader /> :

				this.getState("activeUser") ? 

					<HUD

						podium={this.getState("podium")}
						activeUser={this.getState("activeUser")}

						getUser={this.getUser}

						search={this.search}
						resetSearch={this.resetSearch}
						searchData={this.getState("search")}

						alerts={this.getState("alerts")}

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

						podium={this.getState("podium")}
						registerUser={this.registerUser}
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

		//TODO - Stop listening for alerts

		// Sign out
		if (this.getState("activeUser")) {
			this.signOut();
		}

		// Close connections
		if (this.getState("podium")) {
			this.getState("podium").cleanUp()
		}

	}



}

export default App;