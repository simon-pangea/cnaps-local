import * as React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import Grid from '@mui/material/Grid';

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  textAlign: "center",
  color: theme.palette.text.secondary,
  height: 60,
  lineHeight: "60px",
}));

export default function SplitedFingers(props) {
  return (
    <Box
      sx={{
        alignSelf: "center",
        display: "flex",
        flexWrap: "wrap",
        "& > :not(style)": {
          m: 1,
          width: 128,
          height: 150,
        },
      }}
    >
      {props.fData.map((d) => (
        <Item key={d.position+Date.now}>
          {d.position}
          <br/>
          <img src={`data:image/png;base64,${d.Image}`} style={{maxWidth:80, maxHeight:80}} />
        </Item>
      ))}
    </Box>
  );
}
