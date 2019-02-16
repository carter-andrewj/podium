import React, { Component } from 'react';

import Placeholder from '../../placeholder';



class Integrity extends Component {

	render() {
		return (
			<Placeholder
				title="integrity"
				icon="balance-scale"
				text={
					<div>
						<p className="placeholder-text">
							Integrity is Podium's reputation system.
							Citizens gain/lose integrity according to
							how well they follow the platform rules.
						</p>
						<p className="placeholder-text">
							Certain actions on Podium require permissions
							that can only be unlocked by meeting a sufficient
							level of Integrity, along with other requirements.
						</p>
						<p className="placeholder-text">
							These permissions control the number of followers
							a citizen can have, the number of citizens they follow,
							who they can reply/promote/report, and other factors
							dictating the size of a citizen's platform.
						</p>
						<p className="placeholder-text">
							Violation of platform rules will result in a loss
							of integrity and - via this permissions system - 
							result in a reduction in the size of the violator's
							platform.
						</p>
						<p className="placeholder-text">
							Here, users will be able to see their current
							Integrity, view its history, and unlock permissions
							to expand the size of their platform.
						</p>
					</div>
				}
			/>
		);
	}
}

export default Integrity;
