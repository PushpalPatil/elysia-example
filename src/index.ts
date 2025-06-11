import { swagger } from '@elysiajs/swagger';
import { Elysia } from "elysia";

const users = [
  { id: 1, username: "admin", password: "admin123", role: "admin", secret: "admin-secret-123" },
  { id: 2, username: "user", password: "user123", role: "user", secret: "user-secret-456" }
];


// use derive to get to request properties like headers, query, body where store/decorate cant
// headers :

const getUser = new Elysia()
  .derive(
    ({ headers }) => {
      const auth = headers.authorization
      if (!auth) return { user: null }

      const [username, password] = auth.split(":");

      const user = users.find((user) => user.username === username && user.password === password);
      return { user };
    }
  );

const checkAdmin = new Elysia()
  .use(getUser)
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401
      return { error: "No Authentication" };
    }

    if (user.role !== 'admin') {
      set.status = 403
      return { error: "Admin access required" };
    }
  });



const protectedRoutes = new Elysia()
  .get("/", () => "Hello Elysia")
  .get("/api/public", () => { return "This is public information" })
  .use(checkAdmin)
  .get("/api/protected", ({ user }) => {
    return `Only admin should be able to see this, hi there ${user?.username}`
  });



const app = new Elysia()
  .use(swagger(
    {
      path: '/api-docs'
    }
  ))
  .use(protectedRoutes)
  .listen(3000)



console.log(`View documentation at "${app.server!.url}swagger" in your browser`);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
