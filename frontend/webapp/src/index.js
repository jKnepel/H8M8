import React from "react";
import ReactDOM from "react-dom";
import App from "./containers/app";
import {MantineProvider} from "@mantine/core";
import {NotificationsProvider} from "@mantine/notifications";
import {Provider as ReduxStoreProvider} from "react-redux";
import store from "./redux/store";
import "./style.scss";
import ENVIRONMENT from "./utils/env";
import {QueryClient, QueryClientProvider} from "react-query";

if (ENVIRONMENT.SERVICE_WORKER_ON) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const {startWorker} = require("./mocks/browser");
  startWorker();
}

const queryClient = new QueryClient({
  defaultOptions : {
    queries : {
      /* Disabled refetching data if parameters didn't change */
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  }
});

const root = document.getElementById("root");
ReactDOM.render(
  <MantineProvider
    withGlobalStyles
    withNormalizeCSS
    withCSSVariables
    theme={{
      breakpoints: {
        xs: 320,
        sm: 425,
        md: 767,
        lg: 1023,
        xl: 1440,
      },
    }}
  >
    <NotificationsProvider>
      <ReduxStoreProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ReduxStoreProvider>
    </NotificationsProvider>
  </MantineProvider>,
  root
);
