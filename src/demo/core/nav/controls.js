import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';

import Popup from '../widgets/popup';




class Controls extends Component {

	constructor(props) {
		super()
		this.state = {
			data: Map(fromJS({
				highlight: "none",
				signout: false
			}))
		}
		this.hoverStatus = this.hoverStatus.bind(this);
		this.toggleSignOut = this.toggleSignOut.bind(this);
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


	toggleSignOut() {
		this.updateState(state => state
			.update("signout", (s) => !s)
		);
	}


	render() {

		let over = this.state.data.get("highlight");
		let ttOn = "menu-tooltip menu-tooltip-right menu-tooltip-on";
		let ttOff =  "menu-tooltip menu-tooltip-right menu-tooltip-off";

		// Create sign-out confirmation popup
		let signout;
		if (this.state.data.get("signout")) {
			signout = <Popup onClose={this.toggleSignOut}>
				<div className="signout-title">
					Sign Out?
				</div>
				<div className="signout-buttons">
					<div
						className="def-button green-button popup-button "
						onClick={this.props.signOut}>
						confirm
					</div>
					<div
						className="def-button red-button popup-button "
						onClick={this.toggleSignOut.bind(this)}>
						cancel
					</div>
				</div>
			</Popup>
		}

		return (
			<div ref="controls" className="menu menu-right">
				<div className="menu-bar menu-bar-right card">
					<div
						className="menu-box menu-box-right menu-box-top menu-box-top-right"
						onClick={this.props.setCoreMode.bind(this, "feed")}
						onMouseOver={this.hoverStatus.bind(this, "feed")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<div className="menu-top-holder">
							<div className={(over === "feed") ?
								"menu-feed-holder menu-feed-holder-on" :
								"menu-feed-holder menu-feed-holder-off"}>
								<div className="menu-feed-icon-holder">
									{(over === "feed") ?
										<span className="fas fa-th-list menu-icon menu-feed-icon menu-feed-icon-on" /> :
										<span className="fas fa-th-list menu-icon menu-feed-icon menu-feed-icon-off" />
									}
								</div>
							</div>
							<div className={(over === "feed") ? ttOn : ttOff}>
								<p className="menu-tooltip-text">feed</p>
							</div>
						</div>
					</div>
					<div
						className="menu-box menu-box-right"
						onClick={this.props.setCoreMode.bind(this, "searchusers")}
						onMouseOver={this.hoverStatus.bind(this, "searchusers")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className="material-icons menu-icon">search</i>
						<div className={(over === "searchusers") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">people</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-right"
						onClick={this.props.setCoreMode.bind(this, "searchtopics")}
						onMouseOver={this.hoverStatus.bind(this, "searchtopics")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<span className="fa fa-hashtag menu-icon"></span>
						<div className={(over === "searchtopics") ? ttOn : ttOff}>
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
						onClick={this.toggleSignOut.bind(this)}
						onMouseOver={this.hoverStatus.bind(this, "sign-out")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className="material-icons menu-icon">exit_to_app</i>
						<div className={(over === "sign-out") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">sign-out</p>
						</div>
					</div>
				</div>
				{signout}
			</div>
		);
	}

}

export default Controls;