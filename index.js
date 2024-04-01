require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const LoginData = require("./models/loginData");
const bcrypt = require("bcrypt");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const FoundItem = require("./models/foundItem");
const LostItem = require("./models/lostItem");
// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    //add cookie:{secure: true}, in production
  })
);

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(rateLimiter);

app.use(express.static("./public"));

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

const isLoggedIn = (req, res, next) => {
  if (req.session.loggedInUser) {
    next();
  } else {
    res.redirect("/login");
  }
};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages/index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "pages/final login page.html"));
});

app.get("/afterlogin", isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, "pages/AfterLoginPage1.html"));
});

app.get("/reportLost", isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, "pages/LostReportPage.html"));
});

app.get("/reportFound", isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, "pages/RegisterPage.html"));
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/login");
    }
    res.clearCookie("sid");
    res.redirect("/");
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!isValidEmail(email)) {
      return res.status(400).send("Invalid email format");
    }

    const user = await LoginData.findOne({ email: { $eq: email } });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res
        .status(401)
        .send(
          "<script>alert('Invalid email or password. Please try again.'); window.location.href = '/login';</script>"
        );
    }

    req.session.loggedInUser = user;
    res.redirect("/afterlogin");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

function isValidEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

app.use(express.json());

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
}); // 5MB limit

// Route to handle form submission and file upload
app.post(
  "/reportFound",
  isLoggedIn,
  upload.single("Image"),
  async (req, res) => {
    try {
      const { Name, ContactNo, category, Item, DateFound, Description } =
        req.body;
      const imageUrl = req.file.path; // Assuming the image is stored in the 'uploads' directory

      const foundItem = new FoundItem({
        name: Name,
        contactNo: ContactNo,
        category: category,
        item: Item,
        dateFound: DateFound,
        description: Description,
        image: imageUrl,
        userEmail: req.session.loggedInUser.email,
      });

      await foundItem.save();
      res.status(201).send("Item reported successfully");
    } catch (error) {
      console.log(error);
      res.status(500).send("Error reporting item");
    }
  }
);

app.post(
  "/reportLost",
  isLoggedIn,
  upload.single("Image"),
  async (req, res) => {
    try {
      const { Name, ContactNo, category, Item, DateLost, Description } =
        req.body;
      const imageUrl = req.file.path;

      const lostItem = new LostItem({
        name: Name,
        contactNo: ContactNo,
        category: category,
        item: Item,
        dateLost: DateLost,
        description: Description,
        image: imageUrl,
      });

      await lostItem.save();
      res.status(201).send("Item reported as lost successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error reporting lost item");
    }
  }
);
