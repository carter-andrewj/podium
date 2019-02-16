import React from 'react';
import ImmutableComponent from '../immutableComponent';

import { Map, is } from 'immutable';



class Toggle extends ImmutableComponent {

	constructor() {
		super({
			on: false,
			highlight: false,
			caption: "",
			captionStyle: {},
			captionText: {},
			style: {},
			highlightStyle: {}
		})
	}

	componentWillMount() {
		this.setStyles()
	}

	componentDidUpdate(lastProps) {
		if (!is(Map(lastProps), Map(this.props))) {
			this.setStyles()
		}
	}

	setStyles() {

		// Unpack props
		const on = this.props.on || this.getState("on");
		const captionLoc = this.props.captionLocation || "left"
		const captionOffset = 0.4 + (this.props.captionOffset || 0)
		const color = this.props.color || "var(--dark-grey)"
		const background = this.props.background || "white"

		// Set scale
		const scale = this.props.size || 1.8
		const size = `${scale}rem`
		const fontsize = `${Math.floor((scale / 1.8) * 80.0)}%`

		// Build styles
		let align;
		let translate;
		switch (captionLoc) {

			default: // i.e. Left
				align = "right"
				translate = `translate(-${captionOffset}rem,0)`
				break;

			case ("right") :
				align = "left"
				translate = `translate(${captionOffset}rem,0)`
				break;

			case ("top"):
				align = "bottom"
				translate = `translate(0,-${captionOffset}rem)`
				break;

			case ("bottom"):
				align = "top"
				translate = `translate(0,${captionOffset}rem)`
				break;

		}

		// Set styles
		this.updateState(state => state

			// Set toggle on/off
			.set("on", on)
			.set("caption", on ?
				this.props.captionOn : this.props.captionOff)

			// Set normal button style when off
			.setIn(["styleOff", "color"], color)
			.setIn(["styleOff", "background"],
				this.props.transparent ? "transparent" : background)
			.setIn(["styleOff", "borderColor"],
				this.props.transparent ? "transparent" : background)
			.setIn(["styleOff", "width"], size)
			.setIn(["styleOff", "height"], size)
			.setIn(["styleOff", "lineHeight"], size)

			// Set normal button style when on
			.setIn(["styleOn", "color"], background)
			.setIn(["styleOn", "background"], color)
			.setIn(["styleOn", "borderColor"],
				this.props.transparent ? "transparent" : background)
			.setIn(["styleOn", "width"], size)
			.setIn(["styleOn", "height"], size)
			.setIn(["styleOn", "lineHeight"], size)

			// Set highlight style when off
			.setIn(["highlightStyleOff", "color"], background)
			.setIn(["highlightStyleOff", "background"], color)
			.setIn(["highlightStyleOff", "borderColor"], color)
			.setIn(["highlightStyleOff", "width"], size)
			.setIn(["highlightStyleOff", "height"], size)
			.setIn(["highlightStyleOff", "lineHeight"], size)

			// Set highlight style when on
			.setIn(["highlightStyleOn", "color"], color)
			.setIn(["highlightStyleOn", "background"], background)
			.setIn(["highlightStyleOn", "borderColor"], color)
			.setIn(["highlightStyleOn", "width"], size)
			.setIn(["highlightStyleOn", "height"], size)
			.setIn(["highlightStyleOn", "lineHeight"], size)

			// Set caption style
			.setIn(["captionStyle", captionLoc], 0)
			.setIn(["captionStyle", "color"], color)
			.setIn(["captionStyle", "transform"], translate)

			// Set caption text style
			.setIn(["captionText", align], 0)
			.setIn(["captionText", "fontSize"], fontsize)

		)

	}


	on() {
		this.updateState(
			state => state.set("on", true),
			() => setTimeout(
				() => this.updateState(state => state
					.set("caption", this.props.captionOn)
				),
				200
			)
		)
	}

	off() {
		this.updateState(
			state => state.set("on", false),
			() => setTimeout(
				() => this.updateState(state => state
					.set("caption", this.props.captionOff)
				),
				200
			)
		)
	}


	highlight() {
		this.updateState(state => state.set("highlight", true))
	}

	unlight() {
		this.updateState(state => state.set("highlight", false))
	}


	click(event) {
		if (event) {
			event.preventDefault()
			event.stopPropagation()
		}
		if (this.getState("on")) {
			this.off()
			this.unlight()
			this.props.toggleOff()
		} else {
			this.on()
			this.unlight()
			this.props.toggleOn()
		}
	}


	render() {
		return (
			<div
				className="button"
				style={this.getState("on") ?
					(this.getState("highlight") ?
						this.getState("highlightStyleOn").toJS() :
						this.getState("styleOn").toJS())
					:
					(this.getState("highlight") ?
						this.getState("highlightStyleOff").toJS() :
						this.getState("styleOff").toJS())
				}
				onMouseEnter={() => this.highlight()}
				onMouseLeave={() => this.unlight()}
				onClick={event => this.click(event)}>

				<div style={{
						transform: `scale(${(this.props.size || 1.8) / 1.8}`
					}}>
					{this.props.children}
					{(this.getState("on") && this.getState("highlight")) ?
						this.props.childrenOff : this.props.childrenOn}
				</div>

				{this.getState("caption") ?
					<div
						className={this.getState("highlight") ?
							"button-caption button-caption-on" :
							"button-caption button-caption-off"}
						style={this.getState("captionStyle").toJS()}>
						<p
							className="button-caption-text"
							style={this.getState("captionText").toJS()}>
							{this.getState("caption")}
						</p>
					</div>
					: null
				}
			</div>
		);
	}
}

export default Toggle;
