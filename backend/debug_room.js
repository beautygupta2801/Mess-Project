const mongoose = require('mongoose');
const Student = require('./models/Student');
const ExtraOrder = require('./models/ExtraOrder');

const MONGODB_URI = 'mongodb+srv://ai87kartikroy_db_user:FlzTSY5duYWFdmhZ@cluster0.wqhbxgq.mongodb.net/mess_project';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Find one order
      const order = await ExtraOrder.findOne().populate('studentId');
      
      if (!order) {
        console.log('No orders found.');
      } else {
        console.log('Order found ID:', order._id);
        if (order.studentId) {
            console.log('Student Name:', order.studentId.name);
            console.log('Student Room:', order.studentId.roomNo);
        }
      }
      
      // Check specific student 'kbc'
      const kbc = await Student.findOne({ name: 'kbc' });
      if (kbc) {
        console.log('Student kbc found.');
        console.log('kbc.roomNo:', `'${kbc.roomNo}'`);
        console.log('kbc object keys:', Object.keys(kbc.toObject()));
      } else {
        console.log('Student kbc not found in DB');
      }

    } catch (err) {
      console.error(err);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('Connection error:', err));
