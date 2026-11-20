function resetGame() {
  counter = 0;
  if (bestBird) {
    bestBird.score = 0;
  }
  pipes = [];
}

function nextGeneration() {
  normalizeFitness(allBirds);
  activeBirds = generate(allBirds);
  allBirds = activeBirds.slice();
  resetGame();
}

function generate(oldBirds) {
  let newBirds = [];
  let best = oldBirds[0];
  for (let b of oldBirds) {
    if (b.fitness > best.fitness) best = b;
  }
  let elite = new Bird();
  elite.brain = best.brain.copy();
  newBirds.push(elite);
  
  for (let i = 1; i < oldBirds.length; i++) {
    newBirds.push(poolSelection(oldBirds));
  }
  return newBirds;
}

function normalizeFitness(birds) {
  let sum =0;
  for (let b of birds) {
    b.fitness = pow(b.score, 2);
    sum += b.fitness;
  }
  for (let b of birds) {
    b.fitness = sum > 0? b.fitness / sum : 1 / birds.length;
  }
}

function poolSelection(birds) {
  let index = 0;
  let r = random(1);
  while (r > 0 && index < birds.length) {
    r -= birds[index].fitness;
    index += 1;
  }
  index -= 1;
  return birds[index].copy();
}
