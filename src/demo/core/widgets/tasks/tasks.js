import React, { Component } from 'react';

import TaskCard from './taskcard';




class Tasks extends Component {

	render() {
		return (
			<div ref="tasks" className="tasks">
				{this.props.tasks
					.map((task, id) => <TaskCard
						key={"task-" + id}
						id={id}
						task={task}
						endTask={this.props.endTask}
					/>)
					.toList()
				}
			</div>
		);
	}

}

export default Tasks;
