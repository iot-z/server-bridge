const IOTZ = {
  _state: {},
  init(fn) {
    window.addEventListener('message', function(e) {
      if (e.data.type == 'create') {
        this._state = MakeObservable(e.data.state, function(prop, oldVal, newVal) {
          parent.postMessage({
            type: 'change',
            data: {
              moduleId: e.data.moduleId,
              prop: prop,
              val: newVal
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
