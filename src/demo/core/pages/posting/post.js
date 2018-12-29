import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';

import { markupPost, timeform } from 'demo/utils';
import Send from './send';

import UserCard from './references/mentions/usercard';
import TopicCard from './references/topics/topiccard';
import LinkCard from './references/links/linkcard';



class Post extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				highlight: "none",
				html: null,
				reply: false,
				userTimer: null,
				usercard: false,
				refTimer: null,
				refcard: false,
				reference: {},
				reacted: true 		//TODO - Put this in a smart contract
			}))
		}
		this.highlight = this.highlight.bind(this);
		this.constructPost = this.constructPost.bind(this);
		this.replyOn = this.replyOn.bind(this);
		this.replyOff = this.replyOff.bind(this);
		this.react = this.react.bind(this);
	}


	updateState(up, callback) {
		this.setState(
			({data}) => { return {data: up(data)} },
			callback
		);
	}


	componentWillMount() {
		this.constructPost();
	}



	showUser() {
		if (this.state.data.get("userTimer")) {
			clearTimeout(this.state.data.get("userTimer"))
		}
		this.updateState(state => state
			.set("usercard", true)
		);
	}

	hideUser() {
		const timer = setTimeout(
			() => this.updateState(state => state
				.set("usercard", false)),
			10);
		this.updateState(state => state
			.set("userTimer", timer)
		);
	}

	showReference(reference) {
		if (this.state.data.get("refTimer")) {
			clearTimeout(this.state.data.get("refTimer"))
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

	hideAll() {
		this.hideUser();
		this.hideReference();
	}



	highlight(target) {
		this.updateState(state => state
			.set("refcard", Map({}))
			.set("highlight", target)
		);
	}


	showProfile(id) {
		console.log("user:", id);
	}


	gotoProfile(id) {
		console.log("user:", id);
	}


	showTopic(id) {
		console.log("topic:", id);
	}


	gotoTopic(id) {
		console.log("topic:", id);
	}


	replyOn() {
		this.updateState(state => state
			.set("reply", true)
		);
	}

	replyOff() {
		this.updateState(state => state
			.set("reply", false)
		);
	}


	react(reaction) {

		//TODO - Transact POD from post reaction pool
		//		 to the active user.

		this.updateState(state => state
			.set("reacted", true)
		);

	}


	constructPost() {

		// Markup raw post string
		const postID = this.props.post.get("address");
		const post = markupPost(this.props.post.get("content"));

		// Count lines in output
		const lineNum = post.reduce((x, p) => Math.max(x, p.line), 0) + 1;

		// Build each line
		const lines = [];
		for (let l = 0; l < lineNum; l++) {

			// Build line
			const words = post.filter(p => p.line === l).map((p, w) => {

				// Create word ID
				const wordID = postID + "-" + l + "-" + w;

				// Handle word type
				let word;
				switch (p.type) {

					// Links
					case ("link"):
						word = <span
							key={wordID}
							className="post-word post-link"
							onMouseOver={this.showReference(p)}>
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
							onClick={this.gotoProfile(p.word)}
							className="post-word post-mention">
							{p.word}
						</span>
						break;

					// Topics
					case ("topic"):
						word = <span
							key={wordID}
							onMouseOver={this.showReference(p)}
							onClick={this.gotoTopic(p.word)}
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

		// Build reply box (when open)
		let reply;
		if (this.state.data.get("reply")) {
			reply = <div className="post-reply">
				<Send
					activeUser={this.props.activeUser}
					getProfileFromID={this.props.getProfileFromID}
					getTopicFromID={this.props.getTopicFromID}
					sendPost={this.props.sendPost}
					replyingTo={this.props.post}
					hideReply={this.replyOff}
				/>
			</div>
		}

		// Show user card on hover
		const author = this.props.users.get(
			this.props.post.get("author")
		);
		let usercard;
		if (this.state.data.get("usercard")) {
			usercard = <div className="post-usercard">
				<UserCard
					user={author}
					getProfile={this.props.getProfile}
					followUser={this.props.followUser}
					unfollowUser={this.props.unfollowUser}
					setCoreMode={this.props.setCoreMode}
				/>
			</div>
		}

		// Show reference card on hover
		let refcard;
		if (this.state.data.get("reference")) {
			let reference;
			switch (reference) {
				case ("mention"):
					reference = <UserCard
						user={this.props.users.get(reference.get("address"))}
						getProfile={this.props.getProfile}
						followUser={this.props.followUser}
						unfollowUser={this.props.unfollowUser}
						setCoreMode={this.props.setCoreMode}
					/>
					break;
				case ("topic"):
					reference = <TopicCard
						topic={this.props.topics.get(reference.get("address"))}
					/>
					break;
				case ("link"):
					reference = <LinkCard />
					break;
				default:
			}
			refcard = <div className="post-refcard">
				{reference}
			</div>
		}

		// Build buttons
		// let react;
		let buttons;
		if (!this.state.data.get("reacted")) {

			// Reaction buttons
			// react = <div className="post-reaction">
			// 	<div
			// 		className="reaction-button react-support card"
			// 		onClick={this.react.bind(this, true)}>
			// 		<div className="reaction-icon-holder">
			// 			<span className="fa fa-thumbs-up reaction-icon"></span>
			// 		</div>
			// 	</div>
			// 	<div
			// 		className="reaction-button react-oppose card"
			// 		onClick={this.react.bind(this, false)}>
			// 		<div className="reaction-icon-holder">
			// 			<span className="fa fa-thumbs-down reaction-icon"></span>
			// 		</div>
			// 	</div>
			// </div>

		} else {

			// Promote/report/respond buttons
			let highlight = this.state.data.get("highlight");
			if (this.props.post.get("owned")) {
				buttons = <div className="post-buttons">
					<div className="post-buttons-left">
						<div
							className="post-button post-button-promoteself"
							onMouseOver={this.highlight.bind(this, "viewpromote")}
							onMouseOut={this.highlight.bind(this, "none")}
							onClick={() => console.log("viewing promotions")}>
							<p className="post-button-text">1.3k</p>
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
							onClick={() => console.log("viewing replies")}>
							<p className="post-button-text">102</p>
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
							onClick={this.props.promotePost.bind(this.props.post.get("address"))}>
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
								((this.state.data.get("reply")) ? "post-button-reply-on" : "")}
							onMouseOver={this.highlight.bind(this, "reply")}
							onMouseOut={this.highlight.bind(this, "none")}
							onClick={(this.state.data.get("reply")) ?
								this.replyOff.bind(this) : this.replyOn.bind(this)}>
							{(this.state.data.get("reply")) ?
								<span className="fas fa-times post-button-icon"></span> :
								<span className="fas fa-reply post-button-icon"></span>
							}
							<div className={"post-button-caption-holder " +
									((highlight === "reply") ?
										"post-button-caption-on" : "post-button-caption-off")}>
								<span className="post-button-caption post-button-caption-reply">
									{(this.state.data.get("reply")) ? "cancel" : "reply"}
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
							<p className="post-button-text">17</p>
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
							<p className="post-button-text">0</p>
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
							<p className="post-button-text">2</p>
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
							onClick={this.props.promotePost.bind(this.props.post.get("address"))}>
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
							className={"post-button post-button-reply " +
								((this.state.data.get("reply")) ? "post-button-reply-on" : "")}
							onMouseOver={this.highlight.bind(this, "reply")}
							onMouseOut={this.highlight.bind(this, "none")}
							onClick={(this.state.data.get("reply")) ?
								this.replyOff.bind(this) : this.replyOn.bind(this)}>
							{(this.state.data.get("reply")) ?
								<span className="fas fa-times post-button-icon"></span> :
								<span className="fas fa-reply post-button-icon"></span>
							}
							<div className={"post-button-caption-holder " +
									((highlight === "reply") ?
										"post-button-caption-on" : "post-button-caption-off")}>
								<span className="post-button-caption post-button-caption-reply">
									{(this.state.data.get("reply")) ? "cancel" : "reply"}
								</span>
							</div>
						</div>
					</div>
				</div>
			}
		}

		//TODO - Handle long user names and ids

		const user = this.props.user;
		return (
			<div className="post-core">
				<div
					className="post-body"
					onMouseOver={this.showUser.bind(this)}
					onMouseOut={this.hideAll.bind(this)}>
					<div className="post-column-1 post-user">
						<img
							className="post-user-picture"
							src={user.get("picture")}
							alt=""
						/>
					</div>
					<div className="post-column-2 post-middle">
						<div className="post-user-title">
							<p className="post-user-name">
								{user.get("name")}
							</p>
							<p className="post-user-id">
								@{user.get("id")}
							</p>
							<p className="post-timestamp">
								{"| " + timeform(this.props.post.get("created"))}
							</p>
						</div>
						<div className="post-content-holder">
							{this.state.data.get("html")}
						</div>
					</div>
					<div className="post-column-3">
						{buttons}
					</div>
					{usercard}
					{refcard}
				</div>
				{reply}
			</div>
		);
	}


	componentWillUnmount() {
		if (this.state.data.get("userTimer")) {
			clearTimeout(this.state.data.get("userTimer"))
		}
		if (this.state.data.get("refTimer")) {
			clearTimeout(this.state.data.get("refTimer"))
		}
	}

}

export default Post;
