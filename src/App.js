// import logo from './logo.svg';
import './App.css';
import "nes.css/css/nes.min.css";

import { useEffect, useState, useRef
  // useCallback
 } from "react";
import { setup, isSupported } from "@loomhq/loom-sdk";
// import { oembed } from "@loomhq/loom-embed";

const API_KEY = process.env.REACT_APP_API_KEY;
const BUTTON_ID = "loom-sdk-button";
// const startButton = document.getElementById(BUTTON_ID);
const endButton = document.getElementById('end-button')

function BlocksSection () {

  let items = []

  // const computeNextBlock = () => {
  //   const newHeight = Math.random() * 400
  //   items = []
  //   for (let i = 0; i < 10; i++) {
  //     items.push(
  //     <div
  //       className="danger-block"
  //       style={{
  //         height: newHeight,
  //       }}
  //     ></div>)
  //   }
  // }
  // computeNextBlock()
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', height: '100%', position: 'fixed'}}>
      { items }
    </div>)
} 


function ShowScore (props) {
  const diff = props.curr - props.start;
  const val = Math.floor(diff / 1000 || 0);
  // console.log('tick', diff)
  console.log('tick', props.gameTimerRef)
  return <span>{val}</span>
}

function App() {
  // const [videoHTML, setVideoHTML] = useState("");
  const [vidButton, setVidButton] = useState({});
  const [vidPos, setVidPos] = useState([0, 0]);
  const [showMessage, setShowMessage] = useState(false);
  // const [timerOn, setTimerOn] = useState(false);
  const [startTime, setStartTime] = useState(NaN);
  const [currentTime, setCurrentTime] = useState(NaN);
  const gameTimerRef = useRef(null)

  window.onblur = () => {
    setShowMessage(true);
  }

  window.onfocus = () => {
    setShowMessage(false);
  }

  const startWatch = () => {
    console.log('start watch')
    const startTime = new Date().getTime();
    setStartTime(startTime);

    gameTimerRef.current = setInterval(() => {
      const currTime = new Date().getTime();
      setCurrentTime(currTime);

    }, 1000)
  }

  // const closeStartWatch = useCallback(startWatch, [gameTimerRef]);

  const stopWatchAct = () => {
    console.log('stop watch', gameTimerRef.current)

    // setTimerOn(false);
    if (!gameTimerRef.current) {
      console.log('oh no')
    } else {
      clearInterval(gameTimerRef.current)
      gameTimerRef.current = null
    }
    // setTimerOn(false);
  }
  // const stopWatch = useCallback(stopWatchAct, [gameTimerRef]);

  const handleMove = (e) => {

    let newX = vidPos[0]
    let newY = vidPos[1]
    if (e.key === "w" || e.key === "ArrowUp") {
      newY = vidPos[1] - 10;
    } else if (e.key === "s" || e.key === "ArrowDown") {
      newY = vidPos[1] + 10;
    // } else if (e.key === "a" || e.key === "ArrowLeft") {
    //   newX = vidPos[0] - 10;
    // } else if (e.key === "d" || e.key === "ArrowRight") {
    //   newX = vidPos[0] + 10;
    } else {
      return;
    }

    if (!(isNaN(newX) || isNaN(newY))) {
      setVidPos([newX, newY]);
      vidButton.moveBubble({ x: newX, y: newY });
      checkDead(newX, newY);
    } else {
      console.log('naan!')
    }
    console.log(`${vidPos[0]}, ${vidPos[1]}`);
  }

  const checkDead = (x, y) => {
    const playerHeight = 192;
    // const marginY = 36;
    const playerY = window.innerHeight - playerHeight + parseInt(y);
    const playerX = parseInt(x);
    const playerWidth = 192;
    // console.log('cam', `${playerX}, ${playerY}`);

    // TODO: check why the Y is not including the height. Y is from the top

    const blocks = document.querySelectorAll('.danger-block');
    for (let i = 0, len = blocks.length; i < len; i++) {
      const blockRect = blocks[i].getBoundingClientRect();
      const blockY = parseInt(blockRect.y);
      const blockX = parseInt(blockRect.x);
      const blockHeight = parseInt(blockRect.height);
      const blockWidth = parseInt(blockRect.width);

      if (((playerY + playerHeight) > blockY) && (playerY < (blockY + blockHeight)) && ((playerX + playerWidth) > blockX) && playerX < (blockX + blockWidth)) {
        endGame()
      }
    }
  }

  /**
   * lose!
   */
  const endGame = () => {
    // setTimeout(() => {
      try {
        console.log('end game', vidButton)
        vidButton.endRecording()
        stopWatchAct()
      } catch (e) {
        console.error('error ending game', e)
        console.log(endButton)
      }
    // }, 100)
  }

  /*
  useEffect(() => {
    if (timerOn) {
      // startWatch();

      const startTime = new Date().getTime();
      setStartTime(startTime);
      const timer = setInterval(() => {
        const currTime = new Date().getTime();
        setCurrentTime(currTime);
      }, 1000)
      console.log('timer', timer)
      setGameTimerRef(timer);
    } else {
      stopWatch();

      clearInterval(gameTimerRef)
      // setGameTimerRef(null);
      setTimerOn(false);
    }
  }, [timerOn])
  */

  useEffect(() => {
    async function setupLoom() {
      console.log('_______ setupLoom')
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

      // let moveHandler = async vidPosit => {
      sdkButton.on("bubble-move", async vidPosit => {
        const newX = vidPosit.x
        const newY = vidPosit.y
        if (!(isNaN(newX) || isNaN(newY))) {
          setVidPos([vidPosit.x, vidPosit.y]);
        } else {
          console.log('naan!')
        }
        console.log('bubble-move');
        checkDead(newX, newY);
      }
      );

      // const moveHandlerBtn = moveHandler.bind(sdkButton);
      // sdkButton.on("bubble-move", moveHandlerBtn)

      // sdkButton.on('start', async () => {
      //   vidButton.moveBubble({x: 0, y: 192 - window.innerHeight / 2 })
      //   setVidPos([0, (192 - window.innerHeight / 2)]);
      // })

      sdkButton.on('recording-start', async () => {
        // console.log('vidpos', `${vidPos[0]}, ${vidPos[1]}`)
        // setVidPos([0, 0]);
        console.log('hi')
        checkDead(0, 0);
        button.focus();
        startWatch();
      })

      sdkButton.on('bubble-drag-end', async () => {
        button.focus();
      })

      /*
      sdkButton.on('lifecycle-update', async(state) => {
        console.log('lifecycle-update', state)
      })
      */

      sdkButton.on('cancel', async () => {
        stopWatchAct();
      })

      sdkButton.on('complete', async () => {
        stopWatchAct();
      })
    }

    setupLoom();
  }, []);
  return (
    <div className="App App-header" >
      <dialog style={{ top: '100px', zIndex: 100}} className="nes-dialog is-rounded" open={showMessage}>Tap anywhere to resume game!</dialog>
      <div style={{ top: 10, position: 'fixed', display: 'flex', justifyContent: 'space-between', minWidth: '85%' }}>
        <span className="danger-block">Score <ShowScore curr={currentTime} start={startTime} gameTimerRef={gameTimerRef} /></span>
        <section className="nes-container with-title" style={{textAlign: 'left'}}>
          <h3 className="title" style={{backgroundColor: '#3f96cf'}}>Accessibility</h3>
          <div>Height of next chimney: <span></span></div>
          <div>Time to next chimney: <span></span></div>
          <div>Player height: <span>{(vidPos[1] * -1) + 'm'}</span></div>
        </section>
      </div>
      <button id={BUTTON_ID} onKeyDown={handleMove} className="nes-btn is-success">Start Game</button>
      {/* <div dangerouslySetInnerHTML={{ __html: videoHTML }}></div> */}
      <BlocksSection />
      <div style={{ bottom: 10, position: 'fixed', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: '85%' }}>
        <span>By Kemal Ahmed</span>
        <button id="end-button" onClick={endGame} className="nes-btn is-error">End Game</button>
      </div>
    </div>
  );
}

export default App;
