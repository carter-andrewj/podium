import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';

import Popup from '../../../../widgets/popup';



class NewTopic extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({

			}))
		}
		this.closePopup = this.closePopup.bind(this);
		this.validateTopic = this.validateTopic.bind(this);
	}


	closePopup(result) {
		if (!result) {
			this.props.toggleNewTopic(false)
		} else {
			const id = this.refs.newtopicName.value;
			const description = this.refs.newtopicDescription.value;
			this.props.createTopic(id, description)
				.then(this.props.toggleNewTopic(false));
		}
	}


	validateTopicName(event) {

		// Must not already exist
		// Must not begin/end with a special character

	}


	validateTopicDescription(event) {

		// Min/Max length

	}


	render() {
		return (
			<Popup onClose={this.closePopup}>
				<div className="newtopic-header">
					<div className="newtopic-icon-holder">
						<span className="fa fa-at newtopic-icon"></span>
					</div>
					<input
						ref="newtopicName"
						className="newtopic-name"
						placeholder="Topic Name"
						onKeyPress={this.validateTopicName}
					/>
				</div>
				<div className="newtopic-core">
					<textarea
						ref="newtopicDescription"
						className="newtopic-description"
						placeholder="Topic Description..."
						onKeyPress={this.validateTopicDescription}
					/>
				</div>
				<div className="newtopic-submit">
					<div
						onClick={this.closePopup.bind(true)}
						className="def-button newtopic-submit-button">
						create
					</div>
				</div>
			</Popup>
		);
	}

}

export default NewTopic;
