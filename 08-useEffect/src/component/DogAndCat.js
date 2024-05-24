import { useState, useEffect } from "../core/MyReact.js";

export function DogAndCat() {
  const [count, setCount] = useState(1);
  const [dog, setDog] = useState("나는 강아지");
  const [cat, setCat] = useState("나는 고양이");

  function BarkDog(newCount) {
    setCount(newCount);
    setDog("멍멍".repeat(newCount));
  }

  function BarkCat(newCount) {
    setCount(newCount);
    setCat("야옹".repeat(newCount));
  }

  window.increment = () => BarkDog(count + 1);
  window.decrement = () => BarkCat(count - 1);

  useEffect(() => {
    console.log("dog", dog);
  }, [dog]);

  return `
    <div>
      <div>count: ${count} </div>
      <div>dog: ${dog} </div>
      <div>cat: ${cat} </div>
      <button onclick="increment()"> 증가 </button>
      <button onclick="decrement()"> 감소 </button>
    </div>
  `;
}
