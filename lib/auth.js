import { PrismaAdapter } from "@auth/prisma-adapter";
import primsa from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubAuthProvider from "next-auth/providers/github";
import bcrypt from 'bcrypt';

const authOptions =  {
    secret: process.env.NEXTAUTH_SECRET,
    adapter: PrismaAdapter(primsa),
    session: {
      strategy: 'jwt',
    },
    pages: {
      signIn: '/login',
    },
    providers: [
      CredentialsProvider({
            name: 'Credentials',
            credentials: {
              email: { label: "Username", type: "text",placeholder:"请输入邮箱" },
              password: {  label: "Password", type: "password",placeholder:'请输入密码' }
            },
            authorize: async (credentials) => {
              if(!credentials.email || !credentials.password){
                return null;
              }
              const user = await primsa.user.findUnique({
                where: { email: credentials.email },
              })
              // verify user
              if(!user){
                throw new Error("用户不存在");
              }
              // verify password
              const validated = await bcrypt.compare(credentials.password,user.pwd);
              if (validated) {
                // return user
                return {id:user.id,name:user.name,email:user.email,image:user.image}
              } 
              throw new Error("密码不匹配");;
            }
          }),
          GithubAuthProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET
          })
    ],
    callbacks: {
      async session({ token, session }) {
        if (token) {
          session.user.id = token.id
          session.user.name = token.name
          session.user.email = token.email
          session.user.image = token.picture
        }
        return session
      },
      
      async jwt({ token, user }) {
        if(!user){
          return token;
        }

        const dbUser = await primsa.user.findUnique({
          where: {
            id: user?.id,
          },
        })
  
        if (!dbUser) {
          token.id = user?.id
          return token
        }
  
        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          picture: dbUser.image,
        }
      },
      redirect() {
        return '/dashboard'
      },
    },
};

export default authOptions;
