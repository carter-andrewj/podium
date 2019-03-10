import React from 'react';
import ImmutableComponent from '../immutableComponent';

import { isEqual, pick } from 'lodash';

import Config from 'config';




const anims = ["offset", "timeIn", "timeOut", "time", "delayIn", "delayOut", "delay"]


class Slider extends ImmutableComponent {

	constructor() {
		super({
			on: {},
			off: {},
			active: false,
			wait: {
				on: 0,
				off: 0
			},
			timer: null,
			ready: false
		})
	}


	immutableComponentDidMount() {
		this.setAnimation()
	}


	immutableComponentDidUpdate(lastProps, lastState) {

		// Update animation properties
		if (!isEqual(pick(lastProps, ...anims), pick(this.props, ...anims))) {
			this.setAnimation()
		}

		// Ignore mouse events during transition
		if (lastProps.show !== this.props.show ||
				(this.props.show === undefined &&
					this.ready !== lastState.get("_ready"))) {
			this.updateState(state => state
				.set("active", true)
				.set("timer", setTimeout(
					() => this.updateState(state => state.set("active", false)),
					1000 * this.getState("wait", (this.props.show) ? "on" : "off")
				))
			)
		}
		
	}


	setAnimation() {

		// Unpack props
		const timeIn = this.props.timeIn || this.props.time || Config.timings.transition;
		const timeOut = this.props.timeOut || this.props.time || Config.timings.transition;
		const delayIn = this.props.delayIn || this.props.delay || 0;
		const delayOut = this.props.delayOut || this.props.delay || 0;
		const units = this.props.units || "rem"

		this.updateState(state => state
			.set("off", {
				transform: `translate(${this.props.offset.x}${units}, ${this.props.offset.y}${units})`,
				transition: `transform ${timeOut}s ease-in ${delayOut}s`,
				"--webkit-transition": `transform ${timeOut}s ease-in ${delayOut}s`
			})
			.set("on", {
				transform: `translate(0${units}, 0${units})`,
				transition: `transform ${timeIn}s ease-out ${delayIn}s`,
				"--webkit-transition": `transform ${timeIn}s ease-out ${delayIn}s`
			})
			.setIn(["wait", "off"], 1.1 * (timeOut + delayOut))
			.setIn(["wait", "on"], 1.1 * (timeIn + delayIn))
			.set("ready", true)
		)

	}


	render() {

		const active = this.getState("active")
		const show = (this.props.show === undefined) ?
			(this.ready && !this.props.exit) : this.props.show

		return (
			<div
				className="slider"
				style={this.getState("ready") ?
					(show ? this.getState("on") : this.getState("off"))
					: { opacity: 0 }
				}>
				<div className={active ?
						"slider-children anim-ignore" :
						"slider-children anim-respond"
					}>
					{this.props.children}
				</div>
			</div>
		)

	}


	immutableComponentDidUnmount() {
		clearTimeout(this.getState("timer"))
	}


}

export default Slider;
