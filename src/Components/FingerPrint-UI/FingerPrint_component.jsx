import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import FingerIcon from "../../assets/images/fingerprint-capture.png";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import SplitedFingers from "./SplitedFingers";

export default function FingerPrint() {
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
  const [scan, setScan] = useState(false);

  const [leftfingersData, setLeftFingersData] = useState([]);
  const [rightfingersData, setRightFingersData] = useState([]);

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
          setLeftFingersData([]);
          setLeftFingersData(item.Data);
          break;
        case "PlainThumbs":
          addThumbs(item.Data);
          break;
        case "PlainRightFourFingers":
          setRightFingersData([]);
          setRightFingersData(item.Data);
          break;
        case "status":
          setMsg(item.Data);
          if (item.Data === "Ok") {
            setScan(false);
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
    sendMessage(`Scan${pos}`, socket);
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

  const addThumbs = (thumbs) => {
    thumbs.map((t) => {
      if (t === undefined) return;
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

  return (
    <div className="App">
      <div class="float-container">
        <div class="image-and-button">
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Select Device</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={device}
              label="Select Device"
              onChange={devHandleChange}
            >
              {devices.map((devic) => (
                <MenuItem value={devic} key={devic}>
                  {devic}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <br />
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Position List</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={pos}
              label="Position List"
              onChange={posHandleChange}
            >
              {positions.map((position) => (
                <MenuItem value={position} key={position}>
                  {position}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <br />

          <button
            type="button"
            className="button"
            onClick={scanBtn}
            disabled={scan}
          >
            {t("Scan")}
          </button>

          <br />
          <Typography
            component="h1"
            variant="h5"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            style={msg === "Ok" ? { color: "lime" } : { color: "red" }}
          >
            {msg}
          </Typography>
          <img
            id="fingerprintsImage"
            src={fingerprintsImage}
            style={{ maxWidth: "50%", maxHeight: "50%", alignSelf: "center" }}
          />
          <button type="button" className="button" onClick={clearBtn}>
            {t("Clear Results")}
          </button>
          <Typography
            component="h1"
            variant="h5"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: 5,
            }}
          >
            Left Hand
          </Typography>
          <SplitedFingers fData={leftfingersData} />
          <Typography
            component="h1"
            variant="h5"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: 5,
            }}
          >
            Right Hand
          </Typography>
          <SplitedFingers fData={rightfingersData} />
        </div>
      </div>
    </div>
  );
}
