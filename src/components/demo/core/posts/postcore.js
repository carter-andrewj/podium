import React, { Component } from 'react';
import '../../../../App.css';

import { markupPost } from '../../utils';
import Send from '../send';



class PostCore extends Component {

	constructor() {
		super()
		this.state = {
			highlight: "none",
			html: null,
			reply: false
		}
		this.highlight = this.highlight.bind(this);
		this.constructPost = this.constructPost.bind(this);
		this.toggleReply = this.toggleReply.bind(this);
	}


	componentWillMount() {
		this.constructPost();
	}


	highlight(tag) {
		const state = this.state;
		state.highlight = tag;
		this.setState(state);
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


	toggleReply() {
		const state = this.state;
		if (state.reply) {
			state.reply = false;
		} else {
			state.reply = true;
		}
		this.setState(state);
	}


	constructPost() {

		// Markup raw post string
		const post = markupPost(this.props.post.content);

		// Count lines in output
		const lineNum = post.reduce((x, p) => Math.max(x, p.line), 0) + 1;

		console.log(post, lineNum);

		// Build each line
		const lines = [];
		for (let l = 0; l < lineNum; l++) {

			// Build line
			const words = post.filter(p => p.line === l).map((p, w) => {

				// Create word ID
				const wordID = this.props.post.address + "-" + l + "-" + w;

				// Handle word type
				let word;
				switch (p.type) {

					// Links
					case ("link"):
						word = <span
							key={wordID}
							className="post-word post-link">
							<a target="_blank" href={p.word}>
								{p.word}
							</a>
						</span>
						break;

					// Mentions
					case ("mention"):
						word = <span
							key={wordID}
							onMouseOver={this.showProfile(p.word)}
							onClick={this.gotoProfile(p.word)}
							className="post-word post-mention">
							{p.word}
						</span>
						break;

					// Topics
					case ("topic"):
						word = <span
							key={wordID}
							onMouseOver={this.showTopic(p.word)}
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
				key={this.props.post.address + "-" + l}
				className="post-line">
				{words}
			</p>);

		}

		// Wrap and store result
		const state = this.state;
		state.html = <div className="post-content">{lines}</div>;
		this.setState(state);

	}

	render() {

		//TODO - Link post to posting user's profile

		//TODO - Show profile card on hover of name/id

		//TODO - Show topic card on hover of id

		//TODO - URL previews

		// Build reply box (when open)
		let reply;
		if (this.state.reply) {
			reply = <div className="post-reply">
				<Send
					getProfileFromID={this.props.getProfileFromID}
					getTopicFromID={this.props.getTopicFromID}
					sendPost={this.props.sendPost}
				/>
			</div>
		}

		//TODO - Replace with actual integrity/affinity scores
		const integrity = 0.78;
		const affinity = 0.32;
		const affinityOut = Math.floor(affinity * 100) + "%";
		const affinitySize = (3.8 * affinity) + "em"
		const integrityOut = Math.floor(integrity * 100) + "%";
		const integritySize = (3.8 * integrity) + "em"

		return (
			<div className="post-core card">
				<div className="post-body">
					<div className="post-column-1 post-user">
						<img
							className="post-user-picture"
							src={this.props.user.picture}
							alt=""
						/>
						<div className="post-user-info-holder">
							<div
								className="post-user-info-size"
								style={{ width: affinitySize }}>
							</div>
							<p className="post-user-info">
								<span className="fa fa-balance-scale post-icon"></span> {affinityOut}
							</p>
						</div>
						<div className="post-user-info-holder">
							<div
								className="post-user-info-size"
								style={{ width: integritySize }}>
							</div>
							<p className="post-user-info">
								<span className="fa fa-compass post-icon"></span> {integrityOut}
							</p>
						</div>
					</div>
					<div className="post-column-2 post-middle">
						<div className="post-user-title">
							<p className="post-user-name">{this.props.user.name}</p>
							<p className="post-user-id">@{this.props.user.id}</p>
						</div>
						<div className="post-content">
							{this.state.html}
						</div>
					</div>
					<div className="post-column-3 post-buttons">
						<div
							className="post-button post-button-promote"
							onMouseOver={this.highlight.bind(this, "promote")}
							onMouseOut={this.highlight.bind(this, "none")}
							onClick={this.props.promotePost.bind(this.props.post.address)}>
							<span className="fa fa-bullhorn post-button-icon"></span>
							<div className={"post-button-caption-holder " +
									((this.state.highlight === "promote") ?
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
							onClick={this.props.reportPost.bind(this.props.post.address)}>
							<span className="fa fa-exclamation-triangle post-button-icon"></span>
							<div className={"post-button-caption-holder " +
									((this.state.highlight === "report") ?
										"post-button-caption-on" : "post-button-caption-off")}>
								<span className="post-button-caption post-button-caption-report">
									report
								</span>
							</div>
						</div>
						<div
							className={"post-button post-button-reply " +
								((this.state.reply) ? "post-button-reply-on" : "")}
							onMouseOver={this.highlight.bind(this, "reply")}
							onMouseOut={this.highlight.bind(this, "none")}
							onClick={this.toggleReply.bind(this)}>
							<span className="fa fa-mail-reply post-button-icon"></span>
							<div className={"post-button-caption-holder " +
									((this.state.highlight === "reply") ?
										"post-button-caption-on" : "post-button-caption-off")}>
								<span className="post-button-caption post-button-caption-reply">
									respond
								</span>
							</div>
						</div>
					</div>
				</div>
				{reply}
			</div>
		);
	}

}

export default PostCore;
