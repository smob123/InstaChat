/**
 * @author Sultan
 * 
 * friends tab, which displays the user's firends, sent friend requests, and received friend requests.
 */
import React, { Component } from 'react';
import { withRouter } from "react-router";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonItem,
  IonAvatar,
  IonImg,
  IonLabel,
  IonButton,
  IonIcon,
  IonToast
} from '@ionic/react';
import './Friends.css';
import { ellipse } from 'ionicons/icons';

interface State {
  friends: Array<any>,
  sentFriendRequests: Array<any>,
  receivedFriendRequests: Array<any>,
  errorMessage: string,
  showAlert: boolean
}

class Friends extends Component<any, State> {

  // checks whether the component is mounted or not 
  // (needed because the observers will try to immediately access the component's state when the user navigates back to this component after its parent has been unmounted)
  isComponentMounted: boolean = false

  constructor(props: any) {
    super(props);

    this.state = {
      friends: [],
      sentFriendRequests: [],
      receivedFriendRequests: [],
      errorMessage: '',
      showAlert: false
    }
  }

  componentDidMount() {
    this.isComponentMounted = true;
    // make the requried network requests to populate the screen with data
    this.props.FriendsModel.fetchFriends();
    this.props.FriendsModel.fetchSentFriendRequests();
    this.props.FriendsModel.fetchReceivedFriendRequests();
    // initialze change observers
    this.initializeFriendsObserver();
    this.initializeSentFriendRequestsObserver();
    this.initializeReceivedFriendRequestsObserver();
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
  }

  /**
   * observes changes to the friends objects in the modle
   */
  initializeFriendsObserver() {
    this.props.FriendsModel.getFriends().subscribe((users: any) => {
      if (this.isComponentMounted) {
        this.setState({ friends: users });
      }
    })
  }

  /**
   * observes changes to the sent friend requests objects in the modle
   */
  initializeSentFriendRequestsObserver() {
    this.props.FriendsModel.getSentRequests().subscribe((users: any) => {
      if (this.isComponentMounted) {
        this.setState({ sentFriendRequests: users });
      }
    })
  }

  /**
   * observes changes to the received friend requests objects in the modle
   */
  initializeReceivedFriendRequestsObserver() {
    this.props.FriendsModel.getReceivedRequests().subscribe((users: any) => {
      if (this.isComponentMounted) {
        this.setState({ receivedFriendRequests: users });
      }
    })
  }

  /**
   * parses and returns the sent friend requests
   */
  getSentFriendRequests(userList: Array<any>) {
    const users = [];
    const defaultAvatar = require('../../../assets/default_avatar.png');

    for (const user of userList) {
      users.push(
        <IonCard key={user.id}>
          <IonItem>
            <IonAvatar slot="start">
              <IonImg src={user.avatar || defaultAvatar}></IonImg>
            </IonAvatar>

            <IonLabel>
              <h2> {user.username}</h2>
              <div className='flex-align-items-center'>
                <IonIcon icon={ellipse} slot='start' style={{ color: user.status.iconColor }}></IonIcon>
                <span className='margin-start'>{user.status.name}</span>
              </div>
            </IonLabel>

            <div slot='end'>
              <IonButton slot='start' onClick={() => this.props.FriendsModel.cancelFriendRequest(user.id)}>Cancel</IonButton>
            </div>
          </IonItem>
        </IonCard>
      )
    }

    return users;
  }

  /**
   * parses and returns the received friend requests
   */
  getReceivedFriendRequests(userList: Array<any>) {
    const users = [];
    const defaultAvatar = require('../../../assets/default_avatar.png');

    for (const user of userList) {
      users.push(
        <IonCard key={user.id}>
          <IonItem>
            <IonAvatar slot="start">
              <IonImg src={user.avatar || defaultAvatar}></IonImg>
            </IonAvatar>

            <IonLabel>
              <h2> {user.username}</h2>
              <div className='flex-align-items-center'>
                <IonIcon icon={ellipse} slot='start' style={{ color: user.status.iconColor }}></IonIcon>
                <span className='margin-start'>{user.status.name}</span>
              </div>
            </IonLabel>

            <div slot='end'>
              <IonButton slot='start' onClick={() => this.props.FriendsModel.acceptFriendRequest(user.id)}>Accept</IonButton>
              <IonButton onClick={() => this.props.FriendsModel.rejectFriendRequest(user.id)}>Reject</IonButton>
            </div>
          </IonItem>
        </IonCard>
      )
    }

    return users;
  }

  /**
   * parses and returns the user's friend list
   */
  getFriendsList(userList: Array<any>) {
    const users = [];
    const defaultAvatar = require('../../../assets/default_avatar.png');

    for (const user of userList) {
      users.push(
        <IonCard key={`friend_${user.id}`} onClick={() => this.props.history.push(`chats/${user.id}`)}>
          <IonItem>
            <IonAvatar slot="start">
              <IonImg src={user.avatar || defaultAvatar}></IonImg>
            </IonAvatar>

            <IonLabel>
              <h2> {user.username}</h2>
              <div className='flex-align-items-center'>
                <IonIcon icon={ellipse} slot='start' style={{ color: user.status.iconColor }}></IonIcon>
                <span className='margin-start'>{user.status.name}</span>
              </div>
            </IonLabel>

          </IonItem>
        </IonCard>
      )
    }

    return users;
  }

  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Friends</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Friends</IonTitle>
            </IonToolbar>
          </IonHeader>

          {
            /** only displys this  part if the user has no friends, nor friend requests*/
            this.state.friends.length < 1 &&
            this.state.receivedFriendRequests.length < 1 &&
            this.state.sentFriendRequests.length < 1 &&
            <div className='full-screen flex-align-items-center flex-justify-content-center'>
              <p>Here you can see the list of your friends</p>
            </div>
          }

          {
            /** only display this part if there are  sent friend requests */
            this.state.sentFriendRequests.length > 0 &&
            <div>
              <h3 className='ion-margin-start'>
                Pending Requests ({this.state.sentFriendRequests.length})
            </h3>

              {this.getSentFriendRequests(this.state.sentFriendRequests)}
            </div>
          }

          {
            /** only display this part if there are  received friend requests */
            this.state.receivedFriendRequests.length > 0 &&
            <div>
              <h3 className='ion-margin-start'>
                Received Requests ({this.state.receivedFriendRequests.length})
            </h3>

              {this.getReceivedFriendRequests(this.state.receivedFriendRequests)}
            </div>
          }

          {/** the list of the user's friends */}
          <h3 className='ion-margin-start'>Friends ({this.state.friends.length})</h3>
          {
            this.state.friends.length > 0 &&
            this.getFriendsList(this.state.friends)
          }
        </IonContent>

        {/* displays error messages */}
        <IonToast
          isOpen={this.state.showAlert}
          onDidDismiss={() => this.setState({ showAlert: false })}
          duration={1000}
          message={this.state.errorMessage}
          buttons={['Okay']}
        />
      </IonPage>
    );
  }
};

export default withRouter(Friends);
