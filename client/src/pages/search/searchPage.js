import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import ProfileFeed from '../profiles/profileFeed';

import Fader from '../../components/animators/fader';
import Slider from '../../components/animators/slider';



let timer;

class SearchPage extends ImmutableComponent {


	immutableComponentDidMount() {
		if (this.props.target) {
			this.searchInput.value = this.props.target
		}
	}


	quickSearch(event) {

		// Get current search string
		const target = this.searchInput.value;

		// Do search on delay
		clearTimeout(timer);
		timer = setTimeout(
			() => this.props.search(target),
			500
		)

	}

	search(event) {

		event.preventDefault()

		// Get current search string
		const target = this.searchInput.value;

		// Do search on delay
		clearTimeout(timer);
		this.props.search(target)

	}


	render() {
		return (
			<div className="searchpage content">

				<Slider
					position="relative"
					offset={{ x: 0, y: -20 }}
					exit={this.props.exit}>
					<div className="searchpage-box card">
						<form onSubmit={this.search.bind(this)}>
							<input
								ref={ref => this.searchInput = ref}
								onKeyUp={this.quickSearch.bind(this)}
								className="searchpage-input"
								placeholder="Search users, topics, etc..."
							/>
							<div
								className="searchpage-button"
								onClick={this.search.bind(this)}>
								<i className="fas fa-search searchpage-button-icon" />
							</div>
							<button
								type="submit"
								style={{ display: "none" }}
							/>
						</form>
					</div>

					<div className="searchpage-filters">
					</div>
				</Slider>

				<div className="searchpage-results">
					<Fader exit={this.props.exit}>
						<ProfileFeed

							podium={this.props.podium}
							activeUser={this.props.activeUser}

							from="address"
							users={this.props.results
								.map(r => r.get("address"))
								.toList()
							}
							
							getUser={this.props.getUser}

							followUser={this.props.followUser}
							unfollowUser={this.props.unfollowUser}

							label={["result", "results"]}

						/>
					</Fader>
				</div>

			</div>
		);
	}


	immutableComponentWillUnmount() {
		console.log("unmounting search")
		this.props.resetSearch()
	}

}

export default SearchPage;
