## use-optimized-context
React context avoid re-renders hook

## Introduction
React Context and useContext is often used to avoid prop drilling,
however it's known that there's a performance issue.
When a context value is changed, all components that useContext
will re-render.
[Learn more](https://github.com/facebook/react/issues/14110)
[context selector rfc](https://github.com/reactjs/rfcs/pull/119)

## When to use?
If your application meets the following conditions, you can consider using this library
> 1. You use react context and react hooks as your state management tool

> 2. The state management scenario in your application is relatively simple, and you don't want to use a state library such as Zustand

> 3. Writing state selectors is too complicated.

## Usage
```jsx
  import { createContext, useMemo, useReducer } from 'react';
  import { useWatchProviderValue, usePerformanceContext } from 'use-optimized-context';

  const Context = createContext();

  const StateProvider = ({ children }) => {
    const [count, forceUpdate] = useReducer(state => state + 1, 0);
    const value = useWatchProviderValue(useMemo(() => ({ count, forceUpdate }), [count, forceUpdate]));
    return <Context.Provider value={value}>{children}</Context.Provider>
  };

  const App1 = () => {
    /** subscribe count when count update App1 will re-render */
    const { count } = usePerformanceContext(Context);

    return `App1: ${count}`;
  }

  const App2 = () => {
    /** App2 dont use count，so will not re-render */
    const { forceUpdate } = usePerformanceContext(Context);

    return <button onClick={forceUpdate}>click App2</button>;
  }

  const App = () => (
    <StateProvider>
      <App1>
      <App2>
    </StateProvider>
  )
```

## Caveats
```jsx
  /** valid */
  const { stateA, setStateA, stateB, setStateB } = usePerformanceContext(context);

  /** Nested destructuring is invalid */
  const { stateA: { childStateA }, setStateA } = usePerformanceContext(context);
```
