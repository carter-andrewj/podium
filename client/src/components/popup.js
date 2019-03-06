import React from 'react';
import ImmutableComponent from '../immutableComponent';



class Popup extends ImmutableComponent {

	render() {
		return <div className="popup-holder">
			<div
				className="popup-screen"
				onClick={this.props.onClose.bind(this)}>
			</div>
			<div className="popup card">
				{this.props.children}
			</div>
		</div>
	}

}

export default Popup;
