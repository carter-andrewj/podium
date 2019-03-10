import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import { List, Set, Map, is, fromJS } from 'immutable';

import PostContent from './postContent';
import PostCard from './postCard';
import PostThread from './postThread';
import PostPage from './postPage';





const emptyState = {
	post: null,
	author: null,
	parent: null,
	parentAuthor: null,
	thread: null,
	liteThread: false,
	fullThread: false,
	mentions: null,
	replies: null,
	required: Set(),
	published: null,
	stale: false,
	last: null,
	links: Map()
}



function placeholder(address) {
	return {
		address: address,
		placeholder: true
	}
}



class Post extends ImmutableComponent {


	constructor() {
		super(emptyState)
		this.timer = null
		this.loadPost = this.loadPost.bind(this)
		this.loadPostFromAddress = this.loadPostFromAddress.bind(this)
		this.setPost = this.setPost.bind(this)
		this.reloadPost = this.reloadPost.bind(this)
		this.autoUpdate = this.autoUpdate.bind(this)
		this.require = this.require.bind(this)
		this.getRequirement = this.getRequirement.bind(this)
		this.loadRequirements = this.loadRequirements.bind(this)
	}





	immutableComponentWillMount() {
		if (this.props.target) {
			this.loadPost()
		}
	}


	shouldImmutableComponentUpdate(nextProps, nextState) {
		if (!is(nextState, this.getState())) {
			return true
		}
		if (nextProps.exit !== this.props.exit) {
			return true
		}
		if (nextProps.from && nextProps.from === "address") {
			if (this.props.target !== nextProps.target) {
				return true
			}
		} else {
			if (nextProps.target && (!this.props.target ||
					!is(nextProps.target.cache, this.props.target.cache))) {
				return true
			}
		}
		return false
	}


	immutableComponentDidUpdate(lastProps, lastState) {
		if (this.props.target !== lastProps.target) {
			this.updateState(
				state => state.mergeDeep(fromJS(emptyState)),
				this.loadPost
			)
		} else {
			const lastPost = lastState.get("post")
			if (lastPost && !lastPost.placeholder && !this.getState("stale") &&
					(this.getState("published") !== lastPost.published)) {
				this.updateState(state => state.set("stale", true))
			}
		}
	}




	loadPost() {
		if (this.props.from && this.props.from === "address") {
			this.loadPostFromAddress(this.props.target)
		} else {
			this.setPost(this.props.target)
		}
	}


	reloadPost(force = false) {
		return new Promise((resolve, reject) => {
			if (this.props.from && this.props.from === "address") {
				this.loadPostFromAddress(this.props.target, force)
					.then(resolve)
					.catch(reject)
			} else {
				this.loadPostFromAddress(this.props.target.address, force)
					.then(resolve)
					.catch(reject)
			}
		})
	}


	loadPostFromAddress(address, force = false) {
		return new Promise((resolve, reject) => {
			this.updateState(
				state => state.set("post", placeholder(address)),
				() => this.props.getPost(address)
					.then(post => this.setPost(post, force))
					.then(resolve)
					.catch(reject)
			)
		})
	}


	setPost(post, force = false) {
		return new Promise((resolve, reject) => {
			this.updateState(
				state => state
					.set("post", post)
					.set("published", post.published)
					.update("thread", t => {
						let thread;
						if (t) {
							thread = t
						} else {
							switch (post.depth) {
								case 0:
									thread = List()
									break;
								case 1:
									thread = List([
										placeholder(post.parentAddress)
									])
									break;
								case 2:
									thread = List([
										placeholder(post.grandparentAddress),
										placeholder(post.parentAddress)
									])
									break;
								case 3:
									thread = List([
										placeholder(post.originAddress),
										placeholder(post.grandparentAddress),
										placeholder(post.parentAddress)
									])
									break;
								default: thread = List([
									placeholder(post.originAddress),
									{
										spacer: true,
										gap: post.depth - 2
									},
									placeholder(post.parentAddress)
								])
							}
						}
						return thread
					}),
				() => {
					this.loadRequirements(force)
						.then(resolve)
						.catch(reject)
				}
			)
		})
	}


	invalidPost(error) {
		console.error(error)
		this.updateState(state => state.set("valid", false))
	}




	autoUpdate(flag = true) {
		clearTimeout(this.timer)
		if (flag) {
			this.timer = setTimeout(
				() => this.reloadPost(true)
					.then(this.autoUpdate)
					.catch(console.error),
				3000
			)
		}
	}



	require() {
		return new Promise((resolve, reject) => {
			var requirements = Set(Array.prototype.slice.call(arguments))
			this.updateState(
				state => state.update(
					"required",
					r => r.union(requirements)
				),
				() => this.loadRequirements()
			)
		})
	}


	loadRequirements(force = false) {
		return new Promise((resolve, reject) => {
			if (this.getState("post") && !this.getState("post").placeholder) {
				const requirements = this.getState("required")
				var fetching = requirements
					.map(r => this.getRequirement(r, force))
					.toJS()
				if (requirements.length === 1) {
					resolve(fetching[0])
				} else {
					Promise.all(fetching)
						.then(resolve)
						.catch(reject)
				}
			} else {
				resolve()
			}
		})
	}


	getRequirement(id, force = false) {
		switch (id) {

			case "author": return this.requireAuthor(force)
			case "parentAuthor": return this.requireParentAuthor(force)

			case "parent": return this.requireParent(force)
			case "grandparent": return this.requireGrandparent(force)
			case "origin": return this.requireOrigin(force)

			case "thread": return this.requireThread(force)
			case "threadSpacer": return this.requireThreadSpacer(force)
			case "fullThread": return this.requireFullThread(force)
			
			case "replies": return this.requireReplies(force)

			case "references": return this.requireReferences(force)
			case "mentions": return this.requireMentions(force)

			default:
				console.error(`Unknown post requirement: ${id}`)
				return null

		}
	}



	requireAuthor(force = false) {
		return new Promise((resolve, reject) => {
			if (this.getState("author") && !force) {
				resolve(this.getState("author"))
			} else {
				this.props.getUser(this.getState("post").authorAddress)
					.then(author => this.updateState(
						state => state.set("author", author),
						() => resolve(author)
					))
					.catch(console.error)
			}
		})
	}


	requireParentAuthor(force = false) {
		const parent = this.getState("post").parentAddress
		if (parent) {
			return new Promise((resolve, reject) => {
				if (this.getState("parentAuthor") && !force) {
					resolve(this.getState("parentAuthor"))
				} else {
					this.requireParent(force)
						.then(parent => this.props.getUser(parent.authorAddress))
						.then(author => this.updateState(
							state => state.set("parentAuthor", author),
							() => resolve(author)
						))
						.catch(reject)
				}
			})
		} else {
			return
		}
	}


	requireParent(force = false) {
		const parent = this.getState("post").parentAddress
		if (parent) {
			return new Promise((resolve, reject) => {
				if (this.getState("parent") && !force) {
					resolve(this.getState("parent"))
				} else {
					this.props.getPost(parent)
						.then(parent => this.updateState(
							state => state.set("parent", parent),
							() => resolve(parent)
						))
						.catch(reject)
				}
			})
		} else {
			return
		}
	}


	requireGrandparent(force = false) {
		const grandparent = this.getState("post").grandparentAddress
		if (grandparent) {
			return new Promise((resolve, reject) => {
				if (this.getState("grandparent") && !force) {
					resolve(this.getState("grandparent"))
				} else {
					this.props.getPost(grandparent)
						.then(grandparent => this.updateState(
							state => state.set("grandparent", grandparent),
							() => resolve(grandparent)
						))
						.catch(reject)
				}
			})
		} else {
			return
		}
	}


	requireOrigin(force = false) {
		return new Promise((resolve, reject) => {
			const post = this.getState("post")
			switch (post.depth) {
				case 0:
					resolve(post)
					break;
				case 1:
					this.requireParent(force).then(resolve).catch(reject)
					break;
				case 2:
					this.requireGrandparent(force).then(resolve).catch(reject)
					break;
				default:
					if (this.getState("origin") && !force) {
						resolve(this.getState("origin"))
					} else {
						this.props.getPost(post.originAddress)
							.then(origin => this.updateState(
								state => state.set("origin", origin),
								() => resolve(origin)
							))
							.catch(reject)
					}
			}
		})
	}



	requireThreadSpacer() {
		const depth = this.getState("post").depth
		if (depth > 3) {
			return Promise.resolve({
				spacer: true,
				gap: depth - 2
			})
		} else {
			return Promise.resolve()
		}
	}


	requireThread(force = false) {
		return new Promise((resolve, reject) => {
			if (this.getState("liteThread") && !force) {
				resolve(this.getState("thread"))
			} else {

				const depth = this.getState("post").depth

				let reqs;
				if (depth === 0) {
					reqs = []
				} else if (depth === 1) {
					reqs = ["parent"]
				} else if (depth === 2) {
					reqs = ["grandparent", "parent"]
				} else if (depth === 3) {
					reqs = ["origin", "grandparent", "parent"]
				} else {
					reqs = ["origin", "threadSpacer", "parent"]
				}

				Promise.all(reqs.map(r => this.getRequirement(r, force)))
					.then(thread => {
						this.updateState(
							state => state
								.set("thread", List(thread))
								.set("liteThread", true),
							resolve(List(thread))
						)
					})
					.catch(reject)

			}
		})
	}


	requireFullThread(force = false) {
		return new Promise((resolve, reject) => {
			if (this.getState("fullThread") && !force) {
				resolve(this.getState("thread"))
			} else {
				this.requireThread(force)
					.then(thread => {
						if (thread.get(1)["spacer"]) {
							const start = thread.get(2).parentAddress
							const stop = this.getState("post").originAddress
							this.fillThread(start, stop)
								.then(posts => this.updateState(
									state => state
										.update("thread", t => t.splice(1, 1, ...posts))
										.set("fullThread", true),
									() => resolve(this.getState("thread"))
								))
								.catch(reject)
						} else {
							resolve(thread)
						}
					})
					.catch(reject)
			}
		})
	}


	fillThread(startAddress, stopAddress, postList = List()) {
		//TODO - Make more efficient by batch-loading parent & grandparent
		//		 posts simultaneously
		return new Promise((resolve, reject) => {
			this.props.getPost(startAddress)
				.then(post => {
					postList = postList.unshift(post)
					const parent = post.parentAddress
					if (parent === stopAddress) {
						return postList
					} else {
						return this.fillThread(parent, stopAddress, postList)
					}
				})
				.then(resolve)
				.catch(reject)
		})
	}


	requireReplies(force = false) {
		return new Promise((resolve, reject) => {
			if (this.getState("replies") && !force) {
				resolve(this.getState("replies"))
			} else {
				this.getState("post").replyIndex()
					.then(replies => this.updateState(
						state => state.set("replies", replies),
						() => resolve(replies)
					))
					.catch(reject)
			}
		})
	}


	requireReferences(force = false) {
		return Promise.all([
			this.requireMentions(force)
		])
	}


	requireMentions(force = false) {
		return new Promise((resolve, reject) => {
			if (this.getState("mentions") && !force) {
				resolve(this.getState("mentions").toJS())
			} else {
				var mentionSet = this.getState("post").mentions
					.map(address => this.props.getUser(address))
					.toJS()
				Promise.all(mentionSet)
					.then(mentions => this.updateState(
						state => state.set("mentions", mentions),
						() => resolve(mentions)
					))
					.catch(reject)
			}
		})
	}




	render() {

		let PostFormat;
		switch (this.props.format) {

			// Render just the post content
			case "content":
				PostFormat = PostContent
				break;

			// Render as a standalone card
			case "card":
				PostFormat = PostCard
				break;

			// Render as the latest post in a thread
			case "thread":
				PostFormat = PostThread
				break;

			// Render as a page
			default: PostFormat = PostPage

		}

		return <PostFormat

			podium={this.props.podium}
			activeUser={this.props.activeUser}
			balance={this.props.balance}

			getUser={this.props.getUser}
			followUser={this.props.followUser}
			unfollowUser={this.props.unfollowUser}

			getPost={this.props.getPost}
			sendPost={this.props.sendPost}

			valid={this.getState("valid")}
			require={this.require}
			autoUpdate={this.autoUpdate}

			toLink={this.toLink}
			makeLink={this.makeLink}
			externalLink={this.externalLink}

			post={this.getState("post")}

			parent={this.getState("parent")}
			grandparent={this.getState("grandparent")}
			origin={this.getState("origin")}
			thread={this.getState("thread")}

			replies={this.getState("replies")}

			author={this.getState("author")}
			parentAuthor={this.getState("parentAuthor")}

			mentions={this.getState("mentions")}

			stale={this.getState("stale")}

			first={this.props.first}
			suppressLabels={this.props.suppressLabels}

			transition={this.props.transition}
			exit={this.props.exit}

		/>

	}


	immutableComponentWillUnmount() {
		clearTimeout(this.timer)
	}

}

export default Post;
