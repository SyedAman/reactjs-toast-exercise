import React from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar from '@mui/material/Snackbar';

/**
 * Generates toast message string.
 * @returns A string representing the toast message when a user submits a form.
 */
function formSnackbarMessage(submittedForm) {
    let message = "First Lastname email.address@domain.com";
    if (submittedForm) {
      const { data: { firstName, lastName, email } } = submittedForm;
      message = `${firstName} ${lastName} ${email}`;
    }
    return message;
}


function Toast({ open, lastSubmittedForm, onClose, onLike }) {
    /**
     * Snackbar action buttons including liking form submission and closing snackbar.
     */
    const likeSubmissionAction = (
        <React.Fragment>
            <Button onClick={onLike}>
            Like
            </Button>
            <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={(event, reason) => onClose(event, reason)}
            >
            <CloseIcon fontSize="small" />
            </IconButton>
        </React.Fragment>
    );

    const snackbarMessage = formSnackbarMessage(lastSubmittedForm);

    return <Snackbar open={open} message={snackbarMessage} action={likeSubmissionAction} />
}

export default Toast;