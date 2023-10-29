//@ts-ignore
import { useAction, useMutation, useQuery } from "convex/react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import './TaskCard.css'
import React, { Component } from "react";
import ReactDOM from "react-dom";
import {Draggable} from "gsap/Draggable";

class TaskCard extends Component {
  componentDidMount() {
    Draggable.create(".draggable", {
      type: "x,y",

      onPress: function() {
        console.log("clicked");
      },
      throwProps: true,
      snap: {x: [0,100,200,300,400,500]},
      
    });
    
  }

  render() {
    return (
      <div className="task-card" style={{
        left:this.props.x,
        top:this.props.y
      }}>

        <div className="draggable"><StyledCard title={this.props.title}></StyledCard></div>
      </div>
      
    );
  }
}


export default TaskCard

import { styled } from '@mui/system';
import { Card, CardContent, Typography,  Box } from '@mui/material';
import { green } from '@mui/material/colors';


function StyledCard({ title }) {
  const [isChecked, setIsChecked] = useState(false);

  const cardStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: isChecked ? green[500] : '#fff',
    fontSize:"0.8rem",
    padding:3
  };

  return (
    <Card style={cardStyle}>
      <CardContent>
        <Typography variant="p">
          {title}
        </Typography>
      </CardContent>
      <Box m={1}>
        <Checkbox
          color="default"
          checked={isChecked}
          onClick={() => setIsChecked(!isChecked)}
        
        />
      </Box>
    </Card>
  );
}

