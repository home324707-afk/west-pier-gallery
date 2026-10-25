const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

let angle = 0;
let radius = 150;
let maxRadius = 150;
let waveHeight = 20;
let waveSpeed = 0.05;
let waveFrequency = 0.2;
let waveSpeedVariation = 0.1;
let wavePhase = 0;

function drawPier() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);

  // Draw the main structure of the pier
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(canvas.width, 0);
  ctx.lineTo(0, 0);
  ctx.strokeStyle = '#654321';
  ctx.stroke();

  // Draw broken sections
  for (let i = 0; i < 5; i++) {
    let angleOffset = Math.random() * Math.PI * 2;
    let brokenLength = Math.random() * 40 + 20;
    let brokenHeight = Math.random() * waveHeight + 10;
    let brokenWidth = Math.random() * 20 + 5;

    ctx.beginPath();
    ctx.moveTo(radius * Math.cos(angleOffset), radius * Math.sin(angleOffset));
    ctx.lineTo(brokenLength * Math.cos(angleOffset + Math.random() * Math.PI * 2), brokenLength * Math.sin(angleOffset + Math.random() * Math.PI * 2));
    ctx.lineTo(brokenLength * Math.cos(angleOffset + Math.random() * Math.PI * 2 + Math.random() * Math.PI * 2), brokenLength * Math.sin(angleOffset + Math.random() * Math.PI * 2 + Math.random() * Math.PI * 2));
    ctx.lineTo(radius * Math.cos(angleOffset), radius * Math.sin(angleOffset));
    ctx.fillStyle = '#654321';
    ctx.fill();
  }

  ctx.restore();
}

function animate() {
  angle += 0.05;
  waveSpeed += Math.sin(angle) * waveSpeedVariation;
  wavePhase += waveFrequency;
  radius = Math.max(150 - waveSpeed, maxRadius);

  drawPier();

  requestAnimationFrame(animate);
}

animate();
