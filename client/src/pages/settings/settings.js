import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import Placeholder from '../placeholder';


class Settings extends ImmutableComponent {

	render() {
		return (
			<Placeholder
				title="settings"
				icon="cogs"
				text={
					<div>
						<p className="placeholder-text">
							Here, users will be able to manage their
							personal preferences and customize their
							experience.
						</p>
					</div>
				}
				exit={this.props.exit}
			/>
		);
	}
}

export default Settings;
