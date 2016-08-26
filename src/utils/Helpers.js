export default {
  wait: (delay, fn) => {
    return setTimeout(fn, delay);
  },
  repeat: function(times, delay, fn, wait) {
    let counter, id ;
    let repeater = () => {
      fn();

      if (++counter >= times) {
        clearInterval(id);
      }
    };

    counter = 0;
    id = this.loop(delay, repeater, wait);

    return id;
  },
  loop: (delay, fn, wait) => {
    if (!wait) {
      fn();
    }

    return setInterval(fn, delay);
  },
  stop: (id) => {
    clearTimeout(id);
    clearInterval(id);
  }
};
