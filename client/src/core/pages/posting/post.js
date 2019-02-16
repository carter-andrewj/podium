import React from 'react';
import ImmutableComponent from '../../widgets/immutableComponent';
import { Link } from 'react-router-dom';

import { Map } from 'immutable';

import { markupPost, timeform } from 'utils';
import Send from './send';




class Post extends ImmutableComponent {

	constructor() {
		super({
			post: null,
			user: null,
			highlight: "none",
			html: null,
			reply: false,
			usercard: false,
			refTimer: null,
			refcard: false,
			reference: {},
			links: {},
			reacted: true
		})
		this.highlight = this.highlight.bind(this);
		this.constructPost = this.constructPost.bind(this);
		this.replyOn = this.replyOn.bind(this);
		this.replyOff = this.replyOff.bind(this);
	}


	componentWillMount() {

		// Load the post and its author
		// this.props.getPost(this.props.post).then(post =>
		// 	this.props.getProfile(post.get("author")).then(profile =>
		// 		this.updateState(
		// 			state => state
		// 				.set("post", post)
		// 				.set("user", profile),
		// 			() => this.constructPost(
		// 				post.get("content")
		// 			)
		// 		)
		// 	)
		// )

		this.props.getUser(this.props.post.authorAddress, false)
			.then(user => this.updateState(state => state
				.set("user", user)
			))
			.catch(error => console.error(error))

	}





	showReference(reference) {
		if (this.getState("refTimer")) {
			clearTimeout(this.getState("refTimer"))
		}
		this.updateState(state => state
			.set("reference", reference)
		);
	}

	hideReference() {
		const timer = setTimeout(
			() => this.updateState(state => state
				.set("reference", Map({}))),
			10);
		this.updateState(state => state
			.set("refTimer", timer)
		);
	}




	highlight(target) {
		this.updateState(state => state
			.set("refcard", Map({}))
			.set("highlight", target)
		);
	}


	replyOn(event) {
		if (event) { event.stopPropagation() }
		this.updateState(state => state
			.set("reply", true)
		);
	}

	replyOff(event) {
		if (event) { event.stopPropagation() }
		this.updateState(state => state
			.set("reply", false)
		);
	}


	makeLink(id, ref) {
		this.updateState(state => state
			.update("links", l => l.set(id, ref))
		)
	}

	toLink(event, id) {
		if (event) { event.stopPropagation() }
		this.getState("links", id).click()
	}



	constructPost(content) {

		// Markup raw post string
		const postID = this.props.post;
		const post = markupPost(content);

		// Count lines in output
		const lineNum = post.reduce((x, p) => Math.max(x, p.line), 0) + 1;

		// Build each line
		const lines = [];
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
							onMouseOver={this.showReference(p)}
							onMouseOut={this.hideReference()}>
							<a
								rel="noopener noreferrer"
								target="_blank"
								href={p.word}>
								{p.word}
							</a>
						</span>
						break;

					// Mentions
					case ("mention"):
						word = <span
							key={wordID}
							onMouseOver={this.showReference(p)}
							onMouseOut={this.hideReference()}
							onClick={(event) => this.toLink(event, p.reference)}
							className="post-word post-mention">
							<Link
								to={`/user/${p.word}`}
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
							onMouseOver={this.showReference(p)}
							onMouseOut={this.hideReference()}
							onClick={(event) => this.toLink(event, p.reference)}
							className="post-word post-topic">
							<Link
								to={`/topic/${p.word}`}
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
			</p>);

		}

		// Wrap and store result
		this.updateState(state => state
			.set("html",
				<div className="post-content">
					{lines}
				</div>
			)
		);

	}




	render() {

		//TODO - Link post to posting user's profile

		//TODO - Show profile card on hover of name/id

		//TODO - Show topic card on hover of id

		//TODO - Only show affinity/integrity on hover (?)

		//TODO - URL previews

		const user = this.getState("user");
		const post = this.props.post

		let buttons;
		const highlight = this.getState("highlight");
		const reply = this.getState("reply");

		// Build reply box (when open)
		let replyBox;
		if (reply) {
			replyBox = <div className="post-reply">
				<Send
					activeUser={this.props.activeUser}
					getProfileFromID={this.props.getProfileFromID}
					getTopicFromID={this.props.getTopicFromID}
					sendPost={this.props.sendPost}
					replyingTo={post}
					hideReply={this.replyOff}
				/>
			</div>
		}

		// Show user card on hover
		//TODO - Combine this with reference cards
		// const author = this.props.users.get(
		// 	this.props.post.get("author")
		// );
		// let usercard;
		// if (this.state.data.get("usercard")) {
		// 	usercard = <div className="post-usercard">
		// 		<UserCard
		// 			user={author}
		// 			getProfile={this.props.getProfile}
		// 			followUser={this.props.followUser}
		// 			unfollowUser={this.props.unfollowUser}
		// 		/>
		// 	</div>
		// }

		// Show reference card on hover
		// let refcard;
		// if (this.state.data.get("reference")) {
		// 	let reference;
		// 	switch (reference) {
		// 		case ("mention"):
		// 			reference = <UserCard
		// 				user={this.props.users.get(reference.get("address"))}
		// 				getProfile={this.props.getProfile}
		// 				followUser={this.props.followUser}
		// 				unfollowUser={this.props.unfollowUser}
		// 			/>
		// 			break;
		// 		case ("topic"):
		// 			reference = <TopicCard
		// 				topic={this.props.topics.get(reference.get("address"))}
		// 			/>
		// 			break;
		// 		case ("link"):
		// 			reference = <LinkCard />
		// 			break;
		// 		default:
		// 	}
		// 	refcard = <div className="post-refcard">
		// 		{reference}
		// 	</div>
		// }

		// Promote/report/respond buttons
		if (post) {
			if (post.get("owned")) {
				buttons = <div className="post-buttons">
					<div className="post-buttons-left">
						<div
							className="post-button post-button-promoteself"
							onMouseOver={this.highlight.bind(this, "viewpromote")}
							onMouseOut={this.highlight.bind(this, "none")}
							onClick={() => console.log("viewing promotions")}>
							<p className="post-button-text">{post.get("promotions")}</p>
							<div className={"post-button-caption-holder " +
									((highlight === "viewpromote") ?
										"post-button-caption-on" : "post-button-caption-off")}>
								<span className="post-button-caption post-button-caption-promoteself">
									view promotions
								</span>
							</div>
						</div>
						<div
							className="post-button post-button-retract"
							onMouseOver={this.highlight.bind(this, "amend")}
							onMouseOut={this.highlight.bind(this, "none")}
							onClick={this.props.amendPost.bind(this)}>
							<span className="fas fa-cut post-button-icon"></span>
							<div className={"post-button-caption-holder " +
									((highlight === "amend") ?
										"post-button-caption-on" : "post-button-caption-off")}>
								<span className="post-button-caption post-button-caption-retract">
									amend
								</span>
							</div>
						</div>
						<div
							className="post-button post-button-reply"
							onMouseOver={this.highlight.bind(this, "viewreply")}
							onMouseOut={this.highlight.bind(this, "none")}
							onClick={() => this.postLink.click()}>
							<p className="post-button-text">{post.get("replies").size}</p>
							<div className={"post-button-caption-holder " +
									((highlight === "viewreply") ?
										"post-button-caption-on" : "post-button-caption-off")}>
								<span className="post-button-caption post-button-caption-reply">
									view replies
								</span>
							</div>
						</div>
					</div>
					<div className="post-buttons-right">
						<div
							className="post-button post-button-promoteself"
							onMouseOver={this.highlight.bind(this, "promote")}
							onMouseOut={this.highlight.bind(this, "none")}
							onClick={this.props.promotePost.bind(post.get("address"))}>
							<span className="fa fa-bullhorn post-button-icon"></span>
							<div className={"post-button-caption-holder " +
									((highlight === "promote") ?
										"post-button-caption-on" : "post-button-caption-off")}>
								<span className="post-button-caption post-button-caption-promoteself">
									promote
								</span>
							</div>
						</div>
						<div
							className="post-button post-button-retract"
							onMouseOver={this.highlight.bind(this, "retract")}
							onMouseOut={this.highlight.bind(this, "none")}
							onClick={this.props.retractPost.bind(this)}>
							<span className="fas fa-undo-alt post-button-icon"></span>
							<div className={"post-button-caption-holder " +
									((highlight === "retract") ?
										"post-button-caption-on" : "post-button-caption-off")}>
								<span className="post-button-caption post-button-caption-retract">
									retract
								</span>
							</div>
						</div>
						<div
							className={"post-button post-button-reply " +
								(reply ? "post-button-reply-on" : "")}
							onMouseOver={this.highlight.bind(this, "reply")}
							onMouseOut={this.highlight.bind(this, "none")}
							onClick={this.getState("reply") ?
								this.replyOff.bind(this) : this.replyOn.bind(this)}>
							{reply ?
								<span className="fas fa-times post-button-icon"></span> :
								<span className="fas fa-reply post-button-icon"></span>
							}
							<div className={"post-button-caption-holder " +
									((highlight === "reply") ?
										"post-button-caption-on" : "post-button-caption-off")}>
								<span className="post-button-caption post-button-caption-reply">
									{reply ? "cancel" : "reply"}
								</span>
							</div>
						</div>
					</div>
				</div>
			} else {
				buttons = <div className="post-buttons">
					<div className="post-buttons-left">
						<div
							className="post-button post-button-promote"
							onMouseOver={this.highlight.bind(this, "viewpromote")}
							onMouseOut={this.highlight.bind(this, "none")}
							onClick={() => console.log("viewing promotions")}>
							<p className="post-button-text">{post.get("promotions")}</p>
							<div className={"post-button-caption-holder " +
									((highlight === "viewpromote") ?
										"post-button-caption-on" : "post-button-caption-off")}>
								<span className="post-button-caption post-button-caption-promote">
									view promotions
								</span>
							</div>
						</div>
						<div
							className="post-button post-button-retract"
							onMouseOver={this.highlight.bind(this, "amend")}
							onMouseOut={this.highlight.bind(this, "none")}
							onClick={() => console.log("viewing reports")}>
							<p className="post-button-text">{post.get("reports").size}</p>
							<div className={"post-button-caption-holder " +
									((highlight === "amend") ?
										"post-button-caption-on" : "post-button-caption-off")}>
								<span className="post-button-caption post-button-caption-retract">
									view reports
								</span>
							</div>
						</div>
						<div
							className="post-button post-button-reply"
							onMouseOver={this.highlight.bind(this, "viewreply")}
							onMouseOut={this.highlight.bind(this, "none")}
							onClick={() => console.log("viewing replies")}>
							<p className="post-button-text">{post.get("replies").size}</p>
							<div className={"post-button-caption-holder " +
									((highlight === "viewreply") ?
										"post-button-caption-on" : "post-button-caption-off")}>
								<span className="post-button-caption post-button-caption-reply">
									view replies
								</span>
							</div>
						</div>
					</div>
					<div className="post-buttons-right">
						<div
							className="post-button post-button-promote"
							onMouseOver={this.highlight.bind(this, "promote")}
							onMouseOut={this.highlight.bind(this, "none")}
							onClick={this.props.promotePost.bind(post.get("address"))}>
							<span className="fa fa-bullhorn post-button-icon"></span>
							<div className={"post-button-caption-holder " +
									((highlight === "promote") ?
										"post-button-caption-on" : "post-button-caption-off")}>
								<span className="post-button-caption post-button-caption-promote">
									promote
								</span>
							</div>
						</div>
						<div
							className="post-button post-button-report"
							onMouseOver={this.highlight.bind(this, "report")}
							onMouseOut={this.highlight.bind(this, "none")}
							onClick={this.props.reportPost.bind(this)}>
							<span className="fa fa-exclamation-triangle post-button-icon"></span>
							<div className={"post-button-caption-holder " +
									((highlight === "report") ?
										"post-button-caption-on" : "post-button-caption-off")}>
								<span className="post-button-caption post-button-caption-report">
									report
								</span>
							</div>
						</div>
						<div
							className={reply?
								"post-button post-button-reply post-button-reply-on" :
								"post-button post-button-reply "
							}
							onMouseOver={this.highlight.bind(this, "reply")}
							onMouseOut={this.highlight.bind(this, "none")}
							onClick={reply ?
								this.replyOff.bind(this) :
								this.replyOn.bind(this)}
							>
							{reply ?
								<span className="fas fa-times post-button-icon"></span> :
								<span className="fas fa-reply post-button-icon"></span>
							}
							<div className={
								(highlight === "reply") ?
									"post-button-caption-holder post-button-caption-on" :
									"post-button-caption-holder post-button-caption-off"
								}>
								<span className="post-button-caption post-button-caption-reply">
									{reply ? "cancel" : "reply"}
								</span>
							</div>
						</div>
					</div>
				</div>
			}
		}


		//TODO - Handle long user names and ids
		return (
			<div className="post-core">
				<div
					className="post-body"
					onClick={() => post ? this.postLink.click() : null}>
					{post ?
						<Link
							to={`/post/${post.get("address")}`}
							innerRef={ref => this.postLink = ref}
							style={{ display: "none" }}
						/>
						: null
					}
					<div className="post-column-1 post-user">
						<img
							className="post-user-picture"
							src={user ? user.get("pictureURL") : ""}
							alt=""
						/>
					</div>
					<div className="post-column-2 post-middle">
						{user ?
							<div className="post-user-title">

								<p className="post-user-name">
									{user.get("name")}
								</p>
								<p className="post-user-id">
									@{user.get("id")}
								</p>
								<p className="post-timestamp">
									{"| " + timeform(post.get("created"))}
								</p>
							</div>
							: null
						}
						<div className="post-content-holder">
							{this.getState("html")}
						</div>
					</div>
					<div className="post-column-3">
						{buttons}
					</div>
				</div>
				{replyBox}
			</div>
		);
	}


}

export default Post;
