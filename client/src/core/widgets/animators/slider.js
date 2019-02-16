import React from 'react';
import ImmutableComponent from '../immutableComponent';

import { isEqual, pick } from 'lodash';



const anims = ["timeIn", "timeOut", "time", "delayIn", "delayOut", "delay"]

class Slider extends ImmutableComponent {

	constructor() {
		super({
			on: {},
			off: {},
			ready: false
		})
	}


	immutableDidMount() {
		this.setAnimation()
	}

	componentDidUpdate(lastProps) {
		if (!isEqual(pick(lastProps, ...anims), pick(this.props, ...anims))) {
			this.setAnimation()
		}
	}


	setAnimation() {

		// Unpack props
		const timeIn = (this.props.timeIn === 0) ? 0 : this.props.timeIn || this.props.time || 1;
		const timeOut = (this.props.timeOut === 0) ? 0 : this.props.timeOut || timeIn;
		const delayIn = (this.props.delayIn === 0) ? 0 : this.props.delayIn || this.props.delay || 0;
		const delayOut = (this.props.delayOut === 0) ? 0 : this.props.delayOut || delayIn;

		this.updateState(state => state
			.set("off", {
				position: this.props.position || "absolute",
				transform: `translate(${this.props.offset.x}rem, ${this.props.offset.y}rem)`,
				transition: `transform ${timeIn}s ease-in ${delayIn}s`
			})
			.set("on", {
				position: this.props.position || "absolute",
				transform: `translate(0rem, 0rem)`,
				transition: `transform ${timeOut}s ease-out ${delayOut}s`
			})
			.set("ready", true)
		)

	}


	render() {

		const show = (this.props.show === undefined) ?
			this.ready : this.props.show

		return (
			<div
				className="slider"
				style={this.getState("ready") ?
					(show ? this.getState("on") : this.getState("off"))
					: null
				}>
				<div className="slider-children">
					{this.props.children}
				</div>
			</div>
		)

	}


}

export default Slider;
