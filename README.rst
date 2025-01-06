Wovver Core
===========

Wovver Core is the main backend for the Wovver social media platform. It is built using Node.js, Express, and Sequelize, and it provides APIs for user authentication, post creation, and more.

Table of Contents
=================

- `Installation <#installation>`_
- `Usage <#usage>`_
- `Environment Variables <#environment-variables>`_
- `API Endpoints <#api-endpoints>`_
- `Project Structure <#project-structure>`_
- `Contributing <#contributing>`_
- `License <#license>`_

Installation
============

1. Clone the repository::

   git clone https://github.com/Wovver/wovver-core.git
   cd wovver-core

2. Install dependencies::

   npm install

3. Create a `.env` file in the root directory and add the necessary environment variables (see `Environment Variables <#environment-variables>`_).

Usage
=====

Development
-----------

To start the development server with hot reloading::

   npm run dev

Production
----------

To build and start the production server::

   npm run build
   npm start

Environment Variables
=====================

Create a `.env` file in the root directory and add the following environment variables::

   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret

API Endpoints
=============

Authentication
--------------

- **POST /auth/signup**
  - Registers a new user.
  - Request body::

    {
      "username": "string",
      "email": "string",
      "password": "string"
    }

- **POST /auth/login**
  - Logs in a user.
  - Request body::

    {
      "email": "string",
      "username": "string",
      "password": "string"
    }

Posts
-----

- **POST /posts/create**
  - Creates a new post.
  - Requires authentication.
  - Request body::

    {
      "content": "string"
    }

Project Structure
=================

::

   wovver-core/
   ├── dist/                   # Compiled output
   ├── migrations/             # Database migrations
   ├── node_modules/           # Node.js modules
   ├── src/                    # Source files
   │   ├── config/             # Configuration files
   │   │   └── database.ts     # Database configuration
   │   ├── middleware/         # Express middleware
   │   │   └── authMiddleware.ts # JWT authentication middleware
   │   ├── models/             # Sequelize models
   │   │   ├── post.ts         # Post model
   │   │   └── user.ts         # User model
   │   ├── public/             # Public assets
   │   ├── routes/             # API routes
   │   │   └── v1/             # Version 1 routes
   │   │       ├── auth.ts     # Authentication routes
   │   │       └── post.ts     # Post routes
   │   ├── utils/              # Utility functions
   │   │   └── logger.ts       # Logger utility
   │   └── index.ts            # Entry point
   ├── .env                    # Environment variables
   ├── .gitignore              # Git ignore file
   ├── nodemon.json            # Nodemon configuration
   ├── package.json            # NPM package file
   ├── package-lock.json       # NPM lock file
   ├── tsconfig.json           # TypeScript configuration
   └── todo.md                 # Project TODO list

Contributing
============

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

License
=======

This project is licensed under the ISC License. See the `LICENSE <LICENSE>`_ file for details.