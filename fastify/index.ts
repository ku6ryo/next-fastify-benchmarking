import fastify from "fastify"
import next from "next";
import { parse } from "url"

const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();
const server = fastify();
app.prepare().then(() => {
  server.get("/api/test", { schema: {
    response: {
      200: {
        type: "object",
        properties: {
          message: {
            type: "string",
          }
        }
      }
    }
  }}, async () => {
    return {
      message: "test"
    }
  })
  server.all("*", (req, res) => {
    return handle(req.raw, res.raw, parse(req.url, true));
  });
  server.listen(process.env.PORT || 3001, "0.0.0.0").then(() => {
    console.log("server started");
  });
});