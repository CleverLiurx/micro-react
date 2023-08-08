let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;
let wipFiber = null;
let hookIndex = null;

function createDom(fiber) {
  // 创建dom
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  // 赋予属性
  updateDom(dom, {}, fiber.props);

  return dom;
}

// 入口：创建 root fiber
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    parent: null,
    child: null,
    sibling: null,
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

function commitRoot() {
  deletions.forEach(commitWork); // 删除
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;
  // const domParent = fiber.parent.dom;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "DELETION") {
    // domParent.removeChild(fiber.dom)
    commitDeletion(fiber, domParent);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    // 普通组件有dom
    domParent.removeChild(fiber.dom);
  } else {
    // 函数式组件，没有dom
    commitDeletion(fiber.child, domParent);
  }
}

const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);

function updateDom(dom, prevProps, nextProps) {
  // 先删除 老的或者改变了的 事件
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((k) => !(k in nextProps) || nextProps[k] !== prevProps[k])
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // 移除老的props
  Object.keys(prevProps)
    .filter(isProperty)
    .filter((k) => !(k in nextProps))
    .forEach((name) => (dom[name] = ""));

  // 设置新的或改变的props
  Object.keys(nextProps)
    .filter(isProperty)
    .filter((k) => prevProps[k] !== nextProps[k])
    .forEach((name) => (dom[name] = nextProps[name]));

  // 绑定 新的或者改变了的 事件
  Object.keys(nextProps)
    .filter(isEvent)
    .filter((k) => prevProps[k] !== nextProps[k])
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

function worKLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(worKLoop);
}

requestIdleCallback(worKLoop);

function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    // 函数组件
    updateFunctionComponent(fiber);
  } else {
    // 普通组件
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);
}

function updateFunctionComponent(fiber) {
  console.log("fiber...", fiber);
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

function useState(initial) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    hook.state = action(hook.state);
  });

  const setState = (action) => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber.hooks.push(hook);
  console.log("push hook...", hook);
  hookIndex++;

  return [hook.state, setState];
}

// 构建fiber，对比wipFiber的子节点
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;

    // 判断是否为相同类型的fiber
    const sameType = oldFiber && element && oldFiber.type === element.type;

    // old    h1    h1          span    div
    // ele    h1    h2          span
    //       更新  新增h2删除h1  更新    删除老的div

    // Here React also uses keys, that makes a better reconciliation.
    // For example, it detects when children change places in the element array.
    if (sameType) {
      // 是相同类型的，执行更新操作
      newFiber = {
        type: oldFiber.type,
        props: element.props, // 更新props
        dom: oldFiber.dom, // 使用老的dom
        parent: wipFiber,
        child: null,
        sibling: null,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }

    if (!sameType && element) {
      // 类型不相同，而且存在新的元素，执行新增操作
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null, // performUnitOfWork时候创建
        parent: wipFiber,
        child: null,
        sibling: null,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }

    if (!sameType && oldFiber) {
      // 类型不相同，而且存在老的，那么要把老的删除
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;

    index++;
  }
}

export { useState };
export default render;
