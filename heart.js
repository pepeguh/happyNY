window.requestAnimationFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function (callback) {
    return setTimeout(callback, 1000 / 60);
  };

window.isDevice =
  /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    (navigator.userAgent || navigator.vendor || window.opera).toLowerCase()
  );

let loaded = false;
const init = () => {
  if (loaded) return;
  loaded = true;

  const mobile = window.isDevice;
  const scaleFactor = 0.9;
  const canvas = document.getElementById("heart");
  const ctx = canvas.getContext("2d");
  let width = (canvas.width = scaleFactor * innerWidth);
  let height = (canvas.height = scaleFactor * innerHeight);
 
  const resizeCanvas = () => {
    width = canvas.width = scaleFactor * innerWidth;
    height = canvas.height = scaleFactor * innerHeight;
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, width, height);
  };
  window.addEventListener("resize", resizeCanvas);

  const heartPosition = (rad) => [
    Math.pow(Math.sin(rad), 3),
    -(
      15 * Math.cos(rad) -
      5 * Math.cos(2 * rad) -
      2 * Math.cos(3 * rad) -
      Math.cos(4 * rad)
    ),
  ];

  const scaleAndTranslate = (pos, sx, sy, dx, dy) => [
    dx + pos[0] * sx,
    dy + pos[1] * sy,
  ];

  const pointsOrigin = [];
  const dr = mobile ? 0.3 : 0.1;
  for (let i = 0; i < Math.PI * 2; i += dr) {
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210, 13, 0, 0));
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150, 9, 0, 0));
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90, 5, 0, 0));
  }
  const heartPointsCount = pointsOrigin.length;

  const targetPoints = [];
  const pulse = (kx, ky) => {
    for (let i = 0; i < pointsOrigin.length; i++) {
      targetPoints[i] = [
        kx * pointsOrigin[i][0] + width / 2,
        ky * pointsOrigin[i][1] + height / 2,
      ];
    }
  };

  const particles = Array.from({ length: heartPointsCount }, () => ({
    vx: 0,
    vy: 0,
    speed: Math.random() + 5,
    force: 0.2 * Math.random() + 0.7,
    f: `hsla(0,${40 * Math.random() + 60}%,${60 * Math.random() + 20}%,0.3)`,
    trace: Array.from({ length: mobile ? 20 : 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
    })),
    q: ~~(Math.random() * heartPointsCount),
    D: 2 * (Math.random() > 0.5 ? 1 : -1),
  }));

  const config = { traceK: 0.4, timeDelta: 0.01 };
  let time = 0;

  const loop = () => {
    const n = -Math.cos(time);
    pulse((1 + n) * 0.5, (1 + n) * 0.5);
    time += (Math.sin(time) < 0 ? 9 : n > 0.8 ? 0.2 : 1) * config.timeDelta;

    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, 0, width, height);

    for (const particle of particles) {
      const q = targetPoints[particle.q];
      const dx = particle.trace[0].x - q[0];
      const dy = particle.trace[0].y - q[1];
      const length = Math.sqrt(dx * dx + dy * dy);

      if (length < 10) {
        particle.q = (particle.q + particle.D) % heartPointsCount;
        if (particle.q < 0) particle.q += heartPointsCount;
      }

      particle.vx += (-dx / length) * particle.speed;
      particle.vy += (-dy / length) * particle.speed;
      particle.vx *= particle.force;
      particle.vy *= particle.force;

      const trace = particle.trace;
      trace[0].x += particle.vx;
      trace[0].y += particle.vy;

      for (let i = 0; i < trace.length - 1; i++) {
        trace[i + 1].x -= config.traceK * (trace[i + 1].x - trace[i].x);
        trace[i + 1].y -= config.traceK * (trace[i + 1].y - trace[i].y);
      }

      ctx.fillStyle = particle.f;
      for (const t of trace) {
        ctx.fillRect(t.x, t.y, 1, 1);
      }
    }

    requestAnimationFrame(loop);
  };

  loop();
};

if (
  document.readyState === "complete" ||
  document.readyState === "loaded" ||
  document.readyState === "interactive"
) {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
