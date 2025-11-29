const mongoose = require('mongoose');

const appUserSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    name: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    userType: {
        type: String,
        enum: ['GIG_WORKER', 'FREELANCER', 'BUSINESS_OWNER', 'SALARIED', 'STUDENT'],
        required: true
    },
    onboardingAnswers: [{
        question: {
            type: String,
            required: true
        },
        answer: {
            type: String,
            required: true
        }
    }],
    financialLiteracyScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    associatedPersons: [{
        email: {
            type: String,
            required: true,
            lowercase: true
        },
        relationship: {
            type: String,
            enum: ['FAMILY', 'ACCOUNTANT', 'FINANCIAL_ADVISOR', 'OTHER']
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Calculate financial literacy score based on onboarding answers
appUserSchema.methods.calculateLiteracyScore = function () {
    if (!this.onboardingAnswers || this.onboardingAnswers.length === 0) {
        return 0;
    }

    // Simple scoring logic - can be enhanced with ML
    let score = 0;
    const totalQuestions = this.onboardingAnswers.length;

    this.onboardingAnswers.forEach(answer => {
        // Award points for financial awareness indicators
        if (answer.answer.toLowerCase().includes('yes') ||
            answer.answer.toLowerCase().includes('track') ||
            answer.answer.toLowerCase().includes('save')) {
            score += 20;
        }
    });

    return Math.min(100, Math.round(score / totalQuestions * 100));
};

const AppUser = mongoose.model('AppUser', appUserSchema);

module.exports = AppUser;
