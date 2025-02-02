import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000"); // Change to PC's local IP for mobile access

function App() {
  const [mode, setMode] = useState(null); // "computer" or "mobile"
  const [code, setCode] = useState(""); // Code displayed on computer
  const [inputCode, setInputCode] = useState(""); // Code entered on mobile
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // If in computer mode, fetch and display the code
    if (mode === "computer") {
      fetch("http://localhost:3000/code")
        .then((res) => res.json())
        .then((data) => setCode(data.code));
    }

    // Handle WebSocket status
    socket.on("status", (status) => {
      if (status === "connected") setConnected(true);
      else alert("Wrong Code!");
    });
  }, [mode]);

  const handleMouseMove = (e) => {
    if (!connected) return;
    const { movementX, movementY } = e;
    socket.emit("mouseMove", { x: movementX, y: movementY });
  };

  const handleClick = (type) => {
    if (!connected) return;
    socket.emit("click", type);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {!mode ? (
        <>
          <h2>Choose Mode</h2>
          <button onClick={() => setMode("computer")}>Computer</button>
          <button onClick={() => setMode("mobile")}>Mobile</button>
        </>
      ) : mode === "computer" ? (
        <>
          <h2>Connection Code: {code}</h2>
          <p>Enter this code on your phone</p>
        </>
      ) : !connected ? (
        <>
          <h2>Enter Connection Code</h2>
          <input
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
          />
          <button onClick={() => socket.emit("join", inputCode)}>
            Connect
          </button>
        </>
      ) : (
        <>
          <h2>Connected! Use your phone as a touchpad.</h2>
          <div
            style={{
              width: "100vw",
              height: "60vh",
              background: "#ccc",
            }}
            onMouseMove={handleMouseMove}
          ></div>
          <button onClick={() => handleClick("left")}>Left Click</button>
          <button onClick={() => handleClick("right")}>Right Click</button>
        </>
      )}
    </div>
  );
}

export default App;
