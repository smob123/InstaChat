/**
 * @author Sultan
 * 
 * explore tab, which suggests a list of accounts for the user to follow.
 */
import React, { Component } from 'react';
import { withRouter } from "react-router";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
  IonToast,
  IonInput
} from '@ionic/react';
import Gallery from '../../../components/Gallery/Gallery';
import './Explore.css';

interface State {
  // the list of all recommended users
  recommendedUsers: Array<any>,
  // the filtered list of users, which changes on search
  filteredUsersList: Array<any>,
  errorMessage: string,
  displayToast: boolean
}

class Explore extends Component<any, State> {

  // checks whether the component is mounted or not 
  // (needed because the observers will try to immediately access the component's state when the user navigates back to this component after its parent has been unmounted)
  isComponentMounted: boolean = false

  constructor(props: any) {
    super(props);
    this.state = {
      recommendedUsers: [],
      filteredUsersList: [],
      errorMessage: '',
      displayToast: false
    }
  }

  componentDidMount() {
    this.isComponentMounted = true;
    // make the requried network requests to populate the screen with data
    this.props.ExploreModel.fetchRandomUsers();
    // initialze change observers
    this.initializeRecommendedUsersObserver();
    this.initializeErrorMessageObserver();
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
  }

  /**
   * observes changes to the recommended users object on the modle
   */
  initializeRecommendedUsersObserver() {
    this.props.ExploreModel.getRecommendedUsers().subscribe((users: any) => {
      if (this.isComponentMounted) {
        // hide the refresher
        document.querySelector('ion-refresher')?.complete();
        this.setState({ recommendedUsers: users, filteredUsersList: users });
      }
    })
  }

  /**
   * observes changes to the error message object in the modle
   */
  initializeErrorMessageObserver() {
    this.props.ExploreModel.getErrorMessage().subscribe((message: any) => {
      if (message && this.isComponentMounted) {
        // hide the refresher
        document.querySelector('ion-refresher')?.complete();
        this.setState({ errorMessage: message, displayToast: true });
      }
    })
  }

  /**
   * filters the list of users based on a given search term
   */
  filterUsersList(searchTerm: string) {
    //find the items the match the serch term
    const filteredList = this.state.recommendedUsers.filter((user) => {
      const currentItem = user.username.toUpperCase();
      searchTerm = searchTerm.toUpperCase();

      return currentItem.indexOf(searchTerm) > -1; //return all items that match the search term
    });

    this.setState({ filteredUsersList: filteredList });
  }

  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Explore</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          {/* refresher to update the current list of recommended users */}
          <IonRefresher slot="fixed" onIonRefresh={() => this.props.ExploreModel.fetchRandomUsers()}>
            <IonRefresherContent></IonRefresherContent>
          </IonRefresher>

          {/* search bar */}
          <IonInput placeholder='Search' className='search-bar' onIonChange={(e) => this.filterUsersList(e.detail.value!)} />

          {
            /* only display this when the list of recommended users is empty */
            this.state.filteredUsersList.length < 1 &&
            <div className='full-screen flex-align-items-center flex-justify-content-center'>
              <p>You can see friend recommendations here</p>
            </div>
          }

          {
            /* display the list of recommended users in a gallery view */
            this.state.filteredUsersList.length > 0 &&
            <Gallery ncols={2} users={this.state.filteredUsersList} />
          }
        </IonContent>

        {/* displays error messages */}
        <IonToast
          message={this.state.errorMessage}
          isOpen={this.state.displayToast}
          duration={1000}
          onDidDismiss={() => this.setState({ displayToast: false })}></IonToast>
      </IonPage>
    );
  }
};

export default withRouter(Explore);