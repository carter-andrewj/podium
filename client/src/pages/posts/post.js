import React from 'react';
import { Link } from 'react-router-dom';
import ImmutableComponent from '../../components/immutableComponent';

import { List, Set, Map, fromJS } from 'immutable';

import { markupPost } from 'utils';

import PostContent from './postContent';
import PostCard from './postCard';
import PostThread from './postThread';
import PostPage from './postPage';

import Profile from '../profiles/profile';



let timer;

const emptyState = {
	post: null,
	author: null,
	parent: null,
	parentAuthor: null,
	replies: null,
	required: Set(),
	published: null,
	stale: false,
	last: null,
	links: Map()
}


class Post extends ImmutableComponent {


	constructor() {
		super(emptyState)
		this.setPost = this.setPost.bind(this)
		this.require = this.require.bind(this)
		this.getRequirement = this.getRequirement.bind(this)
		this.toLink = this.toLink.bind(this)
	}





	immutableComponentWillMount() {
		if (this.props.post) {
			this.loadPost()
		}
	}


	immutableComponentDidUpdate(lastProps, lastState) {
		if (this.props.post !== lastProps.post) {
			this.updateState(
				state => state.mergeDeep(emptyState),
				this.loadPost
			)
		} else {
			const lastPost = lastState.get("post")
			if (lastPost && !this.getState("stale") &&
					(this.getState("published") !== lastPost.published)) {
				this.updateState(state => state.set("stale", true))
			}
		}
	}




	loadPost() {
		if (this.props.from && this.props.from === "address") {
			this.loadPostFromAddress(this.props.post)
		} else {
			this.setPost(this.props.post)
		}
	}


	loadPostFromAddress(address) { 
		this.props.getPost(address)
			.then(this.setPost)
			.catch(console.error)
	}


	setPost(post) {
		this.updateState(
			state => state
				.set("post", post)
				.set("published", post.published),
			() => this.require()
		)
	}




	makeLink(id, ref) {
		this.updateState(state => state
			.update("links", l => l.set(id, ref))
		)
	}


	toLink(event, id) {
		if (event) { event.stopPropagation() }
		this.props.transition(
			() => this.getState("links", id).click()
		)
	}


	externalLink(event, url) {
		event.stopPropagation()
		window.open(url, "_blank")
	}



// REFERENCES

	showReference(reference) {

		console.log("show referernce", this.props)

		// Build reference
		let refComponent;
		switch (reference.type) {

			// Build a reference to another user
			case ("mention"):
				refComponent = <Profile

					key={`tooltip-${this.props.post.address}-${reference.reference}`}

					podium={this.props.podium}
					activeUser={this.props.activeUser}

					from="id"
					target={reference.reference}
					
					getUser={this.props.getUser}

					followUser={this.props.followUser}
					unfollowUser={this.props.unfollowUser}

					format="tooltip"
					side="left"

				/>
				break;

			default: return

		}

		if (this.getState("refTimer")) {
			clearTimeout(this.getState("refTimer"))
		}
		this.updateState(state => state
			.set("reference", refComponent)
		)

	}


	hideReference() {
		const timer = setTimeout(
			() => this.updateState(state => state.set("reference", null)),
			1000
		)
		this.updateState(state => state
			.set("refTimer", timer)
		)
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




	require() {
		return new Promise((resolve, reject) => {

			// Determine requirements
			var requirements = Set(Array.prototype.slice.call(arguments))
			if (requirements.size === 0) {
				requirements = this.getState("required")
			} else {
				this.updateState(state => state
					.update("required", r => r.union(requirements))
				)
			}

			// Provide requirements
			if (this.getState("post")) {
				var fetching = requirements.map(this.getRequirement).toJS()
				if (requirements.length === 1) {
					resolve(fetching[0])
				} else {
					Promise.all(fetching)
						.then(resolve)
						.catch(reject)
				}
			}

		})
	}


	getRequirement(id, force = false) {
		switch (id) {

			case "content": return this.requireContent()

			case "author": return this.requireAuthor(force)
			case "parentAuthor": return this.requireParentAuthor(force)

			case "parent": return this.requireParent(force)
			case "grandparent": return this.requireGrandparent(force)
			case "origin": return this.requireOrigin(force)

			case "thread": return this.requireThread(force)
			case "threadSpacer": return this.requireThreadSpacer(force)
			case "threadFull": return this.requireFullThread(force)
			
			case "replies": return this.requireReplies(force)

			case "references": return this.requireReferences(force)
			case "mentions": return this.requireMentions(force)

			default:
				console.error(`Unknown post requirement: ${id}`)
				return null

		}
	}


	requireContent() {
		return new Promise(async (resolve, reject) => {

			// Load post references
			const references = await this.getRequirement("references")
			const only = fromJS(references)
				.flatten()
				.map(r => `@${r.id}`)
				.toSet()
			//TODO - Split this into separate processes for each
			//		 category of mention. To simply filter by ID
			//		 alone would create an edge case for topics
			//		 and users with the same ID.

			// Markup raw post string
			const postID = this.getState("post").address
			const post = markupPost(this.getState("post").text, undefined, only)

			// Count lines in output
			const lineNum = post.reduce((x, p) => Math.max(x, p.line), 0) + 1;

			// Build each line
			const lines = []
			for (let l = 0; l < lineNum; l++) {

				// Build line
				const words = post.filter(p => p.line === l).map((p, w) => {

					// Create word ID
					const wordID = postID + "-" + l + "-" + w;

					//TODO - Handle edge-case with a post containing
					//		 2 references to the same entity. In this
					//		 case, there will currently be links and
					//		 elements with duplicate keys.

					// Handle word type
					let word;
					switch (p.type) {

						// Links
						case ("link"):
							word = <span
								key={wordID}
								className="post-word post-link"
								onMouseOver={() => this.showReference(p)}
								onMouseOut={() => this.hideReference()}
								onClick={event => this.externalLink(event, p.reference)}>
								{p.word}
							</span>
							break;

						// Mentions
						case ("mention"):
							word = <span
								key={wordID}
								onMouseOver={() => this.showReference(p)}
								onMouseOut={() => this.hideReference()}
								onClick={event => this.toLink(event, p.reference)}
								className="post-word post-mention">
								<Link
									to={`/user/${p.reference}`}
									innerRef={ref => this.makeLink(p.reference, ref)}
									style={{ display: "none" }}
								/>
								{p.word}
							</span>
							break;

						// Topics
						case ("topic"):
							word = <span
								key={wordID}
								onMouseOver={() => this.showReference(p)}
								onMouseOut={() => this.hideReference()}
								onClick={event => this.toLink(event, p.reference)}
								className="post-word post-topic">
								<Link
									to={`/topic/${p.reference}`}
									innerRef={ref => this.makeLink(p.reference, ref)}
									style={{ display: "none" }}
								/>
								{p.word}
							</span>
							break;

						//TODO - Media

						// Otherwise, return the word alone
						default:
							word = <span
								key={wordID}
								className="post-word">
								{p.word}
							</span>

					}

					return word;

				});

				// Add line to output
				lines.push(<p
					key={postID + "-" + l}
					className="post-line">
					{words}
				</p>)

			}

			// Wrap and store result
			this.updateState(
				state => state.set("content",
					<div className="post-content">
						{lines}
					</div>
				),
				resolve
			)

		})
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
			if (this.getState("thread") && !force) {
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
							state => state.set("thread", List(thread)),
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
						if (thread.getIn(2, "spacer")) {
							const start = thread.get(1).parentAddress
							const stop = thread.get(0).address
							this.fillThread(start, stop)
								.then(posts => this.updateState(
									state => state
										.update("thread", t => t.splice(2, 2, ...posts))
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

			require={this.require}

			toLink={this.toLink}
			makeLink={this.makeLink}
			

			post={this.getState("post")}
			content={this.getState("content")}

			parent={this.getState("parent")}
			grandparent={this.getState("grandparent")}
			origin={this.getState("origin")}
			thread={this.getState("thread")}

			replies={this.getState("replies")}

			author={this.getState("author")}
			parentAuthor={this.getState("parentAuthor")}

			reference={this.getState("reference")}
			mentions={this.getState("mentions")}

			stale={this.getState("stale")}

			first={this.props.first}
			suppressLabels={this.props.suppressLabels}


			transition={this.props.transition}
			exit={this.props.exit}

		/>

	}


	immutableComponentWillUnmount() {
		clearTimeout(timer)
	}

}

export default Post;
