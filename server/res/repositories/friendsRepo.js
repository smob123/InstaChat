// initialize firebase app
const admin = require('firebase-admin');

/**
 * @author Sultan
 * 
 * Responsible for manipulating friendships in the database.
 */
class FriendsRepo {
    async addRecievedFriendRequest(userId, requesterId) {
        const userDbRef = admin.database().ref().child('users').child(userId).child('received friend requests');

        await userDbRef.once('value').then(async snapshots => {
            let requests = await snapshots.val();

            // check if the user has no friend requests
            if (!requests) {
                userDbRef.set([requesterId]);
                return;
            }

            // check if a friend request was sent to this user before
            if (requests.includes(requesterId)) {
                throw new Error('Friend request was already sent');
            }

            requests.push(requesterId);
            await userDbRef.set(requests);
        })
    }

    async addSentFriendRequest(userId, receiverId) {
        const userRef = admin.database().ref().child('users').child(userId).child('sent friend requests');
        await userRef.once('value').then(async snapshots => {
            let requests = await snapshots.val();

            // check if the other user has no friend requests
            if (!requests) {
                userRef.set([receiverId]);
                return;
            }

            // check if a friend request was sent to this user before
            if (requests.includes(receiverId)) {
                throw new Error('A friend request was already sent to this user');
                return;
            }

            requests.push(receiverId);
            await otherUserDbRef.set(requests);
        })
    }

    async removeSentFriendRequest(userId, receiverId) {
        const userDbRef = admin.database().ref().child('users').child(userId);

        await userDbRef.child('sent friend requests').once('value').then(async snapshots => {
            const requests = await snapshots.val();

            if (!requests) {
                throw new Error('No friend request was sent to this user');
            }

            const idIndex = requests.indexOf(receiverId);

            // check if the other account's id exists in the received requests list
            if (idIndex < 0) {
                throw new Error('No friend request was sent to this user');
            }

            // otherwise remove the friend request from the list
            requests.splice(idIndex, 1);
            await userDbRef.child('sent friend requests').set(requests);
        })
    }

    async removeReceivedFriendRequest(userId, requesterId) {
        const userDbRef = admin.database().ref().child('users').child(userId);
        await userDbRef.child('received friend requests').once('value').then(async snapshots => {
            const requests = await snapshots.val();

            // check if the user has no received friend requests
            if (!requests) {
                throw new Error('No friend request was received from this user');
            }

            const idIndex = requests.indexOf(requesterId);

            // check if the requester has sent a friend request
            if (idIndex < 0) {
                throw new Error('No friend request was received from this user');
            }

            requests.splice(idIndex, 1);
            await userDbRef.child('received friend requests').set(requests);
        })
    }

    async addFriend(userId, friedId) {
        const userDbRef = admin.database().ref().child('users').child(userId).child('friends');
        userDbRef.once('value').then(async snapshots => {
            let friends = await snapshots.val();

            if (!friends) {
                await userDbRef.set([friedId]);
                return;
            }

            friends.push(friedId);
            await userDbRef.set(friends);
        })
    }
}

module.exports = new FriendsRepo();