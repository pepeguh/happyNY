document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Resize canvas on window resize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Initialize fire objects
    const listFire = [];
    const listFirework = [];
    const fireNumber = 10;
    const center = { x: canvas.width / 2, y: canvas.height / 2 };
    const range = 100;

    for (let i = 0; i < fireNumber; i++) {
        const fire = {
            x: Math.random() * range / 2 - range / 4 + center.x,
            y: Math.random() * range * 2 + canvas.height,
            size: Math.random() + 0.5,
            fill: '#fd1',
            vx: Math.random() - 0.5,
            vy: -(Math.random() + 4),
            ax: Math.random() * 0.02 - 0.01,
            far: Math.random() * range + (center.y - range)
        };
        fire.base = { x: fire.x, y: fire.y, vx: fire.vx };
        listFire.push(fire);
    }

    function randColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r}, ${g}, ${b})`;
    }

    function update() {
        for (let i = 0; i < listFire.length; i++) {
            const fire = listFire[i];
            if (fire.y <= fire.far) {
                const color = randColor();
                for (let j = 0; j < fireNumber * 5; j++) {
                    const firework = {
                        x: fire.x,
                        y: fire.y,
                        size: Math.random() + 1.5,
                        fill: color,
                        vx: Math.random() * 5 - 2.5,
                        vy: Math.random() * -5 + 1.5,
                        ay: 0.05,
                        alpha: 1,
                        life: Math.round(Math.random() * range / 2) + range / 2
                    };
                    firework.base = { life: firework.life, size: firework.size };
                    listFirework.push(firework);
                }
                fire.y = fire.base.y;
                fire.x = fire.base.x;
                fire.vx = fire.base.vx;
                fire.ax = Math.random() * 0.02 - 0.01;
            }
            fire.x += fire.vx;
            fire.y += fire.vy;
            fire.vx += fire.ax;
        }

        for (let i = listFirework.length - 1; i >= 0; i--) {
            const firework = listFirework[i];
            if (firework) {
                firework.x += firework.vx;
                firework.y += firework.vy;
                firework.vy += firework.ay;
                firework.alpha = firework.life / firework.base.life;
                firework.size = firework.alpha * firework.base.size;
                firework.alpha = firework.alpha > 0.6 ? 1 : firework.alpha;
                firework.life--;
                if (firework.life <= 0) {
                    listFirework.splice(i, 1);
                }
            }
        }
    }

    function draw() {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 1;

        for (const fire of listFire) {
            ctx.beginPath();
            ctx.arc(fire.x, fire.y, fire.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fillStyle = fire.fill;
            ctx.fill();
        }

        for (const firework of listFirework) {
            ctx.globalAlpha = firework.alpha;
            ctx.beginPath();
            ctx.arc(firework.x, firework.y, firework.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fillStyle = firework.fill;
            ctx.fill();
        }
    }

    function loop() {
        requestAnimationFrame(loop);
        update();
        draw();
    }

    loop();
});
