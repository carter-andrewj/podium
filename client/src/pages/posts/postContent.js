import React from 'react';
import { Link } from 'react-router-dom';
import ImmutableComponent from '../../components/immutableComponent';

import { Map, List, Set } from 'immutable';

import { formatNumber } from 'utils';

import PostHeader from './postHeader';
import Send from './send';

import Button from '../../components/buttons/button';
import MiniLoader from '../../components/miniLoader';





class PostContent extends ImmutableComponent {

	constructor() {
		super({

			reference: null,
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
		this.props.require("content", "author", "replies",
			"parent", "parentAuthor")
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
		
		return !post ? null :
			<div className={first ? "post post-first" : "post"}>

				<Link
					to={`/post/${post.address}`}
					innerRef={ref => this.postLink = ref}
					style={{ display: "none" }}
				/>

				<div className="post-tooltip-holder">
					{this.props.reference}
				</div>

				<div
					className={first ?
						"post-body post-body-first" :
						"post-body"
					}
					onMouseEnter={this.highlight.bind(this)}
					onMouseLeave={this.unlight.bind(this)}
					onClick={() => this.postLink.click()}>

					<PostHeader
						first={first}
						activeUser={this.props.activeUser}
						author={this.props.author}
						post={post}>

						{labels}

						{this.props.content}

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
											<MiniLoader
												size={1.2}
												color={highlight ? "var(--dark-grey)" : "var(--grey)"}
											/>
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
											<MiniLoader
												size={1.2}
												color={highlight ? "var(--dark-grey)" : "var(--grey)"}
											/>
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
											<MiniLoader
												size={1.2}
												color={highlight ? "var(--dark-grey)" : "var(--grey)"}
											/>
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

				{this.props.activeUser ?
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

	}

}

export default PostContent;
