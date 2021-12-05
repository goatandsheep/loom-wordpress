import logo from './logo.svg';
import './App.css';

import { useEffect, useState } from "react";
import { setup, isSupported } from "@loomhq/loom-sdk";
// import { oembed } from "@loomhq/loom-embed";

const API_KEY = process.env.REACT_APP_API_KEY;
const BUTTON_ID = "loom-sdk-button";

function App() {
  // const [videoHTML, setVideoHTML] = useState("");
  const [vidButton, setVidButton] = useState({});
  const [vidPos, setVidPos] = useState([0, 0]);

  const handleMove = (e) => {

    let newX = vidPos[0]
    let newY = vidPos[1]
    if (e.key === "w" || e.key === "ArrowUp") {
      newY = vidPos[1] - 10;
    } else if (e.key === "s" || e.key === "ArrowDown") {
      newY = vidPos[1] + 10;
    } else if (e.key === "a" || e.key === "ArrowLeft") {
      newX = vidPos[0] - 10;
    } else if (e.key === "d" || e.key === "ArrowRight") {
      newX = vidPos[0] + 10;
    } else {
      return;
    }

    if (!(isNaN(newX) || isNaN(newY))) {
      setVidPos([newX, newY]);
      vidButton.moveBubble({ x: newX, y: newY });
    } else {
      console.log('naan!')
    }
    console.log(`${vidPos[0]}, ${vidPos[1]}`);
  }

  const endGame = () => {
    setTimeout(() => {
      vidButton.endRecording()
    }, 1000)
  }

  useEffect(() => {
    async function setupLoom() {
      const { supported, error } = await isSupported();

      if (!supported) {
        console.warn(`Error setting up Loom: ${error}`);
        return;
      }

      const button = document.getElementById(BUTTON_ID);

      if (!button) {
        return;
      }

      const { configureButton } = await setup({
        apiKey: API_KEY,
        config: {
          bubbleResizable: false,
          insertButtonText: 'Restart game'
        }
      });

      const sdkButton = configureButton({ element: button });

      setVidButton(sdkButton);

      // sdkButton.on("insert-click", async video => {
      //   const { html } = await oembed(video.sharedUrl, { width: 400 });
      //   console.log('finito')
      //   setVideoHTML(html);
      // });

      sdkButton.on("bubble-move", async vidPosit => {
        const newX = vidPosit.x
        const newY = vidPosit.y
        if (!(isNaN(newX) || isNaN(newY))) {
          setVidPos([vidPosit.x, vidPosit.y]);
        } else {
          console.log('naan!')
        }
        console.log('bubble-move', `${vidPosit.x}, ${vidPosit.y}`);
      })

      sdkButton.on('recording-start', async () => {
        button.focus();
      })

      sdkButton.on('bubble-drag-end', async () => {
        button.focus();
      })
    }

    setupLoom();
  }, []);
  return (
    <div className="App App-header" >
      <header className="">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <button id={BUTTON_ID} onKeyDown={handleMove} >Start Game</button>
      {/* <div dangerouslySetInnerHTML={{ __html: videoHTML }}></div> */}
      <button onClick={endGame}>End Game</button>
    </div>
  );
}

export default App;
