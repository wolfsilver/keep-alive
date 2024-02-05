import { createContext } from "react";
import { IHistory } from "./type";

export const context = createContext<{
  history?: IHistory[];
  current?: string;
}>({});

export const { Provider, Consumer } = context;
