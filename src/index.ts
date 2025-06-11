import { swagger } from '@elysiajs/swagger';
import { Elysia } from "elysia";



const protectedRoutes = new Elysia()
  .get("/", () => "Hello Elysia")
  .get("/api/public", () => {return "This is public information"})
  .get("/api/protected", () => { return "Only admin should be able to see this" })
  .listen(3002)


const app = new Elysia()
  .use(swagger(
    {
      path: '/api-docs'
    }
  ))
  .use(protectedRoutes)
  .get('/', () => 'hi')
  .listen(3000)


console.log(`View documentation at "${app.server!.url}swagger" in your browser`);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
