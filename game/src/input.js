// Responsive keyboard + mouse input controller with buffered jump/dash actions.

export function createInputController(canvas) {
  const keys = new Set();
  let jumpQueued = false;
  let duckQueued = false;
  let dashQueued = false;
  let mouseSteerActive = false;
  let mouseTargetNorm = 0; // -1..1 across screen width

  const onKeyDown = (e) => {
    const code = e.code;
    if (
      code === 'Space' ||
      code === 'ArrowUp' ||
      code === 'ArrowDown' ||
      code === 'ArrowLeft' ||
      code === 'ArrowRight'
    ) {
      e.preventDefault();
    }
    if (!keys.has(code)) {
      if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') jumpQueued = true;
      if (code === 'ArrowDown' || code === 'KeyS') duckQueued = true;
      if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'KeyE') dashQueued = true;
    }
    keys.add(code);
    if (code === 'ArrowLeft' || code === 'ArrowRight' || code === 'KeyA' || code === 'KeyD') {
      mouseSteerActive = false;
    }
  };

  const onKeyUp = (e) => {
    keys.delete(e.code);
  };

  const onPointerMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0) return;
    const norm = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseTargetNorm = Math.max(-1, Math.min(1, norm));
    if (e.buttons > 0) {
      mouseSteerActive = true;
    }
  };

  const onPointerDown = (e) => {
    if (e.target !== canvas) return;
    if (e.button === 0) {
      onPointerMove(e);
      mouseSteerActive = true;
      dashQueued = true;
    } else if (e.button === 2) {
      jumpQueued = true;
    }
  };

  const onContextMenu = (e) => {
    if (e.target === canvas) e.preventDefault();
  };

  window.addEventListener('keydown', onKeyDown, { passive: false });
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('contextmenu', onContextMenu);

  return {
    getState() {
      const left = keys.has('ArrowLeft') || keys.has('KeyA');
      const right = keys.has('ArrowRight') || keys.has('KeyD');
      const holdJump = keys.has('Space') || keys.has('ArrowUp') || keys.has('KeyW');
      const holdDuck = keys.has('ArrowDown') || keys.has('KeyS');
      const state = {
        moveAxis: (right ? 1 : 0) - (left ? 1 : 0),
        mouseSteerActive,
        mouseTargetNorm,
        jumpPressed: jumpQueued,
        duckPressed: duckQueued,
        dashPressed: dashQueued,
        holdJump,
        holdDuck,
      };
      jumpQueued = false;
      duckQueued = false;
      dashQueued = false;
      return state;
    },
    clear() {
      keys.clear();
      jumpQueued = false;
      duckQueued = false;
      dashQueued = false;
      mouseSteerActive = false;
    },
  };
}
