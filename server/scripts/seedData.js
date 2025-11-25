const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User, WorkerProfile, CompanyProfile, Job } = require('../models');

dotenv.config();

const seedData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // --- SEED WORKERS ---
        console.log('\n--- Seeding Workers ---');
        for (let i = 1; i <= 5; i++) {
            const email = `worker${i}@test.com`;

            // Cleanup existing
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                await WorkerProfile.deleteOne({ user: existingUser._id });
                await User.deleteOne({ _id: existingUser._id });
                console.log(`Cleaned up existing ${email}`);
            }

            // Create User
            const user = await User.create({
                email,
                password: 'password123',
                role: 'worker',
                status: 'approved',
                isActive: true
            });

            // Create Profile
            await WorkerProfile.create({
                user: user._id,
                fullName: `Test Worker ${i}`,
                phone: `123456789${i}`,
                bio: `I am a skilled test worker number ${i} with expertise in React and Node.js.`,
                skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
                hourlyRate: 20 + i * 5,
                availability: 'available',
                experience: [
                    {
                        title: 'Frontend Developer',
                        company: 'Tech Corp',
                        startDate: new Date('2020-01-01'),
                        current: true,
                        description: 'Building amazing UIs'
                    }
                ]
            });
            console.log(`Created ${email}`);
        }

        // --- SEED COMPANIES ---
        console.log('\n--- Seeding Companies ---');
        for (let i = 1; i <= 5; i++) {
            const email = `company${i}@test.com`;

            // Cleanup existing
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                // Find and delete jobs for this company
                await Job.deleteMany({ company: existingUser._id });
                await CompanyProfile.deleteOne({ user: existingUser._id });
                await User.deleteOne({ _id: existingUser._id });
                console.log(`Cleaned up existing ${email}`);
            }

            // Create User
            const user = await User.create({
                email,
                password: 'password123',
                role: 'company',
                status: 'approved',
                isActive: true
            });

            // Create Profile
            await CompanyProfile.create({
                user: user._id,
                companyName: `Test Company ${i}`,
                industry: 'Technology',
                companySize: '11-50',
                description: `We are a leading tech company number ${i} innovating in the AI space.`,
                website: `https://company${i}.test.com`,
                contactPerson: {
                    name: `Manager ${i}`,
                    position: 'HR Manager',
                    email: `hr@company${i}.test.com`,
                    phone: `987654321${i}`
                }
            });
            console.log(`Created ${email}`);

            // Create Jobs
            const jobCategories = ['Development', 'Design', 'Marketing'];
            for (let j = 1; j <= 3; j++) {
                await Job.create({
                    company: user._id,
                    title: `Senior Developer Role ${j} at Company ${i}`,
                    description: `We are looking for an experienced developer to join our team. This is test job ${j} for company ${i}.`,
                    category: jobCategories[j % 3],
                    tags: ['Remote', 'Full-time', 'React'],
                    salary: 5000 + (j * 1000),
                    salaryType: 'fixed',
                    duration: '3-6 months',
                    experienceLevel: 'intermediate',
                    status: 'posted',
                    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                    requirements: ['3+ years experience', 'Strong communication', 'Team player']
                });
            }
            console.log(`Created 3 jobs for ${email}`);
        }

        console.log('\nSeeding completed successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
