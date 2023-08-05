import { createElement, render } from "./react";

const element = createElement(
  "h1",
  { id: "title", style: "background: yellow" },
  "Hello World",
  createElement(
    "a",
    { href: "https://www.bilibili.com", target: "_black" },
    "Bilibili"
  )
);

const root = document.getElementById("root");
render(element, root);
