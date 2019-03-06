import React from 'react';
import { Link } from 'react-router-dom';
import ImmutableComponent from '../../components/immutableComponent';

import { Map, List, is } from 'immutable';

import AlertTab from './alertTab';




let timer;

class AlertsHUD extends ImmutableComponent {

	constructor() {
		super({
			show: false,
			unseen: List(),		// All unseen alerts
			live: Map(),		// Most recent 3 unseen alerts
			surfaced: List()	// Keys of all previously surfaced alerts
		})
		this.quickAlert = this.quickAlert.bind(this)
	}


	immutableComponentDidMount() {
		this.processAlerts()
	}


	immutableComponentDidUpdate(lastProps) {
		if (!is(this.props.alerts, lastProps.alerts)) {
			this.processAlerts()
		}
	}


	processAlerts() {

		// Identify all unseen alerts
		const unseen = this.props.alerts
			.filter(a => !a.get("seen"))
			.toList()

		// Omit any that have already been surfaced to the user
		const liveFull = unseen
			.filter(a => !(a.get("key") in this.getState("surfaced")))
			.sort((a, b) => (a.get("created") > b.get("created")) ? 1 : -1)

		// Take the most recent 3 of these alerts and
		// flag them for surfacing
		const live = liveFull
			.take(3)
			.reduce(
				(r, a) => r.set(a.get("key"), a.set("show", false)),
				Map()
			)

		// Flag any remaining unsurfaced alerts as surfaced
		// to stop old alerts being sufaced on page refresh
		var liveSkip = List()
		if (liveFull.size > 3) {
			liveSkip = liveFull
				.skip(3)
				.map(a => a.get("key"))
				.toList()
		}

		// Update alert state
		this.updateState(
			state => state
				.set("unseen", unseen)
				.update("surfaced", s => s.concat(liveSkip))
				.set("live", live),
			() => { if (unseen.size > 0) {
				document.title = `${unseen.size} \u2022 ${document.title}`
			}}
		)

	}


	showAlerts() {
		clearTimeout(timer)
		timer = setTimeout(
			() => this.updateState(state => state.set("show", true)),
			150
		)
	}

	hideAlerts() {
		clearTimeout(timer)
		this.updateState(state => state.set("show", false))
	}


	quickAlert(key) {
		this.updateState(
			state => state.setIn(["live", key, "show"], true),
			() => setTimeout(
				() => this.updateState(state => state
					.setIn(["live", key, "show"], false)
					.update("surfaced", s => s.push(key))
				),
				5000
			)
		)
	}


	render() {
		const show = this.getState("show")
		const pending = this.getState("unseen").size > 0
		return <div ref="alerts" className="alerts-container">
				<div
					className={show ? 
						"alerts-capture alerts-capture-open" :
						"alerts-capture alerts-capture-closed"
					}
					onMouseOver={this.showAlerts.bind(this)}
					onMouseLeave={this.hideAlerts.bind(this)}>
					<Link
						to="/alerts"
						innerRef={ref => this.fullAlerts = ref}
						style={{ display: "none" }}
					/>

					<div
						className={(pending || show) ?
							"alerts-button alerts-button-on card" :
							"alerts-button alerts-button-off card"
						}
						onClick={() => this.fullAlerts.click()}>
						<i className="fas fa-bell alerts-icon" />
						{show ?
							<div className="alerts-caption alerts-caption-on">
								<p className="alerts-caption-text">
									{!pending ?
										"no new alerts" :
										(this.getState("unseen").size === 1) ?
											"1 new alert" :
											`${this.getState("unseen").size} new alerts`
									}
								</p>
							</div>
							:
							<div className={pending ?
									"alerts-caption alerts-caption-on" :
									"alerts-caption alerts-caption-off"
								}>
								<p className="alerts-caption-text">
									{(this.getState("unseen").size > 0) ?
										this.getState("unseen").size
										: null
									}
								</p>
							</div>
						}
					</div>

					{(this.getState("unseen").size > 0) ?
						<div className="alerts-live">
							{this.getState("live")
								.map((alert, i) => <AlertTab

									key={`quickalert-${alert.get("key")}`}
									show={this.getState("show") || alert.get("show")}
									new={alert.get("show")}
									index={i}

									podium={this.props.podium}
									activeUser={this.props.activeUser}

									alert={alert}
									ready={this.quickAlert}
									clearAlerts={this.props.clearAlerts}
									
									getUser={this.props.getUser}

									followUser={this.props.followUser}
									unfollowUser={this.props.unfollowUser}

									transition={this.props.transition}
									exit={this.props.exit}

								/>)
								.toList()
							}
							{(this.getState("unseen")
									.filter(a => a.get("show")).size > 3) ?
								<div
									className="quickalerts-footer card"
									onClick={() => this.fullAlerts.click()}>
									<p className="quickalerts-footer-text">
										{`...and ${this.getState("unseen").size - 3} more`}
									</p>
								</div>
								: null
							}
						</div>
						: null
					}

				</div>
			</div>
	}


	immutableComponentWillUnmount() {
		clearTimeout(timer)
	}


}

export default AlertsHUD;
