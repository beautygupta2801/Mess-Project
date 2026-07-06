const mongoose = require('mongoose');
const Student = require('./models/Student');
const ExtraOrder = require('./models/ExtraOrder');

const MONGODB_URI = 'mongodb+srv://ai87kartikroy_db_user:FlzTSY5duYWFdmhZ@cluster0.wqhbxgq.mongodb.net/mess_project';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
        // Prepare query similar to controller
        // We know the hostel is likely matching since orders are returned.
        // We'll just fetch recent orders.
        
        const limit = 5;
        const page = 1;
        const skip = 0;
        
        const query = {}; // Fetch all for now

        const orders = await ExtraOrder.find(query)
            .populate('studentId', 'name rollNo roomNo hostelNo')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        console.log('[Debug] First order student data (raw):', orders[0]?.studentId);

        const data = orders.map((o) => ({
            id: o._id.toString(),
            studentId: o.studentId._id ? o.studentId._id.toString() : o.studentId,
            studentName: o.studentId && o.studentId.name ? o.studentId.name : 'Unknown',
            studentRollNo: o.studentId && o.studentId.rollNo ? o.studentId.rollNo : '',
            studentRoomNo: o.studentId && o.studentId.roomNo ? o.studentId.roomNo : 'MISSING', // text if missing
            items: o.items,
            totalAmount: o.totalAmount,
            mealType: o.mealType,
            date: o.date,
        }));

        console.log('Mapped studentRoomNo:', data[0].studentRoomNo);

    } catch (err) {
      console.error(err);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('Connection error:', err));
