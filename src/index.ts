
// Export whatever you want consumers to use
/*
Consumer import convenience

Without an index.ts, users would need to import deep paths, e.g.

import MyComponent from "my-lib/dist/components/MyComponent";


With an index.ts, they can just:

import { MyComponent } from "my-lib";
*/

export type { GraphiteProps } from "./pages/Graphite";
export { Graphite } from "./pages/Graphite";

export type { FlowiteProps } from "./pages/Flowite";
export { Flowite } from "./pages/Flowite";

export type { DataOProps } from "./pages/DataO";
export { DataO } from "./pages/DataO";