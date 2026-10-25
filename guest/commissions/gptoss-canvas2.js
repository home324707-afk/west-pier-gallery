(() => {
  const canvas = document.getElementById('c');
  if (!canvas) return;
  canvas.width = 800;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');

  const clouds = [];
  const pierSegments = [
    {y: 350, len: 120, broken: true},
    {y: 310, len: 90, broken: true},
    {y: 270, len: 80, broken: false},
    {y: 230, len: 100, broken: true}
  ];

  function initClouds() {
    for (let i = 0; i < 15; i++) {
      clouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * 120,
        radius: 20 + Math.random() * 30,
        speed: 0.2 + Math.random() * 0.3
      });
    }
  }

  function drawCloud(c) {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPier() {
    ctx.strokeStyle = '#8c6e51';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    pierSegments.forEach(seg => {
      ctx.beginPath();
      ctx.moveTo(400, seg.y);
      // broken segments are dashed
      if (seg.broken) {
        ctx.setLineDash([8, 6]);
        ctx.moveTo(400, seg.y + 10);
        ctx.lineTo(400 - seg.len, seg.y);
      } else {
        ctx.setLineDash([]);
        ctx.lineTo(400 - seg.len, seg.y);
      }
      ctx.stroke();
    });
  }

  function animate(time) {
    ctx.fillStyle = '#004e66';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    clouds.forEach(c => {
      drawCloud(c);
      c.x += c.speed;
      if (c.x - c.radius > canvas.width) c.x = -c.radius;
    });

    drawPier();

    const waves = Math.sin(time * 0.001) * 10;
    ctx.fillStyle = '#006ca3';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let x = 0; x <= canvas.width; x += 20) {
      ctx.lineTo(x, canvas.height - 20 + Math.sin(x * 0.02 + time * 0.003) * waves);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();

    requestAnimationFrame(animate);
  }

  initClouds();
  requestAnimationFrame(animate);
})();
