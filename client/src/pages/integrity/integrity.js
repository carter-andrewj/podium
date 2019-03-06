import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import Placeholder from '../placeholder';



class Integrity extends ImmutableComponent {

	render() {
		return (
			<Placeholder
				title="integrity"
				icon="balance-scale"
				text={
					<div>
						<p className="placeholder-text">
							Integrity is Podium's reputation system.
							Users gain and lose integrity according to
							how well they both follow and enforce the
							platform rules.
						</p>
						<p className="placeholder-text">
							Certain actions on Podium require permissions
							that can only be unlocked by meeting a sufficient
							level of Integrity, along with other requirements.
						</p>
						<p className="placeholder-text">
							These permissions are designed to ensure the size of
							a user's platform is dependent upon their Inregrity.
							As such, these permissions will cover the number of followers
							a citizen can have, the number of citizens they can follow,
							which users they can reply/promote/report, and many other factors.
						</p>
						<p className="placeholder-text">
							Violation of platform rules will result in a loss
							of Integrity and - via this permissions system - 
							a reduction of the violator's platform.
						</p>
						<p className="placeholder-text">
							Here, users will be able to see their current
							Integrity, view its history, and unlock permissions
							as they become available.
						</p>
					</div>
				}
				exit={this.props.exit}
			/>
		)
	}
	
}

export default Integrity;
