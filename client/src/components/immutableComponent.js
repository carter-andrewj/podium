import { Component } from 'react';
import { fromJS } from 'immutable'


class ImmutableComponent extends Component {


	constructor(state) {
		super()
		this.state = {
			immutableState: fromJS({
				_ready: false,
				...state
			})
		}
		this.mounting = true
		this.mounted = false
		this._readyTimer = null
		this.immutableComponentWillMount = this.immutableComponentWillMount.bind(this)
		this.immutableComponentDidMount = this.immutableComponentDidMount.bind(this)
		this.shouldImmutableComponentUpdate = this.shouldImmutableComponentUpdate.bind(this)
		this.immutableComponentWillUpdate = this.immutableComponentWillUpdate.bind(this)
		this.immutableComponentDidUpdate = this.immutableComponentDidUpdate.bind(this)
		this.immutableComponentWillUnmount = this.immutableComponentWillUnmount.bind(this)
	}



// STATE METHODS

	getState() {
		const args = Array.prototype.slice.call(arguments)
		if (args.length === 0) {
			return this.state.immutableState
		} else if (args.length === 1) {
			return this.state.immutableState.get(args[0])
		} else {
			return this.state.immutableState.getIn(args)
		}
	}


	updateState(up, callback) {
		if (this.mounted || this.mounting) {
			this.setState(
				({ immutableState }) => {
					return {
						_ready: this.ready,
						immutableState: up(immutableState)
					}
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
		this.mounted = true
		this.mounting = false
		this._readyTimer = setTimeout(
			() => this.updateState(
				state => state.set("_ready", true)
			),
			10
		)
		this.immutableComponentDidMount()
	}


	shouldImmutableComponentUpdate(nextProps, nextState) {
		return true
	}

	shouldComponentUpdate(nextProps, nextState) {
		return this.shouldImmutableComponentUpdate(
			nextProps, nextState.immutableState)
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
		clearTimeout(this._readyTimer)
		this.immutableComponentWillUnmount()
		this.mounted = false
	}



	get ready() {
		return this.getState("_ready")
	}


}

export default ImmutableComponent;
