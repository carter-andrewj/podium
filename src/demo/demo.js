import React, { Component } from 'react';
import { fromJS, Map } from 'immutable';
import _ from 'lodash';

import { radixUniverse, RadixUniverse, radixTokenManager, //RadixLogger,
		 RadixSimpleIdentity, RadixIdentityManager, RadixKeyPair, 
		 RadixKeyStore, RadixTransactionBuilder } from 'radixdlt';

import Channel from './utils';
import Settings from './config';

import Lobby from './lobby/lobby';
import Core from './core/core';
import Loading from './core/widgets/loading';
import Tasks from './core/widgets/tasks/tasks';



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
		pdm: 0,
		dpm: 0,
		rad: 0
	},
	emblems: []
}))


class Demo extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({

				offline: false,
				demomenu: false,

				mode: "lobby",
				settings: Settings,

				podium: {},
				user: {},
				records: emptyRecs,

				tasks: {},
				flags: {},
				timers: {},
				channels: {}

			}))
		}

		this.setMode = this.setMode.bind(this);

		this.setFlag = this.setFlag.bind(this);
		this.clearFlag = this.clearFlag.bind(this);

		this.newTimer = this.newTimer.bind(this);
		this.resetTimer = this.resetTimer.bind(this);
		this.stopTimer = this.stopTimer.bind(this);

		this.newTask = this.newTask.bind(this);
		this.stepTask = this.stepTask.bind(this);
		this.completeTask = this.completeTask.bind(this);
		this.endTask = this.endTask.bind(this);
		this.failTask = this.failTask.bind(this);

		this.sendRecord = this.sendRecord.bind(this);
		this.getHistory = this.getHistory.bind(this);
		this.getLatest = this.getLatest.bind(this);
		this.openChannel = this.openChannel.bind(this);
		this.closeChannel = this.closeChannel.bind(this);

		this.requestFunds = this.requestFunds.bind(this);
		this.spendPOD = this.spendPOD.bind(this);

		this.signIn = this.signIn.bind(this);
		this.signOut = this.signOut.bind(this);
		this.registerUser = this.registerUser.bind(this);

		this.receivePost = this.receivePost.bind(this);
		this.receiveAlert = this.receiveAlert.bind(this);
		this.receiveFollowing = this.receiveFollowing.bind(this);
		this.receiveFollower = this.receiveFollower.bind(this);

		this.getProfile = this.getProfile.bind(this);
		this.getProfileFromID = this.getProfileFromID.bind(this);
		// this.updateProfile = this.updateProfile.bind(this);
		// this.updateID = this.updateID.bind(this);

		this.followUser = this.followUser.bind(this);
		this.unfollowUser = this.unfollowUser.bind(this);

		this.createTopic = this.createTopic.bind(this);
		this.getTopicIndex = this.getTopicIndex.bind(this);
		this.getTopic = this.getTopic.bind(this);
		this.getTopicFromID = this.getTopicFromID.bind(this);
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

		// Offline Mode
		if (this.state.data.get("offline")) {

			// Notify user
			console.log("RUNNING IN OFFLINE MODE")

			// Set offline state
			this.updateState(state => state
				.set("podium", Map({ balance: 0 }))
			);

		} else {

			// Mute radix console updates
			//RadixLogger.setLevel('error')

			// Connect to Radix universe
			radixUniverse.bootstrap(RadixUniverse.ALPHANET);
			console.log("CONNECTING TO RADIX");

			// Get Podium root account
			const rootAccount = Channel.master();
			const rootIdentity = new RadixSimpleIdentity(
				RadixKeyPair.fromAddress(rootAccount.getAddress())
			);

			// Open root account connection
			rootAccount.openNodeConnection()

			// Initialize state
			this.updateState(state => state
				.set("podium", Map({
					id: Settings.ApplicationID,
					identity: rootIdentity,
					account: rootAccount,
					allowance: null,
					balance: 0
				}))
			);

		}

	}


	componentDidMount() {

		// Online mode only
		if (!this.state.data.get("offline")) {

			// Periodically request funds from faucet
			this.requestFunds();
			const allowance = setInterval(this.requestFunds, 600000);

			// Subscribe to root account balance (for demo)
			const token = radixTokenManager.getTokenByISO('TEST');
			const balanceChannel = this.state.data
				.getIn(["podium", "account"])
				.transferSystem
				.balanceSubject
				.subscribe(async balance => {
					this.updateState(state => state
						.setIn(["podium", "balance"],
							   token.toTokenUnits(balance[token.id]))
					);
				});

			// Store subscription for safe exit
			this.updateState(state => state
				.setIn(["podium", "allowance"], allowance)
				.setIn(["podium", "balanceChannel"], balanceChannel)
			);


		}

	}



// UTILITIES

	setMode(mode) {
		this.updateState(state => state.set("mode", mode));
	}


	setFlag(flag) {
		if (!this.state.data.getIn(["flags", flag])) {
			this.updateState(state => state
				.setIn(["flags", flag], true)
			);
		}
	}

	clearFlag(flag) {
		this.updateState(state => state
			.setIn(["flags", flag], false)
		);
	}




// TIMERS

	newTimer(id, lifetime, callback) {

		// Start timer
		const timer = setTimeout(() => {

			// Run callback
			callback();

			// Delete record of this timer
			this.updateState(state => state
				.deleteIn(["timers", id])
			);

		}, lifetime);

		// Store timer
		this.updateState(state => state
			.setIn(["timers", id], Map({
				timer: timer,
				callback: callback,
				lifetime: lifetime
			}))
		);

	}


	resetTimer(id) {

		// Get timer
		var timer = this.state.data.getIn(["timers", id]);

		// Stop timer
		clearTimeout(timer.get("timer"));

		// Recreate timer
		this.newTimer(id, timer.get("callback"), timer.get("lifetime"));

	}


	stopTimer(id) {

		// Stop timer
		clearTimeout(this.state.data.getIn(["timers", id, "timer"]));

		// Delete record of this timer
		this.updateState(state => state
			.deleteIn(["timers", id])
		);

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





// RADIX UTILITIES

	sendRecord(accounts, payload, taskID,
			   identity = this.state.data.getIn(["user", "identity"]),
			   encrypt = false) {
		return new Promise((resolve) => {
			if (accounts.length === 0) {
				resolve();
			} else {
				RadixTransactionBuilder
					.createPayloadAtom(
						accounts,
						this.state.data.getIn(["podium", "id"]),
						JSON.stringify(payload),
						encrypt
					)
					.signAndSubmit(identity)
					.subscribe({
						next: async status => {
							await this.stepTask(taskID);
						},
						error: error => {
							this.failTask(taskID, error);
							resolve(error);
						},
						complete: async () => {
							await this.stepTask(taskID);
							resolve();
						}
					});
			}
		});
	}


	async getHistory(account, lifetime=5) {

		// Pulls all current values from a radix
		// -account- and closes the channel connection.

		// Open the account connection
		account.openNodeConnection();

		// Connect to account data
		const stream = account.dataSystem
			.getApplicationData(this.state.data.getIn(["podium", "id"]))
			.timeoutWith(lifetime * 1000, Promise.resolve(false));

		// Fetch the data
		return new Promise((resolve) => {
			const history = [];
			const channel = stream
				.subscribe({
					//TODO - Rewrite to pull until up-to-date once
					//		 radix provides the required flag.
					//		 Currently, this just collates all
					//		 input until timeout.
					next: item => {
						if (!item) {
							channel.unsubscribe();
							resolve(history);
						} else {
							history.push(JSON.parse(item.data.payload));
						}
					},
					error: error => {
						channel.unsubscribe();
						console.error(error)
						resolve([]);
					}
				});
		});

		// TODO - Close node connection

	}


	getLatest(account, lifetime=10) {

		// Returns the most recent payload among all
		// data for the provided -account-.

		// Get account history
		return new Promise((resolve) => {
			this.getHistory(account, lifetime)
				.then(history => {
					if (history.constructor === Array && history.length > 0) {
						resolve(history[history.length - 1]);
					} else if (Object.keys(history).length > 0) {
						resolve(history);
					} else {
						resolve({});
					}
				});
		});

	}


	openChannel(account, callback, onError=null, lifetime=0) {

		// Creates and manages a subscription to new data
		// updates for a given -account-, running
		// -callback- whenever a new item is received.
		// Will run -onError- callback in case of error.
		// Will timeout after -lifetime- ms of inactivity,
		// or will remain open indefinitely if -lifetime-
		// is not provided or set to 0.

		// Check channel to this account is not already open
		const address = account.getAddress();
		if (address in this.state.data.get("channels")) {
			console.error("Channel already open: ", address);
			return;
		}

		// Connect to the account
		account.openNodeConnection();

		// Initialize data request
		const stream = account.dataSystem.applicationDataSubject;

		// Set up timeout, if required
		let timer;
		if (lifetime > 0) {
			timer = this.newTimer(address, lifetime, (a) => {
				this.closeChannel(a);
				console.warn("Channel " + address + " timed out.");
			});
		}

		// Subscribe to data stream
		const channel = stream.subscribe({
			next: async item => {

				// Reset timeout
				if (lifetime > 0) { this.resetTimer(address); }

				// Run callback
				const result = JSON.parse(item.data.payload);
				callback(result);

			},
			error: error => {

				// Run callback
				if (typeof(onError) === "function") { onError(error); }

				// Close channel
				this.closeChannel(address);

				// Report
				console.error("Error on channel " + address + ":", error);

			}
		});

		// Log open channel
		this.updateState(state => state
			.setIn(["channels", address], Map({
				account: account,
				channel: channel,
				lifetime: timer
			}))
		);

		// Return the channel
		return channel;

	}


	closeChannel(address) {

		// Closes and cleans up a channel created by
		// openChannel

		// Stop channel timeout
		if (this.state.data.getIn(["channels", address, "timer"])) {
			this.stopTimer(address);
		}

		// Unsubscribe from channel
		this.state.data
			.getIn(["channels", address, "channel"])
			.unsubscribe();

		// Remove record from state
		this.updateState(state => state
			.deleteIn(["channels", address])
		);

		//TODO - Close node connection

	}




// TOKENS

	requestFunds(
			account = this.state.data.getIn(["podium", "account"]),
			identity = this.state.data.getIn(["podium", "identity"])
		) {
		RadixTransactionBuilder
			.createRadixMessageAtom(
				account,
				Channel.faucet(),
				"Hello, Mr Faucet. Please money."
			)
			.signAndSubmit(identity);
	}

	spendPOD(amount, taskID,
		     identity=this.state.data.getIn(["user", "identity"])) {

		// Define transaction direction
		let toAccount;
		let fromAccount;
		let ident;
		let volume;
		if (amount < 0) {
			toAccount = this.state.data.getIn(["podium", "account"])
			fromAccount = this.state.data.getIn(["podium", "account"]);
			ident = this.state.data.getIn(["podium", "identity"]);
			volume = amount * -1;
		} else {
			toAccount = this.state.data.getIn(["podium", "account"]);
			fromAccount = this.state.data.getIn(["user", "account"])
			ident = this.state.data.getIn(["user", "identity"])
			volume = amount;
		}

		// Do transaction
		return new Promise((resolve) => {
			RadixTransactionBuilder
				.createTransferAtom(
					fromAccount,
			 		toAccount,
			 		"TEST",
			 		volume
			 	)
				.signAndSubmit(ident)
				.subscribe({
					next: async status => {
						await this.stepTask(taskID);
					},
					error: error => {
						this.failTask(taskID, error);
						resolve(error);
					},
					complete: async () => {
						await this.stepTask(taskID);
						resolve();
					}
				});
		});

	}




// ACTIVE USER MANAGEMENT

	async registerUser(id, pw, name) {

		// Registers a new podium user by storing their
		// radix keypair and profile information, while
		// adding them to the public user roster.

		//TODO - Require ID and pw to obey certain rulesets

		// Switch to loading state
		this.setMode("loading");

		// Log progress
		const taskID = "register";
		await this.newTask(taskID, "Registering @" + id, 44);

		// Offline mode
		if (this.state.data.get("offline")) {

			// Fake task completion
			for (let i = 0; i < 32; i++) {
				await this.stepTask(taskID);
				await new Promise(resolve => setTimeout(resolve, 100));
			}
			this.completeTask(taskID);

			// Store user
			const address = "offlineaddress" + id
			this.updateState(state => state
				.setIn(["records", "users", address], Map({
					id: id,
					name: name,
					bio: "I am a normal human person.",
					picture: "./images/profile-placeholder.png",
					created: (new Date()).getTime(),
					address: address
				}))
			);

			// Sign-in
			this.signIn(id, pw);

		} else {

			// Create user identity
			const identityManager = new RadixIdentityManager();
			const identity = identityManager.generateSimpleIdentity();
			const address = identity.account.getAddress();

			// Generate user public record
			const profileAccount = Channel.forProfileOf(address);
			const profilePayload = {
				id: id,
				name: name,
				bio: "I am a normal human person.",
				picture: "./images/profile-placeholder.png",
				created: (new Date()).getTime(),
				address: address
			}

			// Generate user POD account
			const podAccount = Channel.forPODof(address);
			const podPayload = {
				pod: 500,
				on: (new Date()).getTime(),
				from: ""
			}

			// Generate user integrity record
			const integrityAccount = Channel.forIntegrityOf(address);
			const integrityPayload = {
				i: 0.5,
				on: (new Date()).getTime(),
				from: ""
			}

			// Generate record of this user in the public index
			const rosterAccount = Channel.forUserRoster();
			const rosterPayload = {
				address: address,
				id: id,
				created: (new Date()).getTime(),
			};

			// Generate record of this user's address owning this ID
			const ownershipAccount = Channel.forProfileWithID(id);
			const ownershipPayload = {
				id: id,
				address: address
			};

			// Encrypt keypair
			//TODO - Convert to use new helper functions for txns
			const keyStore = Channel.forKeystoreOf(id, pw);
			RadixKeyStore.encryptKey(identity.keyPair, pw)
				.then(async (encryptedKey) => {

					// Log progress
					await this.stepTask(taskID);

					// Store registration records
					this.sendRecord([keyStore], encryptedKey, taskID, identity)
						.then(await this.sendRecord([profileAccount], profilePayload, taskID, identity))
						.then(await this.sendRecord([podAccount], podPayload, taskID, identity))
						.then(await this.sendRecord([integrityAccount], integrityPayload, taskID, identity))
						.then(await this.sendRecord([rosterAccount], rosterPayload, taskID, identity))
						.then(await this.sendRecord([ownershipAccount], ownershipPayload, taskID, identity))
						//.then(await this.spendPOD(-10, taskID, identity))
						.then(() => {
							this.completeTask(taskID);
							this.signIn(id, pw);
						});

				})
				.catch((error) => {
					this.failTask(taskID, error);
				});

			}

		}


	async signIn(id, pw) {

		//TODO - Allow user to cache encrypted key locally
		//		 for faster sign-in
		
		//TODO - Sign in before finding all followers, etc..

		// Enter loading mode
		this.setMode("loading");

		// Log progress
		await this.newTask("signin", "Signing In", 8)

		// Offline Mode
		if (this.state.data.get("offline")) {

			// Fake task completion
			for (let i = 0; i < 8; i++) {
				await this.stepTask("signin");
				await new Promise(resolve => setTimeout(resolve, 100));
			}
			this.completeTask("signin");

			// Set active user
			this.updateState(state => state
				.set("user", emptyUser)
				.setIn(["user", "address"], "offlineaddress" + id)
			);

			// Enter app
			this.setMode("core");

		} else {

			// Load keypair from keystore
			const keyStore = Channel.forKeystoreOf(id, pw);
			this.getLatest(keyStore, 20)
				.then(async (encryptedKey) => {

					//TODO - Handle an empty value for -encryptedKey-
					// 		 (indicates wrong id/pw)

					// Log progress
					await this.stepTask("signin");

					// Decrypt keys
					RadixKeyStore.decryptKey(encryptedKey, pw)
				    	.then(async (keyPair) => {

				    		// Log progress
				    		await this.stepTask("signin");

				    		// Establish user identity from keypair
							const identity = new RadixSimpleIdentity(keyPair);

							// Get account for this user identity
							const account = identity.account;
							const address = account.getAddress();

							// Store in state
							this.updateState(state => state
								.set("user", emptyUser)
								.setIn(["user", "identity"], identity)
								.setIn(["user", "address"], address)
							);

							// Load profile data
							const profile = new Promise((resolve) => {
								this.getProfile(address)
									.then(profile => {
										this.stepTask("signin");
										resolve(true);
									});
							});
						
							// Load account posts
							const posts = new Promise((resolve) => {
								const postChannel = Channel.forPostsBy(address);
								this.getHistory(postChannel)
									.then(async postHistory => {

										//TODO - Load only the most recent X posts,
										//		 once Radix allows for this

										// Unpack previous posts
										postHistory.forEach(post => {
											this.receivePost(post);
										});

										// Listen for new posts
										this.openChannel(postChannel, this.receivePost);

										// Clean up
										await this.stepTask("signin");
										resolve(true);

									});
							});
							
							// Load account alerts
							const alerts = new Promise((resolve) => {
								const alertChannel = Channel.forAlertsTo(address);
								this.getHistory(alertChannel)
									.then(async alertHistory => {

										// Unpack previous alerts
										alertHistory.forEach(alert => {
											this.receiveAlert(alert);
										});

										//TODO - Step back through alerts to
										// 		determine which are old and which
										// 		have yet to be seen

										// Listen for new alerts
										this.openChannel(alertChannel, this.receiveAlert);
										
										// Clean up
										await this.stepTask("signin");
										resolve(true);

									});
							});

							// Load account following users
							const following = new Promise((resolve) => {
								const followingChannel = Channel.forFollowsBy(address);
								this.getHistory(followingChannel)
									.then(async followingHistory => {

										// Unpack users currently being followed
										followingHistory.forEach(follow => {

											// Store follower record
											this.receiveFollowing(follow);

											//TODO - Subscribe to posts from each
											//		follower

										});

										// Listen for new follows
										this.openChannel(followingChannel, this.receiveFollowing);

										// Clean up
										await this.stepTask("signin");
										resolve(true);

									});
							});

							// Load account followers
							const followers = new Promise((resolve) => {
								const followerChannel = Channel.forFollowing(address);
								this.getHistory(followerChannel)
									.then(async followerHistory => {

										// Unpack current followers
										followerHistory.forEach(follower => {
											this.receiveFollower(follower);
										});

										// Listen for new followers
										this.openChannel(followerChannel, this.receiveFollower);
										
										// Clean Up
										await this.stepTask("signin");
										resolve(true);

									});
							});

							// Wait for tasks to complete
							Promise.all([profile, posts, alerts, following, followers])
								.then((results) => {
									//TODO - Catch errors above and return into
									//		 the -results- before handling here.
									this.completeTask("signin");
									this.setMode("core");
								});

						})
						.catch((error) => { this.failTask("signin", error); });

				});

		}

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

		console.log("POST:", post);

		// Add post record to state
		post.received = (new Date()).getTime();
		post.pending = false;
		this.updateState(state => {
			var newState = state
				.updateIn(["records", "posts", post.address],
					(p) => (!p) ?
						Map(fromJS(post)) :
						(post.type === "post-ref") ?
							p :
							p.mergeDeep(Map(fromJS(post)))
					);
					// (p) => {
					// 	if (p) {
					// 		if (post.type === "post-ref") {
					// 			return p;
					// 		} else {
					// 			return p.mergeDeep(Map(fromJS(post)))
					// 		}
					// 	} else {
					// 		return Map(fromJS(post))
					// 	}
					// });
			if (post.author === state.getIn(["user", "address"])) {
				newState = newState
					.updateIn(["user", "posts"], (p) => p += 1)
					.updateIn(["user", "pending"], (p) => p -= 1)
					.setIn(["records", "posts", post.address, "feed"],
						"owned");
			}
			return newState;
		});

		// Retreive the post content
		this.getPost(post.address);

	}


	receiveAlert(alert) {

		// Add alert record to state
		alert.received = (new Date()).getTime();
		this.updateState(state => state
			.updateIn(["user", "alerts"], (v) => v += 1)
			.updateIn(["records", "alerts", alert.address],
				(a) => (a) ?
					a.mergeDeep(Map(fromJS(alert))) :
					Map(fromJS(alert)))
		);

		//TODO - Pre-emptively load alert subject matter

	}


	receiveFollowing(following) {

		//TODO - Validate relation record for this follower record

		// Add record to state
		following.received = (new Date()).getTime();
		this.updateState(state => state
			.updateIn(["user", "following"], (v) => v += 1)
			.updateIn(["records", "following", following.address],
				(f) => (f) ?
					f.mergeDeep(Map(fromJS(following))) :
					Map(fromJS(following)))
			.setIn(["records", "users", following.address, "following"],
				   true)
		);

		// Get the user's profile info
		this.getProfile(following.address);

		// Subscribe for posts from this user
		this.openChannel(
			Channel.forPostsBy(following.address),
			(post) => {
				post.feed = "following";
				this.receivePost(post);
			}
		);

	}


	receiveFollower(follower) {

		//TODO - Validate relation record for this follower record

		// Add record to state
		follower.received = (new Date()).getTime();
		this.updateState(state => state
			.updateIn(["user", "followers"], (v) => v += 1)
			.updateIn(["records", "followers", follower.address],
				(f) => (f) ?
					f.mergeDeep(Map(fromJS(follower))) :
					Map(fromJS(follower)))
			.setIn(["records", "users", follower.address, "follower"],
				   true)
		);

	}




// USERS

	async getProfile(address, store=true) {
		let result;
		if (this.state.data.get("offline")) {
			result = this.state.data
				.getIn(["records", "users", address]);
		} else {
			result = new Promise((resolve) => {

				//TODO - handle multiple simultaneous requests
				//		 for the same profile without multiple
				//		 calls to the network

				//TODO - load active user's affinity with this
				//		 newly loaded user

				// Check if profile has already been stored
				const current = this.state.data
					.getIn(["records", "users", address]);
				if (current) { resolve(current); }

				// Retrieve the latest profile information for the
				// provided address
				this.getLatest(Channel.forProfileOf(address))
					.then(profile => {

						// Add this profile to the app state
						// or return the result
						profile.received = (new Date()).getTime();
						if (store) {
							this.updateState(state => state
								.updateIn(["records", "users", address],
									(u) => (u) ? 
										u.mergeDeep(Map(fromJS(profile))) :
										Map(fromJS(profile))),
								() => { resolve(Map(fromJS(profile))); }
							);
						} else {
							resolve(Map(profile));
						}

					});

			});
		}
		return result
	}


	async getProfileFromID(id, store=false) {
		let result;
		if (this.state.data.get("offline")) {
			result = this.state.data
				.getIn(["records", "users", "offlineaddress" + id]);
		} else {
			result = new Promise((resolve) => {

				// Check if profile has already been stored
				const user = this.state.data
					.getIn(["records", "users"])
					.filter((user) => user.get("id") === id)
					.first();
				if (user) { resolve(user); }

				this.getLatest(Channel.forProfileWithID(id))
					.then(item => {
						if (_.isEmpty(item)) {
							resolve(false);
						} else {
							//TODO - This is needlessly making the
							//		 same request twice. Once here
							//		 and again in getProfile.
							this.getProfile(item.address, store)
								.then(profile => {
									resolve(profile);
								});
						}
					});
			});
		}
		return result;
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

		// Offline mode
		if (this.state.data.get("offline")) {

			// Fake post address
			const postAddress = "offlinepost" +
				this.state.data.getIn(["user", "address"]) +
				this.state.data.getIn(["user", "posts"]);

			// Fake task
			const taskID = "posting-" + postAddress;
			await this.newTask(taskID, "Sending Post", 18);
			for (let i = 0; i < 18; i++) {
				await this.stepTask(taskID);
				await new Promise(resolve => setTimeout(resolve, 100));
			}
			this.completeTask(taskID);

			// Store post
			this.updateState(state => state
				.updateIn(["user", "posts"], (v) => v += 1)
				.setIn(["records", "posts", postAddress], Map({
					type: "post",		// origin, amendment, retraction
					content: content,
					address: postAddress,
					author: state.getIn(["user", "address"]),
					parent: null,			// address of post being replied to
					origin: postAddress,	// address of first post in thread
					depth: 0,
					created: (new Date()).getTime()
				}))
			);

		} else {

			// Generate post ID
			const userAddress = this.state.data.getIn(["user", "address"]);
			//const postAccount = Channel.forNextPostBy(this.state.data.get("user"));
			const postAccount = Channel.forNewPost(content);
			const postAddress = postAccount.getAddress();

			// Create new task
			const taskID = "posting-" + postAddress;
			await this.newTask(taskID, "Sending Post", 18);

			// Get timestamp
			//TODO - Is this needed? Does Radix not timestamp
			//		 the payload itself?
			const time = (new Date()).getTime();

			// Build post record
			const postRecord = {
				type: "post",	// origin, amendment, retraction
				content: content,
				address: postAddress,
				author: userAddress,
				parent: (parent) ? parent.get("address") : null,			
				origin: (parent) ? parent.get("origin") : postAddress,
				depth: (parent) ? parent.get("depth") + 1 : 0,
				created: time
			}

			// Build reference payload and destination accounts
			const refAccounts = [
				Channel.forPostsBy(userAddress)
				//TODO - Add to other indexes for topics, mentions, links
			];
			const refRecord = {
				type: "post-ref",
				address: postAddress,
				created: time
			}

			// Build alert payload
			const alertAccounts = []
			const alertRecord = {
				type: "alert",
				subtype: "mention",
				address: postAddress,
				by: userAddress
			}

			// Store records in ledger
			this.sendRecord([postAccount], postRecord, taskID)
				.then(await this.sendRecord(refAccounts, refRecord, taskID))
				.then(await this.sendRecord(alertAccounts, alertRecord, taskID))
				.then(await this.completeTask(taskID));

			// Optimistic update
			this.updateState(state => state
				.setIn(["records", "posts", postAddress],
					Map(fromJS(postRecord)))
				.setIn(["records", "posts", postAddress, "pending"], true)
				.updateIn(["user", "pending"], (p) => p += 1)
			);

		}

	}


	async getPost(address, store=true) {
		let result;
		if (this.state.data.get("offline")) {
			result = this.state.data.getIn(["records", "posts", address]);
		} else {
			result = new Promise((resolve) => {

				// Check if post has already been stored
				const current = this.state.data
					.getIn(["records", "posts", address]);
				if (current) { resolve(current); }

				// Retrieve the latest post information for the
				// provided address
				this.getHistory(Channel.forPost(address))
					.then(result => {

						// Reject a result with no posts
						if (result.length === 0) {
							resolve();
						} else {

							// Build post from origin, edits, retractions, etc...
							//TODO - this
							console.log("????", result);
							var post = result[0];
							post.received = (new Date()).getTime();
							if (post.author === this.state.data.getIn(["user", "address"])) {
								post.owned = true;
							} else {
								post.owned = false;
							}
							if (post.author in this.state.data.getIn(["records", "following"])) {
								post.following = true;
							} else {
								post.following = false;
							}
							//TODO - Other classifications

							// Load post's author
							// - We don't store the author in the call to getProfile to ensure
							//   a fully atomic, single update with both post and author
							this.getProfile(post.author, false)
								.then(profile => {

									// Add this profile to the app state
									// or return the result
									profile.received = (new Date()).getTime();
									if (store) {
										this.updateState(state => state
											.updateIn(["records", "posts", address],
												(p) => (p) ?
													p.mergeDeep(Map(fromJS(post))) :
													Map(fromJS(post)))
											.updateIn(["records", "users", post.author],
												(u) => (u) ?
													u.mergeDeep(Map(fromJS(profile))) :
													Map(fromJS(profile))),
											() => { resolve(Map(post)); }
										);
									} else {
										post.author = profile;
										resolve(Map(post));
									}

								});

						}

					});

			});
		}
		return result;
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

	async createTopic(id, description) {

		// Adds a new topic by generating a storage
		// channel from its ID and registering that
		// channel with the main storage index.

		// Create new task
		const taskID = "new-topic-" + id;
		await this.newTask(taskID, "Creating #" + id, 14);

		// Offline mode
		if (this.state.data.get("offline")) {

			// Fake task completion
			for (let i = 0; i < 14; i++) {
				await this.stepTask(taskID);
				await new Promise(resolve => setTimeout(resolve, 100));
			}
			this.completeTask(taskID);

			// Update state
			const topicAddress = "offlinetopic" + id;
			this.updateState(state => state
				.setIn(["records", "topics", topicAddress], Map({
					id: id,
					description: description,
					owner: state.user.get("address"),
					address: topicAddress
				}))
			);

		} else {

			// Generate topic channel
			const topicAccount = Channel.forTopicWithID(id);
			const topicAddress = topicAccount.getAddress();

			// Build topic record
			const topicRecord = {
				id: id,
				description: description,
				owner: this.user.address,
				address: topicAddress
			}

			// Build topic reference
			const indexAccount = Channel.forTopicIndexOf(id);
			const indexRecord = {
				address: topicAddress
			}

			// Store topic
			this.sendRecord([topicAccount], topicRecord, taskID)
				.then(this.sendRecord([indexAccount], indexRecord, taskID))
				.then(this.completeTask(taskID));

		}

	}


	async getTopicIndex(prefix, store=false) {

		// Retreive an index of topics by the first 3
		// letters of the ID.

		// Offline mode
		let result;
		if (this.state.data.get("offline")) {

			result = this.state.data
				.getIn(["records", "topics"])
				.filter((topic) => {
					const id = topic.get("id");
					return id.substring(0,
						Math.min(prefix.length, id.length)) === prefix;
				});

		} else {

			// Load history
			result = new Promise((resolve) => {
				this.getHistory(Channel.getTopicIndexFor(prefix))
					.then(history => { resolve(history); })
				});

		}

		return result;

	}


	async getTopic(address, store=false) {

		// Retreives the record for a topic with the
		// provided address.

		//TODO - Check topic has not already been stored

		// Offline mode
		let result;
		if (this.state.data.get("offline")) {

			result = this.state.data
				.getIn(["records", "topics", address]);

		} else {

			// Return the latest record for this topic
			result = new Promise((resolve) => {
				this.getLatest(Channel.forTopic(address))
					.then(topic => {
						topic.received = (new Date()).getTime();
						if (store) {
							this.updateState(state => state
								.updateIn(["records", "topics", address],
									(t) => (t) ?
										t.mergeDeep(Map(fromJS(topic))) :
										Map(fromJS(topic))),
								() => { resolve(Map(topic)); }
							);
						} else {
							resolve(Map(topic));
						}
					});
			});

		}

		return result;

	}


	async getTopicFromID(id, store=false) {
		let result;
		if (this.state.data.get("offline")) {
			result = this.state.data
				.getIn(["records", "topics", "offlinetopic" + id]);
		} else {
			result = new Promise((resolve) => {

				// Check if profile has already been stored
				const topic = this.state.data
					.getIn(["records", "topics"])
					.filter((topic) => topic.get("id") === id)
					.first();
				if (topic) { resolve(topic); }

				this.getLatest(Channel.forTopicWithID(id))
					.then(item => {
						if (_.isEmpty(item)) {
							resolve(false);
						} else {
							this.getProfile(item.address, store)
								.then(t => { resolve(t); });
						}
					});
			});
		}
		return result
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

		// Create task widget
		const followAddress = follow.get("address");
		const taskID = "follow-" + follow.get("address");
		await this.newTask(taskID, "Following @" + follow.get("id"), 20);

		// Get timestamp
		const time = (new Date()).getTime();

		// Offline mode
		if (this.state.data.get("offline")) {

			// Fake task completion
			for (let i = 0; i < 20; i++) {
				await this.stepTask(taskID);
				await new Promise(resolve => setTimeout(resolve, 100));
			}
			this.completeTask(taskID);

			// Store follow
			this.updateState(state => state
				.setIn(["user", "following", followAddress], Map({
					type: "following index",
					address: followAddress,
					timestamp: time
				}))
			);

		} else {

			//TODO - Update to use new transaction functions

			// Build follow account payload
			const userAddress = this.state.data.getIn(["user", "address"])
			const followAccount = Channel.forFollowing(userAddress);
			const followPayload = JSON.stringify({
				type: "follower index",
				address: userAddress,
				timestamp: time
			});

			// Build relation account and payload
			const relationAccount = Channel.forRelationOf(
				userAddress, followAddress);
			const relationPayload = JSON.stringify({
				type: "follower record",
				users: [userAddress, followAddress],
				follow: true,
				timestamp: time
			});

			// Build following payload
			const followingAccount = Channel.forFollowsBy(userAddress);
			const followingPayload = JSON.stringify({
				type: "following index",
				address: followAddress,
				timestamp: time
			});

			// Store following record
			RadixTransactionBuilder
				.createPayloadAtom(
					[followAccount],
					this.state.data.getIn(["podium", "id"]),
					followPayload,
					false
				)
				.signAndSubmit(this.state.data.getIn(["user", "identity"]))
				.subscribe({
					next: async status => { await this.stepTask(taskID); },
					error: error => { this.failTask(taskID, error); },
					complete: async () => {

						// Log Progress
						await this.stepTask(taskID);

						// Store relationship record
						RadixTransactionBuilder
							.createPayloadAtom(
								[relationAccount],
								this.state.data.getIn(["podium", "id"]),
								relationPayload,
								false
							)
							.signAndSubmit(this.state.data.getIn(["user", "identity"]))
							.subscribe({
								next: async status => { await this.stepTask(taskID); },
								error: error => { this.failTask(taskID, error); },
								complete: async () => {

									// Log progress
									await this.stepTask(taskID);

									// Store followed user in active user's list
									RadixTransactionBuilder
										.createPayloadAtom(
											[followingAccount],
											this.state.data.getIn(["podium", "id"]),
											followingPayload,
											false
										)
										.signAndSubmit(this.state.data.getIn(["user", "identity"]))
										.subscribe({
											next: async status => { await this.stepTask(taskID); },
											error: error => { this.failTask(taskID, error); },
											complete: () => { this.completeTask(taskID); }
										});

								}
							});

					}
				});

		}

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

					getProfile={this.getProfile}
					getProfileFromID={this.getProfileFromID}

					getTopic={this.getTopic}
					getTopicFromID={this.getTopicFromID}

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
				"demo-menu card demo-menu-open" :
				"demo-menu card demo-menu-closed"}>
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
				onClick={this.props.setMode.bind(this, "home")}>
				<span className="fas fa-sign-out-alt demo-menu-icon"></span>
				Return to Homepage
			</p>
		</div>
		
		return (
			<div ref="demo" className="demo">
				{content}
				<Tasks
					tasks={this.state.data.get("tasks")}
					endTask={this.endTask}
				/>
				{demoMenu}
					<button
						className="red-button demo-button card"
						onClick={this.toggleDemoMenu.bind(this)}>
						{(this.state.data.get("demomenu")) ?
							<span className="fas fa-times demo-button-icon"></span> :
							<span className="fas fa-magic demo-button-icon"></span>
						}
					</button>
			</div>
		);
	}




// CLEAN UP

	componentWillUnmount() {

		// Online mode only
		if (!this.state.data.get("offline")) {

			// Close balance and faucet subscriptions
			if (this.state.data.getIn(["podium", "allowance"])) {
				clearInterval(this.state.data
					.getIn(["podium", "allowance"]));
				this.state.data
					.getIn(["podium", "balanceChannel"])
					.unsubscribe();
			}

			// Close all open channels
			this.state.data
				.get("channels")
				.map((_, key) => this.closeChannel(key));

		}

		// Halt all active timers
		this.state.data
			.get("timers")
			.map((timer) => this.stopTimer(timer));

	}



}

export default Demo;