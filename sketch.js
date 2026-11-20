let totalPopulation = 200;
let activeBirds = [];
let allBirds = [];
let pipes = [];
let counter = 0;
let speedSlider;
let speedSpan;
let highScoreSpan;
let allTimeHighScoreSpan;
let highScore = 0;
let runBest = false;
let runBestButton;
let green_drago;
let bestBird = null;

function preload() {
  green_drago = loadImage('green_drago.png')    
}

function setup() {
  let canvas = createCanvas(800, 400);
  canvas.parent('canvascontainer');

  speedSlider = select('#speedSlider');
  speedSpan = select('#speed');
  highScoreSpan = select('#hs');
  allTimeHighScoreSpan = select('#ahs');
  runBestButton = select('#best');
  runBestButton.mousePressed(toggleState);

  for (let i = 0; i < totalPopulation; i++) {
    let bird = new Bird();
    activeBirds[i] = bird;
    allBirds[i] = bird;
  }
}

function toggleState() {
  runBest = !runBest;
  if (runBest) {
    resetGame();
    runBestButton.html('continue training');
  } else {
    nextGeneration();
    runBestButton.html('run best');
  }
}



function draw() {
  background(135, 206, 235);

  let cycles = speedSlider.value();
  speedSpan.html(cycles);

  for (let n = 0; n < cycles; n++) {
    for (let i = pipes.length - 1; i >= 0; i--) {
      pipes[i].update();
      if (pipes[i].offscreen()) {
        pipes.splice(i, 1);
      }
    }
    if (runBest) {
      bestBird.think(pipes);
      bestBird.update();
      for (let j = 0; j < pipes.length; j++) {
        if (pipes[j].hits(bestBird)) {
          resetGame();
          break;
        }
      }
      if (bestBird.bottomTop()) {
        resetGame();
      }
    } else {
      for (let i = activeBirds.length - 1; i >= 0; i--) {
        let bird = activeBirds[i];

        bird.think(pipes);
        bird.update();

        let dead = bird.bottomTop() || pipes.some(p => p.hits(bird));
        if (dead) {
          activeBirds.splice(i, 1)
          }
        }
       }
    if (counter % 75 == 0) {
      pipes.push(new Pipe());
    }
    counter++;
    }
    


  let tempHighScore = 0;
  if (!runBest) {
    let tempBestBird = null;
    for (let i = 0; i < activeBirds.length; i++) {
      let s = activeBirds[i].score;
      if (s > tempHighScore) {
        tempHighScore = s;
        tempBestBird = activeBirds[i];
      }
    }

    if (tempHighScore > highScore) {
      highScore = tempHighScore;
      bestBird = tempBestBird;
    }
  } else {
    tempHighScore = bestBird.score;
    if (tempHighScore > highScore) {
      highScore = tempHighScore;
    }
  }

  highScoreSpan.html(tempHighScore);
  allTimeHighScoreSpan.html(highScore);

  for (let i = 0; i < pipes.length; i++) {
    pipes[i].show();
  }

  if (runBest) {
    bestBird.show();
  } else {
    for (let i = 0; i < activeBirds.length; i++) {
      activeBirds[i].show();
    }
    if (activeBirds.length == 0) {
      nextGeneration();
    }
  }

  if (activeBirds.length > 0) {
    let best = activeBirds[0];
    for (let bird of activeBirds) {
      if (bird.score > best.score) {
        best = bird;
      }
    }

    if (best && best.brain) {
      let boxWidth = 220;
      let boxHeight = 160;
      let margin = 20;
      let xPos = width - boxWidth - margin;
      let yPos = margin;
      drawBrain(best.brain, xPos, yPos, boxWidth, boxHeight);
    }
  }
}


function drawBrain(brain, x, y, w, h) {
  const getNodeY = (index, total) => {
    let spacing = h / (total + 1);
    return y + spacing * (index + 1);
  };


  fill(20, 25, 35, 230);
  noStroke();
  rect(x, y, w, h, 10);

  let inputNodes = brain.input_nodes;
  let hiddenNodes = brain.hidden_nodes;
  let outputNodes = brain.output_nodes;

  let layerX = [x + 50, x + w / 2, x + w - 50];

  let weights_ih = brain.weights_ih.data;
  let weights_ho = brain.weights_ho.data;

  for (let i = 0; i < inputNodes; i++) {
    for (let j = 0; j < hiddenNodes; j++) {
      let weight = weights_ih[j][i];
      if (weight > 0) {
        stroke(0, 255, 0, map(abs(weight), 0, 1, 50, 200));
      } else {
        stroke(255, 0, 0, map(abs(weight), 0, 1, 50, 200));
      }
      strokeWeight(map(abs(weight), 0, 1, 0.5, 2.5));
      line(layerX[0], getNodeY(i, inputNodes), layerX[1], getNodeY(j, hiddenNodes));
    }
  }

  for (let i = 0; i < hiddenNodes; i++) {
    for (let j = 0; j < outputNodes; j++) {
      let weight = weights_ho[j][i];
      if (weight > 0) {
        stroke(0, 255, 0, map(abs(weight), 0, 1, 50, 200));
      } else {
        stroke(255, 0, 0, map(abs(weight), 0, 1, 50, 200));
      }
      strokeWeight(map(abs(weight), 0, 1, 0.5, 2.5));
      line(layerX[1], getNodeY(i, hiddenNodes), layerX[2], getNodeY(j, outputNodes));
    }
  }

  for (let i = 0; i < inputNodes; i++) {
    fill(255);
    stroke(100);
    strokeWeight(1);
    ellipse(layerX[0], getNodeY(i, inputNodes), 14, 14);
  }

  for (let i = 0; i < hiddenNodes; i++) {
    fill(255);
    stroke(100);
    strokeWeight(1);
    ellipse(layerX[1], getNodeY(i, hiddenNodes), 14, 14);
  }

  for (let i = 0; i < outputNodes; i++) {
    fill(255);
    stroke(100);
    strokeWeight(1);
    ellipse(layerX[2], getNodeY(i, outputNodes), 14, 14);
  }
}

