import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("healthz", "routes/healthz.ts"),
  route("api/streaming-poc", "routes/api.streaming-poc.ts"),
] satisfies RouteConfig;
