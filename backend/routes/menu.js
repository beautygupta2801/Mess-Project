const express = require('express');
const router = express.Router();
const munshiAuth = require('../middleware/munshiAuth');
const Student = require('../models/Student');
const Menu = require('../models/menu');
const MealHistory = require('../models/MealHistory');
const MessOff = require('../models/MessOff');
const Bill = require('../models/Bill');
const upload = require('../middleware/upload'); // Import upload middleware

router.use(munshiAuth);



// @route   DELETE /api/munshi/menu/item/:mealType/:itemId
// @desc    Remove an item from menu
// @access  Munshi only
router.delete('/item/:mealType/:itemId', async (req, res) => {
  console.log(`[Menu DELETE] Attempting to delete: ${req.params.mealType} - ${req.params.itemId}`);
  try {
    const { mealType: rawMealType, itemId: rawItemId } = req.params;
    const mealType = rawMealType.toLowerCase();
    const itemId = rawItemId.trim();

    if (!['breakfast', 'lunch', 'snacks', 'dinner'].includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal type'
      });
    }

    const menu = await Menu.findOne({ mealType, isActive: true, hostel: req.hostel });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    // Filter out the item to be deleted
    const initialLength = menu.items.length;
    menu.items = menu.items.filter(item => item._id.toString() !== itemId);

    if (menu.items.length === initialLength) {
      const availableIds = menu.items.map(i => i._id.toString()).join(', ');
      console.log(`[Menu DELETE] Item not found: ${itemId}`);
      return res.status(404).json({
        success: false,
        message: `Item not found. Requested: '${itemId}' (${mealType}). Available: [${availableIds}]`
      });
    }

    await menu.save();
    console.log(`[Menu DELETE] Success`);

    res.json({
      success: true,
      message: 'Menu item removed successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing menu item'
    });
  }
});

// @route   POST /api/munshi/menu/delete-item/:mealType/:itemId
// @desc    Remove an item from menu (POST alternative for robustness)
// @access  Munshi only
router.post('/delete-item/:mealType/:itemId', async (req, res) => {
  console.log(`[Menu POST DELETE] Attempting to delete: ${req.params.mealType} - ${req.params.itemId}`);
  try {
    const { mealType: rawMealType, itemId: rawItemId } = req.params;
    const mealType = rawMealType.toLowerCase();
    const itemId = rawItemId.trim();

    if (!['breakfast', 'lunch', 'snacks', 'dinner'].includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal type'
      });
    }

    const menu = await Menu.findOne({ mealType, isActive: true, hostel: req.hostel });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    // Filter out the item to be deleted
    const initialLength = menu.items.length;
    console.log(`[Menu POST DELETE] Items available: ${menu.items.map(i => i._id.toString()).join(', ')}`);
    menu.items = menu.items.filter(item => item._id.toString() !== itemId);

    if (menu.items.length === initialLength) {
      const availableIds = menu.items.map(i => i._id.toString()).join(', ');
      console.log(`[Menu POST DELETE] Item not found: ${itemId} in [${availableIds}]`);
      return res.status(404).json({
        success: false,
        message: `Item not found. Requested: '${itemId}' (${mealType}). Available: [${availableIds}]`
      });
    }

    await menu.save();
    console.log(`[Menu POST DELETE] Success`);

    res.json({
      success: true,
      message: 'Menu item removed successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing menu item'
    });
  }
});

// @route   GET /api/munshi/student/search
// @desc    Search student by ID or room number
// @access  Munshi only
router.get('/student/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query required'
      });
    }

    // Only search students from munshi's hostel
    const student = await Student.findOne({
      hostelNo: req.hostel,
      $or: [
        { rollNo: q },
        { roomNo: q },
        { qrCode: q }
      ]
    }).select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found in your hostel'
      });
    }

    res.json({
      success: true,
      student: {
        _id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        email: student.email,
        hostelNo: student.hostelNo,
        roomNo: student.roomNo,
        qrCode: student.qrCode,
        isActive: student.isActive
      }
    });
  } catch (error) {
    console.error('Search student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/munshi/menu/item
// @desc    Add a new menu item
// @access  Munshi only
router.post('/item', upload.single('image'), async (req, res) => {
  try {
    const { name, price, mealType } = req.body;
    
    // Handle image from file upload or body
    let imagePath = req.body.image || '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    if (!name || !price || !mealType) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and meal type are required'
      });
    }

    // Validate mealType
    if (!['breakfast', 'lunch', 'snacks', 'dinner'].includes(mealType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal type. Must be breakfast, lunch, snacks, or dinner'
      });
    }

    // Find or create menu for this meal type
    // Use findOne without isActive filter to reactivate existing menus if needed
    let menu = await Menu.findOne({ mealType: mealType.toLowerCase(), hostel: req.hostel });

    if (!menu) {
      // Create new menu for this meal type
      menu = new Menu({
        mealType: mealType.toLowerCase(),
        items: [],
        isActive: true,
        hostel: req.hostel
      });
    } else if (!menu.isActive) {
      // Reactivate existing menu
      menu.isActive = true;
    }

    // Add the new item
    menu.items.push({
      name: name.trim(),
      price: Number(price),
      image: imagePath,
      isAvailable: true
    });

    await menu.save();

    res.status(201).json({
      success: true,
      message: 'Menu item added successfully',
      data: {
        mealType: menu.mealType,
        item: menu.items[menu.items.length - 1]
      }
    });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding menu item: ' + error.message
    });
  }
});





// @route   PUT /api/munshi/menu/item/:mealType/:itemId
// @desc    Update a menu item (price, name, availability)
// @access  Munshi only
router.put('/item/:mealType/:itemId', async (req, res) => {
  try {
    const { mealType, itemId } = req.params;
    const { name, price, isAvailable } = req.body;

    if (!['breakfast', 'lunch', 'snacks', 'dinner'].includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal type'
      });
    }

    const menu = await Menu.findOne({ mealType, isActive: true, hostel: req.hostel });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    const itemIndex = menu.items.findIndex(item => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in menu'
      });
    }

    // Update fields if provided
    if (name) menu.items[itemIndex].name = name.trim();
    if (price !== undefined) menu.items[itemIndex].price = Number(price);
    if (isAvailable !== undefined) menu.items[itemIndex].isAvailable = isAvailable;

    await menu.save();

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: menu.items[itemIndex]
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating menu item'
    });
  }
});

// @route   POST /api/munshi/order/process
// @desc    Process student meal order
// @access  Munshi only
router.post('/order/process', async (req, res) => {
  try {
    const { studentId, mealType, items } = req.body;

    if (!studentId || !mealType || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate mealType
    if (!['breakfast', 'lunch', 'snacks', 'dinner'].includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal type'
      });
    }

    // Verify student belongs to munshi's hostel
    const student = await Student.findById(studentId);
    if (!student || student.hostelNo !== req.hostel) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student not in your hostel.'
      });
    }

    // Calculate total
    const totalCost = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    // Create meal history
    const mealHistory = new MealHistory({
      studentId,
      date: new Date(),
      type: mealType.charAt(0).toUpperCase() + mealType.slice(1),
      items: items.map(item => ({
        name: item.name,
        qty: item.quantity || 1,
        price: item.price
      })),
      totalCost,
      processedBy: req.munshi._id,
      hostel: req.hostel
    });

    await mealHistory.save();

    // Update bill
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    await Bill.findOneAndUpdate(
      { studentId, month: currentMonth, year: currentYear },
      {
        $inc: {
          mealCharges: totalCost,
          totalBill: totalCost,
          mealCount: 1
        }
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Order processed successfully',
      order: {
        id: mealHistory._id,
        totalCost,
        items: mealHistory.items
      }
    });
  } catch (error) {
    console.error('Process order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing order'
    });
  }
});

// @route   GET /api/munshi/mess-off/requests
// @desc    Get mess-off requests from munshi's hostel
// @access  Munshi only
router.get('/mess-off/requests', async (req, res) => {
  try {
    const { status } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    // Get all requests for students in munshi's hostel
    const students = await Student.find({ hostelNo: req.hostel }).select('_id');
    const studentIds = students.map(s => s._id);

    const requests = await MessOff.find({
      ...query,
      studentId: { $in: studentIds }
    })
      .populate('studentId', 'name rollNo hostelNo roomNo')
      .sort({ createdAt: -1 })
      .lean();

    const formattedRequests = requests.map(req => ({
      id: req._id,
      student: req.studentId,
      fromDate: req.fromDate.toISOString().split('T')[0],
      toDate: req.toDate.toISOString().split('T')[0],
      meals: req.meals,
      reason: req.reason,
      status: req.status,
      createdAt: req.createdAt
    }));

    res.json({
      success: true,
      data: formattedRequests
    });
  } catch (error) {
    console.error('Get mess-off requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /api/munshi/mess-off/:id
// @desc    Update mess-off request status
// @access  Munshi only
router.patch('/mess-off/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const messOff = await MessOff.findByIdAndUpdate(
      id,
      {
        status,
        approvedBy: req.munshi._id,
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!messOff) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.json({
      success: true,
      message: `Request ${status.toLowerCase()} successfully`,
      data: messOff
    });
  } catch (error) {
    console.error('Update mess-off status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/munshi/orders
// @desc    Get orders/reports from munshi's hostel
// @access  Munshi only
router.get('/orders', async (req, res) => {
  try {
    const { startDate, endDate, mealType } = req.query;

    let query = { hostel: req.hostel };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (mealType) {
      if (!['breakfast', 'lunch', 'snacks', 'dinner'].includes(mealType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid meal type'
        });
      }
      query.type = mealType.charAt(0).toUpperCase() + mealType.slice(1);
    }

    const orders = await MealHistory.find(query)
      .populate('studentId', 'name rollNo hostelNo roomNo')
      .sort({ date: -1 })
      .lean();

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

// @route   POST /api/munshi/menu/weekly
// @desc    Update weekly menu with images
// @access  Munshi only
router.post('/weekly', upload.any(), async (req, res) => {
    try {
        console.log('[Menu Weekly] Received update request');
        // req.body should contain 'menuData' as a JSON string
        // FormData: 
        // - menuData: JSON string of structure { "Sunday": { "breakfast": [{name, price, ...}], ... }, ... }
        // - files: images with fieldnames like "image-Sunday-breakfast-0" (or handle mapping by ID/Index)

        if (!req.body.menuData) {
             return res.status(400).json({ success: false, message: 'Missing menuData' });
        }

        const weeklyMenu = JSON.parse(req.body.menuData);
        const files = req.files || [];
        
        // Map files to a lookup object or process directly
        // Client side should probably send file fieldname as `${day}-${mealType}-${itemIndex}` or something similar
        // OR Client sends items with a temporary ID, and file fieldname matches that ID.
        
        // Let's assume the client sends a `tempId` in the item, and the file fieldname is that `tempId`.
        const fileMap = {};
        files.forEach(file => {
            fileMap[file.fieldname] = `/uploads/${file.filename}`;
        });

        // Loop through days and meal types to update/create menus
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];

        for (const day of days) {
            if (!weeklyMenu[day]) continue;

            for (const mealType of mealTypes) {
                if (!weeklyMenu[day][mealType]) continue;

                // Find existing menu for Day + MealType
                let menu = await Menu.findOne({ day, mealType, hostel: req.hostel });
                
                if (!menu) {
                    menu = new Menu({ day, mealType, items: [], hostel: req.hostel });
                }

                // Process items
                const newItems = weeklyMenu[day][mealType]
                    .filter(item => item.name && item.name.trim()) // Only include items with names
                    .map((item, index) => {
                    // Check if a new file was uploaded for this item
                    // We expect the client to use a unique key for the file fieldname corresponding to this item.
                    // Let's rely on the client sending `imageKey` in the item data which matches file fieldname.
                    // If no new file, keep existing image if provided in `existingImage`
                    
                    let imagePath = item.existingImage || '';
                    if (item.imageKey && fileMap[item.imageKey]) {
                        imagePath = fileMap[item.imageKey];
                    }

                    return {
                        name: item.name.trim(),
                        price: Number(item.price) || 0,
                        image: imagePath,
                        isAvailable: item.isAvailable !== false // Default true
                    };
                });

                // Only save if there are valid items
                if (newItems.length > 0) {
                    menu.items = newItems;
                    menu.isActive = true;
                    await menu.save();
                } else if (menu._id) {
                    // If menu exists but has no items, delete it
                    await Menu.deleteOne({ _id: menu._id });
                }
            }
        }

        res.json({ success: true, message: 'Weekly menu updated successfully' });

    } catch (error) {
        console.error('Weekly menu update error:', error);
        res.status(500).json({ success: false, message: 'Server error updating weekly menu: ' + error.message });
    }
});

// @route   GET /api/munshi/menu/current
// @desc    Get current menu, optionally filtered by day
// @access  Munshi only
router.get('/current', async (req, res) => {
  try {
    const { day } = req.query;
    
    let query = { isActive: true, hostel: req.hostel };
    if (day) {
        query.day = day;
    }

    const menus = await Menu.find(query)
      .sort({ mealType: 1 })
      .lean();

    const menuByType = {
      breakfast: [],
      lunch: [],
      snacks: [],
      dinner: []
    };

    menus.forEach(menu => {
      if (menuByType[menu.mealType]) {
        // If getting all days (no day filter), we might have collisions or need a different structure.
        // If day IS provided, this works fine.
        // If day IS NOT provided, this currently just merges everything, which might be messy if used for anything other than "Today's Menu".
        // BUT, existing frontend uses this for "Today's session" mostly.
        // Let's assume if no day is provided, we return ALL valid items across all days? Or maybe just return structure?
        // The original code returned all items.
        // If we want to return a specific day's menu, we filter by day.

        menu.items.forEach(item => {
           if (item.isAvailable) {
             menuByType[menu.mealType].push({
                id: item._id,
                name: item.name,
                price: item.price,
                image: item.image ? (item.image.startsWith('http') ? item.image : `${process.env.VITE_API_URL || 'http://localhost:5000'}${item.image}`) : `https://placehold.co/300x200/cccccc/FFF?text=${encodeURIComponent(item.name || '')}`,
                category: menu.mealType,
                isAvailable: item.isAvailable,
                day: menu.day // Include day in response
             });
           }
        });
      }
    });

    res.json({
      success: true,
      data: menuByType
    });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching menu'
    });
  }
});