
interface MetaProps {
  keepAlive?: boolean;
  scrollElement?: string; // id or class
}

type matchesReturn = ReturnType<typeof matchRoutes>;
type matchesReturnItem = NonNullable<matchesReturn>[number];

export interface RouteObject extends matchesReturnItem {
  handle?: MetaProps
}

export type callback = (referrer?: RouteObject) => void;

export interface IHistory {
  locationPath: string;
  historyKey: string;
  scrollTop: number;
  pageHide?: callback[];
  pageShow?: callback[];
  route?: RouteObject;
}
