# Blog API

This is the backend for mine personal website with the blog, but the API can be used in other projects. It allows new users to be added with permissions to perform particular actions.

# Installation & Setup

## Pre-requisites

- Node.js v18
- PostgerSQL (or any SQL database that is supported by Prisma)

## Setting up the Backend

1. Clone the repository.
2. Create `.env` file in the root directory setting up variables from `.env.example`.
3. Run `npm run setup` to install dependencies, build project and create user with admin permissions.
4. Run `npm run start:dev` to start the project in development mode.

This work is licensed under a <a href"https://www.gnu.org/licenses/gpl-3.0.en.html">GNU General Public License</a> license. See LICENSE.md.
