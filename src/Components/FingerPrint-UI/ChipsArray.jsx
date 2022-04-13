import * as React from 'react';
import { styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import TagFacesIcon from '@mui/icons-material/TagFaces';
import { useEffect, useRef, useState } from "react";

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

export default function ChipsArray(props) {
 
  
  return (
    <Paper
      sx={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        listStyle: 'none',
        p: 0.5,
        m: 0,
      }}
      component="ul"
      elevation={0}
    >
      {props.fingers.map((data) => {
        let icon;
        return (
          <ListItem key={data.key}>
            <Chip
              icon={icon}
              label={data.label}
              onDelete={props.handleDelete(data)}
            />
          </ListItem>
        );
      })}
    </Paper>
  );
}
