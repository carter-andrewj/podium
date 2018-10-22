import React, { Component } from 'react';
import '../../../App.css';

import TaskCard from './taskcard';




class Tasks extends Component {

	constructor() {
		super()
		this.state = {

		}
	}

	render() {
		return (
			<div ref="tasks" className="tasks">
				{Object.keys(this.props.tasks).map((k, i) => 
					<TaskCard
						key={k}
						id={k}
						task={this.props.tasks[k]}
						endTask={this.props.endTask}
					/>
				)}
			</div>
		);
	}

}

export default Tasks;
