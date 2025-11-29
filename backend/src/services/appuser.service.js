const AppUser = require('../models/appuser.model');
const Customer = require('../models/customer.model');

/**
 * Create or update app user
 */
async function createOrUpdateAppUser(userData) {
    const { firebaseUid, email, name, phone, userType } = userData;

    // Check if user already exists
    let appUser = await AppUser.findOne({ firebaseUid });

    if (appUser) {
        // Update existing user
        appUser.name = name || appUser.name;
        appUser.phone = phone || appUser.phone;
        appUser.lastLogin = new Date();
        await appUser.save();
        return appUser;
    }

    // Create new app user
    appUser = new AppUser({
        firebaseUid,
        email,
        name,
        phone,
        userType: userType || 'SALARIED'
    });

    // Try to link to existing customer or create new one
    let customer = await Customer.findOne({ email });

    if (!customer) {
        customer = new Customer({
            customerId: `CUST_${Date.now()}`,
            name: name || email.split('@')[0],
            email,
            mobile: phone || '0000000000' // Default mobile if not provided
        });
        await customer.save();
    }

    appUser.customerId = customer._id;
    await appUser.save();

    return appUser;
}

/**
 * Get app user by Firebase UID
 */
async function getAppUserByFirebaseUid(firebaseUid) {
    const appUser = await AppUser.findOne({ firebaseUid })
        .populate('customerId');

    if (!appUser) {
        const error = new Error('User not found');
        error.code = 'USER_NOT_FOUND';
        throw error;
    }

    return appUser;
}

/**
 * Save onboarding answers and calculate literacy score
 */
async function saveOnboardingAnswers(firebaseUid, answers) {
    // Find user without populate to avoid version issues
    const appUser = await AppUser.findOne({ firebaseUid });

    if (!appUser) {
        const error = new Error('User not found');
        error.code = 'USER_NOT_FOUND';
        throw error;
    }

    appUser.onboardingAnswers = answers;
    appUser.financialLiteracyScore = appUser.calculateLiteracyScore();

    await appUser.save();
    return appUser;
}

/**
 * Add associated person
 */
async function addAssociatedPerson(firebaseUid, personData) {
    const appUser = await getAppUserByFirebaseUid(firebaseUid);

    // Check if person already exists
    const exists = appUser.associatedPersons.some(
        p => p.email === personData.email
    );

    if (exists) {
        const error = new Error('Associated person already exists');
        error.code = 'PERSON_EXISTS';
        throw error;
    }

    appUser.associatedPersons.push({
        email: personData.email,
        relationship: personData.relationship || 'OTHER'
    });

    await appUser.save();
    return appUser;
}

/**
 * Remove associated person
 */
async function removeAssociatedPerson(firebaseUid, email) {
    const appUser = await getAppUserByFirebaseUid(firebaseUid);

    appUser.associatedPersons = appUser.associatedPersons.filter(
        p => p.email !== email
    );

    await appUser.save();
    return appUser;
}

/**
 * Update user profile
 */
async function updateUserProfile(firebaseUid, updates) {
    const appUser = await getAppUserByFirebaseUid(firebaseUid);

    const allowedUpdates = ['name', 'phone', 'userType'];
    allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            appUser[field] = updates[field];
        }
    });

    await appUser.save();
    return appUser;
}

module.exports = {
    createOrUpdateAppUser,
    getAppUserByFirebaseUid,
    saveOnboardingAnswers,
    addAssociatedPerson,
    removeAssociatedPerson,
    updateUserProfile
};
