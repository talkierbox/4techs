//@ts-ignore
import React, { useState } from 'react';
import { styled } from '@mui/system';
import { Paper } from '@mui/material';
import TimeTable from './TimeTable';
import TaskCard from './TaskCard';
import { Button, Box, TextField } from '@mui/material';
import "./World.css"

function World() {

  const [showAdd, setShowAdd] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [cards, setCards] = useState([{title:"aaaa",x:0,y:0}])
  const handleSubmit = () => {
    console.log(inputValue); // Here, you can handle the input value as you wish
    setShowAdd(false)
    setCards([...cards,{title:inputValue,x:0,y:0}])
    setInputValue("")
  };
  function addTask() {
    setShowAdd(true);
  }
  return (

    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px' }}>
      {showAdd && (<div className='add-window'>
        <Paper>
          <TextField
            label="Task name"
            variant="outlined"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            fullWidth
          />
          <Button variant="contained" color="primary" onClick={handleSubmit} style={{ marginTop: 16 }}>
            OK
          </Button>
        </Paper>
      </div>)}
      <div style={{ width: '20%', marginRight: '20px', display: "flex", flexDirection: "column" }}>
        <Paper style={{ height: '80vh', padding: '10px', boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)' }}>
          {
            cards.map(({title,x,y})=>{
                return  <TaskCard title={title} x={x} y={y}/>
            })
           
          }

        </Paper>
        <Box display="flex" justifyContent="space-between" mt={0} width="100%" height="20px">
          <Button variant="contained" onClick={addTask} color="primary" style={{ fontSize: '12px', width: '50%' }} >
            Add Task
          </Button>
          <Button variant="contained" color="secondary" style={{ fontSize: '12px', width: '50%' }}>
            Add Project
          </Button>
        </Box>
      </div>
      <Paper style={{ width: '80%', height: '80vh', overflowY: 'auto', boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)' }}>
        <TimeTable />
      </Paper>
      <div className='add-user'>
        <Paper></Paper>
      </div>
    </div>
  );
}
export default World;

