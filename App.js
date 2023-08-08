import { createElement, useState } from "./react";

const Counter = () => {
  const [count, setCount] = useState(0);

  return createElement(
    "h1",
    { onclick: () => setCount((prev) => prev + 1), style: "color: red" },
    `Count: ${count}`
  );
};

const App = (props) => {
  const { name } = props;

  return createElement(
    "h1",
    null,
    "Hi, ",
    name,
    createElement("br"),
    createElement(Counter)
  );
  // 如果使用babel处理jsx，可以写成
  //   return (
  //     <h1>
  //       Hi, {name}
  //       <br />
  //       <Counter />
  //     </h1>
  //   );
};

export default App;
