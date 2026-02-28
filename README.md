# Anni Store

This repository contains the source code for Anni Store, a web-based e-commerce platform including admin dashboard, bot integration, backend services, and storefront.

## Project Structure

- `anni-admin/website-admin/` - Administration panel with HTML, CSS, and JS for managing the store.
- `anni-bot-widget/` - Rasa-based chatbot integration files and configuration.
- `anni-db-backend/` - Node.js backend for handling authentication, product management, and database interactions.
- `AnniStore/` - Frontend storefront assets, pages, and scripts for the customer-facing site.

## Getting Started

### Prerequisites & Dependencies

- **Node.js** (version 14+ recommended) for backend services.
- **MongoDB** (local or remote) for database storage.
- **Rasa Open Source** (2.x or newer) for the chatbot widget.
- Any static web server (e.g. `http-server`, nginx) for serving frontend files.

Before running any part of the project, make sure the above software is installed and available in your `PATH`.

### 1. Admin Dashboard

1. Navigate to `anni-admin/website-admin/login/index.html` in a browser to open the login screen.
2. After logging in (credentials are managed via the backend), the dashboard UI files under `anni-admin/website-admin/admin/` provide the user interface.
3. **Development commands** (run from workspace root):
   ```powershell
   # serve admin panel on localhost if using simple HTTP server
   npx http-server anni-admin/website-admin -p 8081
   ```

### 2. Bot Widget

1. Enter the `anni-bot-widget/` directory:
   ```powershell
   cd anni-bot-widget
   ```
2. Install required Python packages (use a virtual environment):
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1   # Windows PowerShell
   pip install rasa
   ```
3. Train the assistant model using the provided data:
   ```powershell
   rasa train
   ```
4. Start the Rasa action server and the bot:
   ```powershell
   rasa run actions
   rasa run --enable-api
   ```
5. Widget integration is handled by including `anni-bot.js` and `anni-bot.css` on the store frontend pages.

### 3. Backend (anni-db-backend)

1. From the root or navigate to backend folder:
   ```powershell
   cd anni-db-backend
   npm install              # installs dependencies from package.json
   ```
2. Environment configuration
   - Copy `.env.example` to `.env` and set `MONGO_URI`, `PORT`, `JWT_SECRET`, etc.
3. Run the server:
   ```powershell
   node app.js              # or npm start if configured
   ```
   Alternatively use a process manager:
   ```powershell
   npx nodemon app.js        # for auto-restarts in development
   ```
4. API endpoints are documented in the `routes/` folder. Common commands include:
   - `POST /auth/login` – authenticate admin users
   - `GET /products` – list products
   - `POST /products` – add a product (requires authentication)

### 4. Frontend Store (AnniStore)

1. Serve files from `AnniStore/` via any static server:
   ```powershell
   npx http-server AnniStore -p 8080
   ```
2. The main entry point is `AnniStore/pages/index.html`. Adjust API base URLs in `js/api.js` if backend is running on another host/port.
3. Interaction with bot widget is included in the HTML; ensure the Rasa server is running and accessible.

### Running & Activating Everything

1. Start MongoDB service.
2. Launch the backend (`node app.js`).
3. Serve admin and store frontends as described.
4. Activate the bot by training and running Rasa; verify `http://localhost:5005` (default) returns Rasa API responses.

## Commands Summary

| Component        | Directory                   | Key Commands                          |
|------------------|-----------------------------|---------------------------------------|
| Admin Dashboard  | `anni-admin/website-admin`  | `npx http-server`                     |
| Bot Widget       | `anni-bot-widget/`          | `rasa train`, `rasa run`, `rasa run actions` |
| Backend          | `anni-db-backend/`          | `npm install`, `node app.js`          |
| Frontend Store   | `AnniStore/`                | `npx http-server`                     |

## Core Functions & Features

This section highlights the functions and logic implemented across the project.

## Recent Git Activity

The following are the last three commits pushed to `main`:

1. **82518ac** – added `services/permission.middleware.js` (permission middleware implementation).
2. **31b9b83** – refactor admin authentication system and implement unified session management.
3. **17e6221** – initial import of Anni storefront, admin panel, chatbot, and database backend.



### Backend Services (anni-db-backend)

#### Authentication (`services/auth.service.js`)
- **register(data)** – creates a new admin account with bcrypt-hashed password.
- **login(email, password)** – accepts credentials for admins or employees, verifies hashes, returns a JWT containing user id, role and type.
- **requestOTP(email)** – generates a 6‑digit OTP for unregistered employees, hashes it, stores expiration, and returns it for emailing.
- **verifyOTP(email, otp, password)** – validates the OTP, activates the employee account, stores a hashed password.

> 🔐 **Authentication System Features**
> 
> - HR-controlled employee onboarding workflow
> - OTP email verification before account activation
> - Hashed OTP storage with expiration timer
> - JWT‑based stateless authentication
> - Role-based access control (RBAC) enforced via middleware
> - Session expiry handling built into tokens
> - Supports inactivity auto-logout via front-end checks

Error handling is implemented via thrown `Error` objects, and routes wrap calls inside `try/catch` blocks.

#### Reading the source files

To inspect or modify the authentication logic yourself, open:

```text
anni-db-backend/services/auth.service.js
anni-db-backend/services/auth.middleware.js
anni-db-backend/services/role.middleware.js
```
#### Role / Auth Middleware
- **auth.middleware.js** – extracts JWT from `Authorization` header, verifies it, and attaches decoded payload to `req.admin`.
- **role.middleware.js(allowedRoles)** – guards routes by verifying that the authenticated user’s role is in the allowed list.

#### Product Service (`services/product.service.js`)
Contains CRUD and helper functions:
- **buildFilter(options)** – constructs MongoDB query filters for category, price range, and text search.
- **createProduct(data)**, **getAllProducts(options)**, **getProductById(id)**, **updateProduct(id, data)**, **deleteProduct(id)** – standard CRUD.
- **getByCategory(category, options)** – products sorted by rating.
- **searchProducts(keyword, options)** – text search with sorting.
- **getTopProducts(params)** – returns top-rated products optionally within a category/price range.
- **getBestProduct(params)** – selects the single highest-rated product under a budget.
- **compareProducts(names)** – finds products whose titles match any of the provided names.

#### Database Utilities
- **config/db.js** – `connectMongo()` asynchronously connects to MongoDB using `mongoose`.
- **utils/sendEmail.js** – wrapper around `nodemailer` configured for Gmail, used for sending OTPs and notifications.

#### Routes Overview
- **auth.routes.js** – endpoints for registration, login, OTP request/verification; uses services and email utility.
- **product.routes.js** – public endpoints for listing, searching, filtering, and fetching products; protected endpoints for admins to create/update/delete with image upload support using `multer`.

### Frontend Helpers (AnniStore/js/api.js)
This script centralizes communications with the backend API and provides utility functions:

- **apiStart(), apiEnd(), apiError()** – hooks that call loader functions defined in UI (e.g. show/hide spinner, display network errors).
- **normalizeProduct(p)** – maps database product objects to a consistent client structure.
- **getProducts()** – fetches all products once and caches them in `PRODUCT_CACHE` to minimize network calls.
- **getCategories()** – derived from cached products, returns unique categories.
- **getProduct(id)** – retrieves a single product from cache.
- **searchProducts(q)** – performs a search request to the backend, normalizes results.
- **getTopProducts(category, limit)** – fetches top-rated products via API.
- **clearProductCache()** – resets the cache (called immediately on file load to ensure fresh state).

### Other Notable Functions
- `anni-admin/website-admin/js/*` contains UI logic such as `auth.js`, `router.js`, etc. (see source files for specifics).
- The chatbot widget file `anni-bot.js` likely registers UI event listeners and communicates with the Rasa server.

Each function is written with clarity and simple error handling; the README above now gives a developer a good overview of what each part does.  Feel free to expand this section as new features are added.
## Contributing

...
## Contributing

Feel free to fork the repository and submit pull requests for improvements.

## License

Specify the project license here (e.g. MIT License).
