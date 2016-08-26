"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  wait: function wait(delay, fn) {
    return setTimeout(fn, delay);
  },
  repeat: function repeat(times, delay, fn, wait) {
    var counter = void 0,
        id = void 0;
    var repeater = function repeater() {
      fn();

      if (++counter >= times) {
        clearInterval(id);
      }
    };

    counter = 0;
    id = this.loop(delay, repeater, wait);

    return id;
  },
  loop: function loop(delay, fn, wait) {
    if (!wait) {
      fn();
    }

    return setInterval(fn, delay);
  },
  stop: function stop(id) {
    clearTimeout(id);
    clearInterval(id);
  }
};