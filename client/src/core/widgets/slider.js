import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';
import { isEqual, pick } from 'lodash';





class Slider extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				opacity: 0,
				start: "",
				end: "",
				enter: null,
				exit: null,
				transform: null,
				transition: 0,
				timer: null,
				linger: 0
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
			.then(() => setTimeout(
				() => this.slideIn(),
				10
			))
	}


	setAnimation() {
		return new Promise(resolve => {

			// Calculate slide offset
			let x = 0;
			let y = 0;
			const box = this.box.getBoundingClientRect();
			switch (this.props.direction) {
				case ("left"):
					x = -1.1 * (box.width + box.left);
					break;
				case ("right"):
					x = 1.1 * box.right;
					break;
				case ("top"):
					y = -1.1 * (box.height + box.top);
					break;
				case ("bottom"):
					y = 1.1 * box.bottom;
					break;
				default:
					throw new Error("Unknown slider direction: " +
						this.props.direction)
			}

			// Unpack props
			const timeIn = (this.props.timeIn === 0) ? 0 : this.props.timeIn || this.props.time || 1;
			const timeOut = (this.props.timeOut === 0) ? 0 : this.props.timeOut || timeIn;
			const delayIn = (this.props.delayIn === 0) ? 0 : this.props.delayIn || this.props.delay || 0;
			const delayOut = (this.props.delayOut === 0) ? 0 : this.props.delayOut || delayIn;
			const linger = this.props.linger || 0;

			// Move element offscreen and trigger entrance
			this.updateState(state => state
				.set("opacity", 1)
				.set("start", `translate(${x}px, ${y}px)`)
				.set("end", "translate(0px, 0px)")
				.set("transform", `translate(${x}px, ${y}px)`)
				.set("enter", `transform ${timeIn}s ease-out ${delayIn}s`)
				.set("exit", `transform ${timeOut}s ease-in ${delayOut}s`)
				.set("linger", (timeOut + delayOut + linger) * 1000),
				() => resolve()
			);

		})
	}


	slideIn() {
		this.updateState(state => state
			.set("transform", state.get("end"))
			.set("transition", state.get("enter"))
		)
	}

	slideOut() {
		this.updateState(state => state
			.set("transform", state.get("start"))
			.set("transition", state.get("exit"))
		)
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


	exit() {
		if (this.props.exit && !this.state.data.get("timer")) {
			this.slideOut()
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


	render() {
		return (
			<div 
				ref={ref => this.box = ref}
				style={{
					position: this.props.position || "absolute",
					top: 0,
					bottom: 0,
					left: 0,
					right: 0,
					pointerEvents: "none",
					opacity: this.state.data.get("opacity"),
					transform: this.state.data.get("transform"),
					transition: this.state.data.get("transition")
				}}>
				<div style={{ pointerEvents: "auto" }}>
					{this.props.children}
				</div>
			</div>
		);
	}


	componentWillUnmount() {
		clearTimeout(this.state.data.get("timer"));
	}


}

export default Slider;
