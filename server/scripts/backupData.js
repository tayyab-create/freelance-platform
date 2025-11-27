const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const backupData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(__dirname, '..', 'backups', timestamp);

        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        console.log(`Creating backup in: ${backupDir}`);

        const collections = await mongoose.connection.db.collections();

        for (const collection of collections) {
            const name = collection.collectionName;
            const documents = await collection.find({}).toArray();

            const filePath = path.join(backupDir, `${name}.json`);
            fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));

            console.log(`  - Backed up ${name}: ${documents.length} documents`);
        }

        console.log('\nBackup completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating backup:', error);
        process.exit(1);
    }
};

backupData();
