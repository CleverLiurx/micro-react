import { createElement, render } from "./react";
import App from "./App.js";

const root = document.getElementById("root");
const element = createElement(App, { name: "jack" });
// 如果使用babel处理jsx，可以写成
// const element = <App name="foo" />

render(element, root);
