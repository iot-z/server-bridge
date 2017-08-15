function MakeObservable(obj, fn, triggerOnSetup = false, path = '') {
  let observable  = {};
  let _observable = {};

  let counter     = 0;

  for (let prop in obj) {
    let completeProp = (path ? path+'.' : '')+prop;

    _observable[prop] = obj[prop];

    if (typeof obj[prop] == 'object') {
      _observable[prop] = MakeObservable(obj[prop], fn, triggerOnSetup, completeProp);
    }

    Object.defineProperty(observable, prop, {
      get: function() {
        return _observable[prop];
      },
      set: function(newVal) {
        if (_observable[prop] != newVal) {
          let oldVal = _observable[prop];

          if (typeof newVal == 'object') {
            newVal = MakeObservable(newVal, fn, triggerOnSetup, completeProp);
          }

          _observable[prop] = newVal;

          fn(completeProp, oldVal, newVal);
        }
      },
      enumerable: true,
      configurable: true
    });

    counter++;
  }

  if (Array.isArray(obj)) {
    Object.defineProperty(observable, 'length', {
      value: counter
    });
  }

  Object.defineProperty(observable, 'get', {
    value: function get(prop) {
      let obj = this;
      let parts = prop.split('.');

      if (Array.isArray(parts)) {
        let last    = parts.pop();
        let l       = parts.length;
        let i       = 1;
        let current = parts[0];

        while (i < l && (obj = obj[current])) {
          current = parts[i];
          i++;
        }

        if (obj) {
          return obj[last];
        }
      } else {
        throw 'parts is not valid array';
      }
    }
  });

  Object.defineProperty(observable, 'set', {
    value: function set(prop, value) {
      let obj = this;
      let parts = prop.split('.');

      if (Array.isArray(parts)) {
        let last    = parts.pop();
        let l       = parts.length;
        let i       = 1;
        let current = parts[0];

        while (i < l && (obj = obj[current])) {
          current = parts[i];
          i++;
        }

        if (obj) {
          obj[last] = value;
        }
      } else {
        throw 'parts is not valid array';
      }
    }
  });

  if (triggerOnSetup) {
    for (let prop in obj) {
      let completeProp = (path ? path+'.' : '')+prop;

      fn(completeProp, undefined, observable.get(completeProp));
    }
  }

  return observable;
}

module.exports = MakeObservable;
