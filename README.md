# SPICE

# Full Stack Node.js & Angular Project

This project consists of a **Node.js backend** and an **Angular frontend**. Follow the steps below to initialize the project and continue development on a new machine.

## Prerequisites

- **Node.js**: [Download and install Node.js](https://nodejs.org/).
- **Angular CLI**: If not installed globally, run `npm install -g @angular/cli`.

## Initial Setup

1. **Clone the repository:**

    ```bash
    git clone https://github.com/ZarvaanBacha/SPICE.git
    cd my-app
    ```

2. **Install backend dependencies:**

    ```bash
    cd server
    npm install
    ```

3. **Install frontend dependencies:**

    ```bash
    cd ../frontend
    npm install
    ```

## Development

1. **Start the Node.js backend:**

    ```bash
    cd ../server
    npm start
    ```

2. **Run the Angular frontend:**

    ```bash
    cd ../frontend
    ng serve
    ```

- The Node.js server will run on `http://localhost:3000`.
- The Angular development server will run on `http://localhost:4200`.

## Build Angular for Production

If needed, build the Angular app for production:

```bash
cd frontend
ng build --configuration=production
