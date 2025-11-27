const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const updatePasswords = async () => {
    try {
        await connectDB();

        const users = await User.find({});
        console.log(`Found ${users.length} users. Updating passwords...`);

        let count = 0;
        for (const user of users) {
            user.password = '123456';
            await user.save();
            count++;
            process.stdout.write(`\rUpdated ${count}/${users.length} users`);
        }

        console.log('\nAll passwords updated successfully to "123456"');
        process.exit(0);
    } catch (error) {
        console.error('Error updating passwords:', error);
        process.exit(1);
    }
};

updatePasswords();
