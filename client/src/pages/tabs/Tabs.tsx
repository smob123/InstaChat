/**
 * @author Sultan
 * 
 * handles navigating between the tabs in the main app's screen
 */

import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonTabs
} from '@ionic/react';
import { chatbox, people, search, person } from 'ionicons/icons';
import Chats from './screens/Chats';
import Friends from './screens/Friends';
import Explore from './screens/Explore';
import Profile from './screens/Profile';
import ChatsModel from './modles/chatsModel';
import ExploreModel from './modles/exploreModel';
import FriendsModel from './modles/friendsModel';
import ProfileModel from './modles/ProfileModel';
import * as app from 'firebase/app';

const Tabs: React.FC = ({ history }: any) => {
    // check if the user is still signed in, or if the cache has been removed
    if (!app.auth().currentUser || !localStorage.getItem('user')) {
        // reset the variables in all the modles
        ChatsModel.resetVariables();
        ExploreModel.resetVariables();
        FriendsModel.resetVariables();
        ProfileModel.resetVariables();
        history.push('/');
    }

    return (
        <IonTabs>
            <IonRouterOutlet>
                {/* the screens inside the different tabs */}
                <Route path="/chats" exact={true}>
                    <Chats ChatsModel={ChatsModel} />
                </Route>
                <Route path="/friends" exact={true}>
                    <Friends FriendsModel={FriendsModel} />
                </Route>

                <Route path="/explore" exact={true}>
                    <Explore ExploreModel={ExploreModel} />
                </Route>

                <Route path='/profile' exact={true}>
                    <Profile ProfileModel={ProfileModel} />
                </Route>
                <Route path="/" render={() => <Redirect to="/chats" />} exact={true} />
            </IonRouterOutlet>
            {/* the bottom navigation bar */}
            <IonTabBar slot="bottom">
                <IonTabButton tab="chats" href="/chats">
                    <IonIcon icon={chatbox} />
                    <IonLabel>Chats</IonLabel>
                </IonTabButton>
                <IonTabButton tab="friends" href="/friends">
                    <IonIcon icon={people} />
                    <IonLabel>Friends</IonLabel>
                </IonTabButton>
                <IonTabButton tab="explore" href="/explore">
                    <IonIcon icon={search} />
                    <IonLabel>Explore</IonLabel>
                </IonTabButton>
                <IonTabButton tab="profile" href="/profile">
                    <IonIcon icon={person} />
                    <IonLabel>Profile</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    )
};

export default Tabs;