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
const helmet = require("helmet");
const crypto = require("crypto");
const cors = require("cors");

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI);
app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, httpOnly: true, maxAge: 1000 * 60 * 30 },
  })
);

//Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());

function generateCSRFToken() {
  console.log("generate csrf token");
  return crypto.randomBytes(32).toString("hex");
}

app.use((req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCSRFToken();
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
});

function csrfProtection(req, res, next) {
  const csrfToken = req.session.csrfToken;
  const submittedToken =
    req.body._csrf || req.query._csrf || req.headers["x-csrf-token"];
  if (!submittedToken || submittedToken !== csrfToken) {
    return res.status(403).send(
      `
        <script>
          alert('Session Expired, Reload the page again'); 
          window.location.href = '/logout';
        </script>
      `
    );
  }

  next();
}

app.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: req.session.csrfToken });
  console.log("csrf token route");
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", "https://ka-f.fontawesome.com/releases/"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://kit.fontawesome.com/",
          "https://ka-f.fontawesome.com/",
        ],
      },
    },
  })
);

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(rateLimiter);

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const isLoggedIn = (req, res, next) => {
  if (req.session.loggedInUser) {
    next();
  } else {
    res.redirect("/login");
  }
};

// Server
app.listen(process.env.PORT, () => {
  console.log(`Server is up and running`);
});


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

app.get("/viewreports", isLoggedIn, (req, res) => {
  console.log("view report route");
  res.sendFile(path.join(__dirname, "pages/viewReports.html"));
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
  console.log("logout route");
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/login");
    }
    res.clearCookie("sid");
    res.redirect("/");
  });
});

// Login logic
app.post("/login", csrfProtection, async (req, res) => {
  console.log("login logic route");
  const { email, password } = req.body;
  try {
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
  csrfProtection,
  async (req, res) => {
    try {
      const { Name, ContactNo, category, Item, DateFound, Description } =
        req.body;
      let imageUrl = "";
      if (req.file) imageUrl = req.file.path.replace(/\\/g, "/");

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
  csrfProtection,
  async (req, res) => {
    console.log(req.body);
    try {
      const { Name, ContactNo, category, Item, DateLost, Description } =
        req.body;
      let imageUrl = "";
      if (req.file) imageUrl = req.file.path.replace(/\\/g, "/");

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


// Viewing reports
app.get("/viewreportsresults", isLoggedIn, async (req, res) => {
  try {
    const userEmail = req.session.loggedInUser.email;
    const lostItems = await LostItem.find({ userEmail: userEmail });
    const foundItems = await FoundItem.find({ userEmail: userEmail });

    res.json({ lostItems, foundItems });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
