// import logo from './logo.svg';
import './App.css';
import "nes.css/css/nes.min.css";

import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { setup, isSupported } from "@loomhq/loom-sdk";
// import { oembed } from "@loomhq/loom-embed";

const API_KEY = process.env.REACT_APP_API_KEY;
const BUTTON_ID = "loom-sdk-button";
// const startButton = document.getElementById(BUTTON_ID);
const endButton = document.getElementById('end-button')

function BlockChimneyTemplate(props, ref) {

  // const [currTime, setCurrTime] = useState(0);

  // useEffect(() => {
  //   const creationTime = new Date().getTime();
  //   setCurrTime(creationTime);
  // }, [])
  
  let styleObj = {

    right: 0,
    // right: (currTime - props.currentTime) / 5,
    position: 'absolute'
  }
  if (props.top) {
    styleObj.top = 0
  } else {
    styleObj.bottom = 0
  }
  return (
  <div className="danger-block chimney" style={styleObj}></div>
  )
}

const BlockChimney = forwardRef(BlockChimneyTemplate)

function BlocksSectionTemplate (props, ref) {

  // const [blocklist, setBlocklist] = useState([]);
  const blocklist = useRef([])

  // let items = [(<div className="danger-block chimney"></div>)]

  //     (<div
  //       className="danger-block"
  //       style={{
  //         height: newHeight,
  //       }}
  //     ></div>)

  const tickRef = useRef()


  // let blocks = 0 // for key
  const addBlock = () => {
    console.log('adding block')
    // blocks++
    blocklist.current.push(<BlockChimney top currentTime={props.currentTime} ref={tickRef} />)
    // blocks++
    // blocklist.current.push(<div className="danger-block chimney" style={{ right: 0, bottom: 0, position: 'absolute' }}></div>)
    blocklist.current.push(<BlockChimney top={false} currentTime={props.currentTime} ref={tickRef} />)
  }

  const clearBlocks = () => {
    blocklist.current = []
  }
  // TODO: motion
  // use time at block creation => right: 0
  // each second, move by 

  useImperativeHandle(ref, () => ({
    // each key is connected to `ref` as a method name
    // they can execute code directly, or call a local method
    addBlock: () => { addBlock() },
    clearBlocks,
    tick: () => {
      if (tickRef.current && tickRef.current.tick) {
        tickRef.current.tick()
      }
    }
  }))
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', height: '100%', width: '100%', position: 'absolute'}}>
      <div>{blocklist.current}</div>
    </div>)
}

const BlocksSection = forwardRef(BlocksSectionTemplate)

const gravMult = 1

function ShowScore (props) {
  const diff = props.curr - props.start;
  const val = Math.floor(diff / 1000 || 0);
  return <span>{val}</span>
}

function App() {
  // const [videoHTML, setVideoHTML] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [startTime, setStartTime] = useState(NaN);
  const [currentTime, setCurrentTime] = useState(NaN);
  const gameTimerRef = useRef(null)
  const playerSpeedRef = useRef(0)
  const vidButtonRef = useRef({})
  const vidPosRef = useRef([0, 0])
  const blocksRef = useRef()

  window.onblur = () => {
    setShowMessage(true);
  }

  window.onfocus = () => {
    setShowMessage(false);
  }

  const startWatch = () => {
    const startTime = new Date().getTime();
    setStartTime(startTime);

    gameTimerRef.current = setInterval(() => {
      // update timers
      const currTime = new Date().getTime();
      setCurrentTime(currTime);

      // gravity
      // 9.8 m/s^2 * 0.05 s = 0.49 m/s
      // multiplier
      playerSpeedRef.current = playerSpeedRef.current + 0.49 * gravMult;
      console.log('speed', playerSpeedRef.current)
      vidPosRef.current[1] += playerSpeedRef.current;
      // setVidPos([vidPos[0], vidPos[1] + playerSpeedRef.current]);
      vidButtonRef.current.moveBubble({ x: vidPosRef.current[0], y: vidPosRef.current[1] + playerSpeedRef.current });

      const diff = currTime - startTime;
      const val = 10 * Math.floor(diff / 10); // round to nearest 10
      // TODO:
      if (!(val % 1000)) {
        blocksRef.current.addBlock();
      }
      checkDead(vidPosRef.current[0], vidPosRef.current[1])
      blocksRef.current.tick();
    }, 50) // update every 50ms or 0.05s
  }

  const stopWatchAct = () => {
    console.log('stop watch', gameTimerRef.current)

    if (!gameTimerRef.current) {
      console.log('oh no')
    } else {
      clearInterval(gameTimerRef.current)
      gameTimerRef.current = null
      playerSpeedRef.current = 0;
      vidPosRef.current[0] = 0;
      vidPosRef.current[1] = 0;
      blocksRef.current.clearBlocks();
    }
  }

  const handleMove = (e) => {

    let newX = vidPosRef.current[0]
    let newY = vidPosRef.current[1]
    if (e.key === "w" || e.key === "ArrowUp") {
      // newY = vidPosRef.current[1] - 10;
      playerSpeedRef.current -= 5 * gravMult
    } else if (e.key === "s" || e.key === "ArrowDown") {
      newY = vidPosRef.current[1] + 5;
    // } else if (e.key === "a" || e.key === "ArrowLeft") {
    //   newX = vidPos[0] - 10;
    // } else if (e.key === "d" || e.key === "ArrowRight") {
    //   newX = vidPos[0] + 10;
    } else {
      return;
    }

    if (!(isNaN(newX) || isNaN(newY))) {
      vidPosRef.current = [newX, newY]
      // setVidPos([newX, newY]);
      vidButtonRef.current.moveBubble({ x: newX, y: newY });
      checkDead(newX, newY);
    } else {
      console.log('naan!')
    }
    console.log(`${vidPosRef.current[0]}, ${vidPosRef.current[1]}`);
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
    try {
      // console.log('end game', vidButton)
      vidButtonRef.current.endRecording()
      stopWatchAct()
    } catch (e) {
      console.error('error ending game', e)
      console.log(endButton)
    }
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

      vidButtonRef.current = sdkButton;

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
          vidPosRef.current = [vidPosit.x, vidPosit.y]
          // setVidPos([vidPosit.x, vidPosit.y]);
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
        <span>Score <ShowScore curr={currentTime} start={startTime} gameTimerRef={gameTimerRef} /></span>
        <section className="nes-container with-title" style={{textAlign: 'left'}}>
          <h3 className="title" style={{backgroundColor: '#3f96cf'}}>Accessibility</h3>
          <div>Height of next chimney: <span>200m</span></div>
          <div>Time to next chimney: <span></span></div>
          <div>Player altitude: <span>{(Math.floor(vidPosRef.current[1] * -1)) + 'm'}</span></div>
        </section>
      </div>
      <button id={BUTTON_ID} onKeyDown={handleMove} className="nes-btn is-success" style={{ zIndex: 2, opacity: gameTimerRef.current ? 0 : 1 }}>Start Game</button>
      {/* <div dangerouslySetInnerHTML={{ __html: videoHTML }}></div> */}
      <BlocksSection ref={blocksRef} style={{ flexDirection: 'column', width: '100%' }} currentTime={currentTime} />
      <div style={{ bottom: 10, position: 'fixed', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: '85%'}}>
        <span>By Kemal Ahmed</span>
        <button id="end-button" onClick={endGame} className="nes-btn is-error">End Game</button>
      </div>
    </div>
  );
}

export default App;
