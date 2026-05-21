export class Input {
  constructor(target = window) {
    this.down = new Set();
    this.pressed = new Set();

    target.addEventListener("keydown", (event) => {
      if (!this.down.has(event.code)) {
        this.pressed.add(event.code);
      }

      this.down.add(event.code);

      if (this.shouldPreventDefault(event.code)) {
        event.preventDefault();
      }
    });

    target.addEventListener("keyup", (event) => {
      this.down.delete(event.code);

      if (this.shouldPreventDefault(event.code)) {
        event.preventDefault();
      }
    });
  }

  isDown(...codes) {
    return codes.some((code) => this.down.has(code));
  }

  wasPressed(...codes) {
    return codes.some((code) => this.pressed.has(code));
  }

  finishFrame() {
    this.pressed.clear();
  }

  shouldPreventDefault(code) {
    return ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(code);
  }
}
