// initialize firebase app
const admin = require('firebase-admin');

/**
 * @author Sultan
 * 
 * Responsible for manipulating profile records in the database.
 */
class ProfileRepo {
    async uploadAvatar(userId, newAvatarUrl) {
        const userDbRef = admin.database().ref().child('users').child(userId);
        await userDbRef.update({
            avatar: newAvatarUrl
        });

        return true;
    }

    async updateStatus(userId, newStatus) {
        const {
            status
        } = require('../userStatus');

        for (const val of status) {
            if (val.name === newStatus) {
                await admin.database().ref().child('users').child(userId).child('status').set(val);
                return true;
            }
        }

        return false;
    }

    getStatusList() {
        const {
            status
        } = require('../userStatus');

        return status;
    }
}

module.exports = new ProfileRepo();