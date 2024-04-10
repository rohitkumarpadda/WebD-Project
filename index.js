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

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

// Routes
app.get("/", (req, res) => {
  console.log("index page route");
  res.sendFile(path.join(__dirname, "pages/index.html"));
});

app.get("/login", (req, res) => {
  console.log("login route");
  res.sendFile(path.join(__dirname, "pages/final login page.html"));
});

app.get("/afterlogin", isLoggedIn, (req, res) => {
  console.log("after login route");
  res.sendFile(path.join(__dirname, "pages/AfterLoginPage1.html"));
});

app.get("/reportLost", isLoggedIn, (req, res) => {
  console.log("lost form route");
  res.sendFile(path.join(__dirname, "pages/LostReportPage.html"));
});

app.get("/reportFound", isLoggedIn, (req, res) => {
  console.log("found form route");
  res.sendFile(path.join(__dirname, "pages/RegisterPage.html"));
});

app.get("/results", isLoggedIn, (req, res) => {
  console.log("results route");
  res.sendFile(path.join(__dirname, "pages/results.html"));
});

app.get("/logout", (req, res) => {
  console.log("logoout route");
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/login");
    }
    res.clearCookie("sid");
    res.redirect("/");
  });
});

// Login logic
app.post("/login", async (req, res) => {
  console.log("login logic route");
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

// Middleware to validate email format
function isValidEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

app.use(express.json());

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Handling reportFound form submission
app.post(
  "/reportFound",
  isLoggedIn,
  upload.single("Image"),
  async (req, res) => {
    try {
      const { Name, ContactNo, category, Item, DateFound, Description } =
        req.body;
      const imageUrl = req.file.path.replace(/\\/g, "/"); // Replace backslashes with forward slashes

      const foundItem = new FoundItem({
        name: Name,
        contactNo: ContactNo,
        category: category.toLowerCase(),
        item: Item.toLowerCase(),
        date: DateFound,
        description: Description,
        image: imageUrl,
        userEmail: req.session.loggedInUser.email,
      });

      await foundItem.save();

      res.redirect(`/results?category=${category}&item=${Item}&type=found`);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(
          "<script>alert('Error reporting item. Please try again.'); window.location.href = '/reportFound';</script>"
        );
    }
  }
);

// Handling reportLost form submission
app.post(
  "/reportLost",
  isLoggedIn,
  upload.single("Image"),
  async (req, res) => {
    try {
      const { Name, ContactNo, category, Item, DateLost, Description } =
        req.body;
      const imageUrl = req.file.path.replace(/\\/g, "/"); // Replace backslashes with forward slashes

      const lostItem = new LostItem({
        name: Name,
        contactNo: ContactNo,
        category: category.toLowerCase(),
        item: Item.toLowerCase(),
        date: DateLost,
        description: Description,
        image: imageUrl,
        userEmail: req.session.loggedInUser.email,
      });

      await lostItem.save();

      res.redirect(`/results?category=${category}&item=${Item}&type=lost`);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send(
          "<script>alert('Error reporting item. Please try again.'); window.location.href = '/reportLost';</script>"
        );
    }
  }
);

// Searching items
app.get("/searchItems", isLoggedIn, async (req, res) => {
  try {
    const { category, item, type } = req.query;
    const query = {};

    if (category && item && type) {
      query.category = { $eq: category };
      query.item = { $eq: item };
    } else {
      return res.status(400).json({
        error: "Missing parameters",
        message: "Please provide category, item, and type parameters",
      });
    }

    let searchItems;
    if (type === "found") {
      searchItems = await LostItem.find(query);
    } else if (type === "lost") {
      searchItems = await FoundItem.find(query);
    } else {
      return res.status(400).json({
        error: "Invalid type parameter",
        message: "Type parameter must be 'found' or 'lost'",
      });
    }

    res.json(searchItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
