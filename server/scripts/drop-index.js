const mongoose = require('mongoose');
require('dotenv').config();

const dropIndex = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const collection = mongoose.connection.collection('conversations');

        // Check if index exists
        const indexes = await collection.indexes();
        const indexExists = indexes.some(idx => idx.name === 'participants_1_job_1');

        if (indexExists) {
            console.log('Index participants_1_job_1 found. Dropping...');
            await collection.dropIndex('participants_1_job_1');
            console.log('Index dropped successfully.');
        } else {
            console.log('Index participants_1_job_1 not found.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

dropIndex();
