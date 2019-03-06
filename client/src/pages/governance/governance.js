import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import Placeholder from '../placeholder';


class Governance extends ImmutableComponent {

	render() {
		return (
			<Placeholder
				title="governance"
				icon="gavel"
				text={
					<div>
						<p className="placeholder-text">
							Traditional social networks are centrally controlled,
							meaning that every aspect of their operation is
							determined by the controlling company.
						</p>
						<p className="placeholder-text">
							Podium will be different - with the platform's operation,
							rulebook, and priorities dictated by the users themselves.
						</p>
						<p className="placeholder-text">
							Platform governance will be secured via a network of
							Smart Contracts, automating the process of establishing,
							enforcing, and amending the Podium Code of Conduct.
						</p>
						<p className="placeholder-text">
							Participation in governance will be dependent upon each
							user's Integrity - protecting these processes from
							corruption by bad actors and ensuring that those with
							the greatest say in Podium's destiny are those most
							committed to the success of the platform philosophy.
						</p>
					</div>
				}
				exit={this.props.exit}
			/>
		);
	}
}

export default Governance;
