### Javascript로 useState 만들기

useState는 React에서 제공하는 일종의 함수(Hook)이다.

```jsx
const [state, setState] = useState(1);
```

여기서 의문을 가질 수 있는 부분은 useState로 쓰이는 값이 변경되면, 해당 컴포넌트는 리렌더링된다. 하지만, 다시 실행되어도 state값은 초기화되지 않고 유지된다. <br>

이는 어떻게 가능한 것일까? <br>
분석은 해봐야되겠지만, 우선 해당 기능이 가능한 이유는 클로저 개념 때문이다.<br>

#### 클로저 ?

> 클로저는 함수와 함수가 선언된 렉시컬 환경의 조합입니다. 즉, 클로저는 함수가 선언될 때의 스코프(변수 환경)를 기억하고, 그 함수가 스코프 밖에서 호출되더라도 그 스코프에 접근할 수 있게 합니다.
> 예외 사항은 존재합니다. eventHandler 등..

간단한 예시 )

```javascript
function makeFunction() {
  let name = "Velog";
  function displayName() {
    console.log(name);
  }
  function changeName(newName) {
    name = newName;
  }
  return { displayName, changeName };
}

console.log(name); // >>> undefined

const myFunctions = makeFunction();
myFunctions.displayName(); // >>> Velog

myFunctions.changeName("Velog.io");
myFunctions.displayName(); // >>> Velog.io;
```

### useState

기본적인 구조는 useState를 사용하는 컴포넌트의 바깥에서(외부 스코프에서) 모든 상태 변수를 정의하고 관리하여 특정 상태 값을 유지하고 변경할 수 있도록 하는 것이다.

React를 하나의 큰 함수로 본다면, React라는 함수의 lexical scope 안에서 state에 대한 변수를 선언하고, 이 state에 대한 변수를 참조하거나 변경할 수 있는 useState 함수를 React로부터 제공받아 state를 관리할 수 있다.

useState로 관리되어야 하는 값이 1개일 때는 아래와 같이 구현할 수 있을 것이다.

```javascript
let state = undefined; // 관리하려는 상태
function useState(initialState) {
  if (state === undefined) {
    state = initialState;
  }
  const setState = (newState) => {
    state = newState;
    render(); // state가 변경될 때마다 re-render
  };

  return [state, setState];
}
```

만약 여러개인 경우, useState들을 관리할 배열이 필요할 것입니다.

```javascript
let states = []; // 여러개의 상태 관리
let idx = 0; // states에서의 값 위치

function render() {
  ...
  // render 시마다 currentStateIndex를 초기화해서
  // 기존의 state를 계속 바라볼 수 있게 함
  idx = 0;
}

function useState(initialState) {
  const key = idx; //현재 state 위치
  const state = states[key] || initialState;

  const setState = (newState) => {
    if (JSON.stringify(states[key]) !== JSON.stringify(newState)) {
      states[key] = newState;
      render();
    }
  };

  idx += 1;
  return [state, setState];
}
```

그리고, 한 컴포넌트에서 여러개의 state가 쓰일 때 여러번의 렌더링 과정을 거치게 된다. 이를 최적화하기 위해서 debounce 개념을 이용하였습니다.

setTimeout(or setInterval) 과 requestAnimationFrame(rAF)를 사용하여 구현할 수 있지만, setTimeout은 타이머 함수로 프레임 단위로 프레임 시작 시간에 맞춰 실행됨을 보장하지 못하기 때문에 requestAnimationFrame 를 사용하여 구현하였습니다.
자세한 차이점 및 내용은 아래 블로그를 참고해주세요 !

https://inpa.tistory.com/entry/%F0%9F%8C%90-requestAnimationFrame-%EA%B0%80%EC%9D%B4%EB%93%9C

```javascript
function debounceFrame(callback) {
  let nextFrameCallback = -1;

  // 클로저를 이용하기 위해 debounce를 실행하면 함수를 반환한다.
  return () => {
    /**
     * ex) 증가 버튼을 누르는 순간 render가 3번 일어남
     * 3번 일어나는 순간을 한 프레임안에 여러개가 있는 경우, 취소하고 새로운걸 실행
     * 실행이 예약된 함수(callback)이 있을 경우 캔슬한다.
     */
    cancelAnimationFrame(nextFrameCallback);

    // 특정 시간 후에 callback이 실행되도록 한다.
    nextFrameCallback = requestAnimationFrame(callback);
  };
}

const render = debounceFrame(() => {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
      ${DogAndCat()}
    `;
  renderCount += 1;
  idx = 0;
});
```

### useEffect

useEffect도 useState와 거의 동일합니다. 차이점은 useEffect의 dependency를 따로 관리해야한다는 점입니다.
states에 실행 시점의 dependencies를 저장해주고 관리해줍니다.

```javascript
const useEffect = (callback, dependencies) => {
  const { idx, states } = options;

  // 현재 위치에 저장되어 있는 값이 기존의 dependency이다
  // 최초 실행 시에는 이 값은 undefined일 것이다
  const index = idx;
  const oldDependencies = states[index];

  // useEffect 최초 실행 시에는 callback 함수 한번은 실행 해야함
  let hasChange = true;

  if (oldDependencies) {
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
```
