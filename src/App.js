import React from 'react';
import Container from '@mui/material/Container';

import Header from './Header';
import Content from './Content';
import Toast from './Toast';

import {saveLikedFormSubmission, onMessage, fetchLikedFormSubmissions} from './service/mockServer';

/**
 * Main stateful class component that manages behavior of the presentational components.
 */
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      likedFormSubmissions: this.getPersistedLikedForms(),
      bShowSnackbar: false,
      lastSubmittedForm: null
    }
  }

  async componentDidMount() {
    await this.hydrateLikedForms();
  
    onMessage(form => this.onFormSubmitted(form));
  }

  componentWillUnmount() {
    this.persistLikedForms();
    this.tearDownSnackbarTimer();
  }

  /**
   * Update list of likedForms with what is in the server.
   */
  async hydrateLikedForms() {
    let result;
    try {
      result = await fetchLikedFormSubmissions();
    } catch(error) {
      // Retry indefinite amount of times until we get the liked forms.
      result = await this.retryUntilSucceeded(fetchLikedFormSubmissions, [], -1);
    }
    if (result) {
      this.setState({likedFormSubmissions: result.formSubmissions});
    }
  }

  /**
   * Callback for when a new submission is made. Called by the server.
   * @param {Object} form A form object that matches the submitted form objects.
   */
  onFormSubmitted(form) {
    this.setState({ lastSubmittedForm: form });
    this.openSnackbarFor5Seconds();
  }

  /**
   * Manually add likedForms. This is helpful to reduce visual latency by updating UI before resolving promises
   * for fetching forms from the server.
   * @param {Object} likedForm A form object that matches the submitted form objects.
   */
  addLikedFormLocally(likedForm) {
    this.setState({ likedFormSubmissions: [...this.state.likedFormSubmissions, likedForm] });
  }

  /**
   * Save form server side. Simulate liking by closing snackbar. Also add liked form locally
   * and then wait for fetching the liked forms from server.
   */
  likeFormSubmission = async () =>  {
    const { lastSubmittedForm } = this.state;
    const likedForm = {...lastSubmittedForm, data: { ...lastSubmittedForm.data, liked: true }};

    this.addLikedFormLocally(likedForm);

    try {
      await saveLikedFormSubmission(likedForm);

      this.persistLikedForms();      
      this.hydrateLikedForms();
    } catch(error) {
      this.retryUntilSucceeded(saveLikedFormSubmission, [likedForm]);
    }

    this.closeSnackbar();
  }

  /**
   * Recursively retry async calls until they are successful.
   * @param {Function} asyncRequest The async method (that returns a Promise) to retry.
   * @param {Any[]} args An array of arguments to pass of any type.
   * @param {Number} retriesLeft Number of times to retry async request before giving up. -1 = retry infinite times.
   * @returns 
   */
  async retryUntilSucceeded(asyncRequest, args = [], retriesLeft = 3) {
    if (retriesLeft === 0) {
      return;
    }

    let result;
    try {
      result = await asyncRequest(...args);
    } catch(error) {
      result = await this.retryUntilSucceeded(asyncRequest, args, retriesLeft - 1);
    }
    return result;
  }

  /**
   * Clear snackbar timeout. This is useful for cases where snackbar is called repeatedly and
   * previous snackbar is removed but its 5 second timer is still running.
   */
  tearDownSnackbarTimer() {
    if (this.snackbarTimerId) {
      clearTimeout(this.snackbarTimerId);
    };
  }

  /**
   * Simple closing of snackbar.
   */
  closeSnackbar() {
    if (this.state.bShowSnackbar) {
      this.setState({bShowSnackbar: false});
    }
  }

  /**
   * Setup a timer for snackbar to open for 5 seconds then close.
   */
  openSnackbarFor5Seconds() {
    this.tearDownSnackbarTimer();
    this.setState({bShowSnackbar: true});
    this.snackbarTimerId = setTimeout(() => this.closeSnackbar(), 5000);
  }

  /**
   * Save liked forms to local storage.
   */
  persistLikedForms() {
    window.localStorage.setItem('likedFormSubmissions', JSON.stringify(this.state.likedFormSubmissions));
  }

  /**
   * Retrieve liked forms saved to local storage.
   * @returns An array of liked form submissions. Empty if they were never persisted.
   */
  getPersistedLikedForms() {
    return JSON.parse(localStorage.getItem('likedFormSubmissions')) || []
  }

  /**
   * Close the snackbar via button click.
   * @param {ClickEvent} event Node event representing button click.
   * @param {String} reason How the snackbar was closed. 
   * @returns 
   */
  handleCloseSnackbar(event, reason) {
    if (reason == 'clickaway') {
      return;
    }

    this.closeSnackbar();
  }

  render() {
    return (
      <>
        <Header />
        <Container>
          <Content props={this.state.likedFormSubmissions}/>
        </Container>
        <Toast open={this.state.bShowSnackbar} lastSubmittedForm={this.state.lastSubmittedForm} onClose={this.handleCloseSnackbar} onLike={this.likeFormSubmission} />
      </>
    );
  }
}

export default App;
