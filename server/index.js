const express = require('express');
const dotenv = require('dotenv').config();
const connectDb = require('./config/dbConnection');
const cors = require('cors');
const asyncHandler = require('express-async-handler');
const User = require('./models/UserModel');
const Preference = require('./models/PreferenceModel');
const Task = require('./models/TaskModel');
const Timetable = require('./models/TimetableModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

connectDb();
const app = express();
const port = 5002;

app.use(express.json());
app.use(cors());

// SignUp Page
app.get('/signup/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id); // Use findById instead of find
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
    
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' })
    }
});


app.post('/signup', asyncHandler(async (req, res) => {
    const { username, fullname, email, phone, password } = req.body;
    if (!username || !fullname || !email || !phone || !password) {
        res.status(400).json({ message: "All fields required" });
        return;
    }

    const available = await User.findOne({ email });
    if (available) {
        res.status(401).json({ message: "User already registered" });
        return;
    }

    const hashpassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, fullname, email, phone, password: hashpassword });

    res.json(user);
}));

app.put('/signup/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const user = await User.findByIdAndUpdate(id, updatedData, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// SignIn Page
app.post('/login', asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ message: "All fields required" });
        return;
    }

    const user = await User.findOne({ username });
    if (!user) {
        res.status(401).json({ message: "User Not Found" });
        return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        res.status(401).json({ message: "Wrong Password" });
        return;
    }

    try {
        const access_token = jwt.sign(
            {
                user: {
                    username: user.username,
                    fullname: user.fullname,
                    email: user.email,
                    phone: user.phone,
                    id: user.id
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );
        res.status(200).json({ access_token, message: "Success" });
    } catch (error) {
        console.error('Error generating access token:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));


// Fetch preferences based on user ID
app.get('/preferences/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const preferences = await Preference.findOne({ userId });
        if (!preferences) {
            // If no preferences found, return null or a default structure
            res.status(400).json({ message: 'Error fetching preferences', error });
        } else {
            res.status(200).json(preferences);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching preferences', error });
    }
});

// Create preferences
app.post('/preferences', async (req, res) => {
    const data = req.body;
    const pref = new Preference(data);

    try {
        await pref.save();
        res.status(201).json(pref);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update preferences
app.put('/preferences/:userId', async (req, res) => {
    const { userId } = req.params;
    const updatedPreferences = req.body;

    try {
        const result = await Preference.findOneAndUpdate({ userId }, updatedPreferences, { new: true, upsert: true });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error updating preferences', error });
    }
});

// Add a new task
app.post('/tasks', async (req, res) => {
    const { userId, taskName, category, deadline_date,deadline_time, estimatedTime, priority,status } = req.body;
    try {
        const task = new Task({ userId, taskName, category, deadline_date,deadline_time, estimatedTime, priority,status });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: 'Failed to add task' });
    }
});

// Get all tasks for a user
app.get('/tasks/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const tasks = await Task.find({ userId });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(400).json({ error: 'Failed to fetch tasks' });
    }
});

// Update a task
app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { taskName, category, deadline_date,deadline_time, estimatedTime, priority,status } = req.body;
    try {
        const task = await Task.findByIdAndUpdate(id, { taskName, category, deadline_date,deadline_time, estimatedTime, priority,status }, { new: true });
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update task' });
    }
});

// Delete a task
app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Task.findByIdAndDelete(id);
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete task' });
    }
});


// Store timetable
app.post('/timetable', async (req, res) => {
    const { userId, schedule } = req.body;

    try {
        // Check if a timetable already exists for this user
        const existingTimetable = await Timetable.findOne({ userId });

        if (existingTimetable) {
            // If a timetable exists, delete it
            await Timetable.deleteOne({ userId });
        }

        // Create a new timetable and save it
        const newTimetable = new Timetable({
            userId,
            schedule,
        });
        const savedTimetable = await newTimetable.save();

        res.status(201).json(savedTimetable);
    } catch (error) {
        res.status(400).json({ error: 'Failed to save timetable' });
    }
});


// Get latest timetable for user
app.get('/timetable/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const timetable = await Timetable.findOne({ userId }).sort({ date: -1 });
        res.status(200).json(timetable);
    } catch (error) {
        res.status(400).json({ error: 'Failed to fetch timetable' });
    }
});

app.put('/timetable/:timetableId/task/:taskId', async (req, res) => {
    const { timetableId, taskId } = req.params;
    const { status } = req.body;
    try {
        const timetable = await Timetable.findById(timetableId);
        // const taskObjectId = new mongoose.Types.ObjectId(taskId);
        // Use find instead of findIndex
        const task = timetable.schedule.find(item => item._id.toString() === taskId);

        if (task) {
            // Update the status directly on the found task
            task.status = status;
            await timetable.save();
            
            // If task is missed, update the task in Task collection
            // if (status === 'missed') {
            //     await Task.findByIdAndUpdate(taskId, { status: 'missed' });
            // }
        }

        res.status(200).json(timetable);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update task status' });
    }
});


// Clean up expired tasks
app.delete('/timetable/cleanup/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const timetable = await Timetable.findOne({ userId }).sort({ date: -1 });
        if (timetable) {
            const currentTime = new Date();
            timetable.schedule = timetable.schedule.filter(item => {
                if (item.deadline && new Date(item.deadline) < currentTime) {
                    if (item.status === 'pending') {
                        // Mark task as missed if deadline passed and status still pending
                        Task.findByIdAndUpdate(item.taskId, { status: 'missed' }).exec();
                    }
                    return false;
                }
                return true;
            });
            await timetable.save();
        }
        res.status(200).json(timetable);
    } catch (error) {
        res.status(400).json({ error: 'Failed to cleanup timetable' });
    }
});

// Starting the Server
app.listen(port, () => console.log(`Server Started at PORT ${port}`));
