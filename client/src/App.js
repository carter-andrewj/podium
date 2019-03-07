import React from 'react';
import ImmutableComponent from './components/immutableComponent';
import { Route, Switch, Redirect } from "react-router-dom";

import { fromJS, Map, Set, List } from 'immutable';

import { PodiumClient } from '@carter_andrewj/podix';


import HUD from './pages/HUD/HUD';

import AlertsPage from './pages/alerts/alertsPage';
import SearchPage from './pages/search/searchPage';
import Wallet from './pages/wallet/wallet';

import LobbyHUD from './pages/lobby/lobbyHUD';
import Lobby from './pages/lobby/lobby';

import PostFeedPage from './pages/posts/postFeedPage';
import Post from './pages/posts/post';

import Trending from './pages/trending/trending';

import Governance from './pages/governance/governance';
import RulePage from './pages/governance/rulePage';

import Profile from './pages/profiles/profile';

import Integrity from './pages/integrity/integrity';

import Miner from './pages/miner/miner';

import Settings from './pages/settings/settings';

import About from './pages/about/about';

import Loader from './components/loader';

import Error404 from './pages/errors/404';

import Config from 'config';



let alerter;
let holdTimer;
let initializer;
let exit;


const emptyRecs = Map(fromJS({
	posts: {},
	users: {},
	transactions: {},
	topics: {},
	alerts: {}
}))


const emptySearch = Map(fromJS({
	"loading": false,
	"pending": 0,
	"target": "",
	"results": {},
	"error": null,
	"cleared": true
}))


const emptyFeed = Map({
	feed: List(),
	published: Set(),
	pending: Map(),
	markers: List()
})





class App extends ImmutableComponent {

	constructor() {
		super({

			demomenu: false,
			demoLoading: false,
			demoCount: 0,

			podium: null,

			activeUser: null,
			balance: null,

			records: emptyRecs,

			feed: emptyFeed,

			search: emptySearch,

			alerts: {},

			exit: false,
			exitAll: false

		})

		this.search = this.search.bind(this)
		this.resetSearch = this.resetSearch.bind(this)

		this.registerUser = this.registerUser.bind(this)
		this.signIn = this.signIn.bind(this)
		this.initSession = this.initSession.bind(this)
		this.signOut = this.signOut.bind(this)

		this.getAlerts = this.getAlerts.bind(this)
		this.clearAlerts = this.clearAlerts.bind(this)
		this.clearAllAlerts = this.clearAllAlerts.bind(this)

		this.receiveAlert = this.receiveAlert.bind(this)
		this.receiveFollow = this.receiveFollow.bind(this)
		this.receiveTransaction = this.receiveTransaction.bind(this)

		this.getUser = this.getUser.bind(this)
		this.loadUser = this.loadUser.bind(this)
		this.saveUser = this.saveUser.bind(this)

		this.followUser = this.followUser.bind(this)
		this.buildFollow = this.buildFollow.bind(this)
		this.unfollowUser = this.unfollowUser.bind(this)

		this.sendPost = this.sendPost.bind(this)
		this.getPost = this.getPost.bind(this)
		this.loadPost = this.loadPost.bind(this)
		this.savePost = this.savePost.bind(this)
		this.buildPost = this.buildPost.bind(this)
		this.publishPosts = this.publishPosts.bind(this)

		this.transition = this.transition.bind(this)

	}




// INTITIAL SETUP

	immutableComponentWillMount() {

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

				// Log search target
				this.updateState(state => state
					.setIn(["search", "loading"], true)
					.setIn(["search", "target"], target)
					.setIn(["search", "error"], null)
					.setIn(["search", "cleared"], false)
					.updateIn(["search", "pending"], p => p + 1)
					.updateIn(["search", "results"], results => results
						.filter(r => r.get("searchid")
							.includes(target.toLowerCase()))
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

						// Discard results if search was cancelled
						if (this.getState("search", "cleared")) {
							resolve()
						} else {

							// Exclude results if the search
							// string has changed before return
							const currentTarget = this.getState("search", "target")
							var userList = results
								.filter(r => 
									r.get("searchid")
										.includes(currentTarget.toLowerCase())
									&& r.get("id") !== this.getState("activeUser").id
								)
								.toList()

							// Update state with new results
							this.updateState(state => state
								.setIn(["search", "results"], userList)
								.updateIn(["search", "pending"],
									(p) => Math.max(0, p - 1))
								.setIn(["search", "loading"],
									state.getIn(["search", "pending"]) > 1 &&
									state.getIn(["search", "target"]) !== ""),
								resolve
							)

						}

					})
					.catch(console.error)

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
		this.updateState(

			// Store active user
			state => state
				.set("activeUser", user)
				.set("initializing", true)
				.setIn(["records", "users", user.address], user),

			// Set up session
			() => {

				// Load profile data
				user.profile(true).catch(console.error)

				// Load transactions
				user.transactionIndex(true).catch(console.error)
				user.onTransaction(this.receiveTransaction)

				// Load users following the active user
				user.followerIndex(true).catch(console.error)

				// Load users followed by the active user
				// and their posts
				user.followingIndex(true)
					.then(following => Promise.all([
						this.receiveFollow(user.address),
						...following.map(this.receiveFollow)
					]))
					.then(() => {
						user.onPost(this.buildPost)
						user.onFollow(this.receiveFollow)
						this.updateState(state => state
							.set("initializing", false),
							() => this.publishPosts(true)
						)
					})
					.catch(console.error)

				// Check for alerts
				this.getAlerts(true)
				alerter = setInterval(this.getAlerts, 15000)

			}

		)

	}


	signOut() {
		clearInterval(alerter)
		clearInterval(holdTimer)
		clearTimeout(initializer)
		this.transition(
			() => this.updateState(state => state
				.set("activeUser", null)
				.set("initializing", false)
				.set("records", emptyRecs)
				.set("search", emptySearch)
				.set("feed", emptyFeed)
				.set("alerts", Map())
			),
			true
		)
	}





// ALERTS

	getAlerts(seen = false) {
		this.getState("activeUser")
			.alerts(seen)
			.then(alerts => {
				const newAlerts = alerts
					.filter(a => !this.getState("alerts", a.get("key")))
					.reduce((r, a) => r.set(a.get("key"), a), Map())
				this.updateState(state => state
					.update("alerts", current => current.mergeDeep(newAlerts))
				)
			})
			.catch(console.error)
	}


	clearAlerts(keys) {
		return new Promise((resolve, reject) => {
			this.getState("activeUser")
				.clearAlerts(keys)
				.then(() => this.updateState(
					state => state.update("alerts",
						alerts => alerts.map(a => {
							if (keys.includes(a.get("key"))) {
								return a.set("seen", true)
							} else {
								return a
							}
						})
					),
					resolve
				))
				.catch(reject)
		})
	}


	clearAllAlerts() {
		return new Promise((resolve, reject) => {
			const alertKeys = this.getState("alerts")
				.map(a => a.get("key"))
				.toList()
			this.clearAlerts(alertKeys)
				.then(resolve)
				.catch(reject)
		})
	}





// HANDLE NEW DATA

	receiveAlert(alert) {
		this.updateState(state => state
			.updateIn(["records", "alerts"],
				alerts => alerts
					.push(alert)
					.sortBy(a => a.get("created"))
			)
		)
	}


	receiveFollow(address) {
		return new Promise((resolve, reject) => {
			this.getUser(address)
				.then(this.buildFollow)
				.then(user => {
					user.onPost(this.buildPost)
					resolve()
				})
				.catch(reject)
		})
	}


	receiveTransaction(record) {
		const key = record.get("type") + record.get("created")
		this.updateState(state => {
			const transactions = state
				.getIn(["records", "transactions"])
				.set(key, record)
			var balance = transactions.reduce(
				(total, next) => total + next.get("value"),
				0
			)
			return state
				.setIn(["records", "transactions"], transactions)
				.set("balance", balance)
		})
	}




// USERS

	getUser(address, preload = true) {
		return new Promise((resolve, reject) => {
			let currentUser = this.getState("records", "users", address)
			if (currentUser) {
				if (preload) {
					this.loadUser(currentUser, true)
						.then(resolve)
						.catch(reject)
				} else {
					currentUser
						.withProfile(true)
						.then(resolve)
						.catch(reject)
				}
			} else {
				var user = this.getState("podium").user(address)
				if (preload) {
					this.loadUser(user, true)
						.then(resolve)
						.catch(reject)
				} else {
					user.withProfile(true)
						.then(this.saveUser)
						.then(resolve)
						.catch(reject)
				}
			}
		})
	}


	loadUser(user, force = false) {
		return new Promise((resolve, reject) => {
			user.withProfile(force)
				.then(loadedUser => {

					// Pre-emptively load rest of post data in parallel
					loadedUser.load(force)
						.then(this.saveUser)
						.catch(console.error)

					// Build post if its content has changed
					return this.saveUser(loadedUser)

				})
				.then(resolve)
				.catch(reject)
		})
	}


	saveUser(user) {
		return new Promise((resolve, reject) => {
			this.updateState(
				state => state.updateIn(
					["records", "users", user.address],
					u => {
						if (u) {
							u.cache.mergeAll(user.cache)
							return u
						} else {
							return user
						}
					}
				),
				() => resolve(user)
			)
		})
	}


	buildFollow(user) {
		return new Promise((resolve, reject) => {
			user.postIndex(true)
				.then(posts => {
					if (posts.size > 0) {
						this.updateState(state => state.updateIn(
							["feed", "published"],
							p => p.union(posts.rest().toSet())
						))
						return this.buildPost(posts.first())
					} else {
						return
					}
				})
				.then(() => resolve(user))
				.catch(reject)
		})
	}




// POSTING

	async sendPost(content, references, parent) {

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
				.createPost(content, references, parent)
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
					this.loadPost(currentPost, true)
						.then(resolve)
						.catch(reject)
				} else {
					currentPost.withContent(true)
						.then(this.savePost)
						.then(resolve)
						.catch(reject)
				}
			} else {
				var post = this.getState("podium").post(address)
				if (preload) {
					this.loadPost(post, true)
						.then(resolve)
						.catch(reject)
				} else {
					post.withContent(true)
						.then(this.savePost)
						.then(resolve)
						.catch(reject)
				}
			}
		})
	}


	loadPost(post, force = false) {
		return new Promise((resolve, reject) => {
			post.withContent(force)
				.then(loadedPost => {

					// Pre-emptively load rest of post data in parallel
					loadedPost.load(force)
						.then(this.savePost)
						.catch(console.error)

					// Save loaded post
					return this.savePost(loadedPost)

				})
				.then(resolve)
				.catch(reject)
		})
	}


	checkHold() {
		return new Promise((resolve, reject) => {
			var holder = this.getState("feed", "holder")
			if (!holder) {
				holder = new Promise((resolveHold) => {
					holdTimer = setInterval(
						() => {
							if (!this.getState("feed", "hold")) {
								clearInterval(holdTimer)
								this.updateState(
									state => state.setIn(["feed", "holder"], null),
									resolveHold
								)
							}
						},
						100
					)
				})
				this.updateState(state => state.setIn(["feed", "holder"], holder))
			}
			holder.then(resolve).catch(reject)
		})
	}


	buildPost(address) {
		return new Promise(async (resolve, reject) => {

			// Wait until any current publish actions
			// have completed
			await this.checkHold()

			// Retrieve post
			this.getPost(address)
				.then(post => {

					// Check post does not already exist in feed
					if (!this.getState("feed", "published").has(post.address)) {

						// Flag post as feed post
						post.feed = true

						// Pre-emptively load parent post in parallel
						if (post.parentAddress) {
							this.getPost(post.parentAddress).catch(console.error)
						}

						// Pre-emptively load grandparent post in parallel
						if (post.grandparentAddress) {
							this.getPost(post.grandparentAddress).catch(console.error)
						}

						// Pre-emptively load origin post, if different
						if (post.originAddress !== post.grandparentAddress &&
								post.originAddress !== post.parentAddress &&
								post.originAddress !== post.address) {
							this.getPost(post.originAddress).catch(console.error)
						}

						// Pre-emptively load author
						this.getUser(post.authorAddress).catch(console.error)

						// Add post to feed
						this.updateState(state => state.updateIn(
							["feed", "pending"],
							nextFeed => {

								// Check if this origin already exists and
								// if that thread is more recent than this post
								const thread = nextFeed.get(post.originAddress)
								if (!thread || (post.created > thread.get("created"))) {

									// Update next feed with new post
									return nextFeed.set(
										post.originAddress,
										Map({
											target: post.address,
											parent: post.parentAddress,
											grandparent: post.grandparentAddress,
											origin: post.originAddress,
											created: post.created,
											published: new Date().getTime()
										})
									)

								} else {

									// Otherwise, ignore the current post
									return nextFeed

								}

							}
						))

						// Save and return post
						this.savePost(post)
							.then(resolve)
							.catch(reject)

					} else {
						resolve(post)
					}

				})
				.catch(reject)

		})

	}


	savePost(post) {
		return new Promise((resolve, reject) => {
			this.updateState(
				state => state.updateIn(
					["records", "posts", post.address],
					p => {
						if (p) {

							// Merge post caches
							p.cache.mergeAll(post.cache)

							// Set post flags
							p.updated = true 

							// Return post
							return p

						} else {
							return post
						}
					}
				),
				() => resolve(post)
			)
		})
	}


	publishPosts(auto = false) {
		if (this.getState("feed", "pending").size > 0) {

			// Pause adding new posts to the pending set
			this.updateState(
				state => state.setIn(["feed", "hold"], true),

				() => this.updateState(state => {

					// Unpack data
					const pending = state.getIn(["feed", "pending"])
						.valueSeq()
						.sort((a, b) => a.get("created") < b.get("created") ? 1 : -1)
						.toList()
					const newPosts = pending
						.map(p => List([
							p.get("target"), p.get("parent"),
							p.get("grandParent"), p.get("origin")
						]))
						.flatten()
						.filter(a => a)
						.toSet()
					const next = state.getIn(["feed", "feed"]).size

					// Update feed data
					return state

						// Add new post list to published set
						.updateIn(["feed", "feed"],
							f => f.unshift(List(
								[ pending ]
							))
						)

						// Log action that triggered publication
						.updateIn(["feed", "markers"],
							m => m.unshift(List(
								[ fromJS([{
									marker: true,
									show: !auto,
									type: "update",
									value: pending.size
								}]) ]
							))
						)

						// Store which posts have been published
						.updateIn(["feed", "published"],
							p => p.union(newPosts)
						)

						// Update post records
						.updateIn(["records", "posts"],
							posts => posts.map(p => {
								if (newPosts.includes(p.address)) {
									p.published = next
									p.updated = false
								}
								return p
							})
						)

						// Reset pending
						.setIn(["feed", "pending"], Map())
						.setIn(["feed", "hold"], false)

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




// FOLLOWING

	followUser(address) {
		return new Promise((resolve, reject) => {
			this.getState("activeUser")
				.follow(address)
				.then(user => {
					this.saveUser(user)
					this.getUser(address, true)
					resolve()
				})
				.catch(reject)
		})
	}

	unfollowUser(address) {
		return new Promise((resolve, reject) => {
			this.getState("activeUser")
				.unfollow(address)
				.then(user => {
					this.saveUser(user)
					this.getUser(address, true)
					resolve()
				})
				.catch(reject)
		})
	}




// TRANSITIONS

	transition(callback, all = false, hud = false) {
		clearTimeout(exit)
		this.updateState(
			state => state
				.set("exit", all || !hud)
				.set("exitAll", all || hud),
			() => {
				exit = setTimeout(
					() => this.updateState(
						state => state
							.set("exit", false)
							.set("exitAll", false),
						callback
					),
					Config.timings.transition * 2.0 * 1000
				)
			}
		)
	}





// DEMO OPTIONS

	toggleDemoMenu() {
		this.updateState(state => state
			.update("demomenu", (x) => !x)
		)
	}


	requestFunds(value) {
		this.updateState(
			state => state
				.set("demoLoading", true)
				.update("demoCount", d => d + 1),
			() => this.getState("activeUser")
				.requestFunds(value)
				.then(() => this.updateState(state => state
					.update("demoCount", d => d - 1)
					.set("demoLoading", state.get("demoCount") > 1)
				))
				.catch(console.error)
		)
	}


	divestFunds(value) {
		if (this.getState("balance") && value <= this.getState("balance")) {
			this.updateState(
				state => state
					.set("demoLoading", true)
					.update("demoCount", d => d + 1),
				() => this.getState("activeUser")
					.createTransaction(this.getState("podium").rootAddress, value)
					.then(() => {
						this.updateState(state => state
							.update("demoCount", d => d - 1)
							.set("demoLoading", state.get("demoCount") > 1)
						)
					})
					.catch(console.error)
			)
		}
	}




// RENDER

	render() {

		const balance = this.getState("balance")
		const demoMenu = <div
			className={(this.getState("demomenu")) ? 
				"card demo-menu demo-menu-open" :
				"card demo-menu demo-menu-closed"}>
			<p className="demo-menu-title">
				Demo Menu
			</p>

			<div
				className="demo-menu-item demo-menu-option"
				onClick={() => console.log("about")}>
				<i className="fas fa-info-circle demo-menu-icon" />
				About Podium
			</div>

			<div className="demo-menu-item">
				<p className="demo-menu-text">
					POD Tokens
				</p>
				{balance ?
					<div>
						<div
							className="demo-menu-button"
							onClick={() => this.divestFunds(100)}>
							-100
						</div>
						<div
							className="demo-menu-button"
							onClick={() => this.requestFunds(100)}>
							+100
						</div>
					</div>
					:
					<div className="demo-menu-button demo-menu-pending">
						<i className="fa fas-circle-notch demo-menu-loader" />
					</div>
				}
			</div>

			<div
				className="demo-menu-item demo-menu-option"
				onClick={()=> window.location.href =
					"mailto:andrew@podium-network.com" +
						"?subject=Re:%20Podium%20Demo%20-%20Feedback"
				}>
				<i className="fas fa-envelope demo-menu-icon" />
				Contact Us
			</div>

		</div>



		// Route to main post feed
		const FeedRoute = <Route
			exact
			path="/"
			render={props => <PostFeedPage {...props}

				podium={this.getState("podium")}
				activeUser={this.getState("activeUser")}
				balance={this.getState("balance")}

				getUser={this.getUser}

				feedData={this.getState("feed")}

				getPost={this.getPost}
				sendPost={this.sendPost}
				publishPosts={this.publishPosts}

				followUser={this.followUser}
				unfollowUser={this.unfollowUser}

				transition={this.transition}
				exit={this.getState("exit")}

			/>}
		/>

		// Route to a post with a given >address<
		const PostRoute = <Route
			path="/post/:address"
			render={props => <Post {...props}

				podium={this.getState("podium")}
				activeUser={this.getState("activeUser")}
				balance={this.getState("balance")}

				target={props.match.params.address}
				from="address"
				format="page"

				getUser={this.getUser}

				getPost={this.getPost}
				sendPost={this.sendPost}

				followUser={this.followUser}
				unfollowUser={this.unfollowUser}

				transition={this.transition}
				exit={this.getState("exit")}

			/>}
		/>


		// Route to the profile page of the user
		// with the given >address<
		const ProfileRoute = <Route
			path="/user/:id"
			render={props => <Profile {...props}
				key={`profile-${props.match.params.id}`}

				podium={this.getState("podium")}
				activeUser={this.getState("activeUser")}
				balance={this.getState("balance")}

				from="id"
				target={props.match.params.id}

				getPost={this.getPost}
				getUser={this.getUser}

				followUser={this.followUser}
				unfollowUser={this.unfollowUser}

				format="page"

				transition={this.transition}
				exit={this.getState("exit")}

			/>}
		/>


		// Route to the integrity page of the active user
		const IntegrityRoute = <Route
			path="/integrity"
			render={props => <Integrity {...props}

				activeUser={this.getState("activeUser")}

				transition={this.transition}
				exit={this.getState("exit")}

			/>}
		/>


		// Route to the integrity page of the active user
		const MinerRoute = <Route
			path="/miner"
			render={props => <Miner {...props}

				activeUser={this.getState("activeUser")}

				transition={this.transition}
				exit={this.getState("exit")}

			/>}
		/>


		// Route to the Alerts page of the active user
		const AlertsRoute = <Route
			path="/alerts"
			render={props => <AlertsPage {...props}

				activeUser={this.getState("activeUser")}

				alerts={this.getState("alerts")}
				clearAllAlerts={this.clearAllAlerts}

				getUser={this.getUser}

				transition={this.transition}
				exit={this.getState("exit")}

			/>}
		/>


		// Route to the wallet page of the active user
		const WalletRoute = <Route
			path="/wallet"
			render={props => <Wallet {...props}

				activeUser={this.getState("activeUser")}
				balance={this.getState("balance")}
				transactions={this.getState("records", "transactions")}

				transition={this.transition}
				exit={this.getState("exit")}

			/>}
		/>


		// Route to the main governance page
		const GovernanceRoute = <Route
			path="/governance"
			render={props => <Governance {...props}

				activeUser={this.getState("activeUser")}

				transition={this.transition}
				exit={this.getState("exit")}

			/>}
		/>


		// Route to the details page for a specific
		// rule with the given >address<
		const RuleRoute = <Route
			path="/governance/rules/:address"
			render={props => <RulePage {...props}

				ruleAddress={props.match.params.address}
				activeUser={this.getState("activeUser")}

				transition={this.transition}
				exit={this.getState("exit")}

			/>}
		/>


		// Route to the topic curation page
		const TrendingRoute = <Route
			path="/trending"
			render={props => <Trending {...props}

				activeUser={this.getState("activeUser")}

				transition={this.transition}
				exit={this.getState("exit")}

			/>}
		/>


		// Route to the settings page
		const SettingsRoute = <Route
			path="/settings"
			render={props => <Settings {...props}

				activeUser={this.getState("activeUser")}

				transition={this.transition}
				exit={this.getState("exit")}

			/>}
		/>


		// Route to the search results page
		const SearchRoute = <Route
			path="/search"
			render={props => <SearchPage {...props}

				podium={this.getState("podium")}
				activeUser={this.getState("activeUser")}
				balance={this.getState("balance")}

				getUser={this.getUser}

				search={this.search}
				resetSearch={this.resetSearch}

				followUser={this.followUser}
				unfollowUser={this.unfollowUser}

				loading={this.getState("search", "loading")}
				target={this.getState("search", "target")}
				results={this.getState("search", "results")}

				transition={this.transition}
				exit={this.getState("exit")}

			/>}
		/>


		// Route to the lobby
		const LobbyRoute = <Route
			exact
			path="/"
			render={props => <Lobby {...props}
				transition={this.transition}
				exit={this.getState("exit")}
			/>}
		/>


		// Route to the About page
		const AboutRoute = <Route
			path="/about"
			render={props => <About {...props}
				transition={this.transition}
				exit={this.getState("exit")}
			/>}
		/>



		return <div ref="podium" className="app podium">

			<div className="backdrop" />
			<div className={this.ready ?
				"master-loading-mask master-loading-mask-off" :
				"master-loading-mask master-loading-mask-on"} />

			{!this.getState("podium") ?

				<Loader /> :

				this.getState("activeUser") ? 

					<HUD

						key="hud"

						podium={this.getState("podium")}
						activeUser={this.getState("activeUser")}

						balance={this.getState("balance")}
						transactions={this.getState("records", "transactions")}

						getUser={this.getUser}

						followUser={this.followUser}
						unfollowUser={this.unfollowUser}

						search={this.search}
						resetSearch={this.resetSearch}
						searchData={this.getState("search")}

						alerts={this.getState("alerts")}
						clearAlerts={this.clearAlerts}

						transition={this.transition}
						exit={this.getState("exit")}
						exitAll={this.getState("exitAll")}

						signOut={this.signOut}

						>
						<Switch>	
							
							{ProfileRoute}
							{IntegrityRoute}
							{MinerRoute}
							{SettingsRoute}

							{AlertsRoute}
							{SearchRoute}
							{WalletRoute}

							{FeedRoute}
							{PostRoute}
							{GovernanceRoute}
							{RuleRoute}
							{TrendingRoute}
							
							{AboutRoute}

							<Route component={Error404} />

						</Switch>
						{demoMenu}
						<div
							className="red-button demo-button card"
							onClick={this.toggleDemoMenu.bind(this)}>
							<p className="demo-button-text">demo</p>
							{this.getState("demomenu") ?
								<i className="fas fa-times demo-button-icon" /> :
								<i className="fas fa-magic demo-button-icon" />
							}
							{this.getState("demoLoading") ?
								<div className="demo-loader-holder">
									<i className="fas fa-circle-notch demo-loader" />
								</div>
								: null
							}
						</div>
					</HUD>

					:

					<LobbyHUD

						key="hud"

						podium={this.getState("podium")}
						registerUser={this.registerUser}
						signIn={this.signIn}

						transition={this.transition}
						exit={this.getState("exitAll")}

						>
						<Switch>

							{LobbyRoute}

							{ProfileRoute}
							{PostRoute}

							{RuleRoute}

							{AboutRoute}

							<Redirect to="/" />

						</Switch>
					</LobbyHUD>

			}

		</div>

	}




// CLEAN UP

	immutableComponentWillUnmount() {

		// Interupt remaining exit transitions
		clearTimeout(exit)

		// Sign out
		if (this.getState("activeUser")) {
			this.signOut()
		}

		// Close connections
		if (this.getState("podium")) {
			this.getState("podium").cleanUp()
		}

	}



}

export default App;