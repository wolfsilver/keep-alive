import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigationType, useOutlet, useMatches } from 'react-router-dom';

import KeepAlive, { keepAliveRef } from './KeepAlive';
import { Provider } from './context';
import { IHistory, RouteObject } from './type';


const Layout = () => {
  const outlet = useOutlet();
  const location = useLocation();
  const { pathname: locationPath, key: historyKey } = location;
  const [current, setCurrent] = useState('');
  const [top, setTop] = useState(0);
  const [isKeepAlive, setIsKeepAlive] = useState(true);
  const keepAliveRef = useRef<keepAliveRef>(null);

  const history = useRef<IHistory[]>([]);

  const navigationType = useNavigationType();

  const matches = useMatches();
  const route = matches[matches.length - 1] as unknown as RouteObject;

  const customHook = useMemo(
    () => ({
      history: history.current,
      current,
    }),
    [history, current],
  );

  useEffect(() => {
    setCurrent(locationPath);

    setIsKeepAlive(route?.handle?.keepAlive !== false);

    if (navigationType === 'PUSH') {
      setTop(0);
      if (
        history.current.some(el => el.locationPath === locationPath) &&
        !history.current.some(el => el.historyKey === historyKey)
      ) {
        // historyKey不存在，locationKey存在，剔除旧的locationKey
        history.current = history.current.filter(el => el.locationPath !== locationPath);
        keepAliveRef.current?.clear(locationPath); // fix 首次进入，执行浏览器前进、后退，都是POP
      }
      const { pageHide = [] } = history.current[history.current.length - 1] || {};
      pageHide.forEach(cb => {
        cb && cb();
      });
      const scrollTop = getScrollTop(route);
      history.current.push({
        locationPath,
        historyKey,
        scrollTop,
        route: route,
      });
      console.log('cache last scrollTo', scrollTop);
      return;
    }
    if (navigationType === 'POP') {
      // 首次进入，执行浏览器前进、后退，都是POP

      // history中不存在时，将页面加入history
      if (!history.current.some(el => el.locationPath === locationPath)) {
        history.current.push({
          locationPath,
          historyKey,
          scrollTop: 0,
          route: route,
        });
        return;
      }
      if (!history.current.some(el => el.historyKey === historyKey)) {
        // history中存在，判断historyKey是否存在，key存在说明时浏览器前进后退操作
        return;
      }
      const { locationPath: last = '', scrollTop = 0, route: referrer } = history.current.pop() || {};
      const { pageShow = [] } = history.current[history.current.length - 1] || {};

      pageShow.forEach(cb => {
        cb && cb(referrer);
      });
      keepAliveRef.current?.clear(last);
      setTop(scrollTop);
      return;
    }
    if (navigationType === 'REPLACE') {
      // 清掉上一个页面
      const last = history.current.pop() || ({} as IHistory);
      keepAliveRef.current?.clear(last?.locationPath);
      // 加入当前页面
      history.current.push({
        ...last,
        locationPath,
        historyKey,
      });
    }
  }, [locationPath, historyKey, navigationType]); // eslint-disable-line

  function getScrollTop(route: RouteObject) {
    if (route.handle?.scrollElement) {
      return document.querySelector(route.handle?.scrollElement)?.scrollTop || 0;
    }
    const defaultElement = document.querySelector('.keepAliveScrollElement');
    if (defaultElement) {
      return defaultElement.scrollTop;
    }

    return document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
  }

  useEffect(() => {
    const configElement = route.handle?.scrollElement && document.querySelector(route.handle?.scrollElement);
    if (configElement) {
      configElement.scrollTop = top;
    } else {
      const defaultElement = document.querySelector('.keepAliveScrollElement');
      if (defaultElement) {
        defaultElement.scrollTop = top;
      } else {
        window.scrollTo({
          top,
        });
      }
    }
  }, [top]);

  return (
    <Provider value={customHook}>
      <KeepAlive ref={keepAliveRef} current={current} isKeepAlive={isKeepAlive} >
        {outlet}
      </KeepAlive>
    </Provider>
  );
};
export default Layout;
