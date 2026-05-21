export class Input {
  constructor(target = window) {
    this.down = new Set();
    this.pressed = new Set();
    this.typedCharacters = [];

    target.addEventListener("keydown", (event) => {
      if (!this.down.has(event.code)) {
        this.pressed.add(event.code);
      }

      this.down.add(event.code);

      if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
        this.typedCharacters.push(event.key);
      }

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
    this.typedCharacters = [];
  }

  consumeTypedCharacters() {
    return [...this.typedCharacters];
  }

  shouldPreventDefault(code) {
    return ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Backspace", "Space"].includes(code);
  }
}
