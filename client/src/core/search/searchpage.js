import React from 'react';

import ImmutableComponent from '../widgets/immutableComponent';

import ProfileFeed from '../pages/user/profile/profilefeed';



let timer;


class SearchPage extends ImmutableComponent {


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
			<div className="searchpage">

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

				<div className="searchpage-results">
					<ProfileFeed

						podium={this.props.podium}
						activeUser={this.props.activeUser}

						from="address"
						users={this.props.results
							.map(r => r.get("address"))
							.toList()
						}
						
						getUser={this.props.getUser}

						header={
							<p className="profile-feed-title">
								<i className="fas fa-user-circle profile-feed-title-icon" />
								<span className="profile-feed-title-text">
									{this.props.loading ?
										<i className="fas fa-circle-notch profile-feed-title-loader" />
										: (this.props.results.size === 0) ?
											"no results found" :
											(this.props.results.size === 1) ?
												"1 result" :
												`${this.props.results.size} results`
									}
								</span>
							</p>
						}

					/>
				</div>

			</div>
		);
	}


	componentWillUnmount() {
		this.props.resetSearch()
	}

}

export default SearchPage;
