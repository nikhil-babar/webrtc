import { useContext, useEffect } from "react";
import { PeerContext } from "./context/PeerContext";
import useSocket from "./hooks/useSocket";
import ReactPlayer from "react-player";

function App() {
  const { users } = useSocket()
  const { sendConnRequest, localStream, remoteStream, sendMediaStream } = useContext(PeerContext)

  useEffect(() => {
    console.log(remoteStream)
  }, [remoteStream])

  return (
    <div className="App">
      {
        users.map((user) => {
          return <button onClick={() => sendConnRequest(user)} key={user}>{user}</button>
        })

      }

      <ReactPlayer url={localStream} playing muted/>
      <ReactPlayer url={remoteStream} playing muted/>

      <button onClick={sendMediaStream}>send video</button>
    </div>
  );
}

export default App;
