/**
 * @author Sultan
 */

import React from 'react';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Switch, Redirect } from 'react-router-dom';
import AppModel from './AppModel';
import { ApolloProvider } from '@apollo/client';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

/* Global Styles */
import './globalStyles.css';

/* protected route */
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { AuthProvider } from './Auth';

/* screens */
import Tabs from './pages/tabs/Tabs';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import Chat from './pages/chat/Chat';

const App: React.FC = () => (
  <IonApp>
    {/* graphql client */}
    <ApolloProvider client={AppModel.getApolloClient()}>
      {/* verifies the user's auth state so that the app can decide whether to load the login screen, or the main app's screen */}
      <AuthProvider>
        <IonReactRouter>
          <Switch>
            {/* protected routes are only accessible when the user is logged in*/}
            <ProtectedRoute exact path={'/(|chats|friends|explore|profile)'} component={Tabs} />
            <ProtectedRoute exact={true} path='/chats/:userId' component={Chat} />
            {/* auth screens */}
            <IonRouterOutlet>
              <Route exact path='/login' component={Login} />
              <Route exact path='/register' component={Register} />
            </IonRouterOutlet>
            {/* redirect 404s to "/" */}
            <Redirect from='*' to='/' />
          </Switch>
        </IonReactRouter>
      </AuthProvider>
    </ApolloProvider>
  </IonApp>
);

export default App;