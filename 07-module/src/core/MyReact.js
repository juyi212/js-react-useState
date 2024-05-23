function MyReact() {
  const options = {
    idx: 0,
    states: [],
    root: null,
    rootComponent: null,
  };

  function useState(initialState) {
    const { states, idx: key } = options;
    if (states.length === key) {
      states.push(initialState);
    }

    const state = states[key];

    function setState(newState) {
      if (JSON.stringify(states[key]) !== JSON.stringify(newState)) {
        states[key] = newState;
        _render();
      }
    }

    options.idx += 1;
    return [state, setState];
  }

  function _render() {
    const { root, rootComponent } = options;
    if (!root || !rootComponent) return;

    root.innerHTML = rootComponent();
    options.idx = 0;
  }

  function render(rootComponent, root) {
    options.root = root;
    options.rootComponent = rootComponent;
    _render();
  }

  return { useState, render };
}

export const { useState, render } = MyReact();
