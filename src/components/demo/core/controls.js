import React, { Component } from 'react';
import '../../../App.css';


class Controls extends Component {

	constructor(props) {
		super()
		this.state = {

		}
		this.hoverStatus = this.hoverStatus.bind(this);
	}


	hoverStatus(target) {
		this.setState({
			highlight: target
		})
	}


	render() {

		let over = this.state.highlight;
		let ttOn = "menu-tooltip menu-tooltip-right menu-tooltip-on";
		let ttOff =  "menu-tooltip menu-tooltip-right menu-tooltip-off";

		return (
			<div ref="controls" className="menu menu-right">
				<div className="menu-bar menu-bar-right card">
					<div
						className="menu-box menu-box-right menu-box-top menu-box-top-right"
						onClick={this.props.setCoreMode.bind(this, "feed")}
						onMouseOver={this.hoverStatus.bind(this, "feed")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<div className="menu-top-holder">
							<i className="material-icons menu-icon">explore</i>
							<div className={(over === "feed") ? ttOn : ttOff}>
								<p className="menu-tooltip-text">feed</p>
							</div>
						</div>
					</div>
					<div
						className="menu-box menu-box-right"
						onClick={this.props.setCoreMode.bind(this, "users")}
						onMouseOver={this.hoverStatus.bind(this, "users")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className="material-icons menu-icon">search</i>
						<div className={(over === "users") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">people</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-right"
						onClick={this.props.setCoreMode.bind(this, "topics")}
						onMouseOver={this.hoverStatus.bind(this, "topics")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<span className="fa fa-hashtag menu-icon"></span>
						<div className={(over === "topics") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">topics</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-right"
						onClick={this.props.setCoreMode.bind(this, "rulebook")}
						onMouseOver={this.hoverStatus.bind(this, "rulebook")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className="material-icons menu-icon">book</i>
						<div className={(over === "rulebook") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">rulebook</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-right"
						onClick={this.props.setCoreMode.bind(this, "settings")}
						onMouseOver={this.hoverStatus.bind(this, "settings")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className="material-icons menu-icon">settings</i>
						<div className={(over === "settings") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">settings</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-right"
						onClick={this.props.setCoreMode.bind(this, "help")}
						onMouseOver={this.hoverStatus.bind(this, "help")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className="material-icons menu-icon">help</i>
						<div className={(over === "help") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">help</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-right"
						onClick={this.props.signOut}
						onMouseOver={this.hoverStatus.bind(this, "sign-out")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className="material-icons menu-icon">exit_to_app</i>
						<div className={(over === "sign-out") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">sign-out</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

}

export default Controls;