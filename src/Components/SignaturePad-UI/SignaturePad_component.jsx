import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Typography from "@mui/material/Typography";

const useUnload = (fn, socket) => {
  const cb = useRef(fn);

  useEffect(() => {
    cb.current = fn;
  }, [fn]);

  useEffect(() => {
    const onUnload = (...args) => {
      cb.current?.(...args);
      console.log("THE SOCKET IS: " + socket);
      if (socket) {
        socket.close();
        console.log("Refresh and Socket closed");
      }
    };

    window.addEventListener("beforeunload", onUnload);

    return () => window.removeEventListener("beforeunload", onUnload);
  }, []);
};

export default function SignPad() {
  //-------config-------//

  const loc = "localhost:64714";
  const protocal = loc.protocol;
  const w = protocal === `https:` ? `wss` : `ws`;
  const uri = `${w}://${loc}/signature`;

  //-------------------//

  //---Logic. Server Conversation---//

  const [socket, setSocket] = useState();

  /* useUnload((e) => {
    e.preventDefault();
    e.returnValue = "";
    console.log(socket);
    service("Close");
  }, socket);*/

  let isDrawing = false;

  const [msg, setMsg] = useState("Signature Pad");
  const [start, setStart] = useState(false);

  const service = (command) => {
    if (command === "Clear") clearCanvas();
    if (socket && socket.readyState === 1) sendMessage(command);
    else {
      connectToService(command);
    }
  };

  const sendMessage = (message) => {
    const b64 = base64EncodeUnicode(JSON.stringify(message));
    socket.send(b64);
  };

  const base64EncodeUnicode = (str) => {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode("0x" + p1);
      })
    );
  };

  const b64DecodeUnicode = (str) => {
    if (str && str.length > 0) {
      try {
        return decodeURIComponent(
          atob(str)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
      } catch (error) {
        console.log(error);
        return undefined;
      }
    } else {
      return undefined;
    }
  };

  const connectToService = (command) => {
    if (socket) return;

    try {
      const _socket = new WebSocket(uri);
      setSocket(_socket);
      _socket.onopen = ($event) => {
        console.log(`opened connection to ${uri}`);
        sendMessage(command);
      };

      _socket.onclose = ($event) => {
        console.log(`closed connection from ${uri}`);
        _socket = undefined;
      };

      _socket.onmessage = ($event) => {
        const data = b64DecodeUnicode($event.data);
        console.log(data);
        handleMessage(data);
      };

      _socket.onerror = ($event) => {
        console.log("error: " + $event.data);
        if (!$event.data) {
          alert("Signature Pad Server Connection Lost");
          setMsg("Signature Pad Server Connection Lost");
        }
        _socket.close();
      };
    } catch (error) {
      console.log(error);
    }
  };

  //-----------------------------//

  const canvas = useRef(null);

  useEffect(() => {
    setupCtx();
    service("Init");
  }, [socket]);

  const setupCtx = () => {
    const ctx = canvas.current.getContext("2d");
    canvas.current.width = `500`;
    canvas.current.height = `200`;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#FF0000";

    canvas.current.addEventListener("mousedown", (e) => {
      isDrawing = true;
      [lastX, lastY] = [e.offsetX, e.offsetY];
    });
  };

  let lastX = 0;
  let lastY = 0;

  const handleMessage = (message) => {
    if (message.indexOf("{") == 0) {
      const data = message.slice(message.indexOf("{"));
      const item = JSON.parse(data);
      if (item.Type === undefined) return;
      switch (item.Type) {
        case "Clear":
          clearCanvas();
        case "Draw":
          padDraw(item.Data.X, item.Data.Y, item.Data.Pressure);
        default:
      }
    }
  };

  const padDraw = (x, y, pressure) => {
    if (pressure > 0) {
      if (!isDrawing) [lastX, lastY] = [x, y];
      isDrawing = true;
      const ctx = canvas.current.getContext("2d");
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      [lastX, lastY] = [x, y];
    } else {
      isDrawing = false;
      [lastX, lastY] = [0, 0];
    }
  };

  const clearCanvas = () => {
    const ctx = canvas.current.getContext("2d");
    ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
  };

  const Save = () => {
    const base64Canvas = canvas.current
      .toDataURL("image/jpeg")
      .split(";base64,")[1];
    console.log(base64Canvas);
  };

  const { t } = useTranslation();

  return (
    <div className="App">
      <div class="float-container">
        <div class="image-and-button">
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
          <p>&nbsp;</p>
          <canvas ref={canvas} style={{ border: "1px solid #000000" }} />
          <br />
          {!start ? (
            <>
              <button
                id="startBtn"
                type="button"
                className="button"
                onClick={() => {
                  service("Start");
                  setStart(true);
                }}
              >
                {t("Start")}
              </button>
              <br />
            </>
          ) : (
            <>
              <button
                id="clearBtn"
                type="button"
                className="button"
                onClick={() => {
                  service("Clear");
                  service("Start");
                }}
              >
                {t("Clear")}
              </button>
              <br />
            </>
          )}
          <button
            id="saveBtn"
            type="button"
            className="button"
            onClick={() => Save()}
            disabled={!start}
          >
            {t("Save")}
          </button>
          <br />
        </div>
      </div>
    </div>
  );
}
