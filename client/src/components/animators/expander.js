import React from 'react';
import ImmutableComponent from '../immutableComponent';

import { Map } from 'immutable';






class Expander extends ImmutableComponent {

	constructor() {
		super({
			on: {},
			off: {},
			show: false,
			active: false,
			wait: {
				on: 0,
				off: 0
			},
			timer: null
		})
	}


	immutableComponentDidMount() {
		this.setAnimation()
	}

	immutableComponentDidUpdate(lastProps, lastState) {
		const height = this.pending.offsetHeight;
		if (this.ready && !this.getState("show") &&
				!this.getState("active") && height > 100) {
			this.updateState(state => state
				.set("active", true)
				.setIn(["on", "maxHeight"], `${height}px`)
				.set("timer", setTimeout(
					() => this.updateState(state => state
						.set("active", false)
						.set("show", true)
						.setIn(["on", "maxHeight"], "none")
					),
					1000 * this.getState("wait", this.getState("show") ? "on" : "off")
				))
			)
		}
	}


	setAnimation() {

		// Unpack props
		var timeIn = (this.props.timeIn === 0) ? 0 : this.props.timeIn || this.props.time || 1;
		var timeOut = (this.props.timeOut === 0) ? 0 : this.props.timeOut || timeIn;
		var delayIn = (this.props.delayIn === 0) ? 0 : this.props.delayIn || this.props.delay || 0;
		var delayOut = (this.props.delayOut === 0) ? 0 : this.props.delayOut || delayIn;

		timeIn = timeIn / 2.0
		timeOut = timeOut / 2.0
		delayIn = delayIn / 2.0
		delayOut = delayOut / 2.0

		this.updateState(state => state
			.set("off", Map({
				maxHeight: "0px",
				opacity: 0.0,
				transition:
					`max-height ${timeIn}s ease-in ${delayIn}s,` +
					`opacity ${timeIn}s ease-in ${delayIn + timeIn}s`,
				"--webkit-transition":
					`max-height ${timeIn}s ease-in ${delayIn}s,` +
					`opacity ${timeIn}s ease-in ${delayIn + timeIn}s`
			}))
			.set("on", Map({
				maxHeight: "100px",
				opacity: 1.0,
				transition:
					`max-height ${timeOut}s ease-in ${delayOut}s,` +
					`opacity ${timeOut}s ease-in ${delayOut + timeOut}s`,
				"--webkit-transition":
					`max-height ${timeOut}s ease-in ${delayOut}s,` +
					`opacity ${timeOut}s ease-in ${delayOut + timeOut}s`
			}))
			.setIn(["wait", "on"], 2.0 * 1.1 * (timeIn + delayIn))
			.setIn(["wait", "off"], 2.0 * 1.1 * (timeOut + delayOut))
		)

	}


	render() {

		const active = this.getState("active")
		const show = (this.props.show === undefined) ?
			this.ready : this.props.show

		return <div className="expander">
			<div
				className={active ?
					"expander-children expander-children-ignore" :
					"expander-children"
				}
				style={show ?
					this.getState("on").toJS() :
					this.getState("off").toJS()
				}>
				{this.props.children}
			</div>
			<div className="expander-pending">
				<div
					className="expander-children"
					ref={ref => this.pending = ref}>
					{this.props.children}
				</div>
			</div>
		</div>

	}


	immutableComponentDidUnmount() {
		clearTimeout(this.getState("timer"))
	}


}

export default Expander;
