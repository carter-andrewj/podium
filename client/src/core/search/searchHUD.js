import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Map, fromJS } from 'immutable';

import Profile from '../pages/user/profile/profile';




let timer;
let hideTimer;

class SearchHUD extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				show: false,
				lock: false,
				category: "all"		// "user", "topic", "all"
			}))
		}
	}


	updateState(up, callback) {
		this.setState(
			({data}) => { return { data: up(data) } },
			callback
		)
	}


	showSearch() {
		if (this.props.route !== "/search") {
			this.updateState(state => state.set("show", true))
		}
	}


	hideSearch() {
		this.updateState(state => state
			.set("show", false)
		)
	}


	lockSearch() {
		this.updateState(state => state.set("lock", true))
		this.hideTimeout()
	}

	hideTimeout() {
		clearTimeout(hideTimer)
		hideTimer = setTimeout(
			() => {
				if (this.searchInput.value === "") {
					this.searchInput.blur()
					this.unlockSearch()
					this.hideSearch()
				}
			},
			10000
		)
	}


	unlockSearch() {
		if (this.searchInput.value === "") {
			this.updateState(state => state
				.set("lock", false))
		}
	}


	search(force = false) {

		// Reset hide timer
		this.hideTimeout()

		// Get current search string
		const target = this.searchInput.value;

		// Do search
		clearTimeout(timer)
		if (force) {
			this.props.search(target)
		} else {
			timer = setTimeout(
				() => this.props.search(target),
				500
			)
		}

	}


	emptySearch() {
		this.searchInput.value = ""
		this.searchInput.blur()
		this.updateState(state => state
			.set("show", false)
			.set("lock", false)
		)
	}


	clearSearch() {
		clearTimeout(timer)
		this.emptySearch()
		this.props.resetSearch()
	}


	goToSearch(event) {
		event.preventDefault()
		if (this.searchInput.value === "" &&
				this.props.location !== "/search") {
			this.searchInput.focus()
		} else {
			this.search(true)
			this.emptySearch()
			this.fullSearch.click()
		}			
	} 


	render() {

		const showSearch = this.state.data.get("show") ||
						   this.state.data.get("lock")

		return (
			<div ref="search" className="search-container">
				<div
					className="search-capture"
					onMouseOver={this.showSearch.bind(this)}
					onMouseLeave={this.hideSearch.bind(this)}>
					<Link
						to="/search"
						innerRef={ref => this.fullSearch = ref}
						style={{ display: "none" }}
					/>
					<div className="search-box">
						<form onSubmit={this.goToSearch.bind(this)}>
							<div
								className={(showSearch) ?
									"search-input-holder card search-input-on" :
									"search-input-holder card search-input-off"}>
								<input
									ref={ref => this.searchInput = ref}
									className="search-input"
									onKeyUp={() => this.search()}
									onFocus={this.lockSearch.bind(this)}
									onBlur={this.unlockSearch.bind(this)}
									placeholder="Search..."
								/>
							</div>
							<div
								className={(showSearch) ?
									"search-button card search-button-on" :
									"search-button card search-button-off"}
								onClick={this.goToSearch.bind(this)}>
								{this.props.loading ?
									<i className="fas fa-circle-notch search-loader" /> :
									<i className="fas fa-search search-icon" />
								}
							</div>
							<button
								type="submit"
								style={{ display: "none" }}
							/>
						</form>
						{(this.searchInput && this.searchInput.value !== "") ?
							<div
								className="search-clear"
								onClick={this.clearSearch.bind(this)}>
								<i className="fas fa-trash search-clear-icon" />
							</div>
							: null
						}
					</div>
					{(this.props.route !== "/search") ?
						(this.props.results.size > 0) ?
							<div className="quicksearch-results">
								{this.props.results
									.take(3)
									.map(result => <Profile

										key={result.get("address")}

										podium={this.props.podium}
										activeUser={this.props.activeUser}

										from="address"
										target={result.get("address")}
										
										getUser={this.props.getUser}

										format="tab"

									/>)
									.toList()
								}
								{(this.props.results.size > 3) ?
									<div
										className="quicksearch-footer card"
										onClick={this.goToSearch.bind(this)}>
										<p className="quicksearch-footer-text">
											{this.props.results.size === 4 ?
												"1 more result" : 
												`${this.props.results.size - 3} more results`
											}
										</p>
									</div>
									: null
								}
							</div>
							:
							(!this.props.loading && this.props.target.length >= 3) ?
								<div className="quicksearch-results card">
									<div className="quicksearch-footer">
										<p className="quicksearch-footer-text">
											no results found
										</p>
									</div>
								</div>
								: null
						: null
					}
				</div>
			</div>
		);
	}


	componentWillUnmount() {
		clearTimeout(timer)
		clearTimeout(hideTimer)
	}

}

export default SearchHUD;
