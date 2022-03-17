import React from 'react';
import Container from '@mui/material/Container';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import Header from './Header';
import Content from './Content';
import {saveLikedFormSubmission, onMessage, fetchLikedFormSubmissions} from './service/mockServer';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      likedFormSubmissions: this.getPersistedLikedForms(),
      bShowSnackbar: false,
      lastSubmittedForm: null
    }
  }
  
  likeSubmissionAction = (
    <React.Fragment>
      <Button onClick={() => {
        this.likeFormSubmission();
      }}>
        Like
      </Button>
        <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={(event, reason) => this.handleCloseSnackbar(event, reason)}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  )

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

  async likeFormSubmission()  {
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

  tearDownSnackbarTimer() {
    if (this.snackbarTimerId) {
      clearTimeout(this.snackbarTimerId);
    };
  }

  closeSnackbar() {
    if (this.state.bShowSnackbar) {
      this.setState({bShowSnackbar: false});
    }
  }

  openSnackbarFor5Seconds() {
    this.tearDownSnackbarTimer();
    this.setState({bShowSnackbar: true});
    this.snackbarTimerId = setTimeout(() => this.closeSnackbar(), 5000);
  }

  formSnackbarMessage() {
    let message = "First Lastname email.address@domain.com";
    if (this.state.lastSubmittedForm) {
      const { data: { firstName, lastName, email } } = this.state.lastSubmittedForm;
      message = `${firstName} ${lastName} ${email}`;
    }
    return message;
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

  handleCloseSnackbar(event, reason) {
    if (reason == 'clickaway') {
      return;
    }

    this.closeSnackbar();
  }

  render() {
    const snackbarMessage = this.formSnackbarMessage();
    return (
      <>
        <Header />
        <Container>
          <Content props={this.state.likedFormSubmissions}/>
        </Container>
        <Snackbar open={this.state.bShowSnackbar} message={snackbarMessage} action={this.likeSubmissionAction} />
      </>
    );
  }
}

export default App;
