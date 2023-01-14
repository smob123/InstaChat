/**
 * @author Sultan
 * 
 * server's setup.
 */

const express = require('express');
const app = express();
const expressGraphQL = require('express-graphql');
const cors = require('cors');

const schema = require('./res/schema');

// initialize the firebase app
const {
    firebaseConfig
} = require('./res/config/firebaseConfig');

const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: 'https://instachat-4dec4.firebaseio.com',
    storageBucket: 'instachat-4dec4.appspot.com'
});

admin.app().auth().updateUser('ifY0uVOspUSAHxmmD4THAhXzHTh1', {
    password: 'MikeSmith12#'
});

const PORT = process.env.PORT || 8080;

app.use(cors());

app.use('/graphql', expressGraphQL.graphqlHTTP({
    schema,
    graphiql: true
}));

app.listen(PORT);

console.log(`listening on http://localhost:${PORT}/graphql`);