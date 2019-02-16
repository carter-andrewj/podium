import React from 'react';
import ImmutableComponent from '../../widgets/immutableComponent';
import { Map, fromJS } from 'immutable';

import Settings from 'settings';
import { getCaretWithin, markupPost } from 'utils';

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

const defState = {
	raw: "",
	focus: false,
	highlight: null,
	sending: false,
	hider: null,
	valid: "pending",
	caret: emptyCaret,
	html: "",
	cost: 0,
	references: {}
}

const refOrder = {
	"mention": 0,
	"topic": 1,
	"link": 2
}




class Send extends ImmutableComponent {

	constructor() {
		super(defState)

		this.setFocus = this.setFocus.bind(this);
		this.clearFocus = this.clearFocus.bind(this);

		this.keyDown = this.keyDown.bind(this);
		this.keyStroke = this.keyStroke.bind(this);

		this.updatePost = this.updatePost.bind(this);
		
		this.sendPost = this.sendPost.bind(this);
	}



	componentDidMount() {
		if (this.props.replyingTo) {
			this.input.focus();
		}
	}


	highlight(target) {
		this.updateState(state => state
			.set("highlight", target)
		);
	}


	// Clear placeholder from posting box on first selection
	setFocus() {
		this.updateState(state => state
			.set("focus", true)
		);
	}

	// Restore placeholder in event of unfocus with no text
	clearFocus(event) {
		if (this.props.replyingTo && this.getState("raw") === "") {

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
		let raw = this.getState("raw");
		var references = this.getState("references");

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

		//TODO - Lock post on send

		//TODO - Handle send failure

		// Check post validity
		if (this.getState("valid") === "passed") {

			this.updateState(state => state.set("sending", true))

			// Get post data
			const content = this.getState("raw")
			const references = Map()
			const parent = this.props.replyingTo

			// Dispatch post to radix net
			this.props
				.sendPost(content, references, parent)
				.then(() => {
					console.log("resolved")
					if (this.props.replyingTo) {
						this.props.hideReply();
					} else {
						this.updateState(() => fromJS(defState));
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
		if (this.getState("focus")) {
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
		if (!(this.getState("focus")) && this.getState("raw") === "") {
			content = '<p id="post-line-0" class="post-input-line post-input-placeholder">' +
				'Post something new...' +
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

		// // Build post insert buttons
		// let insertHighlight;
		// switch (this.getState("highlight")) {
		// 	case ("image"):
		// 		insertHighlight = "insert image";
		// 		break;
		// 	case ("gif"):
		// 		insertHighlight = "insert gif";
		// 		break;
		// 	case ("emoji"):
		// 		insertHighlight = "insert emoji";
		// 		break;
		// 	case ("video"):
		// 		insertHighlight = "insert video";
		// 		break;
		// 	case ("save"):
		// 		insertHighlight = "save to drafts";
		// 		break;
		// 	case ("discard"):
		// 		insertHighlight = "discard post";
		// 		break;
		// 	default:
		// 		insertHighlight = "";
		// }
		// let insertCard;
		// if (this.getState("focus")) {
		// 	insertCard = <div className="input-support insert-card card">
		// 		<div className="insert-holder">
		// 			<div className="insert-panel insert-column-1">
		// 				<div
		// 					className="insert-button insert-image"
		// 					onMouseOver={this.highlight.bind(this, "image")}
		// 					onMouseOut={this.highlight.bind(this, null)}>
		// 					<span className="fas fa-image insert-button-icon"></span>
		// 				</div>
		// 				<div
		// 					className="insert-button insert-gif"
		// 					onMouseOver={this.highlight.bind(this, "gif")}
		// 					onMouseOut={this.highlight.bind(this, null)}>
		// 					<span className="fas fa-fire insert-button-icon"></span>
		// 				</div>
		// 			</div>
		// 			<div className="insert-panel insert-column-2">
		// 				<div
		// 					className="insert-button insert-emoji"
		// 					onMouseOver={this.highlight.bind(this, "emoji")}
		// 					onMouseOut={this.highlight.bind(this, null)}>
		// 					<span className="fas fa-smile insert-button-icon"></span>
		// 				</div>
		// 				<div
		// 					className="insert-button insert-video"
		// 					onMouseOver={this.highlight.bind(this, "video")}
		// 					onMouseOut={this.highlight.bind(this, null)}>
		// 					<span className="fas fa-video insert-button-icon"></span>
		// 				</div>
		// 			</div>
		// 			<div className="insert-panel insert-column-3">
		// 				<div
		// 					className="insert-button discard-post"
		// 					onMouseOver={this.highlight.bind(this, "discard")}
		// 					onMouseOut={this.highlight.bind(this, null)}>
		// 					<span className="fas fa-trash insert-button-icon"></span>
		// 				</div>
		// 				<div
		// 					className="insert-button save-post"
		// 					onMouseOver={this.highlight.bind(this, "save")}
		// 					onMouseOut={this.highlight.bind(this, null)}>
		// 					<span className="fas fa-save insert-button-icon"></span>
		// 				</div>
		// 			</div>
		// 			<div className="insert-highlight">
		// 				<p className="highlight-text">
		// 					{insertHighlight}
		// 				</p>
		// 			</div>
		// 		</div>
		// 	</div>
		// }

		// // Build balances panel
		// let balanceHighlight;
		// switch (this.getState("highlight")) {
		// 	case ("pod"):
		// 		balanceHighlight = <span className="pod-text">
		// 			pay with POD only
		// 		</span>
		// 		break;
		// 	case ("podaud"):
		// 		balanceHighlight = <span>
		// 			<span className="pod-text">pay with POD, </span>
		// 			<span className="aud-text">then AUD</span>
		// 		</span>
		// 		break;
		// 	case ("audpod"):
		// 		balanceHighlight = <span>
		// 			<span className="aud-text">pay with AUD, </span>
		// 			<span className="pod-text">then POD</span>
		// 		</span>
		// 		break;
		// 	case ("aud"):
		// 		balanceHighlight = <span className="aud-text">
		// 			pay with AUD only
		// 		</span>
		// 		break;
		// 	default:
		// 		balanceHighlight = "";
		// }
		// let balanceCard;
		// if (this.getState("focus")) {
		// 	balanceCard = <div className="input-support balance-card card">
		// 		<div className="balance-panel">
		// 			<p className="balance-title pod-title">
		// 				<span className="balance-title-text">POD</span>
		// 			</p>
		// 			<p className="balance-number pod-balance">
		// 				<span className="balance-number-text">
		// 					{0}
		// 				</span>
		// 			</p>
		// 			<div className="pay-button-panel">
		// 				<div
		// 					className="pay-button pay-button-pod"
		// 					onMouseOver={this.highlight.bind(this, "pod")}
		// 					onMouseOut={this.highlight.bind(this, null)}>
		// 					<span className="fas fa-circle pay-icon-pod pay-button-icon"></span>
		// 				</div>
		// 				<div
		// 					className="pay-button pay-button-podaud"
		// 					onMouseOver={this.highlight.bind(this, "podaud")}
		// 					onMouseOut={this.highlight.bind(this, null)}>
		// 					<span className="fas fa-circle pay-button-icon pay-icon-aud pay-icon-right"></span>
		// 					<span className="fas fa-dot-circle pay-button-icon pay-icon-pod pay-icon-left"></span>
		// 				</div>
		// 			</div>
		// 		</div>
		// 		<div className="balance-panel">
		// 			<p className="balance-title aud-title">
		// 				<span className="balance-title-text">AUD</span>
		// 			</p>
		// 			<p className="balance-number aud-balance">
		// 				<span className="balance-number-text">
		// 					{0}
		// 				</span>
		// 			</p>
		// 			<div className="pay-button-panel">
		// 				<div
		// 					className="pay-button pay-button-audpod"
		// 					onMouseOver={this.highlight.bind(this, "audpod")}
		// 					onMouseOut={this.highlight.bind(this, null)}>
		// 					<span className="fas fa-circle pay-button-icon pay-icon-pod pay-icon-right"></span>
		// 					<span className="fas fa-dot-circle pay-button-icon pay-icon-aud pay-icon-left"></span>	
		// 				</div>
		// 				<div
		// 					className="pay-button pay-button-aud"
		// 					onMouseOver={this.highlight.bind(this, "aud")}
		// 					onMouseOut={this.highlight.bind(this, null)}>
		// 					<span className="fas fa-circle pay-button-icon pay-icon-aud"></span>
		// 				</div>
		// 			</div>
		// 		</div>
		// 		<div className="balance-highlight">
		// 			<p className="highlight-text">
		// 				{balanceHighlight}
		// 			</p>
		// 		</div>
		// 	</div>
		// }

		// Build post validation
		//TODO - Allow users to "ignore" a validation
		//		 failure and have the associated reference
		//		 just be treated like normal text
		//TODO - Allow users to create topics directly from
		//		 a failed-topic-validation notification
		const validation = this.getState("references")
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

				// Build notifications
				let notif;
				switch (r.get("type")) {

					// Surface mention validation
					case ("mention"):
						if (r.get("valid") === "pending") {
							notif = <Notify
								key={r.get("id")}
								stage="pending"
								title={<span className="fas fa-at notif-glyph"></span>}
								msg={<span>
									Validating User <strong>{r.get("id")}</strong>
								</span>}
								color={Settings.colors.darkGrey}
							/>
						} else if (r.get("valid") === "passed") {
							notif = <Notify
								key={r.get("id")}
								stage="passed"
								title={<span className="fas fa-at notif-glyph"></span>}
								msg={<span>
									Found user <strong>{r.get("id")}</strong>
								</span>}
								color={Settings.colors.green}
							/>
						} else {
							notif = <Notify
								key={r.get("id")}
								stage="failed"
								title={<span className="fas fa-at notif-glyph"></span>}
								msg={<span>
									User <strong>{r.get("id")}</strong> not found
								</span>}
								color={Settings.colors.red}
							/>
						} 
						break;

					// Surface Topic validation
					case ("topic"):
						if (r.get("valid") === "pending") {
							notif = <Notify
								key={r.get("id")}
								stage="pending"
								title={<span className="fas fa-hashtag notif-glyph"></span>}
								msg={<span>
									Validating Topic <strong>{r.get("id")}</strong>
								</span>}
								color={Settings.colors.darkGrey}
							/>
						} else if (r.get("valid") === "passed") {
							notif = <Notify
								key={r.get("id")}
								stage="passed"
								title={<span className="fas fa-hashtag notif-glyph"></span>}
								msg={<span>
									Found topic <strong>{r.get("id")}</strong>
								</span>}
								color={Settings.colors.tan}
							/>
						} else {
							notif = <Notify
								key={r.get("id")}
								stage="failed"
								title={<span className="fas fa-hashtag notif-glyph"></span>}
								msg={<span>
									Topic <strong>{r.get("id")}</strong> not found
								</span>}
								color={Settings.colors.red}
							/>
						}
						break;

					// Surface Link validation
					case ("link"):
						if (r.get("valid") === "pending") {
							notif = <Notify
								key={r.get("id")}
								stage="pending"
								title={<span className="fa fa-link notif-glyph"></span>}
								msg={<span>
									Validating URL <strong>{r.get("id")}</strong>
								</span>}
								color={Settings.colors.darkGrey}
							/>
						} else if (r.get("valid") === "passed") {
							notif = <Notify
								key={r.get("id")}
								stage="passed"
								title={<span className="fa fa-link notif-glyph"></span>}
								msg={<span>
									Found URL <strong>{r.get("id")}</strong>
								</span>}
								color={Settings.colors.blue}
							/>
						} else {
							notif = <Notify
								key={r.get("id")}
								stage="failed"
								title={<span className="fa fa-link notif-glyph"></span>}
								msg={<span>
									URL <strong>{r.get("id")}</strong> does not exist
								</span>}
								color={Settings.colors.red}
							/>
						}
						break;

					default:
						notif = null;

				}
				return notif;
			})
			.filter(n => n)
			.toList();

		const inputClass = (this.getState("focus") ||
			                this.getState("raw") !== "") ?
			" post-input-open" :
			" post-input-closed";
		const validationClass = (validation.size > 0) ?
			" post-input-with-validations" : "";

		// Calculate border color
		let borderClass = "";
		let buttonClass = "";
		let borderClassVal = "";
		if (this.getState("valid") === "failed") {
			borderClass = " post-input-border-failed"
			buttonClass = " post-input-button-failed"
		} else if (this.getState("valid") === "passed") {
			borderClass = " post-input-border-passed"
			buttonClass = " post-input-button-passed"
		} else {
			borderClass = " post-input-border-pending"
			buttonClass = " post-input-button-pending"
		}
		if (validation.size === 0) {
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
		const costOffset = (validation.size > 0) ? ((validation.size * -2.5) - 0.15) : 0;
		const footer = <div className="post-input-footer">
			<p
				className="post-input-cost"
				style={{transform: "translate(0," + costOffset + "em)"}}>
				{this.getState("cost")} <span className="fa fa-coins post-input-cost-icon"></span>
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
					dangerouslySetInnerHTML={{ __html: content }}>
				</div>
				<div className={"post-validation-box" +
						borderClass + borderClassVal}>
					{validation}
				</div>
				{(this.getState("focus") || this.getState("raw") !== "") ?
					footer : null}
				{this.getState("sending") ?
					<div className="post-input-loading-mask" />
					: null
				}
			</div>
		)

	}


	componentWillUnmount () {

		// Kill hider timer when send box removed externally
		if (this.getState("hider")) {
			clearTimeout(this.getState("hider"));
		}

		//TODO - Save to drafts

	}


}

export default Send;
