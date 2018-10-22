import React, { Component } from 'react';
import '../../../App.css';



class Status extends Component {

	constructor() {
		super()
		this.state = {
			highlight: "none"
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
		let ttOn = "menu-tooltip menu-tooltip-left menu-tooltip-on";
		let ttOff =  "menu-tooltip menu-tooltip-left menu-tooltip-off";

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
							src={this.props.profile.picture}
							alt=""
						/>
						<div className={(over === "profile") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">@{this.props.profile.id}</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-left"
						onClick={this.props.setCoreMode.bind(this, "alerts")}
						onMouseOver={this.hoverStatus.bind(this, "alerts")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className="material-icons menu-icon">notifications</i>
						<div className="status-number-holder">
							<p className="status-number">{this.props.user.alerts}</p>
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
						<div className="status-number-holder">
							<p className="status-number">{this.props.user.balance.pdm}</p>
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
						<div className="status-number-holder">
							<p className="status-number">{this.props.user.followers}</p>
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
						<div className="status-number-holder">
							<p className="status-number">{this.props.user.following}</p>
						</div>
						<div className={(over === "following") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">following</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-left"
						onClick={this.props.setCoreMode.bind(this, "integrity")}
						onMouseOver={this.hoverStatus.bind(this, "integrity")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className="material-icons menu-icon">explore</i>
						<div className="status-number-holder">
							<p className="status-number">
								{Math.round(100 * this.props.user.integrity)}%
							</p>
						</div>
						<div className={(over === "integrity") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">integrity</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-left"
						onClick={this.props.setCoreMode.bind(this, "emblems")}
						onMouseOver={this.hoverStatus.bind(this, "emblems")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className="material-icons menu-icon">verified_user</i>
						<div className="status-number-holder">
							<p className="status-number">{this.props.user.emblems.length}</p>
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
