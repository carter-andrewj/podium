import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';




class Status extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				highlight: "none"
			}))
		}
		this.hoverStatus = this.hoverStatus.bind(this);
	}

	updateState(up, callback) {
		this.setState(
			({data}) => { return {data: up(data)} },
			callback
		);
	}

	hoverStatus(target) {
		this.updateState(state => state
			.set("highlight", target)
		);
	}

	render() {

		const user = this.props.user;

		let over = this.state.data.get("highlight");
		let ttOn = "menu-tooltip menu-tooltip-left menu-tooltip-on";
		let ttOff =  "menu-tooltip menu-tooltip-left menu-tooltip-off";
		let numOn = "status-number-holder status-number-on";
		let numOff = "status-number-holder status-number-off";

		return (
			<div ref="status" className="menu menu-left">
				<div className="menu-bar menu-bar-left card">
					<div
						className="menu-box menu-box-left menu-box-top menu-box-top-left"
						onClick={this.props.setCoreMode.bind(this, "profile")}
						onMouseOver={this.hoverStatus.bind(this, "profile")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<img
							className="menu-profile-picture"
							src={this.props.profile.get("picture")}
							alt=""
						/>
						<div className={(over === "profile") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">profile</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-left"
						onClick={this.props.setCoreMode.bind(this, "alerts")}
						onMouseOver={this.hoverStatus.bind(this, "alerts")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className="material-icons menu-icon">notifications</i>
						<div className={(over === "alerts") ? numOn : numOff}>
							<p className="status-number">{user.get("alerts")}</p>
						</div>
						<div className={(over === "alerts") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">alerts</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-left"
						onClick={this.props.setCoreMode.bind(this, "wallet")}
						onMouseOver={this.hoverStatus.bind(this, "wallet")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className="material-icons menu-icon">account_balance_wallet</i>
						<div className={(over === "wallet") ? numOn : numOff}>
							<p className="status-number">{user.getIn(["balance", "pdm"])}</p>
						</div>
						<div className={(over === "wallet") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">wallet</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-left"
						onClick={this.props.setCoreMode.bind(this, "followers")}
						onMouseOver={this.hoverStatus.bind(this, "followers")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className="material-icons menu-icon">people</i>
						<div className={(over === "followers") ? numOn : numOff}>
							<p className="status-number">{user.get("followers")}</p>
						</div>
						<div className={(over === "followers") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">followers</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-left"
						onClick={this.props.setCoreMode.bind(this, "following")}
						onMouseOver={this.hoverStatus.bind(this, "following")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className="material-icons menu-icon">visibility</i>
						<div className={(over === "following") ? numOn : numOff}>
							<p className="status-number">{user.get("following")}</p>
						</div>
						<div className={(over === "following") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">following</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-left"
						onClick={this.props.setCoreMode.bind(this, "permissions")}
						onMouseOver={this.hoverStatus.bind(this, "permissions")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className="material-icons menu-icon">explore</i>
						<div className={(over === "permissions") ? numOn : numOff}>
							<p className="status-number">
								{Math.round(100 * user.get("integrity"))}%
							</p>
						</div>
						<div className={(over === "permissions") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">permissions</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-left"
						onClick={this.props.setCoreMode.bind(this, "emblems")}
						onMouseOver={this.hoverStatus.bind(this, "emblems")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className="material-icons menu-icon">verified_user</i>
						<div className={(over === "emblems") ? numOn : numOff}>
							<p className="status-number">{user.get("emblems").length}</p>
						</div>
						<div className={(over === "emblems") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">emblems</p>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Status;
