import React, { useMemo, useState, useEffect, useRef, useContext } from 'react';

type Listener = (stateValue: Record<string, any>, changedProperties: string[]) => void;

export interface WatchedContextValue<T> {
  value: T;
  subscribe: (listener: Listener) => Function;
}

function useWatchProviderValue<T extends Record<string, any>>(value: T) {
  const valueRef = useRef(value);

  const listenersRef = useRef<Set<Listener>>(new Set());

  const contextValueRef = useRef({
    value: valueRef.current,
    subscribe: (listener: Listener) => {
      listenersRef.current.add(listener);
      return () => listenersRef.current.delete(listener);
    },
  });

  useEffect(() => {
    // 找出触发render的变化的keys
    const changedProperties = Object.keys(value).filter(key => valueRef.current[key] !== value[key]);

    // 全局state value(需要确保value是memo过的)更新后 触发所有订阅更新
    listenersRef.current.forEach(listener => listener(value, changedProperties));
    // 手动同步valueRef;
    valueRef.current = value;
  }, [value]);

  return contextValueRef.current;
}

function createProxy<T extends Record<string, any>>(state: T, listenedStateProps: Record<string, boolean>): T {
  const result = {};

  Object.keys(state).forEach(propertyName => {
    Object.defineProperty(result, propertyName, {
      get() {
        listenedStateProps[propertyName] = true;
        return state[propertyName];
      },
    });
  });

  return result as T;
}

function usePerformanceContext<T extends Record<string, any>>(context: React.Context<WatchedContextValue<T>>): T {
  const listenedStateProps = useRef<{ [K in keyof T]: boolean }>({} as { [K in keyof T]: boolean });

  const { value, subscribe } = useContext(context);
  const [newValue, setNewValue] = useState(value);

  useEffect(() => {
    const listener = (stateValue: Record<string, any>, changedProperties: string[]) => {
      // 触发render的keys包含 当前hook订阅的key则 触发组件render
      if (changedProperties.some(key => listenedStateProps.current[key])) {
        const targetValue = Object.keys(stateValue).reduce(
          (acc, key) => (listenedStateProps.current[key] ? { ...acc, [key]: stateValue[key] } : acc),
          {}
        );

        setNewValue(pre => ({
          ...pre,
          ...targetValue,
        }));
      }
    };

    const unsubscribe = subscribe(listener);

    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  return useMemo(() => createProxy(newValue, listenedStateProps.current), [newValue]);
}

export { useWatchProviderValue, usePerformanceContext };
