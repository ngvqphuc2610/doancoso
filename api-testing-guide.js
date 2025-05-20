// API Testing Guide for Cinema Management Project

/*
This file contains examples of how to test the API endpoints in the cinema management project.
You can use tools like Postman, Insomnia, or curl to make API requests.

Below are the endpoints available for testing:
*/

// ==================== SHOWTIMES API ====================
// GET /api/admin/showtimes - Get all showtimes
// Example response:
/*
{
  "success": true,
  "data": [
    {
      "id_showtime": 1,
      "id_movie": 12345,
      "id_cinema": "dl",
      "id_screen": 1,
      "showtime": "2023-12-25T19:30:00",
      "price": 85000,
      "status": "active"
    },
    ...
  ]
}
*/

// GET /api/admin/showtimes/:id - Get specific showtime
// Example: /api/admin/showtimes/1

// POST /api/admin/showtimes - Add new showtime
// Example body:
/*
{
  "id_movie": 12345,
  "id_cinema": "dl",
  "id_screen": 1,
  "showtime": "2023-12-25T19:30:00",
  "price": 85000,
  "status": "active"
}
*/

// PUT /api/admin/showtimes/:id - Update showtime
// Example: /api/admin/showtimes/1
// Same body as POST

// PATCH /api/admin/showtimes/:id - Update showtime status
// Example: /api/admin/showtimes/1
// Example body:
/*
{
  "status": "cancelled"
}
*/

// DELETE /api/admin/showtimes/:id - Delete showtime
// Example: /api/admin/showtimes/1

// ==================== MOVIES API ====================
// GET /api/genres - Get all movie genres
// GET /api/movies/now-showing - Get currently showing movies
// GET /api/movies/coming-soon - Get upcoming movies
// GET /api/movies/:id - Get specific movie details
// GET /api/movies/:id/credits - Get movie cast and director info
// GET /api/movies/:id/showtimes - Get movie showtimes

// ==================== CINEMAS API ====================
// GET /api/cinemas - Get all cinemas
// GET /api/cinemas/:id - Get specific cinema details
// GET /api/cinemas/:id/screens - Get screens for a cinema
// GET /api/cinemas/:id/operation-hours - Get cinema operation hours

// ==================== PRODUCTS API ====================
// GET /api/products - Get all products
// GET /api/products/type/:typeId - Get products by type
// GET /api/products/:id - Get specific product details
// GET /api/product-types - Get all product types

// ==================== PROMOTIONS API ====================
// GET /api/promotions - Get all promotions
// GET /api/promotions/active - Get currently active promotions
// GET /api/promotions/:id - Get specific promotion details

// ==================== TESTING INSTRUCTIONS ====================
/*
To test these API endpoints:

1. Make sure your server is running (npm start or similar command)
2. Use a tool like Postman, Insomnia, or curl to make requests
3. For GET requests, simply enter the URL
4. For POST/PUT/PATCH requests, set the Content-Type header to application/json and include the required body
5. Check the response for the expected data structure

Example curl command for getting all products:
curl -X GET http://localhost:3000/api/products

Example curl command for adding a showtime:
curl -X POST http://localhost:3000/api/admin/showtimes \
  -H "Content-Type: application/json" \
  -d '{"id_movie": 12345, "id_cinema": "dl", "id_screen": 1, "showtime": "2023-12-25T19:30:00", "price": 85000, "status": "active"}'
*/
