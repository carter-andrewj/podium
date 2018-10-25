import React, { Component } from 'react';
import _ from 'lodash';
import '../../App.css';

import { radixUniverse, RadixUniverse,
		 RadixSimpleIdentity, RadixIdentityManager, RadixKeyPair, 
		 RadixKeyStore, RadixTransactionBuilder } from 'radixdlt';

import Channel from './utils';
import Settings from './config';

import Lobby from './lobby/lobby';
import Core from './core/core';
import Loading from './core/loading';
import Tasks from './core/tasks';



const emptyData = {
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
}

const emptyUser = {
	identity: null,
	address: "none",
	posts: 0,
	followers: 0,
	following: 0,
	alerts: 0,
	integrity: 0.0,
	balance: {
		pdm: 0,
		dpm: 0,
		rad: 0
	},
	emblems: []
}


class Demo extends Component {

	constructor() {
		super()
		this.state = {

			mode: "lobby",
			settings: Settings,

			podium: {},
			user: {},
			data: emptyData,

			tasks: {},
			flags: {},
			timers: {},
			channels: {},

		};

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




// INTITIAL SETUP

	componentWillMount() {

		// Connect to Radix universe
		radixUniverse.bootstrap(RadixUniverse.ALPHANET);

		// Get Podium root account
		const rootAccount = Channel.master();
		const rootIdentity = new RadixSimpleIdentity(
			RadixKeyPair.fromAddress(rootAccount.getAddress())
		);

		// Initialize state
		var state = this.state;
		state.podium = {
			id: Settings.ApplicationID,
			identity: rootIdentity
		}
		this.setState(state);

	}




// UTILITIES

	setMode(mode) {
		const state = this.state;
		state.mode = mode;
		this.setState(state);
	}


	setFlag(flag) {
		if (!this.state.flags[flag]) {
			const state = this.state;
			state.flags[flag] = true;
			this.setState(state);
		}
	}

	clearFlag(flag) {
		const state = this.state;
		state.flags[flag] = false;
		this.setState(state);
	}




// TIMERS

	newTimer(id, lifetime, callback) {

		// Start timer
		const timer = setTimeout(() => {

			// Run callback
			callback();

			// Delete record of this timer
			const state = this.state;
			delete state.timers[id];
			this.setState(state);

		}, lifetime);

		// Store timer
		const state = this.state;
		state.timers[id] = {
			timer: timer,
			callback: callback,
			lifetime: lifetime
		}
		this.setState(state);

	}


	resetTimer(id) {

		// Stop timer
		clearTimeout(this.state.timers[id].timer);

		// Get timer record
		const rec = this.state.timers[id];

		// Recreate timer
		this.newTimer(rec.id, rec.callback, rec.lifetime);

	}


	stopTimer(id) {

		// Stop timer
		clearTimeout(this.state.timers[id].timer);

		// Remove from state
		const state = this.state;
		delete state.timers[id];
		this.setState(state);

	}




// TASK MANAGEMENT

	newTask(id, title, steps) {
		if (steps > 0) {
			var state = this.state;
			state.tasks[id] = {
				id: id,
				title: title,
				maxstep: steps,
				step: 0,
				complete: false,
				error: null
			};
			this.setState(state);
		}
	}

	async stepTask(id) {
		return new Promise((resolve) => {
			var state = this.state;
			state.tasks[id].step += 1;
			this.setState(state, resolve);
		});
	}

	completeTask(id) {
		var state = this.state;
		state.tasks[id].complete = true;
		this.setState(state);
	}

	endTask(id) {
		var state = this.state;
		delete state.tasks[id];
		this.setState(state);
	}

	failTask(id, error) {
		var state = this.state;
		state.tasks[id].error = error;
		this.setState(state);
		console.error(state.tasks[id].step, error);
	}




// RADIX UTILITIES

	sendRecord(accounts, payload, taskID, encrypt=false) {
		return new Promise((resolve) => {
			if (accounts.length === 0) {
				resolve();
			} else {
				RadixTransactionBuilder
					.createPayloadAtom(
						accounts,
						this.state.podium.id,
						JSON.stringify(payload),
						encrypt
					)
					.signAndSubmit(this.state.user.identity)
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
			.getApplicationData(this.state.podium.id)
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
		if (address in this.state.channels) {
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
		const state = this.state;
		state.channels[address] = {
			account: account,
			channel: channel,
			lifetime: timer
		}
		this.setState(state);

		// Return the channel
		return channel;

	}


	closeChannel(address) {

		// Closes and cleans up a channel created by
		// openChannel

		// Stop channel timeout
		if (this.state.channels[address].timer) {
			this.stopTimer(address);
		}

		// Unsubscribe from channel
		this.state.channels[address].channel.unsubscribe();

		// Remove record from state
		const state = this.state;
		delete state.channels[address];
		this.setState(state);

		//TODO - Close node connection

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
		await this.newTask("register", "Registering @" + id, 21);

		// Create user identity
		const identityManager = new RadixIdentityManager();
		const identity = identityManager.generateSimpleIdentity();
		const address = identity.account.getAddress();

		// Generate user public record
		const time = (new Date()).getTime()
		const profile = {
			id: id,
			name: name,
			bio: "I am a normal human person.",
			picture: "./images/profile-placeholder.png",
			created: time,
			address: address
		}
		const profileAccount = Channel.forProfileOf(
			identity.account.getAddress());
		const profilePayload = JSON.stringify(profile);

		// Generate record of this user in the public index
		const rosterAccount = Channel.forUserRoster();
		const rosterPayload = JSON.stringify({
			address: address,
			id: profile.id,
			created: (new Date()).getTime(),
		});

		// Generate record of this user's address owning this ID
		const ownershipAccount = Channel.forProfileWithID(id);
		const ownershipPayload = JSON.stringify({
			id: id,
			address: address
		});

		// Encrypt keypair
		//TODO - Convert to use new helper functions for txns
		const keyStore = Channel.forKeystoreOf(id, pw);
		RadixKeyStore.encryptKey(identity.keyPair, pw)
			.then(async (encryptedKey) => {

				// Log progress
				await this.stepTask("register");

				// Build payload
				const keyPayload = JSON.stringify(encryptedKey);

				// Store encrypted keys
				RadixTransactionBuilder
					.createPayloadAtom(
						[keyStore],
						this.state.podium.id,
						keyPayload,
						false
					)
					.signAndSubmit(identity)
					.subscribe({
						next: async status => { await this.stepTask("register"); },
						error: error => { this.failTask("register", error); },
						complete: async () => {

							// Log progress
							await this.stepTask("register");

							// Store Profile
							RadixTransactionBuilder
								.createPayloadAtom(
									[profileAccount],
									this.state.podium.id,
									profilePayload,
									false
								)
								.signAndSubmit(identity)
								.subscribe({
									next: async status => { await this.stepTask("register"); },
									error: error => { this.failTask("register", error); },
									complete: async () => {

										// Log progress
										await this.stepTask("register");

										// Store record in public index
										RadixTransactionBuilder
											.createPayloadAtom(
												[rosterAccount],
												this.state.podium.id,
												rosterPayload,
												false
											)
											.signAndSubmit(identity)
											.subscribe({
												next: async status => { await this.stepTask("register"); },
												error: error => { this.failTask("register", error); },
												complete: async () => {

													// Log progress
													await this.stepTask("register");

													// Store ownership record for this ID
													RadixTransactionBuilder
														.createPayloadAtom(
															[ownershipAccount],
															this.state.podium.id,
															ownershipPayload,
															false
														)
														.signAndSubmit(identity)
														.subscribe({
															next: async status => { await this.stepTask("register"); },
															error: error => { this.failTask("register", error); },
															complete: async () => {

																// Close Task
																await this.completeTask("register");

																// Sign user in
																this.signIn(id, pw);

															}
														});

												},
											});

									},
								});

						},
					});

			})
			.catch((error) => {
				this.failTask("register", error);
			});

		}


	async signIn(id, pw) {

		//TODO - Allow user to cache encrypted key locally
		//		 for faster sign-in
		
		//TODO - Sign in before finding all followers, etc..

		// Enter loading mode
		this.setMode("loading");

		// Log progress
		await this.newTask("signin", "Signing In", 8)

		// Load keypair from keystore
		const keyStore = Channel.forKeystoreOf(id, pw);
		this.getLatest(keyStore, 20)
			.then(async (encryptedKey) => {

				//TODO - Handle an empty value for -encryptedKey-
				// 		 (indicates wrong id/pw)
				console.log(encryptedKey);

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
						var state = this.state;
						state.mode = "loading";
						state.user = emptyUser;
						state.user.identity = identity;
						state.user.address = address;
						this.setState(state);

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


	signOut() {
		const state = this.state;
		state.user = {};
		state.data = emptyData;
		state.mode = "lobby";
		this.setState(state);
	}




// HANDLE NEW DATA

	receivePost(post) {
		console.log("New Post:", post);
		var state = this.state;
		state.user.posts += 1;
		state.data.posts[post.address] = post;
		this.setState(state);
	}


	receiveAlert(alert) {
		console.log("New Alert:", alert);
		var state = this.state;
		state.user.alerts += 1;
		state.data.alerts[alert.address] = alert;
		this.setState(state);
	}


	receiveFollowing(following) {
		//TODO - Validate relation record for this follower record

		// Add record to state
		var state = this.state;
		state.user.following += 1;
		state.data.following[following.address] = following;
		if (!(following.address in state.data.users)) {
			state.data.users[following.address] = {
				address: following.address
			}
		}
		this.setState(state);

		// Subscribe for posts from this user
		this.openChannel(
			Channel.forPostsBy(following.address),
			this.receivePost
		);

	}


	receiveFollower(follower) {
		//TODO - Validate relation record for this follower record
		console.log("New Follower:", follower);
		var state = this.state;
		state.user.followers += 1;
		state.data.followers[follower.address] = follower;
		if (!(follower.address in state.data.users)) {
			state.data.users[follower.address] = {
				address: follower.address
			}
		}
		this.setState(state);
	}




// USERS

	//TODO - This should default to store=false so querying
	//		 components can update state atomically
	async getProfile(address, store=true) {
		return new Promise((resolve) => {

			// Check if profile has already been stored
			if (address in this.state.data.users &&
					"id" in this.state.data.users[address]) {
				resolve(this.state.data.users[address]);
			}

			// Retrieve the latest profile information for the
			// provided address
			this.getLatest(Channel.forProfileOf(address))
				.then(profile => {

					// Add this profile to the app state
					// or return the result
					if (store) {
						const state = this.state;
						state.data.users[address] = profile;
						this.setState(state, () => { resolve(profile); });
					} else {
						resolve(profile);
					}

				});

		});
	}


	async getProfileFromID(id, store=false) {
		return new Promise((resolve) => {

			// Check if profile has already been stored
			const user = Object.keys(this.state.data.users)
				.filter(k => this.state.data.users[k].id === id);
			if (user.length > 0) { resolve(user[0]); }

			this.getLatest(Channel.forProfileWithID(id))
				.then(item => {
					if (_.isEmpty(item)) {
						resolve(false);
					} else {
						this.getProfile(item.address, store)
							.then(profile => {
								resolve(profile);
							});
					}
				});
		});
	}




// POSTING

	async sendPost(post, cost) {

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

		// Generate post ID
		const postAccount = Channel.forNextPostBy(this.state.user);
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
			type: "post",
			subtype: "origin",		// origin, revision, retraction
			content: post,
			address: postAddress,
			author: this.state.user.address,
			parent: null,			// address of post being replied to
			origin: postAddress,	// address of first post in thread
			mentions: [],
			topics: [],
			links: [],
			created: time
		}

		// Build reference payload and destination accounts
		const refAccounts = [
			Channel.forPostsBy(this.state.user.address)
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
			by: this.state.user.address
		}

		// Store records in ledger
		this.sendRecord([postAccount], postRecord, taskID)
			.then(await this.sendRecord(refAccounts, refRecord, taskID))
			.then(await this.sendRecord(alertAccounts, alertRecord, taskID))
			.then(await this.completeTask(taskID));

	}


	async getPost(address, store=true) {
		return new Promise((resolve) => {

			// Check if post has already been stored
			if ("content" in this.state.data.posts[address]) {
				resolve(this.state.data.posts[address]);
			}

			// Retrieve the latest post information for the
			// provided address
			this.getHistory(Channel.forPost(address))
				.then(result => {

					// Build post from origin, edits,
					// retractions, etc...
					//TODO - this
					const post = result[0];
					if (post.author === this.state.user.address) {
						post.type = "owned";
					} else if (post.author in this.state.data.following) {
						post.type = "following";
					}
					//TODO - Other classifications

					// Load post's author
					this.getProfile(post.author, false)
						.then(profile => {

							// Add this profile to the app state
							// or return the result
							if (store) {
								const state = this.state;
								state.data.posts[address] = post;
								state.data.users[post.author] = profile;
								this.setState(state, () => { resolve(post); })
							} else {
								post.author = profile;
								resolve(post);
							}

						});

				});

		});
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


	async getTopicIndex(prefix, store=false) {

		// Retreive an index of topics by the first 3
		// letters of the ID.

		// Load history
		return new Promise((resolve) => {
			this.getHistory(Channel.getTopicIndexFor(prefix))
				.then(history => {

					if (store) {
						const state = this.state;
						history.foreach(h => {
							if (!(h in state.data.topics)) {
								state.data.topics[h.address] = h;
							}
						});
						this.setState(state, () => { resolve(history); });
					} else {
						resolve(history);
					}
					
				});
		});

	}


	async getTopic(address, store=false) {

		// Retreives the record for a topic with the
		// provided address.

		//TODO - Check topic has not already been stored

		// Return the latest record for this topic
		return new Promise((resolve) => {
			this.getLatest(Channel.forTopic(address))
				.then(topic => {

					if (store) {
						const state = this.state;
						state.data.topics[address] = topic;
						this.setState(state, () => { resolve(topic); });
					} else {
						resolve(topic);
					}

				});
		});

	}


	async getTopicFromID(id, store=false) {
		return new Promise((resolve) => {

			// Check if profile has already been stored
			const topic = Object.keys(this.state.data.topics)
				.filter(k => this.state.data.topics[k].id === id);
			if (topic.length > 0) { resolve(topic[0]); }

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


	async deleteTopic() {

	}




// FOLLOWING/FOLLOWERS

	async followUser(user) {

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
		const taskID = "follow-" + user.address;
		await this.newTask(taskID, "Following @" + user.id, 20);

		// Get timestamp
		const time = (new Date()).getTime();

		// Build follow account payload
		const followAccount = Channel.forFollowing(user.address);
		const followPayload = JSON.stringify({
			type: "follower index",
			address: this.state.user.address,
			timestamp: time
		});

		// Build relation account and payload
		const relationAccount = Channel.forRelationOf(
			this.state.user.address, user.address);
		const relationPayload = JSON.stringify({
			type: "follower record",
			follow: true,
			timestamp: time
		});

		// Build following payload
		const followingAccount = Channel.forFollowsBy(this.state.user.address);
		const followingPayload = JSON.stringify({
			type: "following index",
			address: user.address,
			timestamp: time
		});

		// Store following record
		RadixTransactionBuilder
			.createPayloadAtom(
				[followAccount],
				this.state.podium.id,
				followPayload,
				false
			)
			.signAndSubmit(this.state.user.identity)
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
							this.state.podium.id,
							relationPayload,
							false
						)
						.signAndSubmit(this.state.user.identity)
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
										this.state.podium.id,
										followingPayload,
										false
									)
									.signAndSubmit(this.state.user.identity)
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


	async unfollowUser(user) {

		// Update relation record between the target user and
		// the active user

		// Remove the target user from the app state

	}




// RENDER

	render() {

		let content;
		switch (this.state.mode) {

			case ("lobby"):
				content = <Lobby
					podium={this.state.podium}
					registerUser={this.registerUser}
					signIn={this.signIn}
				/>
				break;

			case ("loading"):
				content = <Loading />;
				break;

			default:
				content = <Core

					podium={this.state.podium}
					user={this.state.user}
					data={this.state.data}

					getProfile={this.getProfile}
					getProfileFromID={this.getProfileFromID}

					getTopic={this.getTopic}
					getTopicFromID={this.getTopicFromID}

					followUser={this.followUser}
					unfollowUser={this.unfollowUser}

					sendPost={this.sendPost}
					getPost={this.getPost}

					signOut={this.signOut}

				/>

		}
		
		return (
			<div ref="demo" className="demo">
				{content}
				<Tasks
					tasks={this.state.tasks}
					endTask={this.endTask}
				/>
				<button
					className="red-button quit-button card"
					onClick={this.props.setMode.bind(this, "home")}>
					quit demo
				</button>
			</div>
		);
	}




// CLEAN UP

	componentWillUnmount() {

		// Close all open channels
		Object.keys(this.state.channels).forEach((k) => {
			this.closeChannel(k);
		});

		// Halt all active timers
		Object.keys(this.state.timers).forEach((k) => {
			this.stopTimer(k);
		});

	}



}

export default Demo;