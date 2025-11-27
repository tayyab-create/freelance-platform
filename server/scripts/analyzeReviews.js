const mongoose = require('mongoose');
const Review = require('../models/Review');
require('dotenv').config();

const analyzeReviews = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        // Get all reviews
        const allReviews = await Review.find({}).lean();
        console.log(`📊 Total reviews in database: ${allReviews.length}\n`);

        // Check for reviews without reviewedBy field
        const reviewsWithoutReviewedBy = allReviews.filter(r => !r.reviewedBy);
        if (reviewsWithoutReviewedBy.length > 0) {
            console.log(`⚠️  Found ${reviewsWithoutReviewedBy.length} reviews WITHOUT reviewedBy field:`);
            reviewsWithoutReviewedBy.forEach(r => {
                console.log(`   - Review ID: ${r._id}, Job: ${r.job}, Worker: ${r.worker}, Company: ${r.company}`);
            });
            console.log();
        } else {
            console.log('✅ All reviews have reviewedBy field\n');
        }

        // Check for potential duplicates based on (job, worker, reviewedBy)
        const reviewKeys = {};
        const duplicates = [];

        allReviews.forEach(review => {
            const key = `${review.job}_${review.worker}_${review.reviewedBy || 'undefined'}`;
            if (reviewKeys[key]) {
                duplicates.push({
                    key,
                    reviews: [reviewKeys[key], review]
                });
            } else {
                reviewKeys[key] = review;
            }
        });

        if (duplicates.length > 0) {
            console.log(`⚠️  Found ${duplicates.length} DUPLICATE review combinations:`);
            duplicates.forEach(dup => {
                console.log(`   - Key: ${dup.key}`);
                dup.reviews.forEach(r => {
                    console.log(`     Review ID: ${r._id}, Created: ${r.createdAt}`);
                });
            });
            console.log();
        } else {
            console.log('✅ No duplicate reviews found\n');
        }

        // Group by reviewedBy
        const byReviewedBy = allReviews.reduce((acc, r) => {
            const key = r.reviewedBy || 'undefined';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        console.log('📈 Reviews by type:');
        Object.entries(byReviewedBy).forEach(([type, count]) => {
            console.log(`   - ${type}: ${count}`);
        });
        console.log();

        // Summary
        console.log('═══════════════════════════════════════');
        console.log('SUMMARY:');
        console.log(`Total Reviews: ${allReviews.length}`);
        console.log(`Missing reviewedBy: ${reviewsWithoutReviewedBy.length}`);
        console.log(`Duplicates: ${duplicates.length}`);
        console.log('═══════════════════════════════════════');

        if (reviewsWithoutReviewedBy.length > 0 || duplicates.length > 0) {
            console.log('\n⚠️  ACTION REQUIRED: Run the cleanup script to fix these issues');
        } else {
            console.log('\n✅ Database is clean! No action required.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error analyzing reviews:', error);
        process.exit(1);
    }
};

analyzeReviews();
