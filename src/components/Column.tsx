import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const Column = ({show}) => {
  const hours = [];

  for (let i = 6; i <= 16; i++) {
    hours.push(i);
  }

  return (
    <Paper elevation={3} style={{ 
        width: '100px', 
        height: '100%', 
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    }}>
      {show||hours.map(hour => (
        <Typography key={hour} variant="body2" align="center">
          {hour % 12 === 0 ? 12 : hour % 12}{hour >= 12 ? 'PM' : 'AM'}
        </Typography>
      ))}
    </Paper>
  );
};

export default Column;
