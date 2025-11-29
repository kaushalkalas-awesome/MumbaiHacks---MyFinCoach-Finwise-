const FIP = require('../models/fip.model');

/**
 * Get all FIPs
 */
const getAllFIPs = async () => {
    try {
        const fips = await FIP.find({ status: 'ACTIVE' }).sort({ name: 1 });
        return fips;
    } catch (error) {
        throw error;
    }
};

/**
 * Get FIP by ID
 */
const getFIPById = async (fipId) => {
    try {
        const fip = await FIP.findOne({ fipId });
        return fip;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAllFIPs,
    getFIPById
};
