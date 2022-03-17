import React from 'react';
import Container from '@mui/material/Container';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';

import Header from './Header';
import Content from './Content';
import {saveLikedFormSubmission, onMessage, fetchLikedFormSubmissions} from './service/mockServer';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      likedFormSubmissions: [],
      bShowSnackbar: false,
      lastSubmittedForm: null
    }
  }
  
  likeSubmissionAction = (
    <Button onClick={() => {
      this.likeFormSubmission();
    }}>
      Like
    </Button>
  )

  async componentDidMount() {
    await this.hydrateLikedForms();
  
    onMessage(form => this.onFormSubmitted(form));
  }

  componentWillUnmount() {
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
      result = await this.retryUntilSucceeded(fetchLikedFormSubmissions)
    }
    this.setState({likedFormSubmissions: result.formSubmissions});
  }

  /**
   * Callback for when a new submission is made. Called by the server.
   * @param {Object} form A form object that matches the submitted form objects.
   */
  onFormSubmitted(form) {
    console.log('onFormSubmitted', form);
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
    console.log('liked form');
    const { lastSubmittedForm } = this.state;
    const likedForm = {...lastSubmittedForm, data: { ...lastSubmittedForm.data, liked: true }};

    this.addLikedFormLocally(likedForm);

    try {
      const result = await saveLikedFormSubmission(likedForm);
      console.log('saved', 'result: ', result);

      this.hydrateLikedForms();
    } catch(error) {
      console.log('likeFormSubmission error', error);
      this.retryUntilSucceeded(saveLikedFormSubmission, [likedForm]);
    }

    this.closeSnackbar();
  }

  async retryUntilSucceeded(asyncRequest, args = []) {
    console.log('type async', typeof(asyncRequest));
    console.log('retrying', asyncRequest);
    let result;
    try {
      result = await asyncRequest(...args);
      console.log('retry succeeded', asyncRequest);
    } catch(error) {
      console.log('error retry', error);
      result = await this.retryUntilSucceeded(asyncRequest, args);
    }
    return result;
  }

  tearDownSnackbarTimer() {
    if (this.snackbarTimerId) {
      this.snackbarTimerId.clearTimeout();
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
    setTimeout(() => this.closeSnackbar(), 5000);
  }

  formSnackbarMessage() {
    let message = "First Lastname email.address@domain.com";
    if (this.state.lastSubmittedForm) {
      const { data: { firstName, lastName, email } } = this.state.lastSubmittedForm;
      message = `${firstName} ${lastName} ${email}`;
    }
    return message;
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
