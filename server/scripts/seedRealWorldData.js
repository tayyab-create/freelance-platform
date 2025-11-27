const mongoose = require('mongoose');
const dotenv = require('dotenv');
const {
    User,
    WorkerProfile,
    CompanyProfile,
    Job,
    Application,
    Review,
    Conversation,
    Message,
    Submission
} = require('../models');

dotenv.config();

// --- HELPER TO GENERATE TEST DATA ---
const generateTestWorkers = () => {
    const workers = [];
    for (let i = 1; i <= 5; i++) {
        workers.push({
            name: `Test Worker ${i}`,
            email: `worker${i}@test.com`,
            title: `Test Worker Role ${i}`,
            bio: `I am a skilled test worker number ${i} with expertise in React and Node.js.`,
            skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
            hourlyRate: 20 + i * 5,
            experience: [
                {
                    title: 'Frontend Developer',
                    company: 'Tech Corp',
                    startDate: new Date('2020-01-01'),
                    current: true,
                    description: 'Building amazing UIs'
                }
            ],
            certifications: []
        });
    }
    return workers;
};

const generateTestCompanies = () => {
    const companies = [];
    const jobCategories = ['Development', 'Design', 'Marketing'];

    for (let i = 1; i <= 5; i++) {
        const jobs = [];
        for (let j = 1; j <= 3; j++) {
            jobs.push({
                title: `Senior Developer Role ${j} at Company ${i}`,
                description: `We are looking for an experienced developer to join our team. This is test job ${j} for company ${i}.`,
                category: jobCategories[j % 3],
                tags: ['Remote', 'Full-time', 'React'],
                salary: 5000 + (j * 1000),
                salaryType: 'fixed',
                duration: '3-6 months',
                experienceLevel: 'intermediate',
                requirements: ['3+ years experience', 'Strong communication', 'Team player']
            });
        }

        companies.push({
            name: `Test Company ${i}`,
            email: `company${i}@test.com`,
            industry: 'Technology',
            description: `We are a leading tech company number ${i} innovating in the AI space.`,
            website: `https://company${i}.test.com`,
            location: 'Test City',
            jobs: jobs
        });
    }
    return companies;
};

const realWorldData = {
    workers: [
        // --- USER REQUESTED ACCOUNT ---
        {
            name: "Tayyab Ali",
            email: "tayyabofficial78@gmail.com",
            title: "Lead Full Stack Engineer",
            bio: "Experienced Full Stack Engineer with a proven track record of delivering scalable web applications. Expert in the MERN stack, cloud infrastructure, and system architecture.",
            skills: ["React", "Node.js", "MongoDB", "Express", "AWS", "Docker", "System Design"],
            hourlyRate: 150,
            experience: [
                {
                    title: "Senior Software Engineer",
                    company: "Tech Innovators",
                    startDate: new Date("2019-01-01"),
                    current: true,
                    description: "Leading development of core platform features."
                }
            ],
            certifications: [
                {
                    title: "AWS Certified Solutions Architect",
                    issuedBy: "Amazon",
                    issuedDate: new Date("2023-01-15")
                }
            ]
        },
        // --- ORIGINAL TEST WORKERS ---
        ...generateTestWorkers(),
        // --- REAL WORLD WORKERS ---
        {
            name: "Alex Thompson",
            email: "alex.thompson@example.com",
            title: "Senior Full Stack Developer",
            bio: "Passionate Full Stack Developer with 8+ years of experience in building scalable web applications. Expert in MERN stack and cloud architecture. I love solving complex problems and mentoring junior developers.",
            skills: ["React", "Node.js", "MongoDB", "AWS", "TypeScript", "Docker", "GraphQL"],
            hourlyRate: 85,
            experience: [
                {
                    title: "Senior Developer",
                    company: "TechGiant Corp",
                    startDate: new Date("2020-03-01"),
                    current: true,
                    description: "Leading a team of 5 developers, architecting microservices, and improving system performance by 40%."
                },
                {
                    title: "Web Developer",
                    company: "StartUp Inc",
                    startDate: new Date("2017-06-01"),
                    endDate: new Date("2020-02-28"),
                    current: false,
                    description: "Developed and maintained multiple client-facing web applications using React and Express."
                }
            ],
            certifications: [
                {
                    title: "AWS Certified Solutions Architect",
                    issuedBy: "Amazon Web Services",
                    issuedDate: new Date("2022-05-15")
                }
            ]
        },
        {
            name: "Sarah Chen",
            email: "sarah.chen@example.com",
            title: "UI/UX Designer",
            bio: "Creative UI/UX Designer focused on creating intuitive and visually stunning user experiences. I believe good design is invisible. Proficient in Figma, Adobe XD, and Prototyping.",
            skills: ["UI Design", "UX Research", "Figma", "Adobe XD", "Prototyping", "Wireframing", "HTML/CSS"],
            hourlyRate: 65,
            experience: [
                {
                    title: "Lead Designer",
                    company: "Creative Studio",
                    startDate: new Date("2019-01-15"),
                    current: true,
                    description: "Spearheading design projects for Fortune 500 clients, conducting user research, and creating high-fidelity mockups."
                }
            ],
            certifications: [
                {
                    title: "Google UX Design Professional Certificate",
                    issuedBy: "Google",
                    issuedDate: new Date("2021-08-20")
                }
            ]
        },
        {
            name: "Michael Rodriguez",
            email: "michael.r@example.com",
            title: "DevOps Engineer",
            bio: "DevOps Engineer specializing in CI/CD pipelines, infrastructure as code, and cloud automation. I help teams ship code faster and more reliably.",
            skills: ["Kubernetes", "Jenkins", "Terraform", "Azure", "Python", "Bash Scripting", "Linux"],
            hourlyRate: 95,
            experience: [
                {
                    title: "DevOps Specialist",
                    company: "Cloud Systems",
                    startDate: new Date("2021-04-01"),
                    current: true,
                    description: "Managing cloud infrastructure for high-traffic applications, optimizing costs, and ensuring 99.99% uptime."
                }
            ],
            certifications: []
        },
        {
            name: "Emily Parker",
            email: "emily.parker@example.com",
            title: "Content Marketing Manager",
            bio: "Strategic Content Marketer with a knack for storytelling and SEO. I help brands find their voice and grow their audience through compelling content.",
            skills: ["Content Strategy", "SEO", "Copywriting", "Social Media Marketing", "Google Analytics", "Email Marketing"],
            hourlyRate: 55,
            experience: [
                {
                    title: "Content Lead",
                    company: "Growth Marketing Agency",
                    startDate: new Date("2018-09-01"),
                    current: true,
                    description: "Developing content strategies that increased organic traffic by 150% within one year."
                }
            ],
            certifications: [
                {
                    title: "HubSpot Content Marketing Certification",
                    issuedBy: "HubSpot",
                    issuedDate: new Date("2020-11-10")
                }
            ]
        },
        {
            name: "David Kim",
            email: "david.kim@example.com",
            title: "Mobile App Developer",
            bio: "iOS and Android developer with a passion for building smooth, native-feeling mobile experiences. Expert in React Native and Swift.",
            skills: ["React Native", "Swift", "Kotlin", "Mobile UI", "Redux", "Firebase"],
            hourlyRate: 75,
            experience: [
                {
                    title: "Mobile Engineer",
                    company: "AppWorks",
                    startDate: new Date("2020-07-01"),
                    current: true,
                    description: "Built and launched 5+ successful mobile apps on App Store and Play Store."
                }
            ],
            certifications: []
        },
        {
            name: "Jessica Walsh",
            email: "jessica.walsh@example.com",
            title: "Data Scientist",
            bio: "Data Scientist who loves turning raw data into actionable insights. Experienced in machine learning, statistical analysis, and data visualization.",
            skills: ["Python", "Machine Learning", "SQL", "Pandas", "Tableau", "Data Analysis", "TensorFlow"],
            hourlyRate: 100,
            experience: [
                {
                    title: "Data Analyst",
                    company: "FinTech Solutions",
                    startDate: new Date("2019-05-01"),
                    current: true,
                    description: "Analyzing financial data to detect fraud patterns and improve risk assessment models."
                }
            ],
            certifications: []
        },
        {
            name: "James Wilson",
            email: "james.wilson@example.com",
            title: "Frontend Developer",
            bio: "Frontend specialist with a keen eye for detail. I build responsive, accessible, and performant web interfaces using modern JavaScript frameworks.",
            skills: ["Vue.js", "JavaScript", "HTML5", "CSS3", "SASS", "Webpack", "Accessibility"],
            hourlyRate: 60,
            experience: [],
            certifications: []
        },
        {
            name: "Lisa Anderson",
            email: "lisa.anderson@example.com",
            title: "Project Manager",
            bio: "Certified Scrum Master and Project Manager with experience leading agile teams to deliver software projects on time and within budget.",
            skills: ["Agile", "Scrum", "JIRA", "Project Management", "Team Leadership", "Communication"],
            hourlyRate: 70,
            experience: [
                {
                    title: "Project Manager",
                    company: "Software House",
                    startDate: new Date("2016-02-01"),
                    current: true,
                    description: "Overseeing multiple software development projects, managing stakeholders, and facilitating sprint ceremonies."
                }
            ],
            certifications: [
                {
                    title: "PMP Certification",
                    issuedBy: "PMI",
                    issuedDate: new Date("2018-06-15")
                }
            ]
        },
        {
            name: "Robert Taylor",
            email: "robert.taylor@example.com",
            title: "Cybersecurity Analyst",
            bio: "Security professional dedicated to protecting systems and networks from cyber threats. Skilled in penetration testing and vulnerability assessment.",
            skills: ["Network Security", "Penetration Testing", "Ethical Hacking", "Firewalls", "Security Auditing"],
            hourlyRate: 110,
            experience: [],
            certifications: [
                {
                    title: "Certified Ethical Hacker (CEH)",
                    issuedBy: "EC-Council",
                    issuedDate: new Date("2021-03-10")
                }
            ]
        },
        {
            name: "Maria Garcia",
            email: "maria.garcia@example.com",
            title: "Graphic Designer",
            bio: "Visual storyteller with a background in branding and illustration. I create designs that communicate ideas and inspire audiences.",
            skills: ["Adobe Illustrator", "Photoshop", "InDesign", "Branding", "Illustration", "Typography"],
            hourlyRate: 50,
            experience: [
                {
                    title: "Senior Graphic Designer",
                    company: "Design Co",
                    startDate: new Date("2018-11-01"),
                    current: true,
                    description: "Leading branding initiatives and creating marketing collateral for diverse clients."
                }
            ],
            certifications: []
        }
    ],
    companies: [
        // --- ORIGINAL TEST COMPANIES ---
        ...generateTestCompanies(),
        // --- REAL WORLD COMPANIES ---
        {
            name: "TechFlow Solutions",
            email: "contact@techflow.com",
            industry: "Software Development",
            description: "TechFlow Solutions is a premier software development firm specializing in custom enterprise applications. We partner with businesses to drive digital transformation through innovative technology solutions.",
            website: "https://techflow.example.com",
            location: "San Francisco, CA",
            jobs: [
                {
                    title: "Senior React Developer",
                    description: "We are looking for a Senior React Developer to join our core product team. You will be responsible for building high-performance user interfaces and collaborating with backend engineers to deliver seamless experiences.\n\nKey Responsibilities:\n- Develop new features using React and Redux\n- Optimize application for maximum speed and scalability\n- Mentor junior developers\n\nRequirements:\n- 5+ years of experience with JavaScript\n- Deep understanding of React and its core principles\n- Experience with RESTful APIs",
                    category: "Development",
                    tags: ["React", "Redux", "Frontend", "Remote"],
                    salary: 120000,
                    salaryType: "fixed",
                    duration: "6 months",
                    experienceLevel: "expert",
                    requirements: ["5+ years React experience", "Strong TypeScript skills", "Experience with state management"]
                },
                {
                    title: "Node.js Backend Engineer",
                    description: "Join our backend team to build robust APIs and microservices. You will work with Node.js, Express, and MongoDB to power our enterprise applications.",
                    category: "Development",
                    tags: ["Node.js", "Backend", "API", "MongoDB"],
                    salary: 60,
                    salaryType: "hourly",
                    duration: "3-6 months",
                    experienceLevel: "intermediate",
                    requirements: ["Strong Node.js knowledge", "Experience with MongoDB", "API design best practices"]
                }
            ]
        },
        {
            name: "Creative Minds Agency",
            email: "hello@creativeminds.com",
            industry: "Design & Creative",
            description: "Creative Minds is a full-service design agency helping brands tell their stories. From logo design to full web experiences, we craft visuals that matter.",
            website: "https://creativeminds.example.com",
            location: "New York, NY",
            jobs: [
                {
                    title: "Product Designer",
                    description: "We need a talented Product Designer to help us redesign a major e-commerce platform. You will work on user flows, wireframes, and high-fidelity UI designs.",
                    category: "Design",
                    tags: ["UI/UX", "Figma", "E-commerce", "Web Design"],
                    salary: 8000,
                    salaryType: "fixed",
                    duration: "2 months",
                    experienceLevel: "intermediate",
                    requirements: ["Portfolio demonstrating UI/UX work", "Proficiency in Figma", "Understanding of design systems"]
                },
                {
                    title: "Brand Identity Designer",
                    description: "Looking for a creative designer to develop a complete brand identity for a new fintech startup. Includes logo, color palette, typography, and brand guidelines.",
                    category: "Design",
                    tags: ["Branding", "Logo Design", "Identity", "Graphic Design"],
                    salary: 4500,
                    salaryType: "fixed",
                    duration: "1 month",
                    experienceLevel: "expert",
                    requirements: ["Strong branding portfolio", "Experience with fintech is a plus", "Adobe Creative Suite mastery"]
                }
            ]
        },
        {
            name: "Global Systems Inc",
            email: "careers@globalsystems.com",
            industry: "Enterprise Solutions",
            description: "Global Systems Inc provides scalable cloud infrastructure and IT consulting services to multinational corporations.",
            website: "https://globalsystems.example.com",
            location: "Austin, TX",
            jobs: [
                {
                    title: "Cloud Infrastructure Engineer",
                    description: "We are seeking a Cloud Engineer to assist in migrating legacy systems to AWS. You will be responsible for setting up EC2 instances, RDS databases, and configuring VPCs.",
                    category: "Development",
                    tags: ["AWS", "Cloud", "DevOps", "Migration"],
                    salary: 100,
                    salaryType: "hourly",
                    duration: "6+ months",
                    experienceLevel: "expert",
                    requirements: ["AWS Certified", "Experience with large scale migrations", "Terraform knowledge"]
                }
            ]
        },
        {
            name: "Digital Horizon",
            email: "info@digitalhorizon.com",
            industry: "Digital Marketing",
            description: "Digital Horizon is a data-driven marketing agency. We specialize in SEO, PPC, and content marketing strategies that deliver measurable ROI.",
            website: "https://digitalhorizon.example.com",
            location: "Chicago, IL",
            jobs: [
                {
                    title: "SEO Manager",
                    description: "Manage SEO strategy for our top clients. Conduct site audits, keyword research, and implement on-page optimization strategies.",
                    category: "Marketing",
                    tags: ["SEO", "Marketing", "Analytics", "Strategy"],
                    salary: 50,
                    salaryType: "hourly",
                    duration: "Ongoing",
                    experienceLevel: "intermediate",
                    requirements: ["Proven SEO track record", "Familiarity with SEO tools (Ahrefs, SEMrush)", "Analytical mindset"]
                },
                {
                    title: "Technical Writer",
                    description: "We need a technical writer to create comprehensive documentation and blog posts for a SaaS client. Topics include API usage and cloud computing.",
                    category: "Writing",
                    tags: ["Writing", "Technical", "SaaS", "Documentation"],
                    salary: 2000,
                    salaryType: "fixed",
                    duration: "1 month",
                    experienceLevel: "intermediate",
                    requirements: ["Technical background", "Excellent writing skills", "Ability to simplify complex topics"]
                }
            ]
        },
        {
            name: "EcoTech Innovations",
            email: "jobs@ecotech.com",
            industry: "Green Technology",
            description: "EcoTech Innovations is dedicated to developing sustainable technology solutions for a better planet. We work on renewable energy software and smart grid systems.",
            website: "https://ecotech.example.com",
            location: "Seattle, WA",
            jobs: [
                {
                    title: "Machine Learning Engineer",
                    description: "Help us build predictive models for energy consumption. You will work with large datasets to train and deploy ML models.",
                    category: "Data Science",
                    tags: ["Machine Learning", "Python", "Data Science", "Energy"],
                    salary: 15000,
                    salaryType: "fixed",
                    duration: "4 months",
                    experienceLevel: "expert",
                    requirements: ["Strong ML background", "Python proficiency", "Experience with time-series data"]
                }
            ]
        }
    ]
};

const seedRealWorldData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // --- FULL CLEANUP ---
        console.log('Cleaning up database (Full Wipe)...');
        await Promise.all([
            User.deleteMany({}),
            WorkerProfile.deleteMany({}),
            CompanyProfile.deleteMany({}),
            Job.deleteMany({}),
            Application.deleteMany({}),
            Review.deleteMany({}),
            Conversation.deleteMany({}),
            Message.deleteMany({}),
            Submission.deleteMany({})
        ]);
        console.log('Database cleaned.');

        const createdWorkers = [];
        const createdCompanies = [];
        const createdJobs = [];

        // --- CREATE WORKERS ---
        console.log('\n--- Seeding Workers ---');
        for (const workerData of realWorldData.workers) {
            const user = await User.create({
                email: workerData.email,
                password: '12345678', // UPDATED PASSWORD FOR ALL
                role: 'worker',
                status: 'approved',
                isActive: true
            });

            const profile = await WorkerProfile.create({
                user: user._id,
                fullName: workerData.name,
                phone: '123-456-7890',
                bio: workerData.bio,
                skills: workerData.skills,
                hourlyRate: workerData.hourlyRate,
                availability: 'available',
                experience: workerData.experience,
                certifications: workerData.certifications
            });

            createdWorkers.push({ user, profile });
            console.log(`Created worker: ${workerData.name} (${workerData.email})`);
        }

        // --- CREATE COMPANIES & JOBS ---
        console.log('\n--- Seeding Companies & Jobs ---');
        for (const companyData of realWorldData.companies) {
            const user = await User.create({
                email: companyData.email,
                password: '12345678', // UPDATED PASSWORD FOR ALL
                role: 'company',
                status: 'approved',
                isActive: true
            });

            const profile = await CompanyProfile.create({
                user: user._id,
                companyName: companyData.name,
                industry: companyData.industry,
                companySize: '11-50',
                description: companyData.description,
                website: companyData.website,
                contactPerson: {
                    name: 'Hiring Manager',
                    position: 'HR',
                    email: companyData.email,
                    phone: '987-654-3210'
                }
            });

            createdCompanies.push({ user, profile });
            console.log(`Created company: ${companyData.name} (${companyData.email})`);

            for (const jobData of companyData.jobs) {
                const job = await Job.create({
                    company: user._id,
                    title: jobData.title,
                    description: jobData.description,
                    category: jobData.category,
                    tags: jobData.tags,
                    salary: jobData.salary,
                    salaryType: jobData.salaryType,
                    duration: jobData.duration,
                    experienceLevel: jobData.experienceLevel,
                    status: 'posted',
                    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                    requirements: jobData.requirements,
                    isActive: true
                });
                createdJobs.push(job);
                console.log(`  - Posted job: ${jobData.title}`);
            }
        }

        // --- CREATE APPLICATIONS ---
        console.log('\n--- Seeding Applications ---');
        // Randomly apply workers to jobs
        for (const job of createdJobs) {
            // Pick 2-4 random workers to apply
            const numApplicants = Math.floor(Math.random() * 3) + 2;
            const shuffledWorkers = createdWorkers.sort(() => 0.5 - Math.random());
            const applicants = shuffledWorkers.slice(0, numApplicants);

            for (const applicant of applicants) {
                await Application.create({
                    job: job._id,
                    worker: applicant.user._id,
                    proposal: `I am writing to express my strong interest in the ${job.title} position. With my background in ${applicant.profile.skills[0] || 'relevant skills'} and ${applicant.profile.skills[1] || 'technologies'}, I am confident in my ability to deliver high-quality results. I have reviewed the project requirements and I am ready to start immediately. I look forward to the opportunity to discuss how I can contribute to your team.`,
                    coverLetter: `I am very interested in the ${job.title} position. I believe my skills in ${applicant.profile.skills.slice(0, 2).join(', ')} make me a great fit.`,
                    proposedRate: job.salaryType === 'fixed' ? job.salary : applicant.profile.hourlyRate,
                    status: 'pending',
                    estimatedDuration: job.duration
                });

                // Update job application count
                await Job.findByIdAndUpdate(job._id, { $inc: { totalApplications: 1 } });
            }
            console.log(`Created ${numApplicants} applications for job: ${job.title}`);
        }

        console.log('\n--- Real World Data Seeding Completed Successfully! ---');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedRealWorldData();
