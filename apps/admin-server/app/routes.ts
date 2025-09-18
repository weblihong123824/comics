import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // 根路径重定向
  index("routes/index.tsx"),
  
  // 管理后台路由
  route("admin/dashboard", "routes/admin/dashboard.tsx"),
  route("admin/comics", "routes/admin/comics.tsx"),
  route("admin/users", "routes/admin/users.tsx"),
  route("admin/analytics", "routes/admin/analytics.tsx"),
  
  // API 路由
  route("api/comics", "routes/api/comics.ts"),
  route("api/comics/:id", "routes/api/comics.[id].ts"),
  route("api/chapters/:id", "routes/api/chapters.[id].ts"),
  route("api/users", "routes/api/users.ts"),
  route("api/upload", "routes/api/upload.ts"),
] satisfies RouteConfig;