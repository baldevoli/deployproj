/**
 * Vendors Controller
 * 
 * Handles CRUD operations for vendor data in the inventory system.
 * This controller interfaces with the database to manage vendor information.
 */
const db = require('../db');

/**
 * Get all vendors
 * 
 * Retrieves a list of all vendors from the database.
 * No filtering or pagination is applied.
 */
exports.getAll = async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM vendors');
    console.log(`Retrieved ${rows.length} vendors`);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching vendors:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

/**
 * Get a single vendor by ID
 * 
 * Retrieves detailed information for a specific vendor.
 * Returns 404 if the vendor doesn't exist.
 */
exports.getOne = async (req, res) => {
  const vendorId = req.params.id;
  console.log(`Fetching vendor with ID: ${vendorId}`);
  
  try {
    const [rows] = await db.query('SELECT * FROM vendors WHERE vendor_id = ?', [vendorId]);
    
    if (!rows[0]) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching vendor:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

/**
 * Get all items for a specific vendor
 * 
 * Retrieves a list of all items associated with a given vendor ID.
 * Returns 404 if the vendor doesn't exist.
 */
exports.getVendorItems = async (req, res) => {
  const vendorId = req.params.id;
  console.log(`Fetching items for vendor with ID: ${vendorId}`);
  
  try {
    // First check if the vendor exists
    const vendorRows = await db.query('SELECT * FROM vendors WHERE vendor_id = $1', [vendorId]);
    
    if (!vendorRows.rows[0]) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    // Vendor exists, now fetch associated items
    const itemRows = await db.query('SELECT * FROM items WHERE vendor_id = $1', [vendorId]);
    
    console.log(`Retrieved ${itemRows.rows.length} items for vendor ${vendorId}`);
    res.json(itemRows.rows);
  } catch (err) {
    console.error('Error fetching vendor items:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

/**
 * Create a new vendor
 * 
 * Adds a new vendor to the database with the provided information.
 * Requires at minimum a vendor_name.
 * Other fields (contact_person, address, phone, email) are optional.
 * Returns the newly created vendor's ID and data upon success.
 */
exports.create = async (req, res) => {
  console.log('Creating new vendor with data:', req.body);
  
  // Validate required fields
  const { vendor_name } = req.body;
  
  if (!vendor_name || !vendor_name.trim()) {
    console.error('Validation error: Missing vendor_name');
    return res.status(400).json({ error: 'Vendor name is required' });
  }
  
  // Create data object for insertion - excluding role field
  const vendorData = {
    vendor_name,
    contact_person: req.body.contact_person || null,
    address: req.body.address || null,
    phone: req.body.phone || null,
    email: req.body.email || null
  };
  
  console.log('Processed vendor data for insertion:', vendorData);
  
  try {
    const [result] = await db.query('INSERT INTO vendors SET ?', vendorData);
    
    console.log('Vendor created successfully with ID:', result.insertId);
    res.status(201).json({ 
      message: 'Vendor created successfully', 
      id: result.insertId,
      vendor: vendorData
    });
  } catch (err) {
    console.error('Error creating vendor:', err);
    res.status(500).json({ error: err });
  }
};

/**
 * Update an existing vendor
 * 
 * Updates vendor information based on the provided data.
 * Requires at minimum a vendor_name.
 * Returns 404 if the vendor doesn't exist.
 */
exports.update = async (req, res) => {
  const vendorId = req.params.id;
  console.log(`Updating vendor with ID: ${vendorId}, data:`, req.body);
  
  // Validate required fields
  const { vendor_name } = req.body;
  
  if (!vendor_name || !vendor_name.trim()) {
    console.error('Validation error: Missing vendor_name');
    return res.status(400).json({ error: 'Vendor name is required' });
  }
  
  // Create data object for update - excluding role field
  const vendorData = {
    vendor_name,
    contact_person: req.body.contact_person || null,
    address: req.body.address || null,
    phone: req.body.phone || null,
    email: req.body.email || null
  };
  
  console.log('Processed vendor data for update:', vendorData);
  
  try {
    const [result] = await db.query('UPDATE vendors SET ? WHERE vendor_id = ?', [vendorData, vendorId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    console.log('Vendor updated successfully');
    res.json({ message: 'Vendor updated successfully' });
  } catch (err) {
    console.error('Error updating vendor:', err);
    res.status(500).json({ error: err });
  }
};

/**
 * Delete a vendor
 * 
 * Removes a vendor from the database.
 * Performs a safety check to prevent deletion of vendors with associated items.
 * Returns 400 if the vendor has associated items.
 * Returns 404 if the vendor doesn't exist.
 */
exports.remove = async (req, res) => {
  const vendorId = req.params.id;
  console.log(`Deleting vendor with ID: ${vendorId}`);
  
  try {
    // First, check if this vendor has any items
    const [countResult] = await db.query('SELECT COUNT(*) as itemCount FROM items WHERE vendor_id = ?', [vendorId]);
    
    // If vendor has associated items, prevent deletion and return informative error
    if (countResult[0].itemCount > 0) {
      console.log(`Cannot delete vendor ${vendorId}: Has ${countResult[0].itemCount} associated items`);
      return res.status(400).json({ 
        error: 'Vendor has associated items', 
        message: `This vendor has ${countResult[0].itemCount} items associated with it. Please remove or reassign these items before deleting the vendor.` 
      });
    }
    
    // No items found, proceed with deletion
    const [result] = await db.query('DELETE FROM vendors WHERE vendor_id = ?', [vendorId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    console.log('Vendor deleted successfully');
    res.json({ message: 'Vendor deleted successfully' });
  } catch (err) {
    console.error('Error deleting vendor:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};
