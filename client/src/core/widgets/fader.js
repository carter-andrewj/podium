import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';
import { isEqual, pick } from 'lodash';





class Fader extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				opacity: 0,
				enter: null,
				exit: null,
				linger: 0,
				timer: null
			}))
		}
	}


	updateState(up, callback) {
		this.setState(
			({data}) => { return { data: up(data) } },
			callback
		);
	}


	componentDidMount() {
		this.setAnimation()
			.then(() => this.fadeIn())
	}


	setAnimation() {
		return new Promise(resolve => {

			// Unpack props
			const timeIn = (this.props.timeIn === 0) ? 0 : this.props.timeIn || this.props.time || 1;
			const timeOut = (this.props.timeOut === 0) ? 0 : this.props.timeOut || timeIn;
			const delayIn = (this.props.delayIn === 0) ? 0 : this.props.delayIn || this.props.delay || 0;
			const delayOut = (this.props.delayOut === 0) ? 0 : this.props.delayOut || delayIn;
			const linger = this.props.linger || 0;

			// Store animation state
			this.updateState(state => state
				.set("opacity", 0)
				.set("enter", `opacity ${timeIn}s ease-in-out ${delayIn}s`)
				.set("exit", `opacity ${timeOut}s ease-in-out ${delayOut}s`)
				.set("linger", (timeOut + delayOut + linger) * 1000),
				() => resolve()
			);

		})
	}


	fadeIn() {
		this.updateState(state => state
			.set("opacity", 1)
			.set("transition", state.get("enter"))
		)
	}

	fadeOut() {
		this.updateState(state => state
			.set("opacity", 0)
			.set("transition", state.get("exit"))
		)
	}


	exit() {
		if (this.props.exit && !this.state.data.get("timer")) {
			this.fadeOut()
			this.updateState(state => state
				.set("timer", setTimeout(
					() => {
						if (this.props.onExit) {
							this.props.onExit()
						}
					},
					this.state.data.get("linger") + 100
				))
			)
		}
	}


	componentDidUpdate(lastProps) {
		const anims = ["timeIn", "timeOut", "time",
			"delayIn", "delayOut", "delay", "linger"];
		if (!isEqual(pick(lastProps, ...anims), pick(this.props, ...anims))) {
			this.setAnimation()
				.then(() => this.exit())
		} else {
			this.exit()
		}
	}


	render() {
		return (
			<div style={{
					opacity: this.state.data.get("opacity"),
					transition: this.state.data.get("transition"),
				}}>
				{this.props.children}
			</div>
		);
	}


	componentWillUnmount() {
		clearTimeout(this.state.data.get("timer"));
	}


}

export default Fader;
