import fastify from "fastify"
import next from "next";
import { parse } from "url"
import cluster from "cluster"
import os from "os"

if (cluster.isMaster) {
  for (let i = 0; i < os.cpus().length; i++) cluster.fork({});
  cluster.on("exit", (w) => {
    console.log(w.process.pid + " died.")
  })
  cluster.on("online", (worker) => {
    console.log("Worker %o is listening", worker.process.pid)
  })
} else {
  const server = fastify();
  const app = next({ dev: process.env.NODE_ENV !== "production" });
  const handle = app.getRequestHandler();
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
    server.listen(process.env.PORT || 3002, "0.0.0.0").then(() => {
      console.log("server started." + process.pid);
    });
  });
}