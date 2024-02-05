import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  RouteObject,
} from "react-router-dom";
import App from './App.tsx'
import './index.css'
import Layout from '../packages/Layout.tsx'

export const router: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "a",
        element: <App page='a' />,
      },
      {
        path: "b",
        element: <App page='b' />,
        handle: {
          keepAlive: true,
        },
      },
    ],
  },
]

const browserRouter = createBrowserRouter(router);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RouterProvider router={browserRouter} />,
)
