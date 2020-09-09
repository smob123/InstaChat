/**
 * @author Sultan
 * 
 * the chats tab, which displays the user's latest conversations
 */

import React, { Component } from 'react';
import { withRouter } from "react-router";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonItem, IonLabel, IonAvatar, IonImg, IonIcon } from '@ionic/react';
import './Chats.css';
import { ellipse, image } from 'ionicons/icons';

interface State {
  chats: Array<any>
}

class Chats extends Component<any, State> {

  // checks whether the component is mounted or not 
  // (needed because the observers will try to immediately access the component's state when the user navigates back to this component after its parent has been unmounted)
  isComponentMounted: boolean = false

  constructor(props: any) {
    super(props);
    this.state = {
      chats: []
    }
  }

  componentDidMount() {
    this.isComponentMounted = true;
    // make the requried network requests to populate the screen with data
    this.props.ChatsModel.fetchChats();
    // initialze change observers
    this.initializeChatsObserver();
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
  }

  /**
   * observes changes to the chat objects in the modle
   */
  initializeChatsObserver() {
    this.props.ChatsModel.getChats().subscribe((chats: any) => {
      if (this.isComponentMounted) {
        this.setState({ chats });
      }
    })
  }

  /**
   * parses the chats' dates to display them in these formates:
   * if the message was received on the same day
   * hh:mm PM/AM
   * 
   * if the message was received on a different day:
   * DD/MM/YYYY
   */
  parseDate(dateString: string) {
    const datetime = new Date(dateString);
    const now = new Date(Date.now());

    if (datetime.getDate() === now.getDate() &&
      datetime.getMonth() === now.getMonth() &&
      datetime.getFullYear() === now.getFullYear()) {
      const hour = datetime.getHours() > 12 ? Math.abs(12 - datetime.getHours()) : datetime.getHours();
      const minute = datetime.getMinutes() < 10 ? `0${datetime.getMinutes()}` : datetime.getMinutes();
      const timeOfDay = datetime.getHours() > 12 ? 'PM' : 'AM';
      return `${hour}:${minute} ${timeOfDay}`;
    }

    return `${datetime.getDate()}/${datetime.getMonth() + 1}/${datetime.getFullYear()}`;
  }

  render() {
    return (
      <IonPage>
        <IonContent>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Conversations</IonTitle>
            </IonToolbar>
          </IonHeader>

          {
            /* display this if the chats array is empty */
            this.state.chats.length < 1 &&
            <div className='full-screen flex-align-items-center flex-justify-content-center'>
              <p>You can see your latest conversations here</p>
            </div>
          }

          {
            /* go through the chats array, and add card elements to represent each chat */
            this.state.chats.map((item, index) => (
              <IonCard key={`chat_${item.userId}`} onClick={() => this.props.history.push(`chats/${item.userId}`)}>
                <IonItem lines='none'>
                  {/* display the user's avatar on the left */}
                  <IonAvatar slot="start">
                    <IonImg src={item.avatar || require('../../../assets/default_avatar.png')}></IonImg>
                  </IonAvatar>

                  {/* display the contact's username and the last message in the conversation to the right of the avatar */}
                  <IonLabel>
                    <div className='flex-align-items-center'>
                      <h2 slot='start'> {item.username}</h2>
                      <IonIcon icon={ellipse} style={{ color: item.status.iconColor }} className='margin-start'>
                      </IonIcon>
                    </div>

                    {item.type === 'image' ?
                      <div className='flex-align-items-center'>
                        <IonIcon icon={image} slot='start'>
                        </IonIcon>
                        <span className='margin-start'>Image</span>
                      </div>
                      :

                      item.isRead ?
                        <p>{item.lastMessage}</p>
                        :
                        <strong color='dark'>{item.lastMessage}</strong>
                    }
                  </IonLabel>

                  {/* display the message's date at the right side of the card */}
                  <div slot='end'>
                    <span>{this.parseDate(item.datetime)}</span>
                  </div>
                </IonItem>
              </IonCard>
            ))
          }

        </IonContent>
      </IonPage>
    );
  }
};

export default withRouter(Chats);
