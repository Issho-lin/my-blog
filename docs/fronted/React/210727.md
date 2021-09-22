---
title: Fiber的render阶段
sidebar: 'auto'
sidebarDepth: 2
date: 2021-07-27
author: Issho Lin
tags:
 - 框架
categories:
 - React
---

## 流程概览
### render阶段开始
```js
// performSyncWorkOnRoot会调用该方法
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

// performConcurrentWorkOnRoot会调用该方法
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
```
### performUnitOfWork的递与归
![image.png](https://upload-images.jianshu.io/upload_images/19423820-9e6da1d361b71f18.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

以下面的代码为例子
```js
function App() {
  return (
    <div>
      Hello
      <span>World</span>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById("root"));
```
![image.png](https://upload-images.jianshu.io/upload_images/19423820-ad54c5240e11e013.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## [beginWork](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react-reconciler/src/ReactFiberBeginWork.new.js#L3075)
```js
// 传入当前Fiber节点，创建子Fiber节点
function beginWork(
  current: Fiber | null, // workInProgress.alternate
  workInProgress: Fiber, // 当前组件对应的Fiber节点
  renderLanes: Lanes, // 优先级相关
): Fiber | null {
  // ...省略函数体
}
```
### mount
结合下图，组件首次渲染，除了rootFiber，不存在当前组件对应的Fiber节点在上一次更新时的Fiber节点，即mount时beginWork 函数的current 参数（即workInProgress.alternate）为null

![image.png](https://upload-images.jianshu.io/upload_images/19423820-40d1c7c11540be34.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```js
function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
): Fiber | null {

  // mount时，current为null
  if (current !== null) {
    //update: 可能存在优化路径，可以复用current（即上一次更新的Fiber节点）
    //...
    // 复用current
    return bailoutOnAlreadyFinishedWork(
      current,
      workInProgress,
      renderLanes,
    );
  } else {
    didReceiveUpdate = false;
  }

  // mount或，update时不能复用current：根据tag创建不同的子Fiber节点
  switch (workInProgress.tag) {
    case IndeterminateComponent: 
      // ...
    case LazyComponent: 
      // ...
    case FunctionComponent: 
      // ...
      // 进入reconcileChildren
    case ClassComponent: 
      // ...
      // 进入reconcileChildren
    case HostRoot:
      // ...
    case HostComponent:
      // ...
      // 进入reconcileChildren
    case HostText:
      // ...
    // ...其他类型
  }
}
```

### update
当满足以下条件时，可以复用current
- oldProps === newProps && workInProgress.type === current.type，即props与fiber.type不变
- !includesSomeLane(renderLanes, updateLanes)为true，即当前Fiber节点优先级不够
```js
if (current !== null) {
    const oldProps = current.memoizedProps;
    const newProps = workInProgress.pendingProps;
    if (
      oldProps !== newProps ||
      hasLegacyContextChanged() ||
      // 热重载，强制重新渲染？？？
      (__DEV__ ? workInProgress.type !== current.type : false)
    ) {
      didReceiveUpdate = true;
    } else if (!includesSomeLane(renderLanes, updateLanes)) {
      // 进入可复用current的逻辑
      didReceiveUpdate = false;
      switch (workInProgress.tag) {
        // 省略处理
      }
      return bailoutOnAlreadyFinishedWork(
        current,
        workInProgress,
        renderLanes,
      );
    } else {
      didReceiveUpdate = false;
    }
} else {
   didReceiveUpdate = false;
}
```
### [reconcileChildren](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react-reconciler/src/ReactFiberBeginWork.new.js#L233)
```js
// 生成新的子Fiber节点并赋值给workInProgress.child，作为beginWork的返回值
export function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
  renderLanes: Lanes
) {
  // current为null，是mount阶段
  if (current === null) {
    // mount：创建新的子fiber节点
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderLanes,
    );
  } else {
    // update：打effectTag标记，保存dom操作的具体类型
    // 比较旧fiber节点，生成新fiber节点（diff算法）
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderLanes,
    );
  }
}
```

### effecTag
```js
// 插入
export const Placement = /*                */ 0b00000000000010;
// 更新
export const Update = /*                   */ 0b00000000000100;
// 插入并更新
export const PlacementAndUpdate = /*       */ 0b00000000000110;
// 删除
export const Deletion = /*                 */ 0b00000000001000;
```
> 在mount时只有rootFiber会赋值Placement effectTag，在commit阶段只会执行一次插入操作。

### 流程图
![image.png](https://upload-images.jianshu.io/upload_images/19423820-7a0e457cddb4280e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## [completeWork](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react-reconciler/src/ReactFiberCompleteWork.new.js#L673)
```js
function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  const newProps = workInProgress.pendingProps;

  switch (workInProgress.tag) {
    case IndeterminateComponent:
    case LazyComponent:
    case SimpleMemoComponent:
    case FunctionComponent:
    case ForwardRef:
    case Fragment:
    case Mode:
    case Profiler:
    case ContextConsumer:
    case MemoComponent:
      return null;
    case ClassComponent: {
      // ...省略
      return null;
    }
    case HostRoot: {
      // ...省略
      updateHostContainer(workInProgress);
      return null;
    }
    case HostComponent: {
      // ...省略
      return null;
    }
  // ...省略
```

### mount
- 为fiber节点生成对应的dom节点
```js
const instance = createInstance(
    type,
    newProps,
    rootContainerInstance,
    currentHostContext,
    workInProgress,
);
```

- 将子孙dom节点插入刚生成的dom节点中
```js
appendAllChildren(instance, workInProgress, false, false);
workInProgress.stateNode = instance;
```

- 处理props，初始化DOM对象的事件监听器和内部属性
```js
    if (
  finalizeInitialChildren(
    instance,
    type,
    newProps,
    rootContainerInstance,
    currentHostContext,
  )
) {
  markUpdate(workInProgress);
}
```

### update
update时，Fiber节点已经存在对应DOM节点，所以不需要生成DOM节点。主要是处理props，比如：
- onClick、onChange等回调函数的注册
- 处理style prop
- 处理DANGEROUSLY_SET_INNER_HTML prop
- 处理children prop
```js
if (current !== null && workInProgress.stateNode != null) {
  updateHostComponent(
    current,
    workInProgress,
    type,
    newProps,
    rootContainerInstance,
  );
}
```
在[updateHostComponent](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react-reconciler/src/ReactFiberCompleteWork.new.js#L225)内部，被处理完的props会被赋值给workInProgress.updateQueue，并最终会在commit阶段被渲染在页面上。
```js
updateHostComponent = function(
    current: Fiber,
    workInProgress: Fiber,
    type: Type,
    newProps: Props,
    rootContainerInstance: Container,
  ) {
    const oldProps = current.memoizedProps;
    if (oldProps === newProps) {

      return;
    }

    const instance: Instance = workInProgress.stateNode;
    const currentHostContext = getHostContext();

    const updatePayload = prepareUpdate(
      instance,
      type,
      oldProps,
      newProps,
      rootContainerInstance,
      currentHostContext,
    );
   // updatePayload为数组形式，他的偶数索引的值为变化的prop key，奇数索引的值为变化的prop value
    workInProgress.updateQueue = (updatePayload: any);

    if (updatePayload) {
      markUpdate(workInProgress);
    }
  };
```

### [effectList](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1744)
在completeWork的上层函数completeUnitOfWork中，每个执行完completeWork且存在effectTag的Fiber节点会被保存在一条被称为effectList的单向链表中，在commit阶段只需要遍历effectList就能执行所有effect了。
![image.png](https://cdn.nlark.com/yuque/0/2021/png/613071/1630998231027-2841bd08-89e1-426f-9042-e3bf8c3289bf.png)

### render阶段结束
当rootFiber 的completeWork执行结束，此时已经构建好一棵离屏DOM树。至此，render阶段全部工作完成。在performSyncWorkOnRoot函数中fiberRootNode被传递给commitRoot方法，开启commit阶段工作流程。
```js
commitRoot(root);
```

### 流程图
![image.png](https://upload-images.jianshu.io/upload_images/19423820-148eb352a9c61606.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)