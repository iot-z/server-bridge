/**
 * Este arquivo precisa ser gerado com um build. Utilizando o make-observavle dos utils.
 * Por enquanto deixei direto para ganhar tempo.
 */

function MakeObservable(obj, fn, triggerOnSetup = false, path = '') {
  let observable = {};
  let _observable = {};

  let counter = 0;

  for (let prop in obj) {
    let completeProp = (path ? path + '.' : '') + prop;

    _observable[prop] = obj[prop];

    if (typeof obj[prop] == 'object') {
      _observable[prop] = MakeObservable(obj[prop], fn, triggerOnSetup, completeProp);
    }

    Object.defineProperty(observable, prop, {
      get: function () {
        return _observable[prop];
      },
      set: function (newVal) {
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
      return prop.split('.').reduce((nestedObject, key) => {
        if (nestedObject && key in nestedObject) {
          return nestedObject[key];
        }

        return undefined;
      }, this);
    }
  });

  Object.defineProperty(observable, 'set', {
    value: function set(prop, value) {
      let parts = prop.split('.');
      let last = parts.pop();

      let nestedObject = parts.reduce((nestedObject, key) => {
        if (nestedObject && key in nestedObject) {
          return nestedObject[key];
        }

        return undefined;
      }, this);

      nestedObject[last] = value;
    }
  });

  if (triggerOnSetup) {
    for (let prop in obj) {
      let completeProp = (path ? path + '.' : '') + prop;

      fn(completeProp, undefined, observable.get(completeProp));
    }
  }

  return observable;
}

function MakeObservableFn(obj, fn) {
  const observable = {};

  for (let prop in obj) {
    if (isFunction(obj[prop])) {
      Object.defineProperty(observable, prop, {
        value: function (...params) {
          fn(prop, params);
          obj[prop].apply(this, params);
        }
      });
    }
  }

  return observable;
}

function isFunction(fn) {
  return fn && {}.toString.call(fn) === '[object Function]';
}

/**
 * Este é o conteúdo do IOTZ Client. O conteúdo acima precisa ser carregado via require.
 */
const IOTZ = {
  _state: {},
  _actions: {},
  init(fn) {
    window.addEventListener('message', function(e) {
      if (e.data.type == 'create') {
        this._state = MakeObservable(e.data.state, function (prop, ) {
          parent.postMessage({
            type: 'change',
            data: {
              moduleId: e.data.moduleId,
              prop: prop,
              val: newVal
            }
          }, '*');
        });

        this._actions = MakeObservableFn(e.data.actions, function (prop, params) {
          parent.postMessage({
            type: 'call',
            data: {
              moduleId: e.data.moduleId,
              prop: prop,
              val: params
            }
          }, '*');
        });

        fn(this._state);
      } else if (e.data.type == 'update') {
        this._state.set(e.data.prop, e.data.val, false);
      }
    });
  }
}
