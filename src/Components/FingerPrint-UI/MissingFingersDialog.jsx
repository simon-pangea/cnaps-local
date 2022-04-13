import * as React from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import hamdsImg from "../../assets/images/hands.png";
import ImageMapper from "react-image-mapper";
import ChipsArray from "./ChipsArray";
import { useEffect, useRef, useState } from "react";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function MissingFingersDialog(props) {
  const [open, setOpen] = React.useState(props.open);
  const [fingers, setFingers] = React.useState([]);

  const AREAS_MAP = {
    name: "my-map",
    areas: [
      {
        key: "1",
        name: "LeftThumb",
        shape: "circle",
        coords: [50, 170, 30],
      },
      {
        key: "2",
        name: "LeftIndex",
        shape: "circle",
        coords: [100, 65, 20],
      },
      {
        key: "3",
        name: "LeftMiddle",
        shape: "circle",
        coords: [138, 42, 20],
      },
      {
        key: "4",
        name: "LeftRing",
        shape: "circle",
        coords: [178, 65, 20],
      },
      {
        key: "5",
        name: "LeftLittle",
        shape: "circle",
        coords: [208, 105, 20],
      },
      {
        key: "6",
        name: "RightLittle",
        shape: "circle",
        coords: [285, 105, 20],
      },
      {
        key: "7",
        name: "RightRing",
        shape: "circle",
        coords: [317, 62, 20],
      },
      {
        key: "8",
        name: "RightMiddle",
        shape: "circle",
        coords: [357, 37, 20],
      },
      {
        key: "9",
        name: "RightIndex",
        shape: "circle",
        coords: [396, 60, 20],
      },
      {
        key: "10",
        name: "RightThumb",
        shape: "circle",
        coords: [450, 160, 30],
      },
    ],
  };

  const addFingers = () => {
    console.log(fingers);
    return <ChipsArray fingers={fingers} />;
  };

  const handleDelete = (chipToDelete) => () => {
    setFingers(fingers.filter((chip) => chip.key !== chipToDelete.key));
  };

  return (
    <div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Select Missing Fingers"}</DialogTitle>
        <DialogContent style={{ textAlign: "center" }}>
          <ImageMapper
            src={hamdsImg}
            map={AREAS_MAP}
            width={500}
            onClick={(area) => {
              if (!fingers.some(e => e.key === area.key)) {
                setFingers([...fingers, { key: area.key, label: area.name }]);
              }
            }}
          />
          <ChipsArray fingers={fingers} handleDelete={handleDelete} />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              props.dialogClose();
              props.missFingers(fingers);
              //props.startScan();
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
