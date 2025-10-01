import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",
    "/tasks/:path*",
    "/leads/:path*",
    "/opportunities/:path*",
  ],
}