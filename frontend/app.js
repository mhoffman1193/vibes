const canvas = document.getElementById('pendulum-canvas');
const ctx = canvas.getContext('2d');
const liveData = document.getElementById('live-data');
const liveData2 = document.getElementById('live-data2');
const liveData2Container = document.getElementById('live-data-2');
const gravitySlider = document.getElementById('gravity-slider');
const gravityValue = document.getElementById('gravity-value');
const frictionSlider = document.getElementById('friction-slider');
const frictionValue = document.getElementById('friction-value');
const doubleToggle = document.getElementById('double-toggle');
const length1Slider = document.getElementById('length1-slider');
const length1Value = document.getElementById('length1-value');
const length2Slider = document.getElementById('length2-slider');
const length2Value = document.getElementById('length2-value');

// Canvas layout
const width = canvas.width;
const height = canvas.height;
const origin = { x: width / 2, y: height / 3 };

// Pendulum parameters
let L1 = parseFloat(length1Slider.value); // meters
let L2 = parseFloat(length2Slider.value); // meters
let g = parseFloat(gravitySlider.value); // gravity
let friction = parseFloat(frictionSlider.value); // damping
const ball_radius = 0.05; // meters
const pipe_width = 0.016; // meters

// State
let isDouble = false;
let dragging = false;
let dragTarget = null; // 'single', 'double2'

// Single pendulum state
let theta = 0; // at rest, straight down
let omega = 0;

// Double pendulum state
let theta1 = 0; // at rest, straight down
let omega1 = 0;
let theta2 = 0; // at rest, straight down
let omega2 = 0;

function getSingleState() {
    const x = L1 * Math.sin(theta);
    const y = L1 * Math.cos(theta);
    const vx = L1 * omega * Math.cos(theta);
    const vy = -L1 * omega * Math.sin(theta);
    return { theta, omega, x, y, vx, vy, L: L1, ball_radius, pipe_width };
}

function getDoubleState() {
    // First ball
    const x1 = L1 * Math.sin(theta1);
    const y1 = L1 * Math.cos(theta1);
    const vx1 = L1 * omega1 * Math.cos(theta1);
    const vy1 = -L1 * omega1 * Math.sin(theta1);
    // Second ball
    const x2 = x1 + L2 * Math.sin(theta2);
    const y2 = y1 + L2 * Math.cos(theta2);
    const vx2 = vx1 + L2 * omega2 * Math.cos(theta2);
    const vy2 = vy1 - L2 * omega2 * Math.sin(theta2);
    return {
        theta1, omega1, x1, y1, vx1, vy1, L1,
        theta2, omega2, x2, y2, vx2, vy2, L2,
        ball_radius, pipe_width
    };
}

function getBallScreenPos(x, y, L) {
    const scale = (height / 3) / Math.max(L1, L2);
    return {
        x: origin.x + x * scale,
        y: origin.y + y * scale,
        scale
    };
}

function isMouseOnBall(mx, my, state, which) {
    let pos;
    if (!isDouble || which === 'single') {
        pos = getBallScreenPos(state.x, state.y, state.L);
    } else if (which === 'double2') {
        pos = getBallScreenPos(state.x2, state.y2, L2);
    } else if (which === 'double1') {
        pos = getBallScreenPos(state.x1, state.y1, L1);
    }
    const dx = mx - pos.x;
    const dy = my - pos.y;
    // Increase hitbox radius to 2.5x the ball's radius
    return Math.sqrt(dx * dx + dy * dy) < ball_radius * pos.scale * 2.5;
}

function drawPendulum(state) {
    ctx.clearRect(0, 0, width, height);
    if (!isDouble) {
        // Single pendulum
        const pos = getBallScreenPos(state.x, state.y, state.L);
        // Draw rod
        ctx.lineWidth = pipe_width * pos.scale;
        ctx.strokeStyle = '#444';
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        // Draw ball
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ball_radius * pos.scale, 0, 2 * Math.PI);
        ctx.fillStyle = dragging ? '#ff9800' : '#1976d2';
        ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.stroke();
    } else {
        // Double pendulum
        const pos1 = getBallScreenPos(L1 * Math.sin(theta1), L1 * Math.cos(theta1), L1);
        const pos2 = getBallScreenPos(
            L1 * Math.sin(theta1) + L2 * Math.sin(theta2),
            L1 * Math.cos(theta1) + L2 * Math.cos(theta2),
            L2
        );
        // Draw first rod
        ctx.lineWidth = pipe_width * pos1.scale;
        ctx.strokeStyle = '#444';
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(pos1.x, pos1.y);
        ctx.stroke();
        // Draw second rod
        ctx.lineWidth = pipe_width * pos2.scale;
        ctx.strokeStyle = '#888';
        ctx.beginPath();
        ctx.moveTo(pos1.x, pos1.y);
        ctx.lineTo(pos2.x, pos2.y);
        ctx.stroke();
        // Draw first ball
        ctx.beginPath();
        ctx.arc(pos1.x, pos1.y, ball_radius * pos1.scale, 0, 2 * Math.PI);
        ctx.fillStyle = '#1976d2';
        ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.stroke();
        // Draw second ball
        ctx.beginPath();
        ctx.arc(pos2.x, pos2.y, ball_radius * pos2.scale, 0, 2 * Math.PI);
        ctx.fillStyle = dragging && dragTarget === 'double2' ? '#ff9800' : '#d32f2f';
        ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.stroke();
    }
}

function updateLiveData(state) {
    if (!isDouble) {
        liveData.textContent = `x: ${state.x.toFixed(3)} m\ny: ${state.y.toFixed(3)} m\nvx: ${state.vx.toFixed(3)} m/s\nvy: ${state.vy.toFixed(3)} m/s\ntheta: ${(state.theta * 180 / Math.PI).toFixed(2)} deg\nomega: ${state.omega.toFixed(3)} rad/s`;
        liveData2Container.style.display = 'none';
    } else {
        liveData.textContent = `x₁: ${state.x1.toFixed(3)} m\ny₁: ${state.y1.toFixed(3)} m\nvx₁: ${state.vx1.toFixed(3)} m/s\nvy₁: ${state.vy1.toFixed(3)} m/s\nθ₁: ${(state.theta1 * 180 / Math.PI).toFixed(2)} deg\nω₁: ${state.omega1.toFixed(3)} rad/s`;
        liveData2.textContent = `x₂: ${state.x2.toFixed(3)} m\ny₂: ${state.y2.toFixed(3)} m\nvx₂: ${state.vx2.toFixed(3)} m/s\nvy₂: ${state.vy2.toFixed(3)} m/s\nθ₂: ${(state.theta2 * 180 / Math.PI).toFixed(2)} deg\nω₂: ${state.omega2.toFixed(3)} rad/s`;
        liveData2Container.style.display = '';
    }
}

function animate() {
    if (!dragging) {
        const dt = 0.033;
        if (!isDouble) {
            // Single pendulum physics
            const alpha = -(g / L1) * Math.sin(theta) - friction * omega;
            omega += alpha * dt;
            theta += omega * dt;
            if (Math.abs(theta) < 0.001 && Math.abs(omega) < 0.001) {
                theta = 0;
                omega = 0;
            }
        } else {
            // Double pendulum physics (standard equations)
            // https://www.myphysicslab.com/pendulum/double-pendulum-en.html
            const m1 = 1, m2 = 1;
            const delta = theta2 - theta1;
            const denom1 = (m1 + m2) * L1 - m2 * L1 * Math.cos(delta) * Math.cos(delta);
            const denom2 = (L2 / L1) * denom1;
            const num1 = m2 * L1 * omega1 * omega1 * Math.sin(delta) * Math.cos(delta)
                + m2 * g * Math.sin(theta2) * Math.cos(delta)
                + m2 * L2 * omega2 * omega2 * Math.sin(delta)
                - (m1 + m2) * g * Math.sin(theta1);
            const alpha1 = num1 / denom1 - friction * omega1;
            const num2 = -m2 * L2 * omega2 * omega2 * Math.sin(delta) * Math.cos(delta)
                + (m1 + m2) * g * Math.sin(theta1) * Math.cos(delta)
                - (m1 + m2) * L1 * omega1 * omega1 * Math.sin(delta)
                - (m1 + m2) * g * Math.sin(theta2);
            const alpha2 = num2 / denom2 - friction * omega2;
            omega1 += alpha1 * dt;
            theta1 += omega1 * dt;
            omega2 += alpha2 * dt;
            theta2 += omega2 * dt;
            // Damping: stop if both are close to rest
            if (Math.abs(theta1) < 0.001 && Math.abs(omega1) < 0.001 && Math.abs(theta2) < 0.001 && Math.abs(omega2) < 0.001) {
                theta1 = 0;
                omega1 = 0;
                theta2 = 0;
                omega2 = 0;
            }
        }
    }
    const state = isDouble ? getDoubleState() : getSingleState();
    drawPendulum(state);
    updateLiveData(state);
    requestAnimationFrame(animate);
}

// Mouse interaction
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (!isDouble) {
        if (isMouseOnBall(mx, my, getSingleState(), 'single')) {
            dragging = true;
            dragTarget = 'single';
        }
    } else {
        // Check second ball first (on top)
        if (isMouseOnBall(mx, my, getDoubleState(), 'double2')) {
            dragging = true;
            dragTarget = 'double2';
        } else if (isMouseOnBall(mx, my, getDoubleState(), 'double1')) {
            dragging = true;
            dragTarget = 'double1';
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (dragging) {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        if (!isDouble && dragTarget === 'single') {
            const dx = mx - origin.x;
            const dy = my - origin.y;
            theta = Math.atan2(dx, dy);
            omega = 0;
            drawPendulum(getSingleState());
            updateLiveData(getSingleState());
        } else if (isDouble && dragTarget === 'double2') {
            // Drag second ball
            const x1 = L1 * Math.sin(theta1);
            const y1 = L1 * Math.cos(theta1);
            const dx = mx - (origin.x + x1 * (height / 3) / Math.max(L1, L2));
            const dy = my - (origin.y + y1 * (height / 3) / Math.max(L1, L2));
            theta2 = Math.atan2(dx, dy);
            omega2 = 0;
            drawPendulum(getDoubleState());
            updateLiveData(getDoubleState());
        } else if (isDouble && dragTarget === 'double1') {
            // Drag first ball
            const dx = mx - origin.x;
            const dy = my - origin.y;
            theta1 = Math.atan2(dx, dy);
            omega1 = 0;
            drawPendulum(getDoubleState());
            updateLiveData(getDoubleState());
        }
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (dragging) {
        dragging = false;
        dragTarget = null;
    }
});

canvas.addEventListener('mouseleave', (e) => {
    if (dragging) {
        dragging = false;
        dragTarget = null;
    }
});

// Sliders and toggle
function updateSliders() {
    g = parseFloat(gravitySlider.value);
    gravityValue.textContent = g.toFixed(2);
    friction = parseFloat(frictionSlider.value);
    frictionValue.textContent = friction.toFixed(2);
    L1 = parseFloat(length1Slider.value);
    length1Value.textContent = L1.toFixed(2);
    L2 = parseFloat(length2Slider.value);
    length2Value.textContent = L2.toFixed(2);
}
gravitySlider.addEventListener('input', updateSliders);
frictionSlider.addEventListener('input', updateSliders);
length1Slider.addEventListener('input', updateSliders);
length2Slider.addEventListener('input', updateSliders);
updateSliders();

doubleToggle.addEventListener('change', () => {
    isDouble = doubleToggle.checked;
    // Reset all angles and velocities to rest
    theta = 0; omega = 0;
    theta1 = 0; omega1 = 0;
    theta2 = 0; omega2 = 0;
    updateSliders();
});

animate(); 