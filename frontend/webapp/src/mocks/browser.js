import {setupWorker} from "msw";
import {handlers} from "./handlers";

export const worker = setupWorker(...handlers);
export const startWorker = () =>
  worker.start({quiet: false, onUnhandledRequest: "bypass"});
