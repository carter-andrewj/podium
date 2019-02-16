import React from 'react';
import { Link } from 'react-router-dom';
import ImmutableComponent from '../widgets/immutableComponent';

import { Map } from 'immutable';

import { markupPost } from 'utils';

import PostHeader from './postHeader';
import Send from '../pages/posting/send';




class Post extends ImmutableComponent {

	constructor() {
		super({

			author: null,
			content: null,

			reference: null,
			refTimer: null,
			links: Map(),

			reply: false

		})
	}


	componentWillMount() {
		this.constructPost(this.props.post.text)
		this.props.getUser(this.props.post.author.address, false)
			.then(user => this.updateState(state => state
				.set("author", user)
			))
			.catch(error => console.error(error))
	}


	showReference(reference) {
		if (this.getState("refTimer")) {
			clearTimeout(this.getState("refTimer"))
		}
		this.updateState(state => state
			.set("reference", reference)
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



	replyOn(event) {
		// if (event) { event.stopPropagation() }
		this.updateState(state => state.set("reply", true))
	}

	replyOff(event) {
		// if (event) { event.stopPropagation() }
		this.updateState(state => state.set("reply", false))
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



	constructPost(text) {

		// Markup raw post string
		const postID = this.props.post.address;
		const post = markupPost(text);

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
			.set("content",
				<div className="post-content">
					{lines}
				</div>
			)
		);

	}


	render() {

		let reply;
		if (this.getState("reply")) {
			reply = <div className="post-reply">
				<Send

					activeUser={this.props.activeUser}
					getUser={this.props.getProfileFromID}

					sendPost={this.props.sendPost}

					replyingTo={this.props.post}
					hideReply={this.replyOff}

				/>
			</div>
		}

		return (
			<div
				className="post card"
				onClick={() => this.postLink.click()}>
				<Link
					to={`/post/${this.props.post.address}`}
					innerRef={ref => this.postLink = ref}
					style={{ display: "none" }}
				/>
				{this.getState("author") ?
					<div className="post-body">
						<PostHeader
							activeUser={this.props.activeUser}
							author={this.getState("author")}
							post={this.props.post}>
							{this.getState("content")}
						</PostHeader>
						{reply}
					</div>
					: null
				}
			</div>
		)
	}

}

export default Post;
