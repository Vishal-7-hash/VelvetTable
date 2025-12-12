const pool = require("../config/db");

// -------------------------------------------------------------
// CREATE RESTAURANT
// -------------------------------------------------------------
exports.createRestaurant = async (req, res) => {
  try {
    // ✅ Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const owner_id = req.user.id;
    const formData = req.body;

    // ✅ Extract all uploaded images, including the new menu file
  // Store relative paths (uploads/... ) so frontend can request them via /<relative-path>
  const logo_image_url = req.files?.logo_image?.[0]?.filename ? `uploads/logos/${req.files.logo_image[0].filename}` : null;
    const gallery_images = req.files?.gallery_images?.map(file => `uploads/gallery/${file.filename}`) || [];
  // menu_url removed — menu upload is no longer supported

  // Debug: log incoming files and body to help trace 500 errors
    console.log('---- createRestaurant: req.files ----');
    console.log(Object.keys(req.files || {}));
    if (req.files) {
      for (const [key, arr] of Object.entries(req.files)) {
        console.log(`files[${key}] length:`, Array.isArray(arr) ? arr.length : 'n/a');
        if (Array.isArray(arr)) arr.forEach((f, i) => console.log(`  ${key}[${i}] ->`, f.path));
      }
    }
    console.log('---- createRestaurant: req.body ----');
    console.log(formData);

  // ✅ Basic required fields validation
    const requiredFields = [
      "name", "manager_name", "restaurant_type", "description",
      "address", "city", "state", "zip_code", "contact_number", "email"
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        return res.status(400).json({ message: `Missing required field: ${field}` });
      }
    }

    if (!logo_image_url) {
      return res.status(400).json({ message: "Logo image is required." });
    }
    
  // MENU FILE IS OPTIONAL - do not fail if missing

    // ✅ Convert lists to JSON
    const cuisine_types_json = JSON.stringify(formData.cuisine_types ? formData.cuisine_types.split(",") : []);
    const special_areas_json = JSON.stringify(formData.special_areas ? formData.special_areas.split(",") : []);
    const facilities_json = JSON.stringify(formData.facilities ? formData.facilities.split(",") : []);

    // Build INSERT dynamically to match the actual DB schema (defensive)
    const menu_url = req.files?.menu_file?.[0]?.path?.replace(/\\/g, "/") || null;

    // Base columns and values (menu_url may be appended if exists in DB)
    const columns = [
      'owner_id', 'name', 'manager_name', 'restaurant_type', 'cuisine_types', 'description', 'logo_image_url',
      'address', 'city', 'state', 'zip_code', 'contact_number', 'email', 'website_url',
      'operating_hours', 'avg_dining_duration', 'total_tables', 'table_capacity_range',
      'special_areas', 'ambience_type', 'facilities'
    ];

    const values = [
      owner_id,
      formData.name,
      formData.manager_name,
      formData.restaurant_type,
      cuisine_types_json,
      formData.description,
      logo_image_url,
      formData.address,
      formData.city,
      formData.state,
      formData.zip_code,
      formData.contact_number,
      formData.email,
      formData.website_url || null,
      formData.operating_hours || null,
      formData.avg_dining_duration || null,
      formData.total_tables || null,
      formData.table_capacity_range || null,
      special_areas_json,
      formData.ambience_type || null,
      facilities_json
    ];

    // Check if the restaurants table has a menu_url column; if so, append it
    try {
      const [colCheck] = await pool.query(
        `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'restaurants' AND COLUMN_NAME = 'menu_url'`,
        [process.env.DB_NAME]
      );
      if (colCheck && colCheck[0] && colCheck[0].cnt > 0) {
        columns.push('menu_url');
        values.push(menu_url);
      }
    } catch (err) {
      console.warn('Could not check INFORMATION_SCHEMA for menu_url column:', err.message);
      // proceed without menu_url
    }

    // Build placeholders and query
    const placeholders = columns.map(() => '?').join(', ');
    const insertQuery = `INSERT INTO restaurants (${columns.join(', ')}) VALUES (${placeholders})`;

    // Debug: log values before DB insert
    console.log('---- createRestaurant: insert columns ----');
    console.log(columns);
    console.log('---- createRestaurant: insert values ----');
    console.log(values);

    const [result] = await pool.query(insertQuery, values);
    const restaurantId = result.insertId;

    // ✅ Insert gallery images if available
    if (gallery_images.length > 0) {
      const imageValues = gallery_images.map(url => [restaurantId, url]);
      await pool.query("INSERT INTO restaurant_images (restaurant_id, image_url) VALUES ?", [imageValues]);
    }

    res.status(201).json({ message: "Restaurant submitted successfully.", restaurantId });

  } catch (error) {
    console.error("----------- BACKEND ERROR (createRestaurant) -----------");
    console.error(error);
    console.error("--------------------------------------------------------");
    // Return the error message and stack in the response for easier debugging in dev
    res.status(500).json({ message: "Server error while creating restaurant.", error: error.message, stack: error.stack });
  }
};
// -------------------------------------------------------------
// GET MY RESTAURANTS
// -------------------------------------------------------------
exports.getMyRestaurants = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const [restaurants] = await pool.query("SELECT * FROM restaurants WHERE owner_id = ?", [req.user.id]);
    res.json(restaurants);
  } catch (error) {
    console.error("Error fetching user's restaurants:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------------------------------------------------
// GET APPROVED RESTAURANTS
// -------------------------------------------------------------
// @desc    Get all approved restaurants for public view
// @route   GET /api/restaurants
// @access  Public
exports.getApprovedRestaurants = async (req, res) => {
    try {
        const [restaurants] = await pool.query("SELECT id, name, cuisine_types, logo_image_url FROM restaurants WHERE status = 'approved'");
        res.json(restaurants);
        console.log(req.body);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// -------------------------------------------------------------
// GET RESTAURANT BY ID
// -------------------------------------------------------------
exports.getRestaurantById = async (req, res) => {
  try {
    const [restaurants] = await pool.query(
      "SELECT * FROM restaurants WHERE id = ? AND status = 'approved'",
      [req.params.id]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const restaurant = restaurants[0];
    const [images] = await pool.query("SELECT image_url FROM restaurant_images WHERE restaurant_id = ?", [req.params.id]);
    restaurant.gallery = images.map(img => img.image_url) || [];

    res.json(restaurant);
  } catch (error) {
    console.error("Error fetching restaurant by ID:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Add these two new functions

// @desc    Get a single restaurant by ID for its owner to edit
// @route   GET /api/restaurants/owner/:id
// @access  Private/Owner
exports.getRestaurantForOwner = async (req, res) => {
  try {
    const [restaurants] = await pool.query("SELECT * FROM restaurants WHERE id = ? AND owner_id = ?", [req.params.id, req.user.id]);
    if (restaurants.length === 0) {
      return res.status(404).json({ message: "Restaurant not found or you are not the owner." });
    }
    const restaurant = restaurants[0];
    // Fetch gallery images
    const [images] = await pool.query("SELECT image_url FROM restaurant_images WHERE restaurant_id = ?", [req.params.id]);
    restaurant.gallery = images.map(img => img.image_url) || [];
    res.json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update a restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Owner
// Replace the existing updateRestaurant function
exports.updateRestaurant = async (req, res) => {
    const { id } = req.params;
    const owner_id = req.user.id;
    
  try {
    // Check ownership
    const [restaurants] = await pool.query('SELECT * from restaurants WHERE id = ? AND owner_id = ?', [id, owner_id]);
    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found or you are not the owner.' });
    }

    // Get fields from the body (many editable fields)
    const {
      name,
      manager_name,
      restaurant_type,
      cuisine_types,
      description,
      address,
      city,
      state,
      zip_code,
      contact_number,
      email,
      website_url,
      operating_hours,
      avg_dining_duration,
      total_tables,
      table_capacity_range,
      ambience_type,
      special_areas,
      facilities
    } = req.body;

    // Basic required validation
    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required.' });
    }

    // Helper: normalize field to JSON string for list-like fields
    const normalizeListField = (val) => {
      if (!val) return JSON.stringify([]);
      // If already an array (rare with multipart/form-data), stringify
      if (Array.isArray(val)) return JSON.stringify(val);
      // If it's a string that looks like JSON, try to parse then stringify to normalize
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
          try {
            const parsed = JSON.parse(trimmed);
            return JSON.stringify(parsed);
          } catch (err) {
            // fall through
          }
        }
        // If it's a comma-separated string, convert to array
        if (trimmed.includes(',')) {
          const arr = trimmed.split(',').map(s => s.trim()).filter(Boolean);
          return JSON.stringify(arr);
        }
        // Single value -> store as single-element array
        return JSON.stringify([trimmed]);
      }
      // Fallback
      return JSON.stringify([]);
    };

    // Debug: log incoming body and files for tracing why some fields might not persist
    console.log('---- updateRestaurant: req.body ----');
    console.log(req.body);
    console.log('---- updateRestaurant: req.files keys ----');
    console.log(Object.keys(req.files || {}));
    if (req.files) {
      for (const [key, arr] of Object.entries(req.files)) {
        console.log(`files[${key}] length:`, Array.isArray(arr) ? arr.length : 'n/a');
      }
    }

    // Handle logo image upload if present (store relative path)
    let logo_image_url = restaurants[0].logo_image_url; // Keep existing logo by default
    if (req.files && req.files.logo_image && req.files.logo_image[0]) {
      logo_image_url = `uploads/logos/${req.files.logo_image[0].filename}`;
    }

    // Handle new gallery images if present (store relative paths)
    let newGalleryImages = [];
    if (req.files && req.files.gallery_images) {
      newGalleryImages = req.files.gallery_images.map(f => `uploads/gallery/${f.filename}`);
    }

    // Normalize list fields to JSON strings for storage
    const cuisine_types_json = normalizeListField(cuisine_types);
    const special_areas_json = normalizeListField(special_areas);
    const facilities_json = normalizeListField(facilities);

    await pool.query(
      `UPDATE restaurants SET
        name = ?,
        manager_name = ?,
        restaurant_type = ?,
        cuisine_types = ?,
        description = ?,
        address = ?,
        city = ?,
        state = ?,
        zip_code = ?,
        contact_number = ?,
        email = ?,
        website_url = ?,
        operating_hours = ?,
        avg_dining_duration = ?,
        total_tables = ?,
        table_capacity_range = ?,
        special_areas = ?,
        ambience_type = ?,
        facilities = ?,
        logo_image_url = ?
      WHERE id = ?`,
      [
        name,
        manager_name,
        restaurant_type,
        cuisine_types_json,
        description,
        address || null,
        city || null,
        state || null,
        zip_code || null,
        contact_number || null,
        email || null,
        website_url || null,
        operating_hours || null,
        avg_dining_duration || null,
        total_tables || null,
        table_capacity_range || null,
        special_areas_json,
        ambience_type || null,
        facilities_json,
        logo_image_url,
        id
      ]
    );

    // Insert new gallery images if any
    if (newGalleryImages.length > 0) {
      const imageValues = newGalleryImages.map(url => [id, url]);
      await pool.query("INSERT INTO restaurant_images (restaurant_id, image_url) VALUES ?", [imageValues]);
    }

    // Fetch and return the updated restaurant for client-side confirmation
    const [updatedRows] = await pool.query('SELECT * FROM restaurants WHERE id = ?', [id]);
    const updatedRestaurant = updatedRows[0] || null;

    res.json({ 
      message: 'Restaurant updated successfully.',
      restaurant: updatedRestaurant,
      logo_image_url: logo_image_url
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Development helper: echoes received multipart/form-data (files and body)
// Use this endpoint to verify uploads from the client without executing DB logic.
exports.debugEcho = async (req, res) => {
  try {
    const filesSummary = {};
    if (req.files) {
      for (const [k, arr] of Object.entries(req.files)) {
        filesSummary[k] = arr.map(f => ({ originalname: f.originalname, path: f.path }));
      }
    }
    return res.json({ body: req.body, files: filesSummary });
  } catch (err) {
    console.error('debugEcho error', err);
    res.status(500).json({ message: 'debugEcho server error', error: err.message });
  }
};