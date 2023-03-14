require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const encrypt = require("mongoose-encryption");
const md5 = require("md5");
const bcrypt = require("bcrypt");
const passport = require("passport");
const passportLocal = require("passport-local");
const session = require("express-session");

const saltCount = 10;
const LocalStrategy = passportLocal.Strategy;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose
  .connect("mongodb://0.0.0.0:27017/userDB")
  .then(() => console.log("connected to database"))
  .catch((err) => console.error(err));

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: ["true", "Username is required"],
  },
  password: {
    type: String,
    required: ["true", "Password is required"],
  },
});

// userSchema.plugin(encrypt, {
//   secret: process.env.SECRET,
//   encryptedFields: ["password"],
// });

const User = mongoose.model("user", userSchema);

passport.use(
  new LocalStrategy((username, password, done) => {
    try {
      User.findOne({ username }).then((user) => {
        if (!user) {
          return done(null, false, { message: "Incorrect Username" });
        }
        bcrypt.compare(password, user.password, function (err, result) {
          if (err) {
            return done(err);
          }
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Incorrect Password" });
          }
        });
      });
    } catch (err) {
      return done(err);
    }
  })
);

//serialize user
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
//deserialize user
passport.deserializeUser(function (id, done) {
  try {
    User.findById(id).then((user) => {
      done(null, user);
    });
  } catch (err) {
    done(err);
  }
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
});

app.post("/register", (req, res) => {
  bcrypt.hash(req.body.password, 10, function (err, hash) {
    //10 is SaltRounds
    if (err) {
      console.log(err);
    }
    const user = new User({
      username: req.body.username,
      password: hash,
    });
    user.save();
    passport.authenticate("local")(req, res, () => {
      res.redirect("/secrets");
    });
  });

  //OTHERS
  // bcrypt.hash(req.body.password, saltCount, (err, hash) => {
  //   const newUser = new User({
  //     username: req.body.username,
  //     // password: md5(req.body.password),
  //     password: hash,
  //   });
  // newUser
  //   .save()
  //   .then(() => {
  //     res.redirect("/secrets");
  //   })
  //   .catch((err) => console.log(err));
  // });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/secrets",
    failureRedirect: "/login",
  })
);

// app.post("/login", (req, res) => {
//   const username = req.body.username;
//   // const password = md5(req.body.password);
//   const password = req.body.password;
//   const user = new User({
//     username: username,
//     password: password,
//   });

//   //PASSPORT
//   req.login(user, function (err) {
//     if (err) {
//       console.log(err);
//     }
//     return res.redirect("/secrets");
//   });

//OTHERS
// User.findOne({ username })
//   .then((data) => {
// bcrypt.compare(password, data.password, (err, result) => {
//   if (result === true) {
//     res.render("secrets");
//   }
// });
// })
// .catch((err) => console.log(err));
// });

app.listen(3000, () => {
  console.log("Server Running on Port 3000");
});
