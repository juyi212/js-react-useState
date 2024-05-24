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

  const useEffect = (callback, dependencies) => {
    const { idx, states } = options;
    const index = idx;
    const oldDependencies = states[index];

    // useEffect 최초 실행 시에는 callback 함수 한번은 실행 해야함
    let hasChange = true;

    if (oldDependencies) {
      // 적어도 하나라도 다른 것이 있는 지 판별
      hasChange = dependencies.some(
        (dep, i) => !Object.is(dep, oldDependencies[i])
      );
    }

    if (hasChange) {
      callback();
      states[index] = dependencies;
    }

    options.idx++;
  };

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

  return { useState, useEffect, render };
}

export const { useState, render, useEffect } = MyReact();
