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
			links: Map(),

			lock: false,
			reply: false,
			highlight: false

		})

		this.highlight = this.highlight.bind(this)
		this.unlight = this.unlight.bind(this)
		this.lock = this.lock.bind(this)
		this.unlock = this.unlock.bind(this)
		this.showReply = this.showReply.bind(this)
		this.hideReply = this.hideReply.bind(this)

		this.makeLink = this.makeLink.bind(this)
		this.toLink = this.toLink.bind(this)
		this.externalLink = this.externalLink.bind(this)

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

				// Markup raw post string
				const post = this.props.post
				const postID = this.props.post.address
				const content = markupPost(post.text || "", undefined, only)

				// Count lines in output
				const lineNum = content.reduce((x, p) => Math.max(x, p.line), 0) + 1;

				// Build each line
				var lines = []
				for (let l = 0; l < lineNum; l++) {

					// Build line
					const words = content.filter(p => p.line === l).map((p, w) => {

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
									onMouseEnter={() => this.showReference("url", p.reference)}
									onMouseLeave={() => this.hideReference()}
									onClick={event => this.externalLink(event, p.reference)}>
									{p.word}
								</span>
								break;

							// Mentions
							case ("mention"):
								word = <span
									key={wordID}
									onMouseEnter={() => this.showReference("user", p.reference)}
									onMouseLeave={() => this.hideReference()}
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
									onMouseEnter={() => this.showReference("topic", p.reference)}
									onMouseLeave={() => this.hideReference()}
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
	}



// REFERENCES

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


	showReference(type, reference) {

		// Stop timeout
		clearTimeout(this.getState("refTimer"))

		// Switch to new reference, if required
		if (reference !== this.getState("reference")) {
			this.updateState(state => state
				.set("reference", reference)
				.set("referenceType", type)
			)
		}

	}


	hideReference() {
		clearTimeout(this.getState("refTimer"))
		this.updateState(state => state
			.set("refTimer", setTimeout(
				() => this.updateState(state => state
					.set("reference", null)
					.set("referenceType", null)
				),
				1000
			))
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
					onClick={() => this.parentLink.click()}>
					{this.props.parentAuthor && this.props.parent ?
						<p className="post-label-text">
							<Link
								to={`/post/${this.props.parent.address}`}
								innerRef={ref => this.parentLink = ref}
								style={{ display: "none" }}
							/>
							<i className="fas fa-reply post-label-icon" />
							{`Replying to @${this.props.parentAuthor.id}`}
						</p>
						: null
					}
				</div>
			)
		}
		
		return (
			<div className={first ? "post post-first" : "post"}>

				{post ?
					<Link
						to={`/post/${post.address}`}
						innerRef={ref => this.postLink = ref}
						style={{ display: "none" }}
					/>
					: null
				}

				{reference ?
					<div
						className="post-tooltip-holder"
						onMouseEnter={() => this.showReference()}
						onMouseLeave={() => this.hideReference()}>
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

				<div
					className={first ?
						"post-body post-body-first" :
						"post-body"
					}
					onMouseEnter={this.highlight.bind(this)}
					onMouseLeave={this.unlight.bind(this)}
					onClick={this.postLink ?
						() => this.postLink.click()
						: null
					}>

					<PostHeader
						first={first}
						activeUser={this.props.activeUser}
						author={this.props.author}
						post={post}>

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
										onClick={() => console.log("promote view")}>
										{!promos ?
											<div className="button-loader">
												<MiniLoader
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
										off={replies.size === 0}
										onClick={() => this.postLink.click()}>
										{!this.props.replies ?
											<div className="button-loader">
												<MiniLoader
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
		)

	}


	immutableComponentWillUnmount() {
		clearTimeout(this.getState("refTimer"))
	}

}

export default PostContent;
