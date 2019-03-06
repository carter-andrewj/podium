import React from 'react';
import { withRouter } from 'react-router-dom';
import ImmutableComponent from '../../components/immutableComponent';

import Status from './status';
import Controls from './controls';

import SearchHUD from '../search/searchHUD';
import AlertsHUD from '../alerts/alertsHUD';
import WalletHUD from '../wallet/walletHUD';

import Slider from '../../components/animators/slider';
import Fader from '../../components/animators/fader';




class _HUD extends ImmutableComponent {

	constructor() {
		super({ show: false })
	}

	render() {
		return (
			<div className="master-layout">

				<div className="sidebar sidebar-left">
					<div className="sidebar-column">

						<Fader
							delayIn={1.0}
							exit={this.props.exitAll}>
							<AlertsHUD

								podium={this.props.podium}
								activeUser={this.props.activeUser}

								route={this.props.location.pathname}

								getUser={this.props.getUser}

								followUser={this.props.followUser}
								unfollowUser={this.props.unfollowUser}

								alerts={this.props.alerts}
								clearAlerts={this.props.clearAlerts}

								transition={this.props.transition}
								exit={this.props.exit}

							/>
						</Fader>

						<Fader 
							delayIn={1.0}
							exit={this.props.exitAll}>
							<WalletHUD

								activeUser={this.props.activeUser}
								
								transactions={this.props.transactions}
								balance={this.props.balance}

								transition={this.props.transition}
								exit={this.props.exit}

							/>
						</Fader>

						<Slider
							position="fixed"
							offset={{ x: -5, y: 0 }}
							exit={this.props.exitAll}>
							<Status
								active={this.props.location.pathname}
								activeUser={this.props.activeUser}
								balance={this.props.balance}
								transition={this.props.transition}
							/>
						</Slider>

					</div>
				</div>


				<div className="content-holder">
					<div className="content-column">
						{this.props.children}
					</div>
				</div>


				<div className="sidebar sidebar-right">
					<div className="sidebar-column">

						<Fader
							delayIn={1.0}
							exit={this.props.exitAll}>
							<SearchHUD

								podium={this.props.podium}
								activeUser={this.props.activeUser}

								route={this.props.location.pathname}

								getUser={this.props.getUser}

								search={this.props.search}
								resetSearch={this.props.resetSearch}

								followUser={this.props.followUser}
								unfollowUser={this.props.unfollowUser}

								target={this.props.searchData.get("target")}
								loading={this.props.searchData.get("loading")}
								results={this.props.searchData.get("results")}

								transition={this.props.transition}
								exit={this.props.exit}

							/>
						</Fader>

						<Slider
							position="fixed"
							offset={{ x: 5, y: 0 }}
							exit={this.props.exitAll}>
							<Controls
								active={this.props.location.pathname}
								signOut={this.props.signOut}
								transition={this.props.transition}
							/>
						</Slider>

					</div>
				</div>

			</div>
		);
	}

}


const HUD = withRouter(_HUD);

export default HUD;
