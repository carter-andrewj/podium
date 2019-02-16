import React, { Component } from 'react';

import Placeholder from '../../placeholder';


class Wallet extends Component {

	render() {
		return (
			<Placeholder
				title="wallet"
				icon="wallet"
				text={
					<p className="placeholder-text">
						Here, users will be able to manage their
						POD and AUD balance, make payments
						and view their transaction history.
					</p>
				}
			/>
		);
	}
}

export default Wallet;
