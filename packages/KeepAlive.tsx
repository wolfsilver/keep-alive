import React, { memo, ReactNode, useEffect, useImperativeHandle, useMemo, useReducer, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
export interface ComponentReactElement {
  children?: ReactNode | ReactNode[];
}
interface ComponentProps extends ComponentReactElement {
  active: boolean;
  name: string;
  renderDiv: HTMLDivElement;
}
interface KeepComponentProps extends ComponentReactElement {
  current: string;
  deleteKey?: string;
  isKeepAlive?: boolean;
}

function Component({ active, children, name, renderDiv }: ComponentProps) {
  const [targetElement] = useState(() => document.createElement('div'));
  const activatedRef = useRef(false);
  activatedRef.current = activatedRef.current || active;
  useEffect(() => {
    if (active) {
      try {
        renderDiv?.replaceChildren(targetElement);
      } catch (error) {
        console.error('render error', error);
      }
    } else {
      renderDiv?.contains(targetElement) && renderDiv?.removeChild(targetElement);
    }
  }, [active, name, renderDiv, targetElement]);
  useEffect(() => {
    targetElement.setAttribute('id', name);
    targetElement.style.display = 'contents';
  }, [name, targetElement]);
  return <>{activatedRef.current && createPortal(children, targetElement)}</>;
}
export const KeepAliveComponent = memo(Component);

export interface keepAliveRef {
  clear: (deleteKey: string) => void;
}

const KeepAlive = ({ current, children, isKeepAlive = true }: KeepComponentProps, ref: React.Ref<keepAliveRef>) => {
  const componentList = useRef<Map<string, ReactNode | ReactNode[]>>(new Map());
  const forceUpdate = useReducer(bool => !bool, false)[1]; // 强制渲染
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!current) {
      return;
    }
    if (!isKeepAlive) {
      componentList.current.delete(current);
    }
    if (!componentList.current.has(current)) {
      componentList.current.set(current, children);
    }
    forceUpdate();
  }, [current, isKeepAlive]); // eslint-disable-line

  useImperativeHandle(ref, () => ({
    clear: (deleteKey: string) => {
      if (deleteKey) {
        componentList.current.delete(deleteKey);
      }
    },
  }));

  const container = useMemo(() => {
    return containerRef.current?.closest('#keepAliveContainer') as HTMLDivElement || containerRef.current;
  }, [containerRef.current]);

  return (
    <>
      <div ref={containerRef} style={{ display: 'contents' }} />
      {Array.from(componentList.current).map(([key, component]) =>
        key === current && !isKeepAlive ? (
          createPortal(component, container)
        ) : (
          <KeepAliveComponent active={key === current && isKeepAlive} renderDiv={container} name={key} key={key}>
            {component}
          </KeepAliveComponent>
        ),
      )}
    </>
  );
};

export default memo(React.forwardRef(KeepAlive));
