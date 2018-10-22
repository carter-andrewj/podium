import { RadixAccount, RadixUtil, RadixKeyPair } from 'radixdlt';

import Settings from './config';



function getAccount(seed) {
	const hash = RadixUtil.hash(Buffer.from(seed));
	return new RadixAccount(RadixKeyPair.fromPrivate(hash));
}




class ChannelSet {
	master() {
		return getAccount(Settings.ApplicationID)
	}
	forUserRoster() {
		return getAccount("podium-user-roster")
	}
	forTopics() {
		return getAccount("podium-topics")
	}
	forKeystoreOf(id, pw) {
		return getAccount("podium-keystore-for-" + id + pw)
	}
	forProfileOf(address) {
		return RadixAccount.fromAddress(address)
	}
	forPostsBy(address) {
		return getAccount("podium-user-posts-" + address)
	}
	forFollowing(address) {
		return getAccount("podium-user-followers-" + address)
	}
	forFollowsBy(address) {
		return getAccount("podium-user-following-" + address)
	}
	forAlertsTo(address) {
		return getAccount("podium-user-alerts-" + address)
	}
	forRelationOf(address1, address2) {
		return getAccount("podium-user-" + address1 +
			"-follows-user-" + address2)
	}
	forOwnershipOf(id) {
		return getAccount("podium-ownership-of-id-" + id)
	}
}

var Channel = new ChannelSet();
export default Channel;





