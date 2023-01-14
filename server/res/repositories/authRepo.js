// initialize firebase app
const admin = require('firebase-admin');

/**
 * @author Sultan
 * 
 * Responsible for handling auth database operations, such as, login and sign up.
 */
class AuthRepo {
    async verifyUserFirebaseTokenByUserId(userId, firebaseToken) {
        await admin.auth().verifyIdToken(firebaseToken)
            .then(async (decodedToken) => {
                const uid = decodedToken.uid;

                if (uid !== userId) {
                    throw new Error('Firebase tokens do not match');
                }
            })
            .catch(err => {
                throw new Error('Invalid firebase toekn');
            });
    }

    async verifyUserFirebaseTokenByEmail(email, firebaseToken) {
        let uid = '';

        // verify firebase token
        await admin.auth().verifyIdToken(firebaseToken)
            .then(async (decodedToken) => {
                uid = decodedToken.uid;
                const fbUser = await admin.auth().getUser(uid);

                if (fbUser.email.toUpperCase() !== email.toUpperCase()) {
                    throw new Error("Email doesn't match the record");
                }
            })
            .catch(err => {
                throw new Error('Invalid firebase toekn');
            });

        return uid;
    }

    async storeUserInfoInDataBase(userId, username) {
        // create a database reference for the user
        const ref = admin.database().ref().child('users').child(userId);
        await ref.child('username').set(username);
        await ref.child('avatar').set(null);

        const {
            status
        } = require('../userStatus');
        await ref.child('status').set(status[0]);
    }
}

module.exports = new AuthRepo();