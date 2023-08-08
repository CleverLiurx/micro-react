import { createElement } from "./react";

const App = (props) => {
  const { name } = props;
  return createElement("h1", null, "Hi, ", name);
  // 如果使用babel处理jsx，可以写成
  // return <h1>Hi, {name}</h1>
};

export default App;
