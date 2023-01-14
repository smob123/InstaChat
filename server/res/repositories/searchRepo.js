// initialize firebase app
const admin = require('firebase-admin');

/**
 * @author Sultan
 * 
 * Responsible for retrieving data from the database.
 */
class SearchRepo {
    async getUserById(userId) {
        await admin.auth().getUser(userId).catch(err => {
            throw new Error("Couldn't send a request to the user with the given id");
        });
    }

    async getUsernameByUserId(userId) {
        const ref = admin.database().ref().child('users').child(userId);
        let username = '';
        await ref.child('username').once('value', async snapshot => {
            username = await snapshot.val();
        }, err => {
            throw new Error('Invalid firebase toekn');
        });

        return username;
    }

    async getAvatarByUserId(userId) {
        const ref = admin.database().ref().child('users').child(userId);
        let avatar = null;
        await ref.child('avatar').once('value', async snapshot => {
            avatar = await snapshot.val();
        }, err => {
            throw new Error('Invalid firebase toekn');
        });

        return avatar;
    }

    async getUsersStatus(userId) {
        // get the value of the user's status
        const status = await (await admin.database().ref('users').child(userId).child('status').once('value')).val();
        return status;
    }

    async getUsersFriends(userId) {
        const userDbRef = admin.database().ref().child('users').child(userId);
        let friendsList = [];

        // add the list of friends
        await userDbRef.child('friends').once('value', async snapshots => {
            const friends = await snapshots.val();

            if (!friends) {
                return;
            }

            friendsList = friends;
        })

        return friendsList;
    }

    async getUsersSentFriendRequests(userId) {
        const userDbRef = admin.database().ref().child('users').child(userId);
        let sentFriendRequests = [];
        await userDbRef.child('sent friend requests').once('value', async snapshots => {
            const requests = await snapshots.val();

            if (!requests) {
                return;
            }
            sentFriendRequests = requests;
        })

        return sentFriendRequests;
    }

    async getUsersReceivedFriendRequests(userId) {
        const userDbRef = admin.database().ref().child('users').child(userId);
        let receivedFriendRequests = [];

        await userDbRef.child('received friend requests').once('value', async snapshots => {
            const requests = await snapshots.val();

            if (!requests) {
                return;
            }
            receivedFriendRequests = requests;
        })

        return receivedFriendRequests;
    }

    async getFriendSuggestions(ignoreList, userId) {
        const recommendedUsers = [];
        await admin.database().ref().child('users').once('value', async snapshots => {
            const users = await snapshots.val();

            for (const key of Object.keys(users)) {

                if (key !== userId && !ignoreList.includes(key)) {
                    const user = users[key]
                    const username = user.username;
                    const status = user.status;
                    let avatar = user.avatar;

                    let userData = {
                        id: key,
                        username,
                        avatar,
                        status
                    };

                    recommendedUsers.push(userData);
                }
            }
        }, err => {
            throw new Error("Couldn't connect to the firebase database");
        });

        return recommendedUsers;
    }
}

module.exports = new SearchRepo();