# Lost and Found System

Lost and Found System is a web application designed to help users report lost or found items and facilitate the search for them.

## Features

- User authentication: Users can create an account, log in, and log out securely.
- Report Lost Item: Users can report lost items by providing details such as item name, category, description, and contact information.
- Report Found Item: Users can report found items by providing similar details as reporting lost items.
- Search Items: Users can search for lost or found items based on category and item name.
- CSRF Protection: Implemented Cross-Site Request Forgery (CSRF) protection to prevent unauthorized access.
- Rate Limiting: Implemented rate limiting to prevent abuse or DoS attacks.
- Content Security Policy: Implemented Content Security Policy (CSP) to mitigate XSS attacks.
- File Upload: Implemented file upload functionality for users to upload images of lost or found items.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- bcrypt
- express-session
- multer
- helmet
- crypto
- CORS
- dotenv

## Getting Started

1. Clone the repository.`git clone https://github.com/your-username/your-repo.git`
2. Install dependencies: `npm install`.
3. Set up environment variables by creating a `.env` file and providing values for `MONGODB_URI`, `SESSION_SECRET`, and `PORT`.
4. Start the server: `npm start`.
5. Access the application in your browser at `http://localhost:PORT`.

## Usage

1. Register an account or log in if you already have one.
2. Report a lost or found item by filling out the respective form.
3. Search for lost or found items by selecting the category and item name.
4. Log out when finished.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Create a new Pull Request.

