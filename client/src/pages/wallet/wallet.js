import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import Placeholder from '../placeholder';


class Wallet extends ImmutableComponent {

	render() {
		return (
			<Placeholder
				title="wallet"
				icon="wallet"
				text={
					<div>
						<p className="placeholder-text">
							Podium Tokens - or POD - is the earned currency
							of this social network. User actions on Podium -
							posting, promoting posts, unlocking permissions - 
							all require a payment in POD to carry out.
						</p>
						<p className="placeholder-text">
							POD is easily earned via normal actions on the
							platform - specifically, those actions allowing
							the platform to characterise each user's bias.
						</p>
						<p className="placeholder-text">
							This ensures we have the data required to account
							for user-bias from platform governance decisions -
							These decisions will be encrypted and secured via smart
							contract, ensuring that this data can only be used for
							transparent governance processes and is never revealed
							to any human except the user themselves.
						</p>
					</div>
				}
				exit={this.props.exit}
			/>
		)
	}
}

export default Wallet;
