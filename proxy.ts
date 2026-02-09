import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isRedirectIfAuthenticated = createRouteMatcher([
  "/",
  "/login",
  "/signup",
]);

const isProtectedRoute = createRouteMatcher(["/game"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (
    isRedirectIfAuthenticated(request) &&
    (await convexAuth.isAuthenticated())
  ) {
    return nextjsMiddlewareRedirect(request, "/game");
  }

  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/login");
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/game", "/(api|trpc)(.*)"],
};
