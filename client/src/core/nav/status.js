import React, { Component } from 'react';
import { Link } from 'react-router-dom';

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


	getState() {
		const args = Array.prototype.slice.call(arguments)
		if (args.length === 1) {
			return this.state.data.get(args[0])
		} else {
			return this.state.data.getIn([...args])
		}
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

		//const user = this.props.user;
		let active = this.props.active;
		let over = this.state.data.get("highlight");
		let ttOn = "menu-tooltip menu-tooltip-left menu-tooltip-on";
		let ttOff =  "menu-tooltip menu-tooltip-left menu-tooltip-off";

		return (
			<div ref="status" className="menu menu-left">
				<div className="menu-bar menu-bar-left card">
					<div
						className="menu-box menu-box-left menu-box-top-left"
						onClick={() => this.profileLink.click()}
						onMouseOver={this.hoverStatus.bind(this, "profile")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<Link
							innerRef={ref => this.profileLink = ref}
							style={{ display: "none" }}
							to={`/user/${this.props.activeUser.get("address") || ""}`}
						/>
						<div className="menu-box-top menu-box-top-left">
							{(this.props.activeUser.get("address") !== "") ?
								<img
									className={(over === "profile") ?
										"menu-picture menu-picture-left menu-picture-on" :
										(active === "profile") ?
											"menu-picture menu-picture-left menu-picture-active" :
											"menu-picture menu-picture-left menu-picture-off"
									}
									src={this.props.activeUser.getIn(["profile", "pictureURL"])}
									alt=""
								/> :
								<div className="menu-profile-placeholder">
									<i className="fas fa-spinner menu-loader" />
								</div>
							}
						</div>
						<div className={(over === "profile") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">profile</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-left"
						onClick={() => this.walletLink.click()}
						onMouseOver={this.hoverStatus.bind(this, "wallet")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<Link
							innerRef={ref => this.walletLink = ref}
							style={{ display: "none" }}
							to="/wallet"
						/>
						<i className={(active === "wallet") ?
							"fas fa-wallet menu-icon menu-icon-active" :
							"fas fa-wallet menu-icon"
						}/>
						<div className={(over === "wallet") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">wallet</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-left"
						onClick={() => this.followersLink.click()}
						onMouseOver={this.hoverStatus.bind(this, "followers")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<Link
							innerRef={ref => this.followersLink = ref}
							style={{ display: "none" }}
							to="/followers"
						/>
						<i className={(active === "followers") ?
							"fas fa-users menu-icon menu-icon-active" :
							"fas fa-users menu-icon"
						}/>
						<div className={(over === "followers") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">followers</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-left"
						onClick={() => this.followingLink.click()}
						onMouseOver={this.hoverStatus.bind(this, "following")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<Link
							innerRef={ref => this.followingLink = ref}
							style={{ display: "none" }}
							to="/following"
						/>
						<i className={(active === "following") ?
							"fas fa-eye menu-icon menu-icon-active" :
							"fas fa-eye menu-icon"
						}/>
						<div className={(over === "following") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">following</p>
						</div>
					</div>
					<div
						className="menu-box menu-box-left"
						onClick={() => this.integrityLink.click()}
						onMouseOver={this.hoverStatus.bind(this, "integrity")}
						onMouseOut={this.hoverStatus.bind(this, "none")}>
						<Link
							innerRef={ref => this.integrityLink = ref}
							style={{ display: "none" }}
							to="/integrity"
						/>
						<i className={(active === "integrity") ?
							"fas fa-balance-scale menu-icon menu-icon-active" :
							"fas fa-balance-scale menu-icon"
						}/>
						<div className={(over === "integrity") ? ttOn : ttOff}>
							<p className="menu-tooltip-text">integrity</p>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Status;
