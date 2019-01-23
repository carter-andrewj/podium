import React, { Component } from 'react';
import { Link } from 'react-router-dom';

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

		let active = this.props.active;
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
						className="menu-box menu-box-right menu-box-top-right"
						onClick={() => this.feedLink.click()}
						onMouseOver={this.hoverStatus.bind(this, "feed")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<Link
							innerRef={ref => this.feedLink = ref}
							style={{ display: "none" }}
							to="/"
						/>
						<div className="menu-box-top menu-box-top-right">
							<img
								className={(over === "feed") ?
									"menu-picture menu-picture-right menu-picture-on" :
									(active === "feed") ?
										"menu-picture menu-picture-right menu-picture-active" :
										"menu-picture menu-picture-right menu-picture-off"
								}
								src={(active === "feed" || over === "feed") ?
									"./images/icon-feed-green.png" :
									"./images/icon-feed.png"
								}
								alt=""
							/>
						</div>
						<div className={(over === "feed") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">feed</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-right"
						onClick={() => this.topicsLink.click()}
						onMouseOver={this.hoverStatus.bind(this, "topics")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<Link
							innerRef={ref => this.topicsLink = ref}
							style={{ display: "none" }}
							to="/topics"
						/>
						<i className={(active === "topics") ?
							"fas fa-hashtag menu-icon menu-icon-active" :
							"fas fa-hashtag menu-icon"
						}/>
						<div className={(over === "topics") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">topics</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-right"
						onClick={() => this.governanceLink.click()}
						onMouseOver={this.hoverStatus.bind(this, "governance")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<Link
							innerRef={ref => this.governanceLink = ref}
							style={{ display: "none"}}
							to="/governance"
						/>
						<i className={(active === "governance") ?
							"fas fa-gavel menu-icon menu-icon-active" :
							"fas fa-gavel menu-icon"
						}/>
						<div className={(over === "governance") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">governance</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-right"
						onClick={() => this.settingsLink.click()}
						onMouseOver={this.hoverStatus.bind(this, "settings")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<Link
							innerRef={ref => this.settingsLink = ref}
							style={{ display: "none"}}
							to="/settings"
						/>
						<i className={(active === "settings") ?
							"fas fa-cogs menu-icon menu-icon-active" :
							"fas fa-cogs menu-icon"
						}/>
						<div className={(over === "settings") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">settings</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-right"
						onClick={this.toggleSignOut.bind(this)}
						onMouseOver={this.hoverStatus.bind(this, "sign-out")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<i className="fas fa-sign-out-alt menu-icon"></i>
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