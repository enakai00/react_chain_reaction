import React, { useRef, useState, useEffect } from "react";
// eslint-disable-next-line
import { GameBackend, getScreen, sleep, randInt, clearScreen, print }
       from "./components/GameBackend";

// Your code here!
const game = async (screen, refresh, keyPress, exit) => {
  // Global game variables.
  let pos = 19, score = 0, hiscore = 0;
  const arrows = ["⬆", "⬇", "⬅", "➡"];
  var field, nextField;

  const getField = () => { const field = new Array(24);
    field[1] = new Array(40).fill("wall");
    for (let y = 2; y < 23; y++) {
      field[y] = new Array(40).fill(" ");
      field[y][0] = "wall";
      field[y][39] = "wall";
    }
    field[23] = new Array(40).fill("floor");
    return field;
  }

  const drawField = (field) => {
    for (let y = 2; y < 23; y++) {
      print(screen, 1, y, field[y].slice(1, -1).join(""));
    }
    print(screen, 2, 0,
      "SCORE:" + score.toString().padStart(6, "0") + "MWh");
    print(screen,
      20, 0, "HI-SCORE:" + hiscore.toString().padStart(6, "0") + "MWh");
    print(screen, pos, 22, "┏┻┓");
    for (let i = 0; i < 3; i++) {
      if (field[22][pos+i] !== " ") {
        print(screen, pos+i, 22, field[22][pos+i]);
        finished = true;
      }
    }
  }

  const initGame = async () => {
    pos = 19;

    // Draw start screen.
    clearScreen(screen);
    print(screen, 2, 0,
      "SCORE:" + score.toString().padStart(6, "0") + "MWh");
    print(screen,
      20, 0, "HI-SCORE:" + hiscore.toString().padStart(6, "0") + "MWh");
    print(screen, 0, 1, " ".repeat(40), "white", "white");
    for (let y = 2; y < 24; y++) {
      print(screen, 0, y, " ", "white", "white");
      print(screen, 39, y, " ", "white", "white");
    }
    print(screen, 1, 23, " ".repeat(38), "white", "gray");
    print(screen, 13, 12, "@ URANIUM-235");
    print(screen, 13, 14, "* NUCLEAR WASTE");
    print(screen, pos-2, 18, "NEUTRON");
    print(screen, pos-2, 19, "B E A M");
    print(screen, pos, 20, "[Z]");
    print(screen, pos+1, 21, arrows[0]);
    print(screen, pos-5, 22, "[J]<=┏┻┓=>[L]");
    print(screen, 13, 8, "HIT [S] TO START");
    await refresh();
    while (true) {
      if (exit.current) return;
      if (keyPress["s"]) {
        break;
      }
      await sleep(100);
    }
    score = 0;
    field = getField();
    drawField(field);
    await refresh();
  }

  const gameover = async () => {
    await sleep(300);  
    print(screen, pos, 22, "WWW", "black", "red");
    print(screen, 15, 10, " GAME OVER ", "black", "white");
    await refresh();
    await sleep(5000);  
  }

  const moveShooter = () => {
    if (keyPress["j"]) pos = Math.max(1, pos-1);
    if (keyPress["l"]) pos = Math.min(36, pos+1);
    if (keyPress["z"]) nextField[21][pos+1] = arrows[0];
  }

  const moveArrows = () => {
    for (let y = 2; y < 23; y++) {
      for (let x = 1; x < 39; x++) {
        if (field[y][x] === "@") {
          if (nextField[y][x] !== "*") nextField[y][x] = "@";
        }

        if (field[y][x] === "*") {
          if (field[y+1][x] !== "floor") nextField[y+1][x] = "*";
        }

        if (field[y][x] === arrows[0]) { // up
          if (field[y-1][x] === "@") {
            nextField[y-1][x-1] = arrows[2];
            nextField[y-1][x] = "*";
            nextField[y-1][x+1] = arrows[3];
            score += 1;
          } else if (field[y-1][x] === "wall") {
            nextField[y][x] = arrows[1];
          } else { 
            if (nextField[y-1][x] !== arrows[1]) {
              nextField[y-1][x] = arrows[0];
            }
          }
        }

        if (field[y][x] === arrows[1]) { // down
          if (field[y+1][x] === "@") {
            nextField[y+1][x-1] = arrows[2];
            nextField[y+1][x] = "*";
            nextField[y+1][x+1] = arrows[3];
            score += 1;
          } else if (field[y+1][x] === "wall") {
          } else if (field[y+1][x] !== "floor") {
            nextField[y+1][x] = arrows[1];
          }              
        }

        if (field[y][x] === arrows[2]) { // left
          if (field[y][x-1] === "@") {
            nextField[y-1][x-1] = arrows[0];
            nextField[y][x-1] = "*";
            nextField[y+1][x-1] = arrows[1];
            score += 1;
          } else if (field[y-1][x] === "wall") {
          } else if (field[y][x-1] === "wall") {
            nextField[y][x] = arrows[3];
          } else {
            nextField[y][x-1] = arrows[2];
          }              
        }

        if (field[y][x] === arrows[3]) { // right
          if (field[y][x+1] === "@") {
            nextField[y-1][x+1] = arrows[0];
            nextField[y][x+1] = "*";
            nextField[y+1][x+1] = arrows[1];
            score += 1;
          } else if (field[y-1][x] === "wall") {
          } else if (field[y][x+1] === "wall") {
            nextField[y][x] = arrows[2];
          } else {
            nextField[y][x+1] = arrows[3];
          }              
        }

        hiscore = Math.max(score, hiscore);
      }
    }
  }

  const updateScreen = () => {
    field = nextField;
    drawField(field);
  }

  const putAtom = () => {
    if (randInt(0, 10) === 0) {
      let y = randInt(0, 7);
      let x = randInt(0, 18);
      let dx = 0
      if (y % 2 === 0) dx = 1;
      if (nextField[y*2+3][x*2+2+dx] === " ") {
        nextField[y*2+3][x*2+2+dx] = "@";
      }
    }
  }

  // main loop
  var finished;
  while (true) {
    finished = false;
    await initGame();
    while (!finished) {
      if (exit.current) return;
      nextField = getField();
      moveShooter();
      moveArrows();
      putAtom();
      updateScreen();
      refresh();
      await sleep(30);
    }
    await gameover();
  }
}


export const Main = (props) => {
  // Define keys used in the game.
  const keys = ["s", "z", "j", "l"];

  // The following part is a fixed boilarplate. Just leave as is.
  const xSize = 40;
  const ySize = 24;
  const screenRef = useRef(getScreen(xSize, ySize));
  const screen = screenRef.current;
  const exit = useRef(false);
  const keyPressRef = useRef({});
  const keyPress = keyPressRef.current;
  // eslint-disable-next-line
  const [dummyState, setDummyState] = useState([]);
  const refresh = () => { setDummyState([]); }

  useEffect(
    () => {
      game(screen, refresh, keyPress, exit);
      return () => exit.current = true;
    }, [screen, keyPress]
  );

  const element = (
    <GameBackend keys={keys} keyPress={keyPress} screen={screen}/>
  );

  return element;
}
