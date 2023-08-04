import { createElement } from "./react";

const element = createElement(
    'h1',
    { id: 'title', class: 'article-title' },
    'Hello World',
    createElement('h2')
)

console.log(element)