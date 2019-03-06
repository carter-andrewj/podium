import { Component } from 'react';
import { fromJS } from 'immutable'


class ImmutableComponent extends Component {


	constructor(state) {
		super()
		this.state = {
			immutableState: fromJS({
				_ready: false,
				_mounted: false,
				_mounting: true,
				...state
			})
		}
		this.immutableComponentWillMount = this.immutableComponentWillMount.bind(this)
		this.immutableComponentDidMount = this.immutableComponentDidMount.bind(this)
		this.immutableComponentWillUnmount = this.immutableComponentWillUnmount.bind(this)
	}



// STATE METHODS

	getState() {
		const args = Array.prototype.slice.call(arguments)
		if (args.length === 0) {
			return this.state.immutableState.toJS()
		} else if (args.length === 1) {
			return this.state.immutableState.get(args[0])
		} else {
			return this.state.immutableState.getIn(args)
		}
	}


	updateState(up, callback) {
		if (this.getState("_mounted") || this.getState("_mounting")) {
			this.setState(
				({ immutableState }) => {
					return { immutableState: up(immutableState) }
				},
				callback
			)
		}
	}



// LIFECYCLE METHODS

	immutableComponentWillMount() {}

	componentWillMount() {
		this.immutableComponentWillMount()
	}


	immutableComponentDidMount() {}

	componentDidMount() {
		this.updateState(state => state
			.set("_mounted", true)
			.set("_mounting", false)
		)
		setTimeout(
			() => this.updateState(state => state.set("_ready", true)),
			10
		)
		this.immutableComponentDidMount()
	}


	immutableComponentWillUpdate(nextProps, nextState) {}

	componentWillUpdate(nextProps, nextState) {
		this.immutableComponentWillUpdate(nextProps, nextState.immutableState)
	}


	immutableComponentDidUpdate(lastProps, lastState) {}

	componentDidUpdate(lastProps, lastState) {
		this.immutableComponentDidUpdate(lastProps, lastState.immutableState)
	}


	immutableComponentWillUnmount() {}

	componentWillUnmount() {
		this.updateState(state => state.set("_mounted", false))
		this.immutableComponentWillUnmount()
	}



// HELPER METHODS

	get mounted() {
		return this.getState("_mounted")
	}

	get ready() {
		return this.getState("_ready")
	}


}

export default ImmutableComponent;
