import { Hono } from "hono";
import booksRouter from "./books.js";
import categoriesRouter from "./categories.js";
import menuRouter from "./menu.js";
import ordersRouter from "./orders.js";
import dashboardRouter from "./dashboard.js";
import { bearerAuth } from "hono/bearer-auth";
import { env } from "hono/adapter";

declare global {
  interface BigInt {
    toJSON(): Number;
  }
}

BigInt.prototype.toJSON = function () {
  return Number(this);
};

const apiRouter = new Hono();

apiRouter.use(
  "*",
  bearerAuth({
    verifyToken: async (token, c) => {
      const { API_SECRET } = env<{ API_SECRET: string }>(c);
      return token === API_SECRET;
    },
  })
);

// Existing routes
apiRouter.route("/books", booksRouter);

// Coffee shop routes
apiRouter.route("/categories", categoriesRouter);
apiRouter.route("/menu", menuRouter);
apiRouter.route("/orders", ordersRouter);
apiRouter.route("/dashboard", dashboardRouter);

export default apiRouter;