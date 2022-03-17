import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function LikedFormSubmissionListItem({props: likedForm}) {
  return (
    <Typography variant="body1" sx={{fontStyle: 'italic', marginTop: 1}}>
      {likedForm.id} | {likedForm.data.firstName} | {likedForm.data.lastName}
    </Typography>
  );
}

export default function Content({props}) {
  return (
    <Box sx={{marginTop: 3}}>
      <Typography variant="h4">Liked Form Submissions</Typography>

      {props.filter(x => x.data.liked).map(likedForm => <LikedFormSubmissionListItem key={likedForm.id} props={likedForm} />)}
    </Box>
  );
}
