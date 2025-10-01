import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "development-secret-key-change-in-production",
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Auth: Missing credentials")
          return null
        }

        // 新しいPrismaClientインスタンスを作成
        const databaseUrl = process.env.DATABASE_URL
        console.log('Auth - Database URL configured:', databaseUrl ? 'Yes' : 'No')
        console.log('Auth - NODE_ENV:', process.env.NODE_ENV)
        
        const prisma = new PrismaClient({
          log: ['query', 'error', 'warn'],
          datasources: {
            db: {
              url: databaseUrl
            }
          }
        })

        try {
          await prisma.$connect()
          console.log('Auth - Database connected successfully')
          
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email.toLowerCase()
            }
          })

          if (!user) {
            console.error("Auth: User not found:", credentials.email)
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.error("Auth: Invalid password for:", credentials.email)
            return null
          }

          console.log("Auth: Successful login for:", credentials.email)
          
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            role: user.role
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        } finally {
          await prisma.$disconnect()
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as string
      }
      return session
    }
  }
}