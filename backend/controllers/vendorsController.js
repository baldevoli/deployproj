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
exports.getAll = (req, res) => {
  db.query('SELECT * FROM vendors', (err, rows) => {
    if (err) {
      console.error('Error fetching vendors:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    console.log(`Retrieved ${rows.length} vendors`);
    res.json(rows);
  });
};

/**
 * Get a single vendor by ID
 * 
 * Retrieves detailed information for a specific vendor.
 * Returns 404 if the vendor doesn't exist.
 */
exports.getOne = (req, res) => {
  const vendorId = req.params.id;
  console.log(`Fetching vendor with ID: ${vendorId}`);
  
  db.query('SELECT * FROM vendors WHERE vendor_id = ?', [vendorId], (err, rows) => {
    if (err) {
      console.error('Error fetching vendor:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (!rows[0]) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    res.json(rows[0]);
  });
};

/**
 * Get all items for a specific vendor
 * 
 * Retrieves a list of all items associated with a given vendor ID.
 * Returns 404 if the vendor doesn't exist.
 */
exports.getVendorItems = (req, res) => {
  const vendorId = req.params.id;
  console.log(`Fetching items for vendor with ID: ${vendorId}`);
  
  // First check if the vendor exists
  db.query('SELECT * FROM vendors WHERE vendor_id = ?', [vendorId], (err, vendorRows) => {
    if (err) {
      console.error('Error checking vendor existence:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (!vendorRows[0]) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    // Vendor exists, now fetch associated items
    db.query('SELECT * FROM items WHERE vendor_id = ?', [vendorId], (err, itemRows) => {
      if (err) {
        console.error('Error fetching vendor items:', err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      console.log(`Retrieved ${itemRows.length} items for vendor ${vendorId}`);
      res.json(itemRows);
    });
  });
};

/**
 * Create a new vendor
 * 
 * Adds a new vendor to the database with the provided information.
 * Requires at minimum a vendor_name.
 * Other fields (contact_person, address, phone, email) are optional.
 * Returns the newly created vendor's ID and data upon success.
 */
exports.create = (req, res) => {
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
  
  db.query('INSERT INTO vendors SET ?', vendorData, (err, result) => {
    if (err) {
      console.error('Error creating vendor:', err);
      return res.status(500).json({ error: err });
    }
    
    console.log('Vendor created successfully with ID:', result.insertId);
    res.status(201).json({ 
      message: 'Vendor created successfully', 
      id: result.insertId,
      vendor: vendorData
    });
  });
};

/**
 * Update an existing vendor
 * 
 * Updates vendor information based on the provided data.
 * Requires at minimum a vendor_name.
 * Returns 404 if the vendor doesn't exist.
 */
exports.update = (req, res) => {
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
  
  db.query('UPDATE vendors SET ? WHERE vendor_id = ?', [vendorData, vendorId], (err, result) => {
    if (err) {
      console.error('Error updating vendor:', err);
      return res.status(500).json({ error: err });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    console.log('Vendor updated successfully');
    res.json({ message: 'Vendor updated successfully' });
  });
};

/**
 * Delete a vendor
 * 
 * Removes a vendor from the database.
 * Performs a safety check to prevent deletion of vendors with associated items.
 * Returns 400 if the vendor has associated items.
 * Returns 404 if the vendor doesn't exist.
 */
exports.remove = (req, res) => {
  const vendorId = req.params.id;
  console.log(`Deleting vendor with ID: ${vendorId}`);
  
  // First, check if this vendor has any items
  db.query('SELECT COUNT(*) as itemCount FROM items WHERE vendor_id = ?', [vendorId], (err, countResult) => {
    if (err) {
      console.error('Error checking for vendor items:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    // If vendor has associated items, prevent deletion and return informative error
    if (countResult[0].itemCount > 0) {
      console.log(`Cannot delete vendor ${vendorId}: Has ${countResult[0].itemCount} associated items`);
      return res.status(400).json({ 
        error: 'Vendor has associated items', 
        message: `This vendor has ${countResult[0].itemCount} items associated with it. Please remove or reassign these items before deleting the vendor.` 
      });
    }
    
    // If no associated items, proceed with deletion
    db.query('DELETE FROM vendors WHERE vendor_id = ?', [vendorId], (err, result) => {
      if (err) {
        console.error('Error deleting vendor:', err);
        
        // Check specifically for foreign key constraint errors
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
          return res.status(400).json({ 
            error: 'Foreign key constraint error', 
            message: 'This vendor cannot be deleted because it has associated items in the database.' 
          });
        }
        
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
      
      console.log('Vendor deleted successfully');
      res.json({ message: 'Vendor deleted successfully' });
    });
  });
};
