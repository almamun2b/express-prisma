import { AuthRoutes } from "@/app/modules/auth/auth.route";
import { UserRoutes } from "@/app/modules/user/user.route";
import { Router } from "express";
import { HealthRoutes } from "./health.route";

const router: Router = Router();

const moduleRoutes = [
  {
    path: "/health",
    route: HealthRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
