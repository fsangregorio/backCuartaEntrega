
import express from "express";
import { resolve } from "path";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import productRouter from "./routes/products.js";
import cartRouter from "./routes/carts.js";
import viewsRouter from "./routes/views.js";

const PORT = process.env.PORT || 8088;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const viewsPath = resolve("src/views");
app.engine(
  "handlebars",
  engine({
    layoutsDir: `${viewsPath}/layouts`,
    defaultLayout: `${viewsPath}/layouts/main.handlebars`,
  })
);
app.set("view engine", "handlebars");
app.set("views", viewsPath);

app.use("/", viewsRouter);
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);

const httpServer = app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});

const io = new Server(httpServer);
app.set("io", io);
