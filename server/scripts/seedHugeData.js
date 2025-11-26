const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');
const { User, WorkerProfile, CompanyProfile, Job } = require('../models');

dotenv.config();

const NUM_WORKERS = 50;
const NUM_COMPANIES = 20;
const JOBS_PER_COMPANY_MIN = 3;
const JOBS_PER_COMPANY_MAX = 8;

const SKILLS_LIST = [
    'React', 'Node.js', 'Python', 'Java', 'C++', 'AWS', 'Docker', 'Kubernetes',
    'Figma', 'UI/UX', 'Adobe XD', 'Photoshop',
    'SEO', 'Content Writing', 'Digital Marketing', 'Social Media',
    'Data Analysis', 'Machine Learning', 'SQL', 'MongoDB'
];

const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Marketing', 'Consulting'];
const JOB_CATEGORIES = ['Development', 'Design', 'Marketing', 'Writing', 'Data Science', 'Business'];

const getRandomSubset = (arr, min, max) => {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    return shuffled.slice(0, count);
};

const seedHugeData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        console.log(`\nStarting generation of ${NUM_WORKERS} workers and ${NUM_COMPANIES} companies...`);

        // --- SEED WORKERS ---
        console.log('\n--- Seeding Workers ---');
        const workers = [];
        for (let i = 0; i < NUM_WORKERS; i++) {
            const email = faker.internet.email();
            const password = 'password123'; // Default password for all

            const user = await User.create({
                email,
                password,
                role: 'worker',
                status: 'approved',
                isActive: true
            });

            const fullName = faker.person.fullName();
            const skills = getRandomSubset(SKILLS_LIST, 3, 8);

            await WorkerProfile.create({
                user: user._id,
                fullName,
                phone: faker.phone.number(),
                bio: faker.person.bio(),
                skills,
                hourlyRate: faker.number.int({ min: 15, max: 150 }),
                availability: faker.helpers.arrayElement(['available', 'busy', 'not-available']),
                totalJobsCompleted: faker.number.int({ min: 0, max: 50 }),
                averageRating: faker.number.float({ min: 3.5, max: 5, precision: 0.1 }),
                totalReviews: faker.number.int({ min: 0, max: 20 }),
                experience: [
                    {
                        title: faker.person.jobTitle(),
                        company: faker.company.name(),
                        startDate: faker.date.past({ years: 5 }),
                        current: true,
                        description: faker.lorem.sentence()
                    }
                ],
                githubProfile: `https://github.com/${faker.internet.userName()}`,
                linkedinProfile: `https://linkedin.com/in/${faker.internet.userName()}`
            });

            workers.push(user);
            process.stdout.write('.');
        }
        console.log(`\nCreated ${workers.length} workers.`);

        // --- SEED COMPANIES & JOBS ---
        console.log('\n--- Seeding Companies and Jobs ---');
        for (let i = 0; i < NUM_COMPANIES; i++) {
            const email = faker.internet.email();
            const password = 'password123';

            const user = await User.create({
                email,
                password,
                role: 'company',
                status: 'approved',
                isActive: true
            });

            const companyName = faker.company.name();

            await CompanyProfile.create({
                user: user._id,
                companyName,
                industry: faker.helpers.arrayElement(INDUSTRIES),
                companySize: faker.helpers.arrayElement(['1-10', '11-50', '51-200', '201-500', '500+']),
                description: faker.company.catchPhrase(),
                website: faker.internet.url(),
                contactPerson: {
                    name: faker.person.fullName(),
                    position: faker.person.jobTitle(),
                    email: faker.internet.email(),
                    phone: faker.phone.number()
                },
                address: {
                    street: faker.location.streetAddress(),
                    city: faker.location.city(),
                    state: faker.location.state(),
                    country: faker.location.country(),
                    zipCode: faker.location.zipCode()
                }
            });

            // Create Jobs for this company
            const numJobs = faker.number.int({ min: JOBS_PER_COMPANY_MIN, max: JOBS_PER_COMPANY_MAX });
            for (let j = 0; j < numJobs; j++) {
                const jobTitle = faker.person.jobTitle();
                const jobCategory = faker.helpers.arrayElement(JOB_CATEGORIES);

                await Job.create({
                    company: user._id,
                    title: jobTitle,
                    description: faker.lorem.paragraphs(2),
                    category: jobCategory,
                    tags: getRandomSubset(SKILLS_LIST, 2, 5),
                    salary: faker.number.int({ min: 1000, max: 10000 }),
                    salaryType: faker.helpers.arrayElement(['fixed', 'hourly']),
                    duration: faker.helpers.arrayElement(['1-3 months', '3-6 months', '6+ months']),
                    experienceLevel: faker.helpers.arrayElement(['entry', 'intermediate', 'expert']),
                    status: 'posted',
                    deadline: faker.date.future({ years: 0.5 }),
                    requirements: [faker.lorem.sentence(), faker.lorem.sentence(), faker.lorem.sentence()],
                    isActive: true
                });
            }
            process.stdout.write('.');
        }
        console.log(`\nCreated ${NUM_COMPANIES} companies with jobs.`);

        console.log('\nHuge data seeding completed successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedHugeData();
