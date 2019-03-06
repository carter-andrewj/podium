import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import { Map, Set, fromJS } from 'immutable';

import { postCost } from '@carter_andrewj/podix/lib/utils';

import { getCaretWithin, markupPost } from 'utils';

import PostHeader from './postHeader';
import Validator from './validator';

import Button from '../../components/buttons/button';
import MiniLoader from '../../components/miniLoader';


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
	focus: false,
	updated: false,
	sending: false,
	sent: false,
	highlight: false,
	valid: "pending",
	caret: emptyCaret,
	references: {},
	mentions: {},
	hide: Set(),
	ignore: Set(),
	placeholder: "",
	inputRef: null
}


const refOrder = {
	"mention": 0,
	"topic": 1,
	"link": 2
}


let timer;

class Send extends ImmutableComponent {

	constructor() {

		super(defState)

		this.highlight = this.highlight.bind(this)
		this.unlight = this.unlight.bind(this)

		this.focus = this.focus.bind(this)
		this.blur = this.blur.bind(this)

		this.keyDown = this.keyDown.bind(this)
		this.keyStroke = this.keyStroke.bind(this)

		this.updatePost = this.updatePost.bind(this)
		
		this.sendPost = this.sendPost.bind(this)

		this.hideReference = this.hideReference.bind(this)
		this.ignoreReference = this.ignoreReference.bind(this)

	}


	highlight() {
		this.updateState(state => state.set("highlight", true))
	}

	unlight() {
		this.updateState(state => state.set("highlight", false))
	}



	immutableComponentDidMount() {

		// Pass ref to parent
		if (this.props.innerRef) {
			this.props.innerRef(this.input)
		}

		// Set placeholder, if required
		this.updateState(state => state
			.set("placeholder", this.generatePlaceholder())
		)

	}


	generatePlaceholder() {
		if (this.props.replyingTo) {
			return "Reply"
		} else {
			return placeholders[
				Math.floor(Math.random() * placeholders.length)
			]
		}
	}




	// Catch new characters
	keyStroke(event) {
		event.preventDefault()
		this.updatePost(event.which)
	}


	// Catches caracters not reported by keyPressed event
	// (specifically backspace, tab, cursor-left, and cursor-right)
	keyDown(event) {
		let key;
		switch (event.which) {
			case 8:
				key = "backspace"
				break
			case 9:
				key = "tab"
				break
			case 37:
				key = "left"
				break
			case 39:
				key = "right"
				break
			default: return
		}
		if (key) {
			event.preventDefault()
			this.updatePost(key)
		}
	}


	paste(event) {
		event.preventDefault()
		const newText = event.clipboardData.getData('Text')
		if (newText && newText !== "") {
			this.updatePost("paste", newText)
		}
	}

	copy(event) {
		event.preventDefault()
		const text = window.getSelection()
			.toString()
			.replace(new RegExp(String.fromCharCode(8203), 'g'), "")
			.replace(/\n\n/g, "\r")
		navigator.clipboard.writeText(text)
	}

	cut(event) {
		this.copy(event)
		this.updatePost("backspace")
	}



	// Format post box content upon input
	updatePost(key, text = "") {

		// Get current post string
		let raw = this.getState("raw")
		var references = this.getState("references")
		const postKey = this.props.postKey

		// Get cursor and selection position
		let lines;
		let cursor;
		let selected;
		if (raw === "") {
			selected = 0;
			lines = 0;
			cursor = [0, 0];
		} else {
			const caretNow = getCaretWithin(this.input)
			selected = window.getSelection().toString().length
			lines = window.getSelection().toString().split("\n\n").length - 1
			cursor = [caretNow - selected, caretNow]
		}

		// Handle new keystroke, if required
		if (key) {

			// Handle keystroke
			let pos;
			switch (key) {

				// Paste
				case "paste":
					raw = raw.slice(0, cursor[0]) + text +
						raw.slice(cursor[1])
					cursor = [cursor[0] + text.length,
							  cursor[0] + text.length]
					break;

				// Backspace
				case "backspace":
					if (selected === 0) {
						cursor = [Math.max(0, cursor[0] - 1), cursor[0]]
					} else {
						cursor = [cursor[0] + (2 * lines), cursor[1]]
					}
					raw = raw.slice(0, cursor[0]) + raw.slice(cursor[1])
					cursor = [cursor[0], cursor[0]]
					break;

				// Tab
				case "tab":
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
				case "left":
					pos = Math.max(0, cursor[0] - 1);
					cursor = [pos, pos];
					break;

				// Cursor Right
				case "right":
					pos = Math.min(raw.length, cursor[1] + 1);
					cursor = [pos, pos];
					break;

				// For all other characters, add to text string at cursor position
				default:
					raw = raw.slice(0, cursor[0]) + String.fromCharCode(key) +
						raw.slice(cursor[1]);
					cursor = [cursor[0] + 1, cursor[0] + 1]

			}

		}

		// Update hidden and ignored references
		const newIgnored = this.getState("ignore")
			.filter(i => raw.split(i).length > 1)
			.toSet()
		const newHidden = this.getState("hide")
			.filter(h => raw.split(h).length > 1)
			.toSet()

		// Markup post
		const markup = markupPost(raw, newIgnored)

		// Deconstruct post references
		var oldrefs = Map({})
		var newrefs = Map({})
		if (raw !== this.getState("raw")) {
			markup
				.filter(w => w.reference)
				.forEach(w => {
					if (references.get(w.word) &&
							references.getIn([w.word, "valid"]) !== "pending") {
						oldrefs = oldrefs.set(w.word, references.get(w.word))
					} else {
						newrefs = newrefs.set(w.word, Map({
							id: w.word,
							type: w.type,
							valid: "pending"
						}))
					}
				})
			references = oldrefs.merge(newrefs)
		}

		// Construct post html from result
		let caret = emptyCaret;
		let html = [];
		let line = 0;
		let depth = 0;
		let caretStart = false;
		let caretEnd = false;
		for (let w = 0; w < markup.length; w++) {

			// Get this post word
			const word = markup[w];

			// Make word id
			const wordID = `post-${postKey}-item-${w}`

			// Detect cursor position
			if (depth <= cursor[0] && word.depth >= (cursor[0] - 1)) {
				caretStart = true
				caret = caret.set("start", Map({
					node: wordID,
					offset: cursor[0] - depth
				}))
			}
			if (depth <= cursor[1] && word.depth >= (cursor[1] - 1)) {
				caretEnd = true
				caret = caret.set("end", Map({
					node: wordID,
					offset: cursor[0] - depth
				}))
			}
			depth = word.depth;
			if (w === (markup.length - 1)) {
				if (!caretStart) {
					caret = caret.set("start", Map({
						node: wordID,
						offset: cursor[0] - depth
					}))
				}
				if (!caretEnd) {
					caret = caret.set("end", Map({
						node: wordID,
						offset: cursor[1] - depth
					}))
				}
			}

			// Handle references
			let postClasses = ""
			if (word.reference) {
				if (references.getIn([word.word, "valid"]) === "failed") {
					postClasses += "post-reference-fail "
				}
				if (references.getIn([word.word, "valid"]) === "pending") {
					postClasses += "post-reference-pending "
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
			if (word.word === " ") {
				postClasses += "post-whitespace "
			} else {
				postClasses += "post-notwhitespace "
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

		// Calculate post cost
		const cost = postCost(raw)

		// Store in state
		this.updateState(

			// Update state
			state => state
				.set("raw", raw)
				.set("caret", key ? caret : this.getState("caret"))
				.set("html", html.reduce((full, next) => full + next, ""))
				.set("cost", cost)
				.set("references", references)
				.set("ignore", newIgnored)
				.set("hide", newHidden)
				.set("updated", true),

			// And then validate any new references
			() => {
				clearTimeout(timer)
				timer = setTimeout(
					() => {
						newrefs.forEach((r) => {
							this.validateReference(r)
								.then(valid => {
									if (valid) {
										this.updateState(state =>
											state.setIn(
												["references", r.get("id"), "valid"],
												"passed"
											),
											this.updatePost
										)
									} else {
										this.updateState(state =>
											state.setIn(
												["references", r.get("id"), "valid"],
												"failed"
											),
											this.updatePost
										)
									}
								})
								.catch(console.error)
						})
					},
					1000
				)
			}

		)

	}


	async validateReference(ref) {
		return new Promise((resolve, reject) => {
			switch (ref.get("type")) {
				case ("mention"):
					this.validateMention(ref.get("id"))
						.then(result => {
							this.updatePost()
							resolve(result)
						})
						.catch(reject)
					break;
				case ("topic"):
					this.validateTopic(ref.get("id"))
						.then(result => {
							this.updatePost()
							resolve(result)
						})
						.catch(reject)
					break;
				case ("link"):
					this.validateLink(ref.get("id"))
						.then(result => {
							this.updatePost()
							resolve(result)
						})
						.catch(reject)
					break;
				default:
					resolve(false)
			}
		})
	}


	validateMention(target) {
		const id = target.substring(1, target.length)
		return new Promise((resolve, reject) => {
			this.props.podium
				.isUser(id)
				.then(result => {
					if (result) {
						this.updateState(
							state => state.setIn(["mentions", target], result),
							() => resolve(true)
						)
					} else {
						resolve(false)
					}
				})
				.catch(error => {
					console.error(error)
					resolve(false)
				})
		})
	}


	validateTopic(target) {
		const id = target.substring(1, target.length)
		return new Promise((resolve, reject) => {
			resolve(true || id)
		});
	}


	validateLink(url) {
		return new Promise((resolve, reject) => {
			//TODO - Validate URLs
			resolve(true)
		});
	}


	hideReference(target) {
		this.updateState(
			state => state.update("hide", h => h.add(target)),
			this.updatePost
		)
	}


	ignoreReference(target) {
		this.updateState(
			state => state
				.update("ignore", i => i.add(target))
				.update("hide", h => h.add(target)),
			this.updatePost
		)
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
			const ignore = this.getState("ignore")
			const referenceMap = this.getState("references")
				.filter(ref => !ignore.includes(ref.get("id")))
			const references = Map({
				"mentions": referenceMap
					.filter(r => r.get("type") === "mention")
					.map(r => this.getState("mentions", r.get("id")))
					.toList()
			})
			const parent = this.props.replyingTo ? this.props.replyingTo.address : null

			// Dispatch post to radix net
			this.props
				.sendPost(content, references, parent)
				.then(() => {
					this.input.blur()
					this.updateState(
						state => state
							.set("references", Map())
							.set("sending", false)
							.set("sent", true),
						() => {
							this.props.unlock()
							this.props.hide(true)
							setTimeout(
								() => this.updateState(state => state
									.merge(fromJS(defState))
									.set("placeholder", this.generatePlaceholder())
								),
								500
							)
						}
					)
				})
				.catch(error => {
					console.error(error)
					//TODO - Handle failed sending
				});

		}

	}


	immutableComponentDidUpdate(lastProps, lastState) {

		// Place cursor if send box is focussed
		if (this.getState("focus") && this.getState("updated")) {
			let range = document.createRange();
			let sel = window.getSelection();
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
			this.updateState(state => state.set("updated", false))
		}

		// Validate post
		const ignore = this.getState("ignore")
		const valid = (this.getState("raw") === "") ?
			"pending" : 
			this.getState("references")
				.filter(ref => !ignore.includes(ref.get("id")))
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
			)
		}

	}


	focus() {
		if (!this.getState("sending")) {
			this.updateState(state => state.set("focus", true))
			this.props.lock()
		}
	}

	blur() {
		this.updateState(state => state.set("focus", false))
		if (this.getState("raw") === "") {
			this.props.unlock()
		}
	}


	render() {

		// Build post content
		let content;
		if (!(this.getState("focus")) && this.getState("raw") === "") {
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
		//TODO - Allow users to create topics directly from
		//		 a failed-topic-validation notification
		var validations = this.getState("references")
			.filter(r => !this.getState("hide").includes(r.get("id")))
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
			.map(r => {
				switch (r.get("type")) {

					// Surface mention validation
					case ("mention"):
						return <Validator
							key={`validator-mention-${r.get("id")}`}
							icon="at"
							color="var(--green)"
							subjectType="user"
							subject={r.get("id")}
							status={r.get("valid")}
							ignore={this.ignoreReference.bind(this)}
							hide={this.hideReference.bind(this)}
						/>

					case ("topic"):
						return <Validator
							key={`validator-topic-${r.get("id")}`}
							icon="hashtag"
							color="var(--tan)"
							subjectType="topic"
							subject={r.get("id")}
							status={r.get("valid")}
							ignore={this.ignoreReference.bind(this)}
							hide={this.hideReference.bind(this)}
						/>

					// Surface Link validation
					case ("link"):
						return <Validator
							key={`validator-link-${r.get("id")}`}
							icon="link"
							color="var(--blue)"
							subjectType="URL"
							subject={r.get("id")}
							status={r.get("valid")}
							ignore={this.ignoreReference.bind(this)}
							hide={this.hideReference.bind(this)}
						/>

					default:
						return null

				}
			})
			.toSet()

		// Validate cost
		const remainder = this.props.balance - this.getState("cost")
		const solvent = remainder > 0
		const rich = remainder > 100
		if (this.props.balance && this.getState("cost") > 0 &&
				this.getState("cost") > this.props.balance) {
			validations = validations.unshift(<Validator
				key="validator-cost"
				icon="pen-nib"
				color="var(--red)"
				status="cost"
			/>)
		}

		const open = this.props.open
		const valid = (remainder < 0) ? "failed" : this.getState("valid")
		const sending = this.getState("sending")
		const filled = this.getState("raw") !== ""
		const reply = this.props.replyingTo ? true : false
		const highlight = this.props.highlight || this.getState("highlight")

    	// Render
		return (
			<div
				className="newpost-container"
				onMouseEnter={this.highlight.bind(this)}
				onMouseLeave={this.unlight.bind(this)}
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
							<p className={
								!solvent ? "newpost-cost newpost-cost-red" :
								!rich ? "newpost-cost newpost-cost-amber" :
									"newpost-cost"
								}>
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
								caption="emote"
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

				<div className={"newpost-send-button newpost-send-button-" +
						`${reply ? "reply" : "main"}-${open ? "open" : "closed"}`}>
					<Button
						style={!reply ?
							{ borderRadius: "0 0 1.2rem 0" } :
							{}
						}
						color={
							(!open && !highlight) ? "var(--grey)" :
							(valid === "pending") ? "var(--dark-grey)" :
							(valid === "failed") ? "var(--red)" :
								"var(--green)"
						}
						caption={
							(valid === "failed") ? "" :
							(valid === "pending" && open && filled) ? "validating..." :
							!filled ? "" :
							reply ? "reply" :
								"send"
						}
						filled={open}
						disabled={(valid !== "passed")}
						transparent={!open}
						size={2.2}
						captionLocation="right"
						captionOffset={0.8}
						onClick={() => this.sendPost()}>
						{((valid === "pending" && filled) || sending) ?
							<MiniLoader color="white" /> :
							(valid === "failed") ?
								<i className="fas fa-ban button-icon" /> :
								reply ?
									<i className="fas fa-reply button-icon" /> :
									<i className="fas fa-comment button-icon" />
								
						}
					</Button>
				</div>

				<div className={"newpost-input-holder newpost-input-holder-" +
						`${reply ? "reply" : "main"}-${open ? "open" : "closed"}`}>
					<div

						key={`sendpost-${reply ? this.props.replyingTo.address : "main"}`}
						id={`sendpost-${reply ? this.props.replyingTo.address : "main"}`}
						ref={ref => this.input = ref}

						className={open ?
							"newpost-input newpost-input-open" :
							(this.getState("sent") ?
								"newpost-input newpost-input-sent" :
								"newpost-input newpost-input-closed"
							)
						}

						contentEditable="true"
						suppressContentEditableWarning={true}

						onFocus={this.focus.bind(this)}
						onBlur={this.blur.bind(this)}

						onKeyDown={this.keyDown.bind(this)}
						onKeyPress={this.keyStroke.bind(this)}

						onCopy={this.copy.bind(this)}
						onCut={this.cut.bind(this)}
						onPaste={this.paste.bind(this)}
						
						dangerouslySetInnerHTML={{ __html: content }}

					/>
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
							this.props.unlock()
							this.input.blur()
						}}
					/>
					: null
				}

			</div>

		)

	}



}

export default Send;
