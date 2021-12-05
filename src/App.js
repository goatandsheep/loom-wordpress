import logo from './logo.svg';
import './App.css';

import { useEffect, useState } from "react";
import { setup, isSupported } from "@loomhq/loom-sdk";
// import { oembed } from "@loomhq/loom-embed";

const API_KEY = process.env.REACT_APP_API_KEY;
const BUTTON_ID = "loom-sdk-button";

function BlocksSection () {
  return (<div className="danger-block">hello</div>)
} 

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
    // console.log(`${vidPos[0]}, ${vidPos[1]}`);
  }

  const checkDead = (x, y) => {
    console.log('cam', `${x}, ${y}`);
    const playerY = parseInt(y);
    const playerX = parseInt(x);
    const playerHeight = 192;
    const playerWidth = 192;

    // TODO: check why the Y is not including the height

    const blocks = document.querySelectorAll('.danger-block');
    for (let i = 0, len = blocks.length; i < len; i++) {
      const blockRect = blocks[i].getBoundingClientRect();
      const blockY = parseInt(blockRect.y);
      const blockX = parseInt(blockRect.x);
      const blockHeight = parseInt(blockRect.height);
      const blockWidth = parseInt(blockRect.width);

      if (((playerHeight - playerY) > blockY) && ((0 - playerY) < (blockY - blockHeight)) && ((playerX + playerWidth) > blockX) && playerX < (blockX + blockWidth)) {
        endGame()
      } else {
        console.log('block', `${blockX}, ${blockY}`);
      }
    }
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
        // console.log('bubble-move', `${vidPosit.x}, ${vidPosit.y}`);
        checkDead(newX, newY);
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
      </header>
      <button id={BUTTON_ID} onKeyDown={handleMove} >Start Game</button>
      {/* <div dangerouslySetInnerHTML={{ __html: videoHTML }}></div> */}
      <button onClick={endGame}>End Game</button>
      <BlocksSection />
    </div>
  );
}

export default App;
