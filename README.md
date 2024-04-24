# Lost and Found System

Lost and Found System is a web application designed to help IIITA students report lost or found items and facilitate the search for them.

## Features

- User authentication: Students can log in and log out securely.
- Report Lost Item: Students can report lost items by providing details such as item name, category, description, and contact information.
- Report Found Item: Students can report found items by providing similar details as reporting lost items.
- Search Items: Students can search for lost or found items based on category and item name.
- CSRF Protection: Implemented Cross-Site Request Forgery (CSRF) protection to prevent unauthorized access.
- Rate Limiting: Implemented rate limiting to prevent abuse or DoS attacks.
- Content Security Policy: Implemented Content Security Policy (CSP) to mitigate XSS attacks.
- File Upload: Implemented file upload functionality for Students to upload images of lost or found items.

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

1. Clone the repository.`git clone https://github.com/rohitkumarpadda/WebD-Project`
2. Install dependencies: `npm install`.
3. Set up environment variables by creating a `.env` file and providing values for `MONGODB_URI`, `SESSION_SECRET`, and `PORT`.
4. Start the server: `npm start`.
5. Access the application in your browser at `http://localhost:PORT`.

## Usage

1. Log in using your LDAP credentials
2. Report a lost or found item by filling out the respective form.
3. Once an item is reported missing, the website searches and displays similar items from the found database. For found items, it searches the lost database and displays results.
4. Log out when finished.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Create a new Pull Request.
