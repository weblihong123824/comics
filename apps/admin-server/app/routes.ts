import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // 根路径重定向
  index("routes/index.tsx"),
  
  // 静态资源
  route("favicon.ico", "routes/favicon.ts"),
  
  // 登录页面 - 不使用Layout
  route("admin/login", "routes/admin/login.tsx"),
  
  // 管理后台路由 - 使用Layout包装
  layout("components/admin/AdminLayout.tsx", [
    route("admin/dashboard", "routes/admin/dashboard.tsx"),
    route("admin/comics", "routes/admin/comics.tsx"),
    route("admin/comics/:id/chapters", "routes/admin/comics.$id.chapters.tsx"),
    route("admin/comics/:id/chapters/:chapterId/pages", "routes/admin/comics.$id.chapters.$chapterId.pages.tsx"),
    route("admin/categories", "routes/admin/categories.tsx"),
    route("admin/users", "routes/admin/users.tsx"),
    route("admin/analytics", "routes/admin/analytics.tsx"),
    route("admin/auth", "routes/admin/auth.tsx"),
    route("admin/orders", "routes/admin/orders.tsx"),
    route("admin/settings", "routes/admin/settings.tsx"),
  ]),
  
  // API 路由
  route("api/comics", "routes/api/comics.ts"),
  route("api/comics/:id", "routes/api/comics.[id].ts"),
  route("api/chapters/:id", "routes/api/chapters.[id].ts"),
  route("api/users", "routes/api/users.ts"),
  route("api/upload", "routes/api/upload.ts"),
  route("api/auth", "routes/api/auth.ts"),
  route("api/purchase", "routes/api/purchase.ts"),
] satisfies RouteConfig;