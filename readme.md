# GUILD API - Backend Application

This repository contains the source code for the backend part of a MERN (MongoDB, Express, React, Node.js) application. The application serves as a REST API implementing user authentication with refresh and access tokens, as well as management of blogs, posts, and comments.

## Technologies

The backend application is built using the following technologies and dependencies:

### Core Dependencies

- **Node.js**: The core runtime environment for the application.
- **Express**: The web framework used for creating the server.
- **MongoDB**: A NoSQL database used for storing application data.
- **Mongoose**: A library for interacting with MongoDB from Node.js.
- **jsonwebtoken**: Used for creating and verifying JSON Web Tokens (JWT) for authentication.
- **bcrypt**: Used for hashing user passwords.
- **cors**: Middleware for handling Cross-Origin Resource Sharing (CORS) in HTTP requests.
- **dotenv**: Used for managing environment variables.

### Additional Dependencies

- **Express Validator**: A library for server-side data validation.
- **Nodemailer**: Used for sending email notifications (e.g., email confirmation).
- **uuid**: Used for generating unique identifiers.
- **date-fns**: Used for working with dates and times.

### Development Dependencies

- **Jest**: A testing framework for JavaScript code.
- **Supertest**: A library for testing HTTP requests and responses.
- **Nodemon**: Used for automatically reloading the server during development.
- **TypeScript**: A statically typed programming language for developing Node.js applications.
- **ts-node**: Adds TypeScript support to Node.js.
- **ts-jest**: Integrates TypeScript with Jest.
- **@types/***: TypeScript type definitions for external libraries.

## Installation and Running

1. Clone the repository to your local machine:

   ```shell
   git clone https://github.com/SergeyYurch/Guild-API-MERN.git
   ```

2. Change to the project directory:

   ```shell
   cd Gulid_API_MERN
   ```

3. Install dependencies:

   ```shell
   npm install
   ```

4. Create a `.env` file in the project's root directory and configure environment variables, such as:

    ```
    PORT=3000
    MONGO_URI=your-mongodb-connection-uri
    DB_NAME=your-mongodb-name
    JWT_SECRET=your-secret
    JWT_ACCESS_SECRET=your-secret
    JWT_REFRESH_SECRET=your-secret
    HASH_SALT_BASE=your-salt
    SMTP_USER=your-mail
    SMTP_PASS=your-mail-password
   ...

   # Additional environment variables
   ```

5. Start the server in development mode:

   ```shell
   npm run dev
   ```

   This will start the server using `nodemon`, which will automatically reload the server when code changes are detected.

## Project Development

This repository provides a foundation for building the backend part of your MERN application. You can extend its functionality, add new routes, models, and middleware as needed for your specific requirements.

## Testing

You can use Jest and Supertest to write and run tests against your server. Test examples can be found in the `tests` directory. To run tests, execute:

```shell
npm test
```

## License

This project is licensed under the terms of the MIT License. For additional information, please refer to the [LICENSE](LICENSE) file.

## Author

Author: Sergey Yurchenko
Contact: sergey.yurchenko.art@gmail.com

If you have any questions or suggestions, feel free to reach out. Happy coding!