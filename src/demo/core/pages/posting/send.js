import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';

import Settings from 'demo/config';
import { getCaretWithin, markupPost } from 'demo/utils';

import Notify from './notify';




const emptyCaret = Map(fromJS({
	start: {
		node: "post-item-0",
		offset: 0
	},
	end: {
		node: "post-item-0",
		offset: 0
	}
}))

const defState = Map(fromJS({
	raw: "",
	focus: false,
	sending: false,
	hider: null,
	valid: "pending",
	caret: emptyCaret,
	html: "",
	cost: 0,
	references: {
		mentions: {},
		links: {},
		topics: {}
	}
}))



function isValid(refs) {
	return Object.keys(refs).reduce((r, n) => {
		if (r === "failed" || refs[n].valid === "failed") { return "failed"; }
		if (r === "pending" || refs[n].valid === "pending") { return "pending"; }
		return "passed";
	}, "passed");
}



class Send extends Component {

	constructor() {
		super()
		this.state = {
			data: defState
		}

		this.setFocus = this.setFocus.bind(this);
		this.clearFocus = this.clearFocus.bind(this);

		this.keyDown = this.keyDown.bind(this);
		this.keyStroke = this.keyStroke.bind(this);

		this.updatePost = this.updatePost.bind(this);
		
		this.sendPost = this.sendPost.bind(this);
	}


	updateState(up, callback) {
		this.setState(
			({data}) => { return {data: up(data)} },
			callback
		);
	}


	componentDidMount() {
		if (this.props.replyingTo) {
			this.input.focus();
		}
	}


	// Clear placeholder from posting box on first selection
	setFocus() {
		this.updateState(state => state
			.set("focus", true)
		);
	}

	// Restore placeholder in event of unfocus with no text
	clearFocus(event) {
		if (this.props.replyingTo && this.state.data.get("raw") === "") {

			// This timer prevents the box being closed by a
			// loss of focus caused by the user clicking the
			// reply button to close the send box. In this
			// instance, the defocus event triggers first,
			// meaning that (otherwise) the send box would
			// be removed before the click registers -
			// causing the click to immediately reopen the
			// send box, contrary to the user's action.
			const hider = setTimeout(
				() => this.props.hideReply(),
				200
			);
			this.updateState(state => state
				.set("hider", hider)
			);

		} else {

			this.updateState(state => state
				.set("focus", false)
			);

		}
	}


	// Catch new characters
	keyStroke(event) {
		event.preventDefault();
		//TODO - add a short pause before triggering updatePost
		//	     to prevent validations being needlessly triggered
		//	     for every character in a word
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
		let raw = this.state.data.get("raw");

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
		// UPDATE: Is this fixed by the switch to immutable.js??
		let caret = emptyCaret;

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
				caret = caret.set("start", Map({
					node: wordID,
					offset: cursor[0] - depth
				}))
			}
			if (depth <= cursor[1] && word.depth >= cursor[1]) {
				caret = caret.set("end", Map({
					node: wordID,
					offset: cursor[0] - depth
				}))
			}
			depth = word.depth;

			// Handle references
			const refs = this.state.data.get("references");
			let postClasses = "";
			if (word.type === "mention") {
				const w = word.word.substring(1, word.word.length);
				if (w in refs.get("mentions") &&
						!(refs.getIn(["mentions", w, "valid"]))) {
					postClasses += "post-reference-fail ";
				}
			}
			if (word.type === "topic") {
				const w = word.word.substring(1, word.word.length);
				if (w in refs.get("topics") &&
						!(refs.getIn(["topics", w, "valid"]))) {
					postClasses += "post-reference-fail ";
				}
			}
			if (word.type === "link") {
				const w = word.word;
				if (w in refs.get("links") &&
						!(refs.getIn(["links", w, "valid"]))) {
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

		//TODO - Convert references to a single Map instead of
		//	     separate maps for each type. And make immutable.

		// Break out post elements
		let mentions = Map({});
		markup.filter(w => w.type === "mention")
			.map(w => w.word.substring(1, w.word.length))
			.forEach(w => {
				if (w in this.state.data
						.getIn(["references", "mentions"])) {
					mentions = mentions.set(w, this.state.data
						.getIn(["references", "mentions", w]));
				} else {
					mentions = mentions.set(w, Map({
						id: w,
						type: "mention",
						valid: "pending"
					}));
					this.validateMention(w)
						.then(valid => {
							if (w in this.state.data
									.getIn(["references", "mentions"])) {
								if (valid) {
									this.updateState(state =>
										state.update("references",
											(r) => r.setIn(
												["mentions", w, "valid"],
												"passed"
											)),
										() => { this.updatePost(false); }
									);
								} else {
									this.updateState(state =>
										state.update("references",
											(r) => r.setIn(
												["mentions", w, "valid"],
												"failed"
											)),
										() => { this.updatePost(false); }
									);
								}
							}
						});
				}
			});
		let topics = Map({});
		markup.filter(w => w.type === "topic")
			.map(w => w.word.substring(1, w.word.length))
			.forEach(w => {
				if (w in this.state.data
						.getIn(["references", "topics"])) {
					topics = topics.set(w, this.state.data
						.getIn(["references", "topics", w]));
				} else {
					topics = topics.set(w, Map({
						id: w,
						type: "topic",
						valid: "pending"
					}));
					this.validateTopic(w)
						.then(valid => {
							if (w in this.state.data
									.getIn(["references", "topics"])) {
								if (valid) {
									this.updateState(state =>
										state.update("references",
											(r) => r.setIn(
												["topics", w, "valid"],
												"passed"
											)),
										() => { this.updatePost(false); }
									);
								} else {
									this.updateState(state =>
										state.update("references",
											(r) => r.setIn(
												["topics", w, "valid"],
												"failed"
											)),
										() => { this.updatePost(false); }
									);
								}
							}
						});
				}
			});
		let links = Map({});
		markup.filter(w => w.type === "link")
			.map(w => w.word)
			.forEach(w => {
				if (w in this.state.data
						.getIn(["references", "links"])) {
					links = links.set(w, this.state.data
						.getIn(["references", "links", w]));
				} else {
					links = links.set(w, Map({
						id: w,
						type: "link",
						valid: "pending"
					}));
					this.validateLink(w)
						.then(valid => {
							if (w in this.state.data
									.getIn(["references", "links"])) {
								if (valid) {
									this.updateState(state =>
										state.update("references",
											(r) => r.setIn(
												["links", w, "valid"],
												"passed"
											)),
										() => { this.updatePost(false); }
									);
								} else {
									this.updateState(state =>
										state.update("references",
											(r) => r.setIn(
												["links", w, "valid"],
												"failed"
											)),
										() => { this.updatePost(false); }
									);
								}
							}
						});
				}
			});

		// Store in state
		this.updateState(state => state
			.set("raw", raw)
			.set("caret", caret)
			.set("html", html.reduce((full, next) => full + next, ""))
			.set("cost", (cost > 0) ?
				Math.round(cost + Settings.costs.overhead) :
				0)
			.set("references", Map(fromJS({
				mentions: mentions,
				topics: topics,
				links: links
			})))
		);

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

		//TODO - Lock post on send

		//TODO - Handle send failure

		// Check post validity
		if (this.state.data.get("valid") === "passed") {

			this.updateState(state =>state
				.set("sending", true)
			);

			// Dispatch post to radix net
			console.log(this.state.data.get("raw"))
			this.props.sendPost(this.state.data.get("raw"),
							    this.props.replyingTo)
				.then(() => {
					if (this.props.replyingTo) {
						this.props.hideReply();
					} else {
						this.updateState(() => defState);
					}
				});

		}

	}


	componentDidUpdate(lastProps, lastState) {

		// Place cursor if send box is focussed
		if (this.state.data.get("focus")) {
			let range = document.createRange();
			let sel = window.getSelection();
			//TODO - Stop this falling back to the master Send box when
			//		 the user is typing a reply and a render/update occurs
			range.setStart(
				document
					.getElementById(this.state.data
						.getIn(["caret", "start", "node"])
					)
					.firstChild,
				this.state.data
					.getIn(["caret", "start", "offset"])
			);
			range.setEnd(
				document
					.getElementById(this.state.data
						.getIn(["caret", "end", "node"])
					)
					.firstChild,
				this.state.data
					.getIn(["caret", "end", "offset"])
			);
			range.collapse(true);
			sel.removeAllRanges();
			sel.addRange(range);
		}

		// Validate post
		const valid = (this.state.data.get("raw") === "") ? "pending" : 
			isValid({
				...this.state.data.getIn(["references", "mentions"]).toJS(),
				...this.state.data.getIn(["references", "topics"]).toJS(),
				...this.state.data.getIn(["references", "links"]).toJS()
			});
		if (valid !== this.state.data.get("valid")) {
			this.updateState(state => state
				.set("valid", valid)
			);
		}

	}


	render() {

		// Return sending message after send
		if (this.state.data.get("sending") && this.props.replyingTo) {

			return <div className="post-sending">
				Sending...
				<p className="sending-spinner-holder">
					<span className="far fa-compass sending-spinner"></span>
				</p>
			</div>

		} else {

			// Build post content
			let content;
			if (!(this.state.data.get("focus")) && this.state.data.get("raw") === "") {
				content = '<p id="post-line-0" class="post-input-line post-input-placeholder">' +
					'Post something new...' +
				'</p>';
			} else if (this.state.data.get("raw") === "") {
				content = '<p id="post-line-0" class="post-input-line post-input-line-empty">' +
					'<span id="post-item-0">' + String.fromCharCode(8203) +
					'</span>' +
				'</p>';
			} else {
				content = '<p' +
					' id="post-line-0"' +
					' class="post-input-line">' +
					this.state.data.get("html") +
				'</p>';
			}

			// Build post validation
			//TODO - Allow users to "ignore" a validation
			//		 failure and have the associated reference
			//		 just be treated like normal text
			//TODO - Allow users to create topics directly from
			//		 a failed-topic-validation notification
			const references = {
				...this.state.data.getIn(["references", "mentions"]).toJS(),
				...this.state.data.getIn(["references", "topics"]).toJS(),
				...this.state.data.getIn(["references", "links"]).toJS()
			}
			const validation = Object.keys(references).map(k => {

				// Get reference
				const r = references[k];

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
						} else if (r.valid === "passed") {
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
						} else if (r.valid === "passed") {
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
						} else if (r.valid === "passed") {
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

			const inputClass = (this.state.data.get("focus") ||
				                this.state.data.get("raw") !== "") ?
				" post-input-open" :
				" post-input-closed";
			const validationClass = (validation.length > 0) ?
				" post-input-with-validations" : "";

			// Calculate border color
			let borderClass = "";
			let buttonClass = "";
			let borderClassVal = "";
			if (this.state.data.get("valid") === "failed") {
				borderClass = " post-input-border-failed"
				buttonClass = " post-input-button-failed"
			} else if (this.state.data.get("valid") === "passed") {
				borderClass = " post-input-border-passed"
				buttonClass = " post-input-button-passed"
			} else {
				borderClass = " post-input-border-pending"
				buttonClass = " post-input-button-pending"
			}
			if (validation.length === 0) {
				borderClassVal = " post-validation-hide"
			}

			// Set button text
			let buttonText;
			if (this.props.replyingTo) {
				if (this.props.replyingTo.get("owned")) {
					buttonText = "thread";
				} else {
					buttonText = "reply";
				}
			} else {
				buttonText = "post";
			}

			// Build footer
			//TODO - Change post button text color with validations
			const costOffset = (validation.length > 0) ? ((validation.length * -2.5) - 0.15) : 0;
			const footer = <div className="post-input-footer">
				<p
					className="post-input-cost"
					style={{transform: "translate(0," + costOffset + "em)"}}>
					{this.state.data.get("cost")} <span className="fa fa-database post-input-cost-icon"></span>
				</p>
				<button
					className={"def-button green-button post-input-button" + buttonClass}
					onClick={this.sendPost.bind(this)}>
					{buttonText}
				</button>
			</div>

	    	// Render
			return (
				<div ref="send" className="input-col">
					<div
						contentEditable="true"
						suppressContentEditableWarning={true}
						ref={(input) => { this.input = input; }}
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
					{(this.state.data.get("focus") || this.state.data.get("raw") !== "") ?
						footer : null}
				</div>
			);

		}

	}


	componentWillUnmount () {

		// Kill hider timer when send box removed externally
		if (this.state.data.get("hider")) {
			clearTimeout(this.state.data.get("hider"));
		}

		// Save to drafts

	}


}

export default Send;
