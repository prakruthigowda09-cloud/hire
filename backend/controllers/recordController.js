const Record = require('../models/Record');

// Get all records
exports.getRecords = async (req, res) => {
    try {
        const query = {};
        if (req.query.search) {
            query.$or = [
                { candidate_name: { $regex: req.query.search, $options: 'i' } },
                { college_name: { $regex: req.query.search, $options: 'i' } },
                { email_id: { $regex: req.query.search, $options: 'i' } },
            ];
        }
        if (req.query.region) query.region = req.query.region;
        if (req.query.drive_status) query.drive_status = req.query.drive_status;

        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        const records = await Record.find(query).sort({ [sortField]: sortOrder });

        // Map _id to id for frontend compatibility
        res.json(records.map(r => ({ ...r.toObject(), id: r._id })));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create one record
exports.createRecord = async (req, res) => {
    const record = new Record(req.body);
    try {
        const newRecord = await record.save();
        res.status(201).json({ ...newRecord.toObject(), id: newRecord._id });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update one
exports.updateRecord = async (req, res) => {
    try {
        const updatedRecord = await Record.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.json({ ...updatedRecord.toObject(), id: updatedRecord._id });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete one
exports.deleteRecord = async (req, res) => {
    try {
        await Record.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted Record' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        const totalRecords = await Record.countDocuments();

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const addedToday = await Record.countDocuments({ createdAt: { $gte: today } });

        const byCategory = await Record.aggregate([
            { $group: { _id: "$region", count: { $sum: 1 } } },
            { $project: { category: "$_id", count: 1, _id: 0 } }
        ]);

        const byStatus = await Record.aggregate([
            { $group: { _id: "$drive_status", count: { $sum: 1 } } },
            { $project: { status: "$_id", count: 1, _id: 0 } }
        ]);

        // Last 7 days activity
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const perDay = await Record.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } },
            { $project: { day: "$_id", count: 1, _id: 0 } }
        ]);

        res.json({
            totalRecords,
            addedToday,
            byCategory,
            byStatus,
            perDay
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Bulk Import
exports.importRecords = async (req, res) => {
    const { records } = req.body;
    if (!Array.isArray(records)) {
        return res.status(400).json({ message: 'Invalid data format' });
    }

    try {
        const result = await Record.insertMany(records);
        res.json({ success: true, count: result.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
