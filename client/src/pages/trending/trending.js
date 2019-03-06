import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import Placeholder from '../placeholder';


class Trending extends ImmutableComponent {

	render() {
		return (
			<Placeholder
				title="trending"
				icon="globe"
				text={
					<div>
						<p className="placeholder-text">
							words
						</p>
					</div>
				}
				exit={this.props.exit}
			/>
		);
	}
}

export default Trending;
