const express = require("express");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { Server } = require("socket.io");
const productsRouter = require("./routes/products.router");
const cartsRouter = require("./routes/carts.router");
const viewsRouter = require("./routes/views.router");
const sessionRouter = require('./routes/sessions.router');
const MessageModel = require("./models/messages");
const ProductManager = require("./dao/dbManagers/ProductManager");
const PORT = 8080;
const app = express();
const productManager = new ProductManager();
require("dotenv").config();

mongoose
  .connect(
    `mongodb+srv://gusal6677:${process.env.MONGO_PASSWORD}@codercluster.vqloj77.mongodb.net/ecommerce`
  )
  .then(() => {
    console.log("Connected");
  });

//** Session setting */
app.use(
  session({
    secret: "ourNewSecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: `mongodb+srv://gusal6677:${process.env.MONGO_PASSWORD}@codercluster.vqloj77.mongodb.net/ecommerce`,
      ttl: 3600,
    }),
  })
);

//*--middlewares--*//
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//*--views engine--*//
app.engine("handlebars", handlebars.engine());
app.set("views", `${__dirname}/views`);
app.set("view engine", "handlebars");

app.use(express.static(`${__dirname}/public`));

const httpServer = app.listen(PORT, () =>
  console.log("Server on port " + PORT)
);

const io = new Server(httpServer);

app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on("connection", async (socket) => {
  console.log("socket connected");

  socket.on("newProduct", async (product) => {
    console.log(product);
    try {
      await productManager.addProduct(product);
    } catch (error) {
      console.log(error);
      io.emit("errorOnSubmit");
    }
    const products = await productManager.getProducts();
    io.emit("listUpdated", { products });
  });

  socket.on("deleteProduct", async ({ id }) => {
    await productManager.deleteProduct(id);
    const products = await productManager.getProducts();
    io.emit("listUpdated", { products });
  });

  const messages = await MessageModel.find().lean();
  socket.emit("chatMessages", { messages });

  socket.on("newMessage", async (messageInfo) => {
    await MessageModel.create(messageInfo);
    const messages = await MessageModel.find().lean();
    io.emit("chatMessages", { messages });
  });
});

app.use('/api/sessions',sessionRouter)
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);
