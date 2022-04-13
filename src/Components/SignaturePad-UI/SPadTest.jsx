import { useEffect, useRef, useState } from "react";

export default function SPad() {
  //--------------

  let {socket} = useState();
  let onError;
  
  let isDrawing = false;

  const loc = "localhost:64714";
  const protocal = loc.protocol;
  const w = protocal === `https:` ? `wss` : `ws`;

  const uri = `${w}://${loc}/signature`;

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
      socket = new WebSocket(uri);
      socket.onopen = ($event) => {
        console.log(`opened connection to ${uri}`);
        sendMessage(command);
      };

      socket.onclose = ($event) => {
        console.log(`closed connection from ${uri}`);
        socket = undefined;
      };

      socket.onmessage = ($event) => {
        const data = b64DecodeUnicode($event.data);
        console.log(data);
        handleMessage(data);
      };

      socket.onerror = ($event) => {
        console.log("error: " + $event.data);
        socket.close();
        if (onError) onError($event.data);
      };
    } catch (error) {
      console.log(error);
      if (onError) onError(error);
    }
  };

  const setOnError = () => {
  };

  //----------
  const canvas = useRef(null);

  useEffect(() => {
    setupCtx();
    setOnError();
    // service("Init");
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

    canvas.current.addEventListener("mousemove", draw);
    canvas.current.addEventListener("mouseup", () => (isDrawing = false));
    canvas.current.addEventListener("mouseout", () => (isDrawing = false));
  };

  let lastX = 0;
  let lastY = 0;


  const draw = (e) => {
    if (!isDrawing) return;
    console.log(e);
    const ctx = canvas.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
    service("Draw");
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
    //canvas.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
  };
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

  const Save = () => {
    const base64Canvas = canvas.current
      .toDataURL("image/jpeg")
      .split(";base64,")[1];
    console.log(base64Canvas);
  };

  return (
    <>
      <button
        id="clearBtn"
        class="btn btn-lg btn-primary"
        onClick={() => service("Clear")}
      >
        Clear
      </button>
      <button
        id="startBtn"
        class="btn btn-lg btn-primary"
        onClick={() => service("Start")}
      >
        Start
      </button>
      <button
        id="saveBtn"
        class="btn btn-lg btn-primary"
        onClick={() => Save()}
      >
        Save
      </button>
      <p>&nbsp;</p>
      <canvas ref={canvas} style={{ border: "1px solid #000000" }} />
    </>
  );
}
