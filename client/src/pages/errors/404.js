import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';


class Error404 extends ImmutableComponent {

	render() {
		return (
			<div ref="error404">
				404 Error
			</div>
		);
	}
}

export default Error404;
