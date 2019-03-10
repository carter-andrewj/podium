import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import AlertCard from './alertCard';

import Fader from '../../components/animators/fader';



class AlertsPage extends ImmutableComponent {

	immutableComponentDidMount() {
		this.props.clearAllAlerts().catch(console.error)
	}

	render() {
		return (
			<div className="alertspage content">
				<Fader exit={this.props.exit}>
					<div className="alertspage-list">
						{this.props.alerts
							.map(alert => <AlertCard

								key={`alert-${alert.get("key")}`}

								podium={this.props.podium}
								activeUser={this.props.activeUser}

								alert={alert}
								
								getUser={this.props.getUser}

								followUser={this.props.followUser}
								unfollowUser={this.props.unfollowUser}

								transition={this.props.transition}
								exit={this.props.exit}

							/>)
							.toList()
						}
						<div className="feed-spacer" />
						<div className="footer-spacer">
							<p className="footer-text background-text">
								{this.props.alerts.size > 0 ?
									"no more alerts" :
									"you have no alerts"
								}
							</p>
						</div>
					</div>
				</Fader>
			</div>
		)
	}

}

export default AlertsPage;
