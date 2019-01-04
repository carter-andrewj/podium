A prototype decentralized microblogging platform with community moderation.


## Contents

- [Running](#running)
- [About](#about)
  - [Decentralization](#decentralization)
- [Features](#features)
  - [Roadmap](#roadmap)
  - [Accounts](#accounts)
  - [Posting](#posting)
  - [Reactions](#reactions)
  - [Reporting](#reporting)
  - [Following](#following)
  - [Topics](#topics)
  - [Integrity](#integrity)
- [Contact](#contact)
- [Thanks](#thanks)


## Running

Podium can be run locally by calling:

`npm start`

Podium has not yet been deployed to a live site, but will be soon...

The Webapp has been built/tested on Mac/Chrome and so may exibit odd behaviour (or fail to work entirely) on another OS/Browser. We plan full OS/Browser support before putting the prototype properly live - it just isn't expedient to prioritise such work at this stage.


## About

Podium is


### Decentralization

Podium is decentralized. This means no company owns your data on a server somewhere, it's stored in a Distributed Ledger (like Blockchain). It also means that Podium itself will not control the platform after lunch - it will be managed by its users while we simply maintain/develop the codebase.

Some features (such as image uploading) are simply impractical/prohibitive to perform via a DLT - so, in the interrim, we will make use of centralized solutions while we pursue decentralize alternatives.


## Features

### Roadmap

The following features are intended for this prototype:

***Phases of progress go: pending > in progress > functional > complete***

- [Accounts](#accounts)
  - Registration (functional)
  - Sign-In/Out (functional)
  - Profile Creation (functional)
  - Profile Update (pending)
  - Alerts/Notifications (pending)
  - Referencing Users in Posts (in progress)
  - POD token (pending)
  - AUD token (pending)
  - Wallet page (pending)
  - Invitations/Referrals (pending)
- [Posting](#posting)
  - Main Feed (functional)
  - Sending Posts (functional)
  - Spending Tokens to Post (pending)
  - Receiving Posts (functional)
  - Referencing Links (in progress)
  - Posting Images/Media (pending)
  - Promoting Posts (pending)
  - Replying to Posts (pending)
  - Revising Posts (pending)
  - Retracting Posts (pending)
  - Paid (AUD) Posts (pending)
  - Paid (AUD) Promotions (pending)
- [Reactions](#reactions)
  - Reaction Pools (pending)
  - Reacting to Posts (pending)
  - Receiving Tokens for Reactions (pending)
  - Bias Mapping (in progress)
  - Affinity Calculation/Surfacing (pending)
- [Reporting](#reporting)
  - Reporting Posts (pending)
  - Reporting Accounts (pending)
  - The Code (in progress)
  - Jury Selection (pending)
  - Voting on Reports (pending)
  - Resolving Reports (pending)
  - Sanctions (pending)
- [Following](#following)
  - Indexing/Searching Users (functional)
  - Following Users (functional)
  - Listing Followers (pending)
  - Listing Users being Followed (functional)
  - Unfollowing Users (pending)
- [Topics](#topics)
  - Creation (in progress)
  - Referencing in Posts (in progress)
  - Indexing/Searching (in progress)
  - Deletion (pending)
- [Integrity](#integrity)
  - Integrity Scoring (pending)
  - Integrity Unlocks (pending)
- Others
  - Settings Page (pending)

The prototype will also include:

- Landing Page
  - Home (functional)
  - About (functional)
  - Contact (functional)
  - Support (in progress)
- Demo Functionality
  - Enter/Exit Demo (functional)
  - Get test tokens (pending)
  - Bots (pending)
- Onboarding
  - Introduction to key features (pending)
  - Reactive Helpers (pending)
  - FAQ (pending)
  - General Help Pages (pending)

Future systems (not planned for the prototype):

- Business Model
  - Transaction %
  - Built-In Radix Nodes
- Direct Messaging
- Governance
  - Platform Constitution
  - Create Rules/Sanctions
  - Amend Rules/Sanctions
  - Appeals
- Accounts
  - Account Transfering
  - Account Linking
  - Account Types (organization vs individual, etc...)
  - Posting to other Social Networks
- Features
  - Bias-balanced Polling
  - AUD Fundraising Campaigns (for charities, etc...)
  - Opt-in Ad Targeting that pays the targeted users
  - Passporting (using your Podium ID on other sites/apps)
  - P2P payments (using AUD as a functional currency)
  - Media validation (partnering with media veracity firms like Onfido to flag fake/altered images, etc...)
- Infrastructure
  - Post Curation
  - Smart Contracts
  - Deep Search
  - API
  - iOS/Android/Desktop/etc... Apps


### Accounts

### Posting

### Reactions

No, not `this sort of code`. This refers to the ruleset users sign up to when joining Podium. Having bias-free, user-moderated enforcement allows for a much broader set of rules and sanctions than other social networks.

### Reporting

### Following


### Topics

Topics are like hashtags on other platforms, but with some key differences:
1. It costs tokens to create a new topic. This is to stop the topic space from becoming cluttered with 1000s of near-identical tags, defeating the very purpose of the feature.
2. Topics require a description. This is to make it easier to learn about a topic without scrolling through every reference to it.


### Integrity

Integrity is the reputational score used by Podium to track each user's adherance to The Code and related behaviours. Backing the integrity system will be a set of permissions requiring (among other things) different levels of integrity to unlock. Some of these permissions are unlocked by default for new users, others need to be earned.

The purpose behind integrity is to remove the benefits of 'disposable anonymity' we see on platforms like Twitter. If bad actors can generate 1000s of sock-puppet accounts and immediately benefit by spreading misinformation (etc.) there is no true value to the platforms of people who have invested time to grow their reach.

Integrity and the associated Unlocks require a commitment of time and demonstration of intent before a user's platform can grow.


## Contact

We're happy to receive any/all feedback and will field questions send to [andrew@podium-network.com](mailto:andrew@podium-network.com).

(We'll have telegram/slack/twitter channels coming soon.)


## Thanks

Podium is built on the [Radix](https://www.radixdlt.com/) distributed ledger using their JS library, available on [GitHub](https://github.com/radixdlt).

This project also used [Create React App](https://github.com/facebook/create-react-app) as a starting template.
