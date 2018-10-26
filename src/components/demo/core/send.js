import React, { Component } from 'react';
import '../../../App.css';

import Settings from '../config';
import { getCaretWithin, markupPost } from '../utils';

import Notify from './notify';



const emptyCaret = {
	start: {
		node: "post-item-0",
		offset: 0
	},
	end: {
		node: "post-item-0",
		offset: 0
	}
}

const defState = {
	raw: "",
	focus: false,
	caret: emptyCaret,
	html: "",
	cost: 0,
	references: {
		mentions: {},
		links: {},
		topics: {}
	}
}



class Send extends Component {

	constructor() {
		super()
		this.state = defState;

		this.setFocus = this.setFocus.bind(this);
		this.clearFocus = this.clearFocus.bind(this);

		this.keyDown = this.keyDown.bind(this);
		this.keyStroke = this.keyStroke.bind(this);

		this.updatePost = this.updatePost.bind(this);
		
		this.sendPost = this.sendPost.bind(this);
	}


	// Clear placeholder from posting box on first selection
	setFocus() {
		const state = this.state;
		state.focus = true;
		this.setState(state);
	}

	// Restore placeholder in event of unfocus with no text
	clearFocus(event) {
		const state = this.state;
		state.focus = false;
		this.setState(state);
	}


	// Catch new characters
	keyStroke(event) {
		event.preventDefault();
		this.updatePost(event.which);
	}


	// Catches caracters not reported by keyPressed event
	// (specifically backspace, tab, cursor-left, and cursor-right)
	keyDown(event) {
		if (Array.of(8, 9, 37, 39).includes(event.keyCode)) {
			event.preventDefault();
			this.updatePost(event.which);
		}
	}


	// Format post box content upon input
	updatePost(key) {

		//TODO - Fix pasting into the box breaking the cursor
		//		 position and subsequent editing

		// Get current post string
		let raw = this.state.raw;

		// Get cursor and selection position
		let cursor;
		let selected;
		if (raw === "") {
			selected = 0;
			cursor = [0, 0];
		} else {
			const caretNow = getCaretWithin(this.input);
			selected = window.getSelection().toString().length;
			cursor = [caretNow - selected, caretNow];
		}

		// Handle new keystroke, if required
		if (key) {

			// Handle keystroke
			let pos;
			switch (key) {

				// Backspace
				//TODO - Fix delete selection across multiple words
				case 8:
					if (selected === 0) {
						cursor = [Math.max(0, cursor[0] - 1), cursor[0]]
					}
					raw = raw.slice(0, cursor[0]) + raw.slice(cursor[1]);
					cursor = [cursor[0], cursor[0]]
					break;

				// Tab
				case 9:
					raw = raw.slice(0, cursor[0]) + "\t" +
						raw.slice(cursor[1]);
					cursor = [cursor[0] + 1, cursor[0] + 1]
					break;

				// Return
				case 13:
					raw = raw.slice(0, cursor[0]) + "\r" +
						raw.slice(cursor[1]);
					cursor = [cursor[0] + 1, cursor[0] + 1]
					break;

				// Cursor Left
				case 37:
					pos = Math.max(0, cursor[0] - 1);
					cursor = [pos, pos];
					break;

				// Cursor Right
				case 39:
					pos = Math.min(raw.length, cursor[1] + 1);
					cursor = [pos, pos];
					break;

				//TODO - Sanitise input of special characters

				// For all other characters, add to text string at cursor position
				default:
					raw = raw.slice(0, cursor[0]) + String.fromCharCode(key) +
						raw.slice(cursor[1]);
					cursor = [cursor[0] + 1, cursor[0] + 1]

			}

		}

		// Construct post html from result
		const markup = markupPost(raw);
		

		//WARNING - You may be tempted to switch this assignment
		//			for the global const -emptyCaret- which contains
		//			these exact values. DO NOT DO THIS. Because
		//			JS is fucking stupid about how it handles
		//			global variables, making this change somehow
		//			instead OVERWRITES THE GLOBAL VARIABLE with
		//			the previous value of -caret- even though
		//			that should be impossible. Yes - to be clear -
		//			assigning a new variable the value of an
		//			existing global variable instead assigns
		//			the value to the global variable. Don't believe
		//			me? Try it. Switch the map below out for
		//			-emptyCaret-, then load the app and type
		//			anything into the Send box before selecting
		//			and deleting the whole thing. Instead of
		//			setting the caret back to zero (as in the
		//			map below) JS will try to set it to the most
		//			recent value and crash. The line below
		//			fixes it, despite this being batshit stupid.
		let caret = {
			start: {
				node: "post-item-0",
				offset: 0
			},
			end: {
				node: "post-item-0",
				offset: 0
			}
		}

		let html = [];
		let cost = 0;
		let line = 0;
		let depth = 0;
		for (let w = 0; w < markup.length; w++) {

			// Get this post word
			const word = markup[w];

			// Sum post cost
			cost += word.cost;

			// Make word id
			const wordID = "post-item-" + w;

			// Detect cursor position
			if (depth <= cursor[0] && word.depth >= cursor[0]) {
				caret.start = {
					node: wordID,
					offset: cursor[0] - depth
				}
			}
			if (depth <= cursor[1] && word.depth >= cursor[1]) {
				caret.end = {
					node: wordID,
					offset: cursor[0] - depth
				}
			}
			depth = word.depth;

			// Handle references
			const refs = this.state.references;
			let postClasses = "";
			if (word.type === "mention") {
				const w = word.word.substring(1, word.word.length);
				if (w in refs.mentions && !(refs.mentions[w].valid)) {
					postClasses += "post-reference-fail ";
				}
			}
			if (word.type === "topic") {
				const w = word.word.substring(1, word.word.length);
				if (w in refs.topics && !(refs.topics[w].valid)) {
					postClasses += "post-reference-fail ";
				}
			}
			if (word.type === "link") {
				const w = word.word;
				if (w in refs.links && !(refs.links[w].valid)) {
					postClasses += "post-reference-fail ";
				}
			}

			// Handle new lines
			let leader = "";
			if (word.type === "return") {
				line += 1
				leader = '</p><p' +
					' id="post-line-' + line + '"' +
					' class="post-input-line">';
			}


			
			// Build result
			html.push(leader +
				'<span' +
					' id="' + wordID + '"' +
					' class="' +
						'post-input-text ' +
						'post-input-' + word.type + ' ' +
						postClasses +
					'">' +
					word.word +
				'</span>'
			);

		}

		// Break out post elements
		let mentions = {};
		markup.filter(w => w.type === "mention")
			.map(w => w.word.substring(1, w.word.length))
			.forEach(w => {
				if (w in this.state.references.mentions) {
					mentions[w] = this.state.references.mentions[w];
				} else {
					mentions[w] = {
						id: w,
						type: "mention",
						valid: "pending"
					}
					this.validateMention(w)
						.then(valid => {
							if (w in this.state.references.mentions) {
								const state = this.state;
								state.references.mentions[w].valid = valid;
								this.setState(
									state,
									() => { this.updatePost(false); }
								);
							}
						});
				}
			});
		let topics = {};
		markup.filter(w => w.type === "topic")
			.map(w => w.word.substring(1, w.word.length))
			.forEach(w => {
				if (w in this.state.references.topics) {
					topics[w] = this.state.references.topics[w];
				} else {
					topics[w] = {
						id: w,
						type: "topic",
						valid: "pending"
					}
					this.validateTopic(w)
						.then(valid => {
							if (w in this.state.references.topics) {
								const state = this.state;
								state.references.topics[w].valid = valid;
								this.setState(
									state,
									() => { this.updatePost(false); }
								);
							}
						});
				}
			});
		let links = {};
		markup.filter(w => w.type === "link")
			.map(w => w.word)
			.forEach(w => {
				if (w in this.state.references.links) {
					links[w] = this.state.references.links[w];
				} else {
					links[w] = {
						id: w,
						type: "link",
						valid: "pending"
					}
					this.validateLink(w)
						.then(valid => {
							if (w in this.state.references.links) {
								const state = this.state;
								state.references.links[w].valid = valid;
								this.setState(
									state,
									() => { this.updatePost(false); }
								);
							}
						});
				}
			});

		// Store in state
		const state = this.state;
		state.raw = raw;
		state.caret = caret;
		state.html = html.reduce((full, next) => full + next, "");
		state.cost = (cost > 0) ? Math.round(cost + Settings.costs.overhead) : 0;
		state.references = {
			mentions: mentions,
			topics: topics,
			links: links
		}
		this.setState(state);

	}


	validateMention(id) {
		return new Promise((resolve) => {
			this.props.getProfileFromID(id)
				.then(profile => {
					if (profile) {
						resolve(true);
					} else {
						resolve(false);
					}
				});
		});
	}


	validateTopic(id) {
		return new Promise((resolve) => {
			this.props.getTopicFromID(id)
				.then(topic => {
					if (topic) {
						resolve(true);
					} else {
						resolve(false);
					}
				});
		});
	}


	validateLink(url) {
		return new Promise((resolve) => {
			//TODO - Validate URLs
			resolve(true);
		});
	}


	sendPost() {

		//TODO - Prevent posting while validation fails exist

		//TODO - Lock post on send

		// Dispatch post to radix net
		this.props.sendPost(this.state.raw)
			.then(this.setState(defState));

	}


	componentDidUpdate(lastProps, lastState) {

		// Place cursor if send box is focussed
		if (this.state.focus) {
			let range = document.createRange();
			let sel = window.getSelection();
			range.setStart(
				document.getElementById(this.state.caret.start.node).firstChild,
				this.state.caret.start.offset
			);
			range.setEnd(
				document.getElementById(this.state.caret.end.node).firstChild,
				this.state.caret.end.offset
			);
			range.collapse(true);
			sel.removeAllRanges();
			sel.addRange(range);
		}

	}


	render() {

		

		// Build post content
		let content;
		if (!(this.state.focus) && this.state.raw === "") {
			content = '<p id="post-line-0" class="post-input-line post-input-placeholder">' +
				'Post something new...' +
			'</p>';
		} else if (this.state.raw === "") {
			content = '<p id="post-line-0" class="post-input-line post-input-line-empty">' +
				'<span id="post-item-0">' + String.fromCharCode(8203) +
				'</span>' +
			'</p>';
		} else {
			content = '<p' +
				' id="post-line-0"' +
				' class="post-input-line">' +
				this.state.html +
			'</p>';
		}

		// Build post validation
		//TODO - Allow users to "ignore" a validation
		//		 failure and have the associated reference
		//		 just be treated like normal text
		//TODO - Allow users to create topics directly from
		//		 a failed-topic-validation notification
		let valid = {
			pending: 0,
			passed: 0,
			failed: 0
		};
		const references = {
			...this.state.references.mentions,
			...this.state.references.links,
			...this.state.references.topics
		}
		const validation = Object.keys(references).map(k => {

			// Get reference
			const r = references[k];

			// Collate validation state
			switch (r.valid) {
				case ("pending"):
					valid.pending += 1;
					break;
				case (true):
					valid.passed += 1;
					break;
				default:
					valid.failed += 1;
			}

			// Build notifications
			let notif;
			switch (r.type) {

				// Surface mention validation
				case ("mention"):
					if (r.valid === "pending") {
						notif = <Notify
							key={r.id}
							stage="pending"
							title={<span className="fa fa-at notif-glyph"></span>}
							msg={<span>
								Verifying ID for User <strong>@{r.id}</strong>
							</span>}
							color={Settings.colors.darkGrey}
						/>
					} else if (r.valid === true) {
						notif = <Notify
							key={r.id}
							stage="passed"
							title={<span className="fa fa-at notif-glyph"></span>}
							msg={<span>
								Found user <strong>@{r.id}</strong>
							</span>}
							color={Settings.colors.green}
						/>
					} else {
						notif = <Notify
							key={r.id}
							stage="failed"
							title={<span className="fa fa-at notif-glyph"></span>}
							msg={<span>
								User <strong>@{r.id}</strong> does not exist
							</span>}
							color={Settings.colors.red}
						/>
					} 
					break;

				// Surface Topic validation
				case ("topic"):
					if (r.valid === "pending") {
						notif = <Notify
							key={r.id}
							stage="pending"
							title={<span className="fa fa-hashtag notif-glyph"></span>}
							msg={<span>
								Verifying Topic <strong>#{r.id}</strong>
							</span>}
							color={Settings.colors.darkGrey}
						/>
					} else if (r.valid === true) {
						notif = <Notify
							key={r.id}
							stage="passed"
							title={<span className="fa fa-hashtag notif-glyph"></span>}
							msg={<span>
								Found topic <strong>#{r.id}</strong>
							</span>}
							color={Settings.colors.tan}
						/>
					} else {
						notif = <Notify
							key={r.id}
							stage="failed"
							title={<span className="fa fa-hashtag notif-glyph"></span>}
							msg={<span>
								Topic <strong>#{r.id}</strong> does not exist
							</span>}
							color={Settings.colors.red}
						/>
					}
					break;

				// Surface Link validation
				case ("link"):
					if (r.valid === "pending") {
						notif = <Notify
							key={r.id}
							stage="pending"
							title={<span className="fa fa-external-link-square notif-glyph"></span>}
							msg={<span>
								Verifying URL <strong>{r.id}</strong>
							</span>}
							color={Settings.colors.darkGrey}
						/>
					} else if (r.valid === true) {
						notif = <Notify
							key={r.id}
							stage="passed"
							title={<span className="fa fa-external-link-square notif-glyph"></span>}
							msg={<span>
								Found URL <strong>{r.id}</strong>
							</span>}
							color={Settings.colors.blue}
						/>
					} else {
						notif = <Notify
							key={r.id}
							stage="failed"
							title={<span className="fa fa-external-link-square notif-glyph"></span>}
							msg={<span>
								URL <strong>{r.id}</strong> does not exist
							</span>}
							color={Settings.colors.red}
						/>
					}
					break;

				default:
					notif = null;

			}
			return notif;
		});

		const inputClass = (this.state.focus || this.state.raw !== "") ?
			" post-input-open" : " post-input-closed";
		const validationClass = (validation.length > 0) ?
			" post-input-with-validations" : "";

		// Calculate border color
		let borderClass = "";
		let borderClassVal = "";
		if (valid.failed > 0) {
			borderClass = " post-input-border-failed"
		} else if (valid.pending > 0) {
			borderClass = " post-input-border-pending"
		} else if (valid.passed > 0) {
			borderClass = " post-input-border-passed"
		} else {
			if (this.state.raw !== "") {
				borderClass = " post-input-border-passed"
			} else {
				borderClass = " post-input-border-pending"
			}
			borderClassVal = " post-validation-hide"
		}

		// Build footer
		//TODO - Change post button text color with validations
		const costOffset = (validation.length > 0) ? ((validation.length * -2.5) - 0.15) : 0;
		const footer = <div className="post-input-footer">
			<p
				className="post-input-cost"
				style={{transform: "translate(0," + costOffset + "em)"}}>
				{this.state.cost} <span className="fa fa-database post-input-cost-icon"></span>
			</p>
			<button
				className={"def-button green-button post-input-button" + borderClass}
				onClick={this.sendPost.bind(this)}>
				post
			</button>
		</div>

    	// Render
		return (
			<div ref="send" className="input-col">
				<div
					contentEditable="true"
					suppressContentEditableWarning={true}
					ref={input => {this.input = input}}
					className={"post-input" + inputClass +
						validationClass + borderClass}
					onFocus={this.setFocus.bind(this)}
					onBlur={this.clearFocus.bind(this)}
					onKeyDown={this.keyDown.bind(this)}
					onKeyPress={this.keyStroke.bind(this)}
					dangerouslySetInnerHTML={{__html: content}}>
				</div>
				<div className={"post-validation-box" +
						borderClass + borderClassVal}>
					{validation}
				</div>
				{(this.state.focus || this.state.raw !== "") ? footer : null}
			</div>
		);
	}


	componentWillUnmount () {
		// Save to drafts
	}


}

export default Send;
