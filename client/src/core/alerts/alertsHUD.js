import React from 'react';
import { Link } from 'react-router-dom';
import ImmutableComponent from '../widgets/immutableComponent';

import { Map, List, is } from 'immutable';

import AlertTab from './alerttab';




class AlertsHUD extends ImmutableComponent {

	constructor() {
		super({
			show: false,
			showing: {},
			unseen: List(),		// All unseen alerts
			live: Map(),		// Most recent 3 unseen alerts
			surfaced: List()	// IDs of all previously surfaced alerts
		})
		this.quickAlert = this.quickAlert.bind(this)
	}


	componentDidMount() {
		this.processAlerts()
	}


	componentDidUpdate(lastProps) {
		if (!is(this.props.alerts, lastProps.alerts)) {
			this.processAlerts()
		}
	}


	processAlerts() {
		const unseen = this.props.alerts
			.filter(a => !a.get("seen"))
			.toList()
		const live = unseen
			.filter(a => !(a.get("id") in this.getState("surfaced")))
			.sort((a, b) => (a.get("created") > b.get("created")) ? 1 : -1)
			.take(3)
			.reduce(
				(r, a) => r.set(a.get("id"), a.set("show", false)),
				Map()
			)
		this.updateState(
			state => state
				.set("unseen", unseen)
				.set("live", live),
			() => {
				if (unseen.size > 0) {
					document.title = `${unseen.size} \u2022 ${document.title}`
				}
			}
		)
	}


	showAlerts() {
		this.updateState(state => state.set("show", true))
	}

	hideAlerts() {
		this.updateState(state => state.set("show", false))
	}


	quickAlert(id) {
		this.updateState(
			state => state.setIn(["live", id, "show"], true),
			() => setTimeout(
				() => this.updateState(
					state => state.setIn(["live", id, "show"], false)
				),
				5000
			)
		)
	}


	render() {
		return <div ref="alerts" className="alerts-container">
				<div
					className="alerts-capture"
					onMouseOver={this.showAlerts.bind(this)}
					onMouseLeave={this.hideAlerts.bind(this)}>
					<Link
						to="/alerts"
						innerRef={ref => this.fullAlerts = ref}
						style={{ display: "none" }}
					/>

					<div
						className={(this.getState("unseen").size > 0 ||
								this.getState("show")) ?
							"alerts-button alerts-button-on card" :
							"alerts-button card"
						}
						onClick={() => this.fullAlerts.click()}>
						<i className="fas fa-bell alerts-icon" />
						<div className="alerts-caption">
							<p className="alerts-caption-text">
								{(this.getState("unseen").size > 0) ?
									this.getState("unseen").size
									: null
								}
							</p>
						</div>
					</div>

					{(this.getState("unseen").size > 0) ?
						<div className="alerts-live">
							{this.getState("live")
								.map(alert => <AlertTab

									key={`quickalert-${alert.get("id")}`}
									show={this.getState("show") || alert.get("show")}

									podium={this.props.podium}
									activeUser={this.props.activeUser}

									alert={alert}
									ready={this.quickAlert}
									
									getUser={this.props.getUser}

								/>)
								.toList()
							}
							{(this.getState("unseen").size > 3) ?
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
}

export default AlertsHUD;
