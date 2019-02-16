import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';



function hexToRGB(hex) {
	var c;
	if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
		c = hex.substring(1).split('');
		if (c.length === 3){
			c= [c[0], c[0], c[1], c[1], c[2], c[2]];
		}
		c = '0x' + c.join('');
        return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
    }
    throw new Error('Bad Hex');
}


class Notify extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				color: {}
			}))
		}
	}

	updateState(up, callback) {
		this.setState(
			({data}) => { return {data: up(data)} },
			callback
		);
	}

	setColors() {
		const rgb = hexToRGB(this.props.color);
		this.updateState(state => state
			.setIn(["color", "main"], "rgb(" + rgb.join(",") + ")")
			.setIn(["color", "bg"], "rgba(" + rgb.join(",") + ",0.2)")
		);
	}

	componentWillMount() {
		this.setColors();
	}

	componentDidUpdate(oldProps) {
		if (oldProps.msg !== this.props.msg) {
			this.setColors();
		}
	}

	render() {

		// Build stage glyph
		let stage;
		switch (this.props.stage) {

			case("pending"):
				stage = <span
					className="fa fa-spinner notif-icon notif-icon-pending">
				</span>
				break;

			case("failed"):
				stage = <span
					className="fa fa-exclamation notif-icon notif-icon-fail">
				</span>
				break;

			case("passed"):
				stage = <span
					className="fa fa-check notif-icon notif-icon-pass">
				</span>
				break;

			default:
				stage = "";

		}

		return (
			<div
				className="notif-card"
				style={{
					background: this.state.data.getIn(["color", "bg"]),
					color: this.state.data.getIn(["color", "main"])
				}}>
				<div
					className="notif-title"
					style={{
						background: this.state.data.getIn(["color", "main"])
					}}>
					<p className="notif-glyph-holder">
						{this.props.title}
					</p>
				</div>
				<div className="notif-message-holder">
					<p className="notif-message">{this.props.msg}</p>
				</div>
				<div
					className="notif-icon-holder"
					style={{
						color: this.state.data.getIn(["color", "main"])
					}}>
					{stage}
				</div>
			</div>
		);

	}
}

export default Notify;
