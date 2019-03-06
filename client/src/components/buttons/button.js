import React from 'react';
import ImmutableComponent from '../immutableComponent';

import { Map, is } from 'immutable';



class Button extends ImmutableComponent {

	constructor() {
		super({
			highlight: false,
			caption: {},
			captionText: {},
			style: {},
			highlightStyle: {}
		})
	}

	immutableComponentWillMount() {
		this.setStyles()
	}

	immutableComponentDidUpdate(lastProps) {
		if (!is(Map(lastProps), Map(this.props))) {
			this.setStyles()
		}
	}

	setStyles() {

		// Unpack props
		const captionLoc = this.props.captionLocation || "left"
		const captionOffset = 0.4 + (this.props.captionOffset || 0)
		const color = this.props.color || "var(--dark-grey)"
		const highlight = this.props.highlight || color
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

			// Set normal button style
			.setIn(["style", "color"],
				!this.props.filled ? color :
					this.props.transparent ? "transparent" :
						background)
			.setIn(["style", "background"],
				this.props.filled ? color :
					this.props.transparent ? "transparent" :
						background)
			.setIn(["style", "borderColor"],
				this.props.filled ? color :
					this.props.transparent ? "transparent" :
						background)
			.setIn(["style", "width"], size)
			.setIn(["style", "height"], size)
			.setIn(["style", "lineHeight"], size)

			// Set highlight style
			.setIn(["highlightStyle", "color"],
				this.props.filled ? highlight : background)
			.setIn(["highlightStyle", "background"],
				this.props.filled ? background : highlight)
			.setIn(["highlightStyle", "borderColor"], highlight)
			.setIn(["highlightStyle", "width"], size)
			.setIn(["highlightStyle", "height"], size)
			.setIn(["highlightStyle", "lineHeight"], size)

			// Set caption style
			.setIn(["caption", captionLoc], 0)
			.setIn(["caption", "color"], highlight)
			.setIn(["caption", "transform"], translate)
			.setIn(["caption", "lineHeight"], size)

			.setIn(["captionText", align], 0)
			.setIn(["captionText", "fontSize"], fontsize)

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
		this.props.onClick()
	}

	render() {
		const onoff = this.props.off ?
			{ pointerEvents: "none"} :
			this.props.disabled ?
				{ cursor : "not-allowed" } :
				{ cursor : "pointer" }
		return (
			<div
				className="button"
				style={{
					...onoff,
					...(this.props.style || {}),
					...(this.getState("highlight") ?
						this.getState("highlightStyle").toJS() :
						this.getState("style").toJS()
					)
				}}
				onMouseEnter={() => this.highlight()}
				onMouseLeave={() => this.unlight()}
				onClick={event => this.click(event)}>
				<div style={{
						transform: `scale(${(this.props.size || 1.8) / 1.8}`
					}}>
					{(this.getState("highlight") && this.props.highlightChildren) ?
						this.props.highlightChildren : this.props.children}
				</div>
				{this.props.caption ?
					<div
						className={this.getState("highlight") ?
							"button-caption button-caption-on" :
							"button-caption button-caption-off"}
						style={this.getState("caption").toJS()}>
						<p
							className="button-caption-text"
							style={this.getState("captionText").toJS()}>
							{this.props.caption}
						</p>
					</div>
					: null
				}
			</div>
		);
	}
}

export default Button;
