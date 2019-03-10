import React from 'react';
import { Link } from 'react-router-dom';
import ImmutableComponent from '../../components/immutableComponent';

import { Map, List, Set, fromJS } from 'immutable';

import { formatNumber, markupPost } from 'utils';

import PostHeader from './postHeader';
import Send from './send';

import Profile from '../profiles/profile'

import Button from '../../components/buttons/button';
import MiniLoader from '../../components/miniLoader';





class PostContent extends ImmutableComponent {

	constructor() {

		super({

			content: "",

			reference: null,
			referenceType: null,
			refTimer: null,

			lock: false,
			reply: false,
			highlight: false,

			link: "post",
			linkMap: Map()

		})

		this.highlight = this.highlight.bind(this)
		this.unlight = this.unlight.bind(this)
		this.lock = this.lock.bind(this)
		this.unlock = this.unlock.bind(this)
		this.showReply = this.showReply.bind(this)
		this.hideReply = this.hideReply.bind(this)

		this.showReference = this.showReference.bind(this)
		this.hideReference = this.hideReference.bind(this)
		this.lockReference = this.lockReference.bind(this)
		this.unlockReference = this.unlockReference.bind(this)

		this.refLink = this.refLink.bind(this)
		this.setLink = this.setLink.bind(this)
		this.goLink = this.goLink.bind(this)

	}




// RESPONSES

	lock() {
		this.updateState(state => state.set("lock", true))
	}

	unlock() {
		this.updateState(state => state.set("lock", false))
	}


	showReply() {
		this.updateState(
			state => state.set("reply", true),
			() => this.input.focus()
		)
	}

	hideReply(force = false) {
		if (!this.getState("lock") || force) {
			this.updateState(state => state
				.set("reply", false)
				.set("lock", false)
			)
		}
	}


	highlight() {
		this.updateState(state => state.set("highlight", true))
	}

	unlight() {
		this.updateState(state => state.set("highlight", false))
	}




// SETUP

	immutableComponentDidMount() {
		this.props.require("author", "replies", "parent", "parentAuthor")
		this.buildContent()
	}


	immutableComponentDidUpdate(lastProps) {
		if (this.props.post && (!lastProps.post ||
				this.props.post.text !== lastProps.post.text)) {
			this.props.require("author", "replies", "parent", "parentAuthor")
			this.buildContent()
		}
	}



// CONTENT

	buildContent() {
		if (!this.props.post) {
			return
		} else {
			return new Promise(async (resolve, reject) => {

				// Get post data
				const post = this.props.post
				const parent = this.props.parent
				const author = this.props.author
				const postID = this.props.post.address

				// Build basic links
				var linkMap = fromJS({
					post: {
						to: `/post/${post.address}`,
						external: false
					}
				})
				if (parent) {
					linkMap = linkMap.set("parent", Map({
						to: `/post/${parent.address}`,
						external: false
					}))
				}
				if (author) {
					linkMap = linkMap.set("author", Map({
						to: `/user/${author.id}`,
						external: false
					}))
				}

				// Load post references
				const references = this.props.mentions || Set()
				const only = fromJS(references)
					.flatten()
					.map(r => `@${r.id}`)
					.toSet()
				//TODO - Split this into separate processes for each
				//		 category of mention. To simply filter by ID
				//		 alone would create an edge case for topics
				//		 and users with the same ID.

				// Build content
				const content = List(markupPost(post.text || "", undefined, only))
					.groupBy(p => p.line)
					.map((line, l) => <p key={`${postID}-l${l}`} className="post-line">
						{line.map((p, w) => {

							// Create word ID
							const wordID = postID + "-" + l + "-" + w;

							// Handle word type
							let word;
							switch (p.type) {

								// Links
								case ("link"):
									linkMap = linkMap.set(p.reference, Map({
										to: p.reference,
										external: true
									}))
									word = <span
										key={wordID}
										onMouseOver={() => this.setLink(p.reference)}
										onMouseOut={() => this.setLink("post")}
										onMouseEnter={() => this.showReference("url", p.reference)}
										onMouseLeave={() => this.hideReference("url", p.reference)}
										className="post-word post-link">
										{p.word}
									</span>
									break;

								// Mentions
								case ("mention"):
									linkMap = linkMap.set(p.reference, Map({
										to: `/user/${p.reference}`,
										external: false
									}))
									word = <span
										key={wordID}
										onMouseOver={() => this.setLink(p.reference)}
										onMouseOut={() => this.setLink("post")}
										onMouseEnter={() => this.showReference("user", p.reference)}
										onMouseLeave={() => this.hideReference("user", p.reference)}
										className="post-word post-mention">
										{p.word}
									</span>
									break;

								// Topics
								case ("topic"):
									linkMap = linkMap.set(p.reference, Map({
										to: `/topic/${p.reference}`,
										external: false
									}))
									word = <span
										key={wordID}
										onMouseOver={() => this.setLink(p.reference)}
										onMouseOut={() => this.setLink("post")}
										onMouseEnter={() => this.showReference("topic", p.reference)}
										onMouseLeave={() => this.hideReference("topic", p.reference)}
										className="post-word post-topic">
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

						}).toList()}
					</p>)
					.toList()

				// Wrap and store result
				this.updateState(state => state
					.set("content",
						<div className="post-content">
							{content}
						</div>
					)
					.set("linkMap", linkMap),
					resolve
				)

			})
		}
	}



// LINKS

	refLink(id, ref) {
		if (!this.getState("linkMap", id, "ref")) {
			this.updateState(state => state
				.setIn(["linkMap", id, "ref"], ref)
			)
		}
	}

	setLink(id) {
		this.updateState(state => state.set("link", id))
	}

	goLink() {
		const link = this.getState("linkMap", this.getState("link"))
		if (link) {
			if (link.get("external")) {
				window.open(link.get("to"), "_blank")
			} else if (link.get("ref")) {
				this.props.transition(
					() => link.get("ref").click()
				)
			}
		}
	}




// REFERENCES

	showReference(type, reference) {
		clearTimeout(this.entryTimer)
		this.entryTimer = setTimeout(
			() => {

				// Stop vanish timeout
				clearTimeout(this.exitTimer)

				// Switch to new reference, if required
				if (reference !== this.getState("reference")) {
					this.updateState(state => state
						.set("reference", reference)
						.set("referenceType", type)
					)
				}

			},
			300
		)
	}


	hideReference(type, reference) {
		clearTimeout(this.entryTimer)
		if (type === this.getState("referenceType") &&
				reference === this.getState("reference")) {
			clearTimeout(this.exitTimer)
			this.exitTimer = setTimeout(
				() => this.updateState(state => state
					.set("reference", null)
					.set("referenceType", null)
				),
				1000
			)
		}
	}


	lockReference() {
		clearTimeout(this.exitTimer)
	}


	unlockReference() {
		this.hideReference(
			this.getState("referenceType"),
			this.getState("reference")
		)
	}




// RENDER

	render() {

		const first = this.props.first
		const open = this.getState("reply") || this.getState("lock")
		const highlight = this.getState("highlight")

		const post = this.props.post
		const promos = this.props.promos || Set()
		const sanctions = this.props.promos || Set()
		const replies = this.props.replies || Set()
		const suppress = this.props.suppressLabels || List()

		const reference = this.getState("reference")

		let labels = List()
		if (post && post.depth > 0 && !suppress.includes("reply")) {
			labels = labels.push(
				<div
					key={`${post.address}-labels-reply`}
					className="post-label post-label-reply"
					onMouseOver={() => this.setLink("parent")}
					onMouseOut={() => this.setLink("post")}>
					{this.props.parentAuthor && this.props.parent ?
						<p className="post-label-text">
							<i className="fas fa-reply post-label-icon" />
							{`Replying to @${this.props.parentAuthor.id}`}
						</p>
						:
						<p className="post-label-text">
							<i className="fas fa-reply post-label-icon" />
							{`Replying`}
						</p>
					}
				</div>
			)
		}
		
		return <div>

			{this.getState("linkMap")
				.map((l, id) => <Link
					key={`link-to-${id}`}
					to={l.get("to")}
					innerRef={ref => this.refLink(id, ref)}
					style={{ display: "none" }}
				/>)
				.toList()
			}

			<div className={first ? "post post-first" : "post"}>

				<div
					className={first ?
						"post-body post-body-first" :
						"post-body"
					}
					onMouseEnter={this.highlight.bind(this)}
					onMouseLeave={this.unlight.bind(this)}
					onClick={this.goLink.bind(this)}>

					{reference ?
						<div
							className="post-tooltip-holder"
							onMouseOver={() => this.setLink(reference)}
							onMouseOut={() => this.setLink("post")}
							onMouseEnter={this.lockReference.bind(this)}
							onMouseLeave={this.unlockReference.bind(this)}>
							<Profile

								key={`tooltip-${this.props.post.address}-${reference}`}

								podium={this.props.podium}
								activeUser={this.props.activeUser}

								from="id"
								target={reference}
								
								getUser={this.props.getUser}

								followUser={this.props.followUser}
								unfollowUser={this.props.unfollowUser}

								format="tooltip"
								side="left"

							/>
						</div>
						: null
					}

					<PostHeader

						first={first}

						activeUser={this.props.activeUser}

						author={this.props.author}
						post={post}

						showReference={this.showReference}
						hideReference={this.hideReference}
						setLink={this.setLink}

						transition={this.props.transition}>

						{labels}

						{this.getState("content")}

					</PostHeader>

					{this.props.activeUser ?
						<div className="post-button-holder">

							<div className="post-button-row">
								<div className="post-button">
									<Button
										caption="view promotions"
										captionLocation="right"
										captionOffset={2.6}
										color={highlight ? "var(--dark-grey)" : "var(--grey)"}
										highlight={highlight ? "var(--green)" : null}
										off={promos.size === 0}
										transparent={true}
										onClick={() => console.log("view promotions")}>
										{!promos ?
											<div className="button-loader">
												<MiniLoader
													inline={true}
													size={0.6}
													color={highlight ? "var(--dark-grey)" : "var(--grey)"}
												/>
											</div>
											:
											<p className="button-inner-text">
												{promos.size === 0 ?
													"-" :
													formatNumber(promos.size)
												}
											</p>
										}
									</Button>
								</div>
								<div className="post-button">
									<Button
										caption="promote"
										captionLocation="right"
										captionOffset={0.8}
										color={highlight ? "var(--dark-grey)" : "var(--grey)"}
										highlight={highlight ? "var(--green)" : null}
										transparent={true}
										onClick={() => console.log("promote")}>
										<i className="fas fa-bullhorn button-icon" />
									</Button>
								</div>
							</div>

							<div className="post-button-row">
								<div className="post-button">
									<Button
										caption="view sanctions"
										captionLocation="right"
										captionOffset={2.6}
										color={highlight ? "var(--dark-grey)" : "var(--grey)"}
										highlight={highlight ? "var(--red)" : null}
										transparent={true}
										off={promos.size === 0}
										onClick={() => console.log("view sanctions")}>
										{!sanctions ?
											<div className="button-loader">
												<MiniLoader
													inline={true}
													size={0.6}
													color={highlight ? "var(--dark-grey)" : "var(--grey)"}
												/>
											</div>
											:
											<p className="button-inner-text">
												{sanctions.size === 0 ?
													"-" :
													formatNumber(sanctions.size)
												}
											</p>
										}
									</Button>
								</div>
								<div className="post-button">
									<Button
										caption="report"
										captionLocation="right"
										captionOffset={0.8}
										color={highlight ? "var(--dark-grey)" : "var(--grey)"}
										highlight={highlight ? "var(--red)" : null}
										transparent={true}
										onClick={() => console.log("report")}>
										<i className="fas fa-exclamation-triangle button-icon" />
									</Button>
								</div>
							</div>

							<div className="post-button-row">
								<div className="post-button">
									<Button
										caption="view replies"
										captionLocation="right"
										captionOffset={2.6}
										color={highlight ? "var(--dark-grey)" : "var(--grey)"}
										highlight={highlight ? "var(--green)" : null}
										transparent={true}
										off={replies.size === 0}>
										{!this.props.replies ?
											<div className="button-loader">
												<MiniLoader
													inline={true}
													size={0.6}
													color={highlight ? "var(--dark-grey)" : "var(--grey)"}
												/>
											</div>
											:
											<p className="button-inner-text">
												{replies.size === 0 ?
													"-" :
													formatNumber(replies.size)
												}
											</p>
										}
									</Button>
								</div>
								<div className="post-button">
									<Button
										caption={open ? "discard reply" : "reply"}
										captionLocation="right"
										captionOffset={0.8}
										color={highlight ? "var(--dark-grey)" : "var(--grey)"}
										highlight={highlight ? 
											(open ? "var(--red)" : "var(--green)")
											: null
										}
										transparent={true}
										onClick={open ? 
											this.hideReply.bind(this, true) :
											this.showReply.bind(this)
										}>
										{open ? 
											<i className="fas fa-trash button-icon" /> :
											<i className="fas fa-reply button-icon" />
										}
									</Button>
								</div>
							</div>

						</div>
						: null
					}

				</div>

				{this.props.activeUser && this.props.post ?
					<div className={open ?
							"post-reply post-reply-open" :
							"post-reply post-reply-closed"
						}>
						<Send

							podium={this.props.podium}
							activeUser={this.props.activeUser}
							balance={this.props.balance}

							getUser={this.props.getProfileFromID}

							sendPost={this.props.sendPost}
							postKey={this.props.post.address}

							replyingTo={post}
							show={this.showReply.bind(this)}
							hide={this.hideReply.bind(this)}

							open={open}
							lock={this.lock}
							unlock={this.unlock}
							highlight={highlight}
							innerRef={ref => this.input = ref}

						/>
					</div>
					: null
				}

			</div>
		
		</div>

	}


	immutableComponentWillUnmount() {
		clearTimeout(this.getState("refTimer"))
	}

}

export default PostContent;
