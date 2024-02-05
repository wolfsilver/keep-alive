import { useContext, useEffect, useRef } from "react";
import { context } from "./context";
import { callback } from "./type";


function KeepAliveHook(hook: string, effect: null | callback) {
  const effectRef = useRef<null | callback>(() => { });
  effectRef.current = effect;

  const { history, current } = useContext(context);
  useEffect(() => {
    if (typeof effectRef.current !== 'function' || !effectRef.current) {
      console.error(`${hook}钩子需要传入函数`);
      return;
    }
    history &&
      history.some(el => {
        if (el.locationPath === current) {
          el.pageShow = el.pageShow || [];
          el.pageHide = el.pageHide || [];
          hook === 'usePageShow' ? el.pageShow.push(effectRef.current!) : el.pageHide.push(effectRef.current!);
          return true;
        }
      });

    return () => {
      console.warn('need to clean ... #########');
    };
  }, []); // eslint-disable-line
}
export const usePageHide = KeepAliveHook.bind(null, 'usePageHide');
export const usePageShow = KeepAliveHook.bind(null, 'usePageShow');
