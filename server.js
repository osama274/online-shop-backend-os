import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import UserModel from "./models/UserModel.js";
import CheckoutModel from "./models/checkoutModel.js";

import bcrypt from "bcrypt";
import * as PlantsController from "./controllers/plantsController.js";
import * as reviewsController from "./controllers/reviewsController.js";
import * as usersController from "./controllers/usersController.js";
import RatingModel from "./models/ratingModel.js";
dotenv.config();

mongoose.connect(process.env.MONGOURI);
// mongoose.connect("mongodb://localhost:27017/mernshowcase");

const app = express();
//  5000localhost
const PORT = process.env.PORT || 5000;

app.use(express.json());

//LOGIN

const userIsInGroup = (user, accessGroup) => {
  const accessGroupArray = user.accessGroups.split(",").map((m) => m.trim());
  return accessGroupArray.includes(accessGroup);
};

app.set("trust proxy", 1); // allow / trust Heroku proxy to forward secure cookies
app.use(
  cors({
    origin:
      process.env.NODE_ENV !== "production"
        ? process.env.ORIGIN_URL
        : process.env.ORIGIN_URL_HTTPS,
    credentials: true, // accept incoming cookies
  })
);

// Configure SESSION COOKIES (=> this will create a cookie in the browser once we set some data into req.session)
app.use(
  session({
    name: "sessId",
    secret: process.env.SESSION_SECRET,
    // store: MongoStore.create({ mongoUrl: process.env.MONGOURI }),
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true, // httpOnly => cookie can just be written from API and not by Javascript
      maxAge: 60 * 1000 * 30, // 30 minutes of inactivity
      // sameSite: "••••••none", // allow cookies transfered from OTHER origin
      // secure: true, // allow cookies to be set just via HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    },
  })
);

app.use(cookieParser());

app.get("/", async (req, res) => {
  res.json("Online Shop");
});

app.post("/login", async (req, res) => {
  const login = req.body.login;
  const password = req.body.password;

  let user = await UserModel.findOne({ login });
  console.log(user);
  if (!user) {
    user = await UserModel.findOne({ login: "anonymousUser" });
  } else {
    bcrypt.compare(password, user.hash).then((passwordIsOk) => {
      if (passwordIsOk) {
        req.session.user = user;
        req.session.save();

        res.json(user);
      } else {
        res.sendStatus(403);
      }
    });
  }
});

app.get("/currentuser", async (req, res) => {
  let user = req.session.user;

  console.log({ user });
  if (!user) {
    user = await UserModel.findOne({ login: "anonymousUser" });
  }
  res.json(user);
});

app.get("/users", async (req, res) => {
  const users = await usersController.getAllUsers();
  res.json(users);
});

app.get("/logout", async (req, res) => {
  req.session.destroy();
  const user = await UserModel.findOne({ login: "anonymousUser" });
  res.json(user);
});

app.delete("/deleteuser", async (req, res) => {
  const _id = req.body._id;
  const user = await UserModel.findByIdAndDelete({
    _id: new mongoose.Types.ObjectId(_id),
  });
  res.json({ user });
});

app.post("/signup", async (req, res) => {
  const user = req.body.user;

  if (
    user.login.trim() === "" ||
    user.password1.trim() === "" ||
    user.password1 !== user.password2
  ) {
    res.status(403);
  } else {
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    console.log(salt);
    console.log(bcrypt.genSalt(Number(process.env.SALT)));
    const hash = await bcrypt.hash(user.password1, salt);
    console.log(hash);

    const _user = {
      firstName: user.firstName,
      lastName: user.lastName,
      login: user.login,
      email: user.email,
      photo: user.photo,
      hash,
      accessGroups: "loggedInUsers, members",
    };
    const dbuser = await UserModel.create(_user);
    req.session.user = _user;
    req.session.save();
    res.json({
      userAdded: dbuser,
    });
  }
});

app.post("/checkout", async (req, res) => {
  const order = req.body.order;
  if (
    order.firstName.trim() === "" ||
    order.lastName.trim() === "" ||
    order.address.trim() === "" ||
    order.email.trim() === "" ||
    order.phone.trim() === "" ||
    order.city.trim() === "" ||
    order.zipcode.trim() === "" ||
    order.state.trim() === ""
  ) {
    res.status(403);
  } else {
    const _order = {
      firstName: order.firstName,
      lastName: order.lastName,
      address: order.address,
      email: order.email,
      phone: order.phone,
      city: order.city,
      zipcode: order.zipcode,
      state: order.state,
      items: order.items,
    };
    const dbOrder = await CheckoutModel.create(_order);
    req.session.order = _order;
    req.session.save();
    res.json({
      orderAdded: dbOrder,
    });
  }
});

// approveuser
app.post("/approveuser", async (req, res) => {
  console.log(req.body);
  const id = req.body.id;
  let user = req.session.user;
  console.log(user);
  if (!user) {
    res.sendStatus(403);
  } else {
    if (!userIsInGroup(user, "admins")) {
      res.sendStatus(403);
    } else {
      const updateResult = await UserModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) },
        { $set: { accessGroups: "loggedInUsers,members" } },
        { new: true }
      );
      res.json({ result: updateResult });
    }
  }
});

// show all approved users
app.get("/approveuser", async (req, res) => {
  const users = await UserModel.find({
    accessGroups: { $regex: "members", $options: "i" },
  });
  res.json({
    users,
  });
});

// notyetapprovedusers
app.get("/notyetapprovedusers", async (req, res) => {
  const users = await UserModel.find({
    accessGroups: { $regex: "notYetApprovedUsers", $options: "i" },
  });
  res.json({
    users,
  });
});

// Articels

// app.use(
//   cors({
//     origin: process.env.ORIGIN_URL || "http://localhost:3000",
//     credentials: true, // accept incoming cookies
//   })
// );

app.get("/stars", async (req, res) => {
  const rating = await RatingModel.find();
  res.json(rating);
});

app.post("/stars", async (req, res) => {
  const rating = req.body.ratingData;

  const _rating = {
    plantName: rating.plantName,
    plantId: rating.plantId,
    star: rating.star,
    customer: rating.customer,
    message: rating.message,
  };
  const dbRating = await RatingModel.create(_rating);
  req.session.rating = _rating;
  req.session.save();
  res.json({
    ratingAdded: dbRating,
  });
});

app.get("/plants", async (req, res) => {
  const plants = await PlantsController.getAllPlants();
  res.json(plants);
});

// nested users: DELETE
app.delete("/deleteProduct/:id", async (req, res) => {
  const id = req.params.id;
  const result = await PlantsController.deleteProduct(id);
  res.json({
    result,
  });
});

// UPDATE code
// nested users: UPDATE

app.patch("/editproduct/:id", async (req, res) => {
  const id = req.params.id;
  const price = req.body.price;
  const result = await PlantsController.updateProduct(id, { $set: { price } });
  res.json({
    result,
  });
});

app.get("/reviews", async (req, res) => {
  const reviews = await reviewsController.getAllReviews();
  res.json(reviews);
});

app.listen(PORT, () => {
  console.log(`app listing on port http://localhost:${PORT}`);
});
