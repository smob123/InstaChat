/**
 * @author Sultan
 * 
 * a route that takes the user to the specified component only if the user is logged in
 */

import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext } from '../../Auth';

const ProtectedRoute: React.FC<{ path: string, exact: boolean, component: any }> = (props) => {
    const { path, exact, component } = props;

    // get the user's info from AuthContext
    const { currentUser } = useContext(AuthContext);

    // return a route with the specified component if the user is logged in, otherwise redirect them to the login screen
    return currentUser !== null ? <Route path={path} exact={exact} component={component} />
        : <Redirect to='/login' />;
}

export default ProtectedRoute;