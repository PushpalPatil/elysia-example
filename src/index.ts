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
    ({ headers, cookie }) => {
      let secret = null;
      const auth = headers.authorization

      if (!auth) return { user: null }

      // check for Bearer token in the Authorization header
      if (auth && auth.startsWith('Bearer ')) {
        // if there is bearer then just take it out and assign to secret
        secret = auth.replace('Bearer ', '')
        console.log(secret)
      }

      // ELSE assign secret to be the secret's value
      else {
        secret = cookie.secret.value;
        console.log(secret)
      }

      const [username, password] = auth.split(":");

      //const user = users.find((user) => user.username === username && user.password === password);
      const user = users.find((user) => user.secret === secret);
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
  .get("/api/protected", (requestInfo) => {
    const authorizationHeaderValue = requestInfo.headers.authorization
    let secret = null
    if (authorizationHeaderValue && authorizationHeaderValue.startsWith('Bearer ')) {
      // if there is bearer then just take it out and assign to secret
      secret = authorizationHeaderValue.replace('Bearer ', '')
    }
    if (secret === null) {
      requestInfo.set.status = 401;
      return "No Secret Found!"
    }
    const user = users.find((user) => user.secret === secret);
    if (user === undefined) {
      requestInfo.set.status = 401;
      return "no user found"
    }
    if (user.role !== 'admin') {
      requestInfo.set.status = 403
      return { error: "Admin access required" };
    }

    return `Hello welcome to our secret endpoint, ${user.username}`
  });



const app = new Elysia()
  .use(swagger(
    { path: '/api-docs' }))
  .use(protectedRoutes)
  .listen(3000)



console.log(`View documentation at "${app.server!.url}swagger" in your browser`);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
