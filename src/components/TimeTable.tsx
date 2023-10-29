import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { styled } from '@mui/system';

const GridContainer = styled(Paper)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr', 
  gridAutoRows: 'minmax(60px, auto)', // Minimum height of 60px but can stretch based on content or container size
  width: '100%',
  height: '100%',
  overflow: 'auto',
});

const StyledTableCell = styled(TableCell)({
  overflow: 'hidden', 
  whiteSpace: 'nowrap', 
  textOverflow: 'ellipsis',
});

function TimeTable() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 6 }, (_, i) => 8 + i);

  return (
    <GridContainer>
      <StyledTableCell>Time</StyledTableCell>
      {days.map((day) => (
        <StyledTableCell key={day}>{day}</StyledTableCell>
      ))}
      {hours.map((hour) => (
        <React.Fragment key={hour}>
          <StyledTableCell>{hour}:00</StyledTableCell>
          {days.map((day) => (
            <StyledTableCell key={day}></StyledTableCell>
          ))}
        </React.Fragment>
      ))}
    </GridContainer>
  );
}

export default TimeTable;
