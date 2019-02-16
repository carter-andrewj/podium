import React from 'react';
import ImmutableComponent from '../widgets/immutableComponent';
import { Map, fromJS } from 'immutable';

import Settings from 'settings';
import { getCaretWithin, markupPost } from 'utils';

import PostHeader from './postHeader';
import Validator from './validator';
import Button from '../widgets/buttons/button';


const placeholders = [
	"Say something...",
	"Make a statement...",
	"Express yourself...",
	"Be creative...",
	"Speak out..."
]

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

const defState = {
	raw: "",
	html: "",
	cost: 0,
	sending: false,
	sent: false,
	valid: "pending",
	caret: emptyCaret,
	references: {},
	show: false,
	lock: false,
	placeholder: ""
}


const refOrder = {
	"mention": 0,
	"topic": 1,
	"link": 2
}




class Send extends ImmutableComponent {

	constructor() {

		super(defState)

		this.show = this.show.bind(this);
		this.hide = this.hide.bind(this);
		this.lock = this.lock.bind(this);
		this.unlock = this.unlock.bind(this);

		this.keyDown = this.keyDown.bind(this);
		this.keyStroke = this.keyStroke.bind(this);

		this.updatePost = this.updatePost.bind(this);
		
		this.sendPost = this.sendPost.bind(this);

	}



	componentDidMount() {
		this.updateState(state => state.set("placeholder",
			placeholders[Math.floor(Math.random() * placeholders.length)]
		))
		if (this.props.replyingTo) {
			this.input.focus();
		}
	}


	show() {
		this.updateState(state => state.set("show", true))
	}

	hide() {
		this.updateState(state => state.set("show", false))
	}

	lock() {
		this.updateState(state => state.set("lock", true))
	}

	unlock() {
		if (this.getState("raw") === "") {
			this.updateState(state => state.set("lock", false))
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
		let raw = this.getState("raw")
		var references = this.getState("references")

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

				//TODO - Handle Punctuation

				//TODO - Sanitise input of special characters

				// For all other characters, add to text string at cursor position
				default:
					raw = raw.slice(0, cursor[0]) + String.fromCharCode(key) +
						raw.slice(cursor[1]);
					cursor = [cursor[0] + 1, cursor[0] + 1]

			}

		}

		// Markup post
		const markup = markupPost(raw);

		// Deconstruct post references
		var oldrefs = Map({});
		var newrefs = Map({});
		if (raw !== this.getState("raw")) {
			markup.filter(w => w.reference)
				.forEach(w => {
					if (references.has(w.word)) {
						oldrefs = oldrefs.set(w.word,
							references.get(w.word));
					} else {
						newrefs = newrefs.set(w.word, Map({
							id: w.word,
							type: w.type,
							valid: "pending"
						}));
					}
				});
			references = oldrefs.merge(newrefs);
		}

		// Construct post html from result
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
			let postClasses = "";
			if (word.reference && 
					!(references.getIn([word.word, "valid"]))) {
				postClasses += "post-reference-fail ";
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


		// Store in state
		this.updateState(

			// Update state
			state => state
				.set("raw", raw)
				.set("caret", caret)
				.set("html", html.reduce((full, next) => full + next, ""))
				.set("cost", (cost > 0) ?
					Math.round(cost + Settings.costs.overhead) : 0)
				.set("references", references),

			// And then validate any new references
			async () => {
				newrefs.forEach((r) => {
					this.validateReference(r)
						.then(valid => {
							if (valid) {
								this.updateState(state =>
									state.setIn(
										["references", r.get("id"), "valid"],
										"passed"
									),
									() => { this.updatePost(false); }
								);
							} else {
								this.updateState(state =>
									state.setIn(
										["references", r.get("id"), "valid"],
										"failed"
									),
									() => { this.updatePost(false); }
								);
							}
						});
				});
			}

		);

	}


	async validateReference(ref) {
		return new Promise((resolve) => {
			switch (ref.get("type")) {
				case ("mention"):
					this.validateMention(ref.get("id"))
						.then(valid => resolve(valid));
					break;
				case ("topic"):
					this.validateTopic(ref.get("id"))
						.then(valid => resolve(valid));
					break;
				case ("link"):
					this.validateLink(ref.get("id"))
						.then(valid => resolve(valid));
					break;
				default:
					resolve(false);
			}
		});
	}


	validateMention(id) {
		id = id.substring(1, id.length);
		return new Promise((resolve) => {
			this.props.podium
				.isUser(id)
				.then(result => resolve(result))
				.catch(error => {
					console.error(error)
					resolve(false)
				})
		})
	}


	validateTopic(id) {
		id = id.substring(1, id.length);
		return new Promise((resolve) => {
			resolve(true)
		});
	}


	validateLink(url) {
		return new Promise((resolve) => {
			//TODO - Validate URLs
			resolve(true)
		});
	}


	sendPost() {

		//TODO - Handle send failure

		// Check post validity
		if (this.getState("valid") === "passed" && !this.getState("sending")) {

			// Set sending state
			this.input.blur()
			this.updateState(state => state.set("sending", true))

			// Get post data
			const content = this.getState("raw")
			const references = Map()
			const parent = this.props.replyingTo

			// Dispatch post to radix net
			this.props
				.sendPost(content, references, parent)
				.then(() => {
					if (this.props.replyingTo) {
						this.props.hideReply();
					} else {
						this.input.blur()
						this.updateState(
							state => state
								.set("references", Map())
								.set("sent", true)
								.set("show", false)
								.set("lock", false),
							() => setTimeout(
								() => this.updateState(state => state
									.merge(fromJS(defState))
									.set("placeholder", placeholders[
										Math.floor(Math.random() * placeholders.length)
									])
								),
								500
							)
						)
					}
				})
				.catch(error => {
					console.error(error)
					//TODO - Handle failed sending
				});

		}

	}


	componentDidUpdate(lastProps, lastState) {

		// Place cursor if send box is focussed
		if (this.getState("lock")) {
			let range = document.createRange();
			let sel = window.getSelection();
			//TODO - Stop this falling back to the master Send box when
			//		 the user is typing a reply and a render/update occurs
			range.setStart(
				document
					.getElementById(this.getState("caret", "start", "node"))
					.firstChild,
				this.getState("caret", "start", "offset")
			)
			range.setEnd(
				document
					.getElementById(this.getState("caret", "end", "node"))
					.firstChild,
				this.getState("caret", "end", "offset")
			)
			range.collapse(true);
			sel.removeAllRanges();
			sel.addRange(range);
		}

		// Validate post
		const valid = (this.getState("raw") === "") ?
			"pending" : 
			this.getState("references")
				.reduce((val, ref) => {
					if (val === "pending" || val === "failed") {
						return val;
					} else {
						return ref.get("valid");
					}
				}, "passed");
		if (valid !== this.getState("valid")) {
			this.updateState(state => state
				.set("valid", valid)
			);
		}

	}


	render() {

		// Build post content
		let content;
		if (!(this.getState("lock")) && this.getState("raw") === "") {
			content = '<p id="post-line-0" class="post-input-line post-input-placeholder">' +
				this.getState("placeholder") +
			'</p>';
		} else if (this.getState("raw") === "") {
			content = '<p id="post-line-0" class="post-input-line post-input-line-empty">' +
				'<span id="post-item-0">' + String.fromCharCode(8203) +
				'</span>' +
			'</p>';
		} else {
			content = '<p' +
				' id="post-line-0"' +
				' class="post-input-line">' +
				this.getState("html") +
			'</p>';
		}

		// Build post validation
		//TODO - Allow users to "ignore" a validation
		//		 failure and have the associated reference
		//		 just be treated like normal text
		//TODO - Allow users to create topics directly from
		//		 a failed-topic-validation notification
		const validations = this.getState("references")
			.sort((a, b) => {
				const aTypeOrd = refOrder[a.get("type")];
				const bTypeOrd = refOrder[b.get("type")];
				if (aTypeOrd > bTypeOrd) {
					return 1
				} else if (aTypeOrd < bTypeOrd) {
					return -1
				} else if (a.get("id") > b.get("id")) {
					return 1
				} else {
					return -1
				}
			})
			.map((r) => {
				switch (r.get("type")) {

					// Surface mention validation
					case ("mention"):
						return <Validator
							key={r.get("id")}
							icon="at"
							color="var(--green)"
							subjectType="user"
							subject={r.get("id")}
							status={r.get("valid")}
						/>

					case ("topic"):
						return <Validator
							key={r.get("id")}
							icon="hashtag"
							color="var(--tan)"
							subjectType="topic"
							subject={r.get("id")}
							status={r.get("valid")}
						/>

					// Surface Link validation
					case ("link"):
						return <Validator
							key={r.get("id")}
							icon="link"
							color="var(--blue)"
							subjectType="URL"
							subject={r.get("id")}
							status={r.get("valid")}
						/>

					default:
						return null

				}
			})
			.toList();


		const open = this.getState("show") || this.getState("lock")
		const valid = this.getState("valid")
		const filled = this.getState("raw") !== ""

    	// Render
		return (
			<div className="newpost-holder">

				<div
					className="newpost-capture"
					onMouseEnter={this.show.bind(this)}
					onMouseLeave={this.hide.bind(this)}>

					<div
						className="newpost card"
						onClick={() => this.input.focus()}>

						<div className={open ?
								"newpost-body newpost-body-open" :
								"newpost-body newpost-body-closed"
							}>
							<PostHeader
								activeUser={this.props.activeUser}
								author={this.props.activeUser}
							/>
							{(this.getState("cost") > 0) ?
								<div className="newpost-cost-holder">
									<p className="newpost-cost">
										{this.getState("cost")}
									</p>
									<img
										className="newpost-cost-icon"
										src="/images/favicon.png"
										alt=""
									/>
								</div>
								: null
							}
							<div className="newpost-button-holder">

								<div className="newpost-button">
									<Button
										caption="emojies"
										captionLocation="right"
										captionOffset={0.8}
										onClick={() => console.log("emoji")}>
										<i className="fas fa-smile button-icon" />
									</Button>
								</div>

								<div className="newpost-button">
									<Button
										caption="media"
										captionLocation="right"
										captionOffset={0.8}
										onClick={() => console.log("media")}>
										<i className="fas fa-camera button-icon" />
									</Button>
								</div>

							</div>
						</div>

						<div className={open ?
								"newpost-send-button newpost-send-button-open" :
								"newpost-send-button newpost-send-button-closed"
							}>
							<Button
								style={{ borderRadius: "0 0 1.2rem 0" }}
								color={!open ?
									"var(--grey)" :
									(valid === "pending") ?
										"var(--dark-grey)" :
										(valid === "failed") ?
											"var(--red)" :
											"var(--green)"
								}
								caption="send"
								filled={open}
								disabled={!(valid === "passed")}
								size={2.2}
								captionLocation="right"
								captionOffset={0.8}
								onClick={() => this.sendPost()}>
								{(open && valid === "pending" && filled) ?
									<i className="fas fa-circle-notch button-icon newpost-send-button-loader" /> :
									(valid === "failed") ?
										<i className="fas fa-times button-icon" /> :
										<i className="fas fa-comment button-icon" />
								}
							</Button>
						</div>

						<div className={open ?
								"newpost-input-holder newpost-input-holder-open" :
								"newpost-input-holder newpost-input-holder-closed"
							}>
							<div
								className={open ?
									"newpost-input newpost-input-open" :
									(this.getState("sent") ?
										"newpost-input newpost-input-sent" :
										"newpost-input newpost-input-closed"
									)
								}
								contentEditable="true"
								suppressContentEditableWarning={true}
								ref={ref => { this.input = ref }}
								onFocus={!this.getState("sending") ?
									() => this.lock()
									: null
								}
								onBlur={this.unlock.bind(this)}
								onKeyDown={this.keyDown.bind(this)}
								onKeyPress={this.keyStroke.bind(this)}
								dangerouslySetInnerHTML={{ __html: content }}>
							</div>
							<div className={(open && validations.size > 0) ?
									"newpost-validation-holder newpost-validation-holder-open" :
									"newpost-validation-holder newpost-validation-holder-closed"}>
								{validations}
							</div>
						</div>

						{this.getState("sending") ?
							<div
								className="newpost-loading-mask"
								onClick={() => {
									this.unlock()
									this.input.blur()
								}}
							/>
							: null
						}

					</div>

				</div>

			</div>
		)

	}



}

export default Send;
