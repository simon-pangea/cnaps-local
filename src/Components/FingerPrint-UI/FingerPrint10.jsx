import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import FingerIcon from "../../assets/images/fingerprint-capture.png";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import SplitedFingers from "./SplitedFingers";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import MissingFingersDialog from "./MissingFingersDialog";

export default function FingerPrint10() {
  //-------config-------//

  const loc = "localhost:44394";
  const protocal = loc.protocol;
  const w = protocal === `https:` ? `wss` : `ws`;
  const uri = `${w}://${loc}/fingerprints`;

  //-------------------//

  //---Logic. Server Conversation---//

  const [socket, setSocket] = useState();

  const connect = () => {
    if (socket) return;

    try {
      const _socket = new WebSocket(uri);
      setSocket(_socket);

      _socket.onopen = ($event) => {
        console.log(`opened connection to ` + uri);
      };

      _socket.onclose = ($event) => {
        console.log(`closed connection from ` + uri);
        setScan(true);
      };

      _socket.onmessage = ($event) => {
        console.log($event.data);
        handleMessage($event.data, _socket);
      };

      _socket.onerror = ($event) => {
        console.log(`error: ` + $event.data);
      };
    } catch (error) {
      console.log(error);
    }
  };

  //-----------------------------//

  const [fingerprintsImage, setFingerprintsImage] = useState(FingerIcon);
  const [msg, setMsg] = useState("");
  const [devices, setDevices] = useState([]);
  const [positions, setPosition] = useState([]);
  const positionList = useRef(null);

  const [device, setDevice] = useState("");
  const [pos, setPos] = useState("");
  const [scan, setScan] = useState(true);

  const [leftfingersData, setLeftFingersData] = useState([]);
  const [rightfingersData, setRightFingersData] = useState([]);
  const [missingFingerDialog, setmissingFingerDialog] = useState(false);
  const [missingFingerArr, setmissingFingerArr] = useState([]);

  useEffect(() => {
    connect();
  }, [socket]);

  const handleMessage = (message, _socket) => {
    if (message.indexOf("{") == 0) {
      const data = message.slice(message.indexOf("{"));
      const item = JSON.parse(data);
      if (item.Description === undefined) return;
      switch (item.Description) {
        case "hello":
          sendMessage("GetDeviceList", _socket);
          break;
        case "DeviceList":
          setDevices(item.Data);
          if(item.Data.length>0){
            setScan(false);
          }
          break;
        case "SelectedDevice":
          sendMessage("GetSupportedPositions", _socket);
          break;
        case "PositionList":
          setPosition(item.Data);
          break;
        case "binary":
          setFingerprintsImage(`data:image/png;base64,${item.Data}`);
          break;
        case "PlainLeftFourFingers":
          setLeftFingersData(item.Data);
          sendMessage(`ScanPlainRightFourFingers` + missFingersData(missingFingerArr), _socket);
          beep();
          break;
        case "PlainRightFourFingers":
          setRightFingersData(item.Data);
          sendMessage(`ScanPlainThumbs` + missFingersData(missingFingerArr), _socket);
          beep();
          break;
        case "PlainThumbs":
          addThumbs(item.Data);
          setScan(false);
          break;
        case "status":
          setMsg(item.Data);
          if (item.Data === "Ok") {
          }
          break;
        case "ClearedSubject":
          clear();
          break;
        case "error":
          setMsg(item.Data);
          break;
      }
    }
  };

  function sendMessage(message, _socket) {
    console.log(`Sending: ` + message);
    _socket.send(message);
  }

  const deviceChanged = (event) => {
    sendMessage(`SelectDevice:${event.target.value}`, socket);
  };

  function clear() {
    setMsg("");
    setFingerprintsImage(FingerIcon);
  }

  const scanBtn = () => {
    setmissingFingerDialog(true);
  };

  const startScan = (arr) => {
    sendMessage(`SelectDevice:${devices[0]}`, socket);
    sendMessage(`ScanPlainLeftFourFingers` + missFingersData(arr), socket);
    setScan(true);
  };

  const clearBtn = () => {
    sendMessage(`ClearSubject`, socket);
    clear();
  };

  const { t } = useTranslation();

  const devHandleChange = (event) => {
    setDevice(event.target.value);
    deviceChanged(event);
  };

  const posHandleChange = (event) => {
    setPos(event.target.value);
  };

  const missFingersData = (arr) => {
    let mf = "";
    arr.map((f) => {
      mf += "/" + f.label;
    });
    return mf;
  };

  const addThumbs = (thumbs) => {
    thumbs.map((t) => {
      if (t === undefined) return;
      if (rightfingersData.length == 4) return;
      if (leftfingersData.length == 4) return;
      switch (t.position) {
        case "RightThumb":
          setRightFingersData((oldArray) => [...oldArray, t]);
          break;
        case "LeftThumb":
          setLeftFingersData((oldArray) => [...oldArray, t]);
          break;
      }
    });
  };

  const beep = () => {
    new Audio(
      "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU" +
        Array(1e3).join(123)
    ).play();
  };

  return (
    <div className="App">
      <div class="float-container" style={{ alignSelf: "center" }}>
        <div class="image-and-button">
          {missingFingerDialog && (
            <>
              <MissingFingersDialog
                //startScan={startScan}
                open={true}
                dialogClose={() => setmissingFingerDialog(false)}
                missFingers={(arr) => {
                  setmissingFingerArr(arr);
                  startScan(arr);
                }}
              />
            </>
          )}
          {leftfingersData.length > 0 && (
            <Paper
              sx={{
                marginY: 1,
              }}
            >
              <Typography
                component="h1"
                variant="h5"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  margin: "auto",
                }}
              >
                Left Hand
              </Typography>
              <SplitedFingers
                fData={leftfingersData}
                style={{
                  maxWidth: "50%",
                  maxHeight: "50%",
                  alignSelf: "center",
                  margin: "auto",
                }}
              />
            </Paper>
          )}

          {rightfingersData.length > 0 && (
            <Paper
              sx={{
                marginY: 1,
              }}
            >
              <Typography
                component="h1"
                variant="h5"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  margin: "auto",
                }}
              >
                Right Hand
              </Typography>
              <SplitedFingers
                fData={rightfingersData}
                style={{
                  maxWidth: "50%",
                  maxHeight: "50%",
                  alignSelf: "center",
                  margin: "auto",
                }}
              />
            </Paper>
          )}

          <Paper
            sx={{
              display: "flex",
              marginY: 1,
            }}
          >
            <img
              id="fingerprintsImage"
              src={fingerprintsImage}
              style={{
                maxWidth: "50%",
                maxHeight: "50%",
                alignSelf: "center",
                margin: "auto",
              }}
            />
          </Paper>
          <button
            type="button"
            className="button"
            onClick={scanBtn}
            disabled={scan}
          >
            {t("START")}
          </button>
        </div>
      </div>
    </div>
  );
}
