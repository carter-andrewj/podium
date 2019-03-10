import React from 'react';
import { Link } from 'react-router-dom';
import ImmutableComponent from '../../components/immutableComponent';

import { commaNumber } from 'utils';





class WalletHUD extends ImmutableComponent {

	render() {

		return <div className="wallet-container">

				<Link
					to="/wallet"
					innerRef={ref => this.goToWallet = ref}
					style={{ display: "none" }}
				/>

				<div
					className="wallet-button card"
					onClick={() => this.props.transition(
						() => this.goToWallet.click()
					)}>
					<div className="wallet-token-holder">
						<img
							className="wallet-token-icon"
							src="/images/favicon.png"
							alt=""
						/>
					</div>
					<div className="wallet-balance-holder">
						{(this.props.balance || this.props.balance === 0) ?
							<p className="wallet-balance">
								{commaNumber(this.props.balance)}
							</p>
							:
							<i className="fas fa-circle-notch wallet-loader" />
						}
					</div>
				</div>

			</div>
	}
}

export default WalletHUD;
