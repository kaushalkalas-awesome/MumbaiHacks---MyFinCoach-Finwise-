const express = require('express');
const router = express.Router();
const {
    createOrUpdateAppUser,
    getAppUserByFirebaseUid,
    saveOnboardingAnswers,
    addAssociatedPerson,
    removeAssociatedPerson,
    updateUserProfile
} = require('../services/appuser.service');

// Middleware to extract Firebase UID from request
const extractFirebaseUid = (req, res, next) => {
    const firebaseUid = req.headers['x-firebase-uid'];

    if (!firebaseUid) {
        return res.status(401).json({
            errorCode: 'MISSING_AUTH',
            errorMsg: 'Firebase UID required in x-firebase-uid header',
            timestamp: new Date().toISOString()
        });
    }

    req.firebaseUid = firebaseUid;
    next();
};

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register or update app user
 */
router.post('/register', async (req, res, next) => {
    try {
        console.log('Registration request:', req.body);

        const { firebaseUid, email, userType } = req.body;

        if (!firebaseUid || !email || !userType) {
            return res.status(400).json({
                errorCode: 'MISSING_FIELDS',
                errorMsg: 'firebaseUid, email, and userType are required',
                timestamp: new Date().toISOString()
            });
        }

        const appUser = await createOrUpdateAppUser(req.body);
        console.log('User registered:', appUser._id);

        res.json({
            success: true,
            user: appUser
        });
    } catch (error) {
        console.error('Registration error:', error);
        next(error);
    }
});

router.get('/me', extractFirebaseUid, async (req, res, next) => {
    try {
        const appUser = await getAppUserByFirebaseUid(req.firebaseUid);
        res.json({
            success: true,
            user: appUser
        });
    } catch (error) {
        next(error);
    }
});

router.put('/me', extractFirebaseUid, async (req, res, next) => {
    try {
        const appUser = await updateUserProfile(req.firebaseUid, req.body);
        res.json({
            success: true,
            user: appUser
        });
    } catch (error) {
        next(error);
    }
});

router.post('/onboarding', extractFirebaseUid, async (req, res, next) => {
    try {
        console.log('Onboarding request for:', req.firebaseUid);
        const { answers } = req.body;
        const appUser = await saveOnboardingAnswers(req.firebaseUid, answers);
        console.log('Onboarding saved, score:', appUser.financialLiteracyScore);

        res.json({
            success: true,
            user: appUser,
            financialLiteracyScore: appUser.financialLiteracyScore
        });
    } catch (error) {
        console.error('Onboarding error:', error);
        next(error);
    }
});

router.post('/associate', extractFirebaseUid, async (req, res, next) => {
    try {
        const appUser = await addAssociatedPerson(req.firebaseUid, req.body);
        res.json({
            success: true,
            user: appUser
        });
    } catch (error) {
        next(error);
    }
});

router.delete('/associate', extractFirebaseUid, async (req, res, next) => {
    try {
        const { email } = req.body;
        const appUser = await removeAssociatedPerson(req.firebaseUid, email);
        res.json({
            success: true,
            user: appUser
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
