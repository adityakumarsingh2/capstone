# Fitkart – Complete Backend Migration, E-commerce System & Admin Dashboard

Act as a senior full-stack engineer and software architect. Your task is to completely migrate and upgrade the existing Fitkart application from Supabase to a custom Express.js + MongoDB backend, while implementing a fully functional e-commerce system with comprehensive admin management, inventory control, order tracking, and customer reviews.

**IMPORTANT: Implement EVERYTHING described in this prompt in one complete implementation. Do not divide the work into phases, leave features for later, or provide only a proposed implementation plan.**

Before making changes, thoroughly inspect the existing project, understand its architecture, frontend components, existing functionality, database structure, integrations, and user flows. Make implementation decisions independently based on the existing codebase.

## 1. Core Requirements and Development Principles

- Preserve the existing Fitkart branding, UI design, styling, responsiveness, and overall user experience.
- Do not unnecessarily redesign existing pages or remove existing functionality.
- Reuse existing components and hooks wherever appropriate.
- Maintain consistency across the entire application.
- Implement real, functional features rather than static UI or placeholder buttons.
- Ensure frontend and backend are fully integrated.
- Use proper validation, error handling, loading states, success messages, and empty states.
- Avoid duplicated business logic.
- Follow clean architecture and maintainable coding practices.
- Do not introduce unnecessary dependencies.
- Do not leave TODOs, incomplete features, mock APIs, or unfinished functionality.
- Do not ask me to manually implement missing pieces unless an external credential or service is genuinely required.

## 2. Complete Supabase Migration

Completely remove Supabase as the application's backend.

Replace:
- Supabase PostgreSQL database with MongoDB and Mongoose.
- Supabase Authentication with JWT and bcryptjs.
- Supabase Storage with Multer-based image uploads.
- Supabase Edge Functions with Express REST API endpoints.
- All Supabase database queries with Axios API calls.

Ensure there are absolutely no remaining Supabase imports, dependencies, configurations, API calls, authentication checks, or references required for the application to function.

Use MongoDB Atlas or a local MongoDB instance through an environment-based connection string.

Implement proper database schemas, relationships through Mongoose references, indexes, timestamps, validation, and error handling.

Preserve existing application data structures and functionality wherever possible.

## 3. Authentication and Authorization

Implement complete authentication using JWT and bcryptjs.

Features:
- User registration.
- User login.
- User logout.
- Persistent authentication across page refreshes.
- Get currently authenticated user.
- Update profile information.
- Change password.
- Proper password hashing.
- JWT expiration and validation.
- Protected frontend routes.
- Protected backend endpoints.
- Authentication error handling.

Use the following two roles:

**Customer**
- Browse products.
- Add products to cart.
- Manage wishlist.
- Place orders.
- Track orders.
- Review delivered products.
- Manage profile and addresses.

**Admin**
- Access the admin dashboard.
- Manage products and inventory.
- Manage orders and deliveries.
- Manage customers.
- View reviews.
- Access dashboard analytics.

There should be no public registration option for admin accounts.

Create an initial admin account using a backend seed mechanism.

Initial development credentials:

Email: admin@fitkart.com  
Password: 1234

Hash the password using bcrypt. Read initial credentials from environment variables, never hardcode them in frontend code. Ensure the initial password can be changed after login. Do not overwrite an existing admin account every time the seed script runs.

Implement role-based authorization on the backend. Hiding admin buttons on the frontend is not sufficient security.

Never allow a customer to promote themselves to admin by modifying a request.

## 4. Product Management and Shopping System

Implement a complete product management system.

Customers should be able to:
- Browse all active products.
- View individual product details.
- Search products by name, brand, and description.
- Filter by category, brand, size, color, and price range.
- Sort by price, popularity, newest, and customer ratings.
- Navigate through paginated product listings.
- View product images, descriptions, sizes, colors, pricing, and availability.
- See stock availability.
- See average ratings and customer reviews.

Admins should be able to:
- Add products.
- Edit products.
- Delete products.
- Activate/deactivate products.
- Upload multiple product images.
- Change product name and description.
- Manage categories and brands.
- Set product prices.
- Manage available sizes and colors.
- Update stock quantities.
- Set SKU/product identifiers.
- View product performance and stock levels.

Product images should be uploaded using Multer and served through the backend.

Implement proper image validation, file size restrictions, supported formats, and safe file handling.

Ensure deleted or inactive products cannot be purchased.

## 5. Inventory and Stock Management

Implement proper inventory management integrated with orders.

Requirements:
- Automatically decrease stock when an order is successfully created.
- Prevent customers from ordering more units than available.
- Prevent negative inventory.
- Prevent overselling during simultaneous orders using atomic stock operations or MongoDB transactions where appropriate.
- Restore stock when an eligible order is cancelled.
- Maintain accurate stock counts for each product, including sizes and colors if inventory is variant-specific.
- Display out-of-stock products appropriately.
- Allow admins to update stock manually.
- Display low-stock warnings in the admin dashboard.
- Maintain an inventory movement history for stock additions, deductions, and adjustments.

Stock updates and order creation must be consistent. Avoid situations where an order is created without stock deduction or stock is deducted without a corresponding order.

## 6. Cart and Wishlist

Implement complete cart and wishlist functionality.

Cart:
- Add products with selected sizes and colors.
- Update quantities.
- Remove individual products.
- Clear the cart.
- Calculate subtotal and total.
- Validate stock availability.
- Persist the cart for authenticated customers.
- Maintain accurate cart count in the navbar.
- Handle unavailable or inactive products gracefully.

Wishlist:
- Add products.
- Remove products.
- View saved products.
- Prevent duplicate wishlist entries.
- Move wishlist products to cart where stock is available.

Ensure all operations use the backend APIs and database.

## 7. Checkout and Dummy Payment System

Completely remove Stripe and all payment gateway integrations for now.

Do not install or use Stripe.

Implement a realistic dummy checkout experience.

Checkout workflow:

1. Customer reviews their cart.
2. Customer enters or selects a shipping address.
3. Customer reviews ordered products and quantities.
4. Display complete price breakdown.
5. Customer selects the demo payment option.
6. Customer clicks Place Order.
7. Backend validates product availability and prices.
8. Backend creates the order and updates stock.
9. Cart is cleared after successful order creation.
10. Customer is redirected to a successful order confirmation page.

Payment details:
- Payment method: DEMO.
- Payment status: SIMULATED.
- No actual payment processing.
- No real financial transaction.

Generate a unique order number for every order.

Save product snapshots inside each order, including product name, image, price, size, color, and quantity at the time of purchase.

Future product price changes must not modify historical order information.

Implement proper handling for failed order creation, unavailable stock, duplicate submissions, and interrupted checkout requests.

## 8. Complete Order Management and Tracking

This is a particularly important feature.

Every customer must be able to access their complete order history.

Customer order features:
- View all orders.
- View individual order details.
- View purchased products.
- View shipping address.
- View order amount.
- View payment status.
- View current delivery status.
- Track the order through a visual timeline.
- See timestamps for every tracking update.
- Cancel eligible orders.
- View cancelled and delivered orders.

Implement the following order lifecycle:

1. ORDER_PLACED
2. PROCESSING
3. SHIPPED
4. ARRIVED_NEAR_AREA
5. OUT_FOR_DELIVERY
6. DELIVERED

Also support:
- CANCELLED
- DELIVERY_FAILED
- RETURN_REQUESTED
- RETURNED

Build a complete order tracking timeline that visually communicates the current stage and completed stages.

Every status change must be recorded in a tracking history with:
- Status.
- Description/message.
- Date and time.
- Admin or system user responsible for the update.

Do not simply overwrite the previous order status. Preserve the entire history.

Admin order management:

Admins should be able to:
- View all orders.
- Search by order number.
- Filter by status and date.
- View customer details.
- View ordered products and quantities.
- View shipping information.
- Update order status.
- Add tracking messages.
- View the complete order history.
- Cancel eligible orders.
- Process return requests.
- Update delivery status.

Only authorized admins should be able to update order statuses.

Implement valid status transitions. Prevent impossible transitions such as moving a cancelled order directly to delivered.

When an order is cancelled, restore stock exactly once.

Customers must see tracking updates immediately when they revisit their order page.

## 9. Admin Dashboard – Complete Management Panel

Build a professional, responsive admin dashboard that matches Fitkart's existing design language.

Provide a separate protected admin area.

Dashboard overview:

Display:
- Total products.
- Total customers.
- Total orders.
- Total delivered orders.
- Pending orders.
- Cancelled orders.
- Total sales/order value.
- Low-stock products.
- Out-of-stock products.
- Recent orders.
- Recent customer registrations.

Provide useful charts and analytics for:
- Orders over time.
- Revenue/order value trends.
- Best-selling products.
- Order status distribution.
- Product category performance.

Clearly distinguish demo order value from actual revenue. Do not label simulated payments as real collected revenue.

### Product Management

Provide a complete interface for:
- Adding products.
- Editing products.
- Deleting products.
- Uploading product images.
- Managing product variants.
- Managing stock.
- Searching and filtering products.
- Viewing product availability.

### Order Management

Provide:
- Orders table.
- Order details page or panel.
- Customer information.
- Ordered product information.
- Status update controls.
- Tracking history.
- Cancellation and return management.

### Inventory Management

Provide:
- Complete stock overview.
- Low-stock alerts.
- Out-of-stock alerts.
- Manual stock adjustments.
- Inventory movement history.
- Product-wise stock information.

### Customer Management

Provide:
- Customer list.
- Search customers.
- View customer profiles.
- View customer order history.
- View account status.
- Block and unblock customers.

Blocked customers must not be able to place new orders or perform restricted authenticated actions.

### Review Management

Admins should be able to:
- View all product reviews.
- View review ratings and comments.
- Remove inappropriate or abusive reviews.
- See verified purchase indicators.

## 10. Product Reviews and Rating System

Implement a complete customer review system.

A customer should only be allowed to review a product when:
- They have purchased that product.
- The corresponding order has been marked DELIVERED.
- They have not already submitted a review for that order and product.

Enforce these conditions on the backend.

Review functionality:
- Submit a star rating from 1 to 5.
- Add a review title.
- Write a review/comment.
- Edit their own review.
- Delete their own review.
- Mark reviews as helpful.
- View all product reviews.
- Sort reviews by newest, oldest, highest rating, and lowest rating.
- Display average product rating.
- Display total number of reviews.
- Display rating distribution.

Show reviews directly on the product detail/shopping page.

Display a Verified Purchase label for eligible reviews.

Customers must never be able to mark their own reviews as verified.

Prevent duplicate reviews for the same order item.

Update product rating aggregates correctly when reviews are created, edited, or deleted.

## 11. User Profile and Address Management

Implement:
- View and edit personal information.
- Update full name.
- Update profile information.
- Manage body measurements.
- Manage style preferences.
- Manage profile image.
- Add shipping addresses.
- Edit addresses.
- Delete addresses.
- Set a default shipping address.
- View order history.

Preserve existing Fitkart profile functionality, including body measurements and style preferences.

## 12. Existing Virtual Try-On Functionality

Inspect the existing virtual try-on functionality carefully.

Do not remove it or break its integration during the migration.

If it uses Supabase Storage or Edge Functions, migrate those dependencies to the new backend or an appropriate replacement.

Preserve try-on sessions, original image references, generated image references, body analysis, and recommended sizing.

Do not replace an existing working AI integration with a static mock implementation.

If an external AI service requires credentials, preserve its integration and document the required environment variables.

## 13. Backend Architecture and API Quality

Build a clean and maintainable Express backend.

Use:
- Express.js.
- MongoDB.
- Mongoose.
- JWT.
- bcryptjs.
- Axios on the frontend.
- Multer.
- dotenv.
- cors.

Separate routing, controllers, business logic, database operations, middleware, and utilities appropriately.

Implement:
- Centralized error handling.
- Request validation.
- Authentication middleware.
- Admin authorization middleware.
- Seller authorization only if an existing feature genuinely requires seller functionality.
- Consistent API response structures.
- Pagination.
- Search and filtering.
- Proper HTTP status codes.
- Database indexes.
- Safe file upload handling.
- Environment-based configuration.

Use MongoDB transactions where necessary for operations involving multiple database writes. If transactions are used, ensure the MongoDB deployment supports them.

Make all important operations secure against unauthorized access, invalid data, duplicate requests, and inconsistent database states.

## 14. Frontend Integration

Refactor all existing React hooks, components, pages, and integrations to communicate with the Express backend through a centralized Axios instance.

Ensure:
- JWT is attached to authenticated API requests.
- Authentication state persists correctly.
- Protected routes work.
- Admin routes are protected.
- API errors are displayed properly.
- Loading indicators work.
- Empty states are handled.
- All forms validate input.
- All buttons perform their intended actions.
- All pages are responsive.

Maintain existing routes where possible and introduce new routes only when necessary.

Do not leave any component dependent on Supabase.

## 15. Environment Configuration and Project Setup

Provide clear environment-based configuration for both frontend and backend.

Backend configuration should include:
- PORT.
- MONGODB_URI.
- JWT_SECRET.
- CLIENT_URL.
- ADMIN_EMAIL.
- ADMIN_PASSWORD.
- Upload configuration where necessary.
- Existing external AI service credentials if applicable.

Frontend configuration should include the backend API URL.

Add appropriate `.gitignore` rules for environment files, uploaded files where appropriate, dependencies, and generated files.

Never commit secrets or credentials.

Provide clear startup instructions for running both frontend and backend.

Ensure the initial admin seeding process is straightforward and safe to execute.

## 16. Testing and Final Verification

Do not consider the task complete merely because the code compiles.

Run the available build, lint, and test commands. Add meaningful automated tests for critical backend business logic and authorization where practical.

Verify the complete application workflow:

**Authentication**
- Register a customer.
- Log in.
- Log out.
- Refresh and verify authentication persistence.
- Verify admin login.
- Verify customers cannot access admin APIs.

**Shopping**
- Browse products.
- Search and filter.
- View product details.
- Add products to cart.
- Update quantities.
- Add/remove wishlist items.

**Checkout**
- Complete dummy checkout.
- Verify order creation.
- Verify stock deduction.
- Verify cart clearing.
- Verify order confirmation.

**Inventory**
- Update product stock as admin.
- Attempt to order unavailable products.
- Verify overselling is prevented.
- Cancel an eligible order and verify stock restoration.

**Order tracking**
- Update order status as admin.
- Verify tracking history.
- Log in as customer and verify tracking timeline.
- Verify invalid status transitions are rejected.

**Reviews**
- Attempt to review an undelivered order and verify rejection.
- Deliver an order.
- Submit a review.
- Verify it appears on the product page.
- Verify review editing and deletion.
- Verify rating aggregates update correctly.

**Admin**
- View analytics.
- Add, edit, and delete products.
- Manage inventory.
- View and update orders.
- Manage customers.
- Moderate reviews.

**Existing functionality**
- Verify profile.
- Verify image uploads.
- Verify virtual try-on.
- Verify all existing major frontend routes and interactions.

Fix all issues discovered during testing.

## 17. Final Acceptance Criteria

The implementation is complete only when:

1. The entire application works without Supabase.
2. Express.js and MongoDB power the application.
3. Authentication and authorization work correctly.
4. Customers can shop and complete dummy checkout.
5. Inventory is updated consistently.
6. Admin can manage all products and stock.
7. Admin can manage every order and its delivery status.
8. Customers can track their orders through a complete timeline.
9. Customers can review only products they have received.
10. Product ratings and reviews appear correctly.
11. Admin dashboard analytics and management features work.
12. Existing Fitkart functionality remains intact.
13. The application builds and runs without critical errors.

**Execution instruction:** Start by inspecting the existing project, then implement the entire requested system directly. Make all necessary architectural decisions independently. Do not stop after analysis, do not return only a plan, and do not ask for confirmation between features. Build, integrate, test, and fix the complete implementation. If a genuine external dependency prevents a particular integration, implement everything else, clearly document the missing credential or dependency, and never pretend that the blocked feature is working.

The final result should be a fully functional, end-to-end Fitkart ecommerce application with a custom Express.js + MongoDB backend, customer shopping experience, dummy checkout, complete order tracking, verified reviews, inventory management, and a comprehensive admin dashboard.