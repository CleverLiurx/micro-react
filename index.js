import { createElement, render } from "./react";

let num = 0;

const root = document.getElementById("root");
const genElement = (num) => {
  return createElement(
    "h1",
    { id: "title", style: "background: yellow" },
    "Hello World",
    createElement("br"),
    createElement("input", { value: num }),
    createElement("br"),
    createElement("button", { onclick: handleClick }, "add"),
    createElement("br"),
    createElement(
      "a",
      { href: "https://www.bilibili.com", target: "_black" },
      "Bilibili"
    )
  );
};

const handleClick = (e) => {
  const domInput = document.querySelector("input");
  num = Number(domInput.value) + 1;
  // 模拟更新
  const element = genElement(num);
  render(element, root);
};

const element = genElement(num);
render(element, root);
