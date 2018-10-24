import React, { Component } from 'react';
import '../../../../App.css';

import { markupPost } from '../../utils';



class PostCore extends Component {

	constructor() {
		super()
		this.state = {
			html: null
		}
		this.constructPost = this.constructPost.bind(this);
	}


	componentWillMount() {
		this.constructPost();
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
		return (
			<div className="post-core card">
				<div className="row">
					<div className="col-1 post-user">
						<img
							className="post-profilepic"
							src={this.props.user.picture}
							alt=""
						/>
					</div>
					<div className="col-10 post-middle">
						<p className="post-username">{this.props.user.name}</p>
						{this.state.html}
					</div>
					<div className="col-1 post-buttons">
					</div>
				</div>
			</div>
		);
	}

}

export default PostCore;
