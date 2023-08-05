let nextUnitOfWork = null;

function worKLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(worKLoop);
}

requestIdleCallback(worKLoop);

function performUnitOfWork(work) {
  // TODO
}

function render(element, container) {
  // 创建dom
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  // 赋予属性
  const isProperty = (key) => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => (dom[name] = element.props[name]));

  // 递归的创建子元素
  // element.props.children.forEach((child) => render(child, dom));

  // 添加到容器
  container.appendChild(dom);
}

export default render;
