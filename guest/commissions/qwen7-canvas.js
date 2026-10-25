const c = document.getElementById('c');
const ctx = c.getContext('2d');
c.width = 800;
c.height = 500;

const pierWidth = 20;
const pierHeight = 400;
const pierColor = 'grey';
const waveColor = 'blue';
const waveHeight = 100;
const waveSpeed = 0.5;
let wavePos = 0;

function drawPier() {
  ctx.fillStyle = pierColor;
  ctx.fillRect(340, 300, pierWidth, -pierHeight);
}

function drawWaves() {
  ctx.fillStyle = waveColor;
  ctx.beginPath();
  ctx.moveTo(0, c.height);
  for (let x = 0; x < c.width; x++) {
    ctx.lineTo(x, Math.sin(x * waveSpeed + wavePos) * waveHeight + (c.height - waveHeight / 2));
  }
  ctx.lineTo(c.width, c.height);
  ctx.closePath();
  ctx.fill();
}

function animate() {
  ctx.clearRect(0, 0, c.width, c.height);
  drawPier();
  drawWaves();
  wavePos += 0.05;
  requestAnimationFrame(animate);
}

animate();
