require('dotenv').config();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const connectDB = require('../config/database');

// Import models
const FIP = require('../models/fip.model');
const Customer = require('../models/customer.model');
const Account = require('../models/account.model');
const FIData = require('../models/fidata.model');

// Seed data
const seedData = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Connect to database
        await connectDB();

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await FIP.deleteMany({});
        await Customer.deleteMany({});
        await Account.deleteMany({});
        await FIData.deleteMany({});

        // Seed FIPs
        console.log('🏦 Seeding FIPs...');
        const fips = await FIP.insertMany([
            {
                fipId: 'HDFC_BANK',
                name: 'HDFC Bank',
                institutionType: 'BANK',
                status: 'ACTIVE',
                fiTypes: ['DEPOSIT', 'TERM_DEPOSIT', 'RECURRING_DEPOSIT']
            },
            {
                fipId: 'ICICI_BANK',
                name: 'ICICI Bank',
                institutionType: 'BANK',
                status: 'ACTIVE',
                fiTypes: ['DEPOSIT', 'TERM_DEPOSIT']
            },
            {
                fipId: 'SBI_BANK',
                name: 'State Bank of India',
                institutionType: 'BANK',
                status: 'ACTIVE',
                fiTypes: ['DEPOSIT', 'TERM_DEPOSIT', 'RECURRING_DEPOSIT']
            },
            {
                fipId: 'HDFC_MF',
                name: 'HDFC Mutual Fund',
                institutionType: 'MUTUAL_FUND',
                status: 'ACTIVE',
                fiTypes: ['MUTUAL_FUNDS', 'SIP']
            },
            {
                fipId: 'ICICI_PRUDENTIAL',
                name: 'ICICI Prudential Life Insurance',
                institutionType: 'INSURANCE',
                status: 'ACTIVE',
                fiTypes: ['INSURANCE_POLICIES']
            }
        ]);
        console.log(`✅ Created ${fips.length} FIPs`);

        // Seed Customers
        console.log('👥 Seeding Customers...');
        const customers = await Customer.insertMany([
            {
                customerId: 'CUST001',
                name: 'Rajesh Kumar',
                mobile: '+919876543210',
                email: 'rajesh.kumar@example.com'
            },
            {
                customerId: 'CUST002',
                name: 'Priya Sharma',
                mobile: '+919876543211',
                email: 'priya.sharma@example.com'
            },
            {
                customerId: 'CUST003',
                name: 'Amit Patel',
                mobile: '+919876543212',
                email: 'amit.patel@example.com'
            }
        ]);
        console.log(`✅ Created ${customers.length} customers`);

        // Seed Accounts
        console.log('💳 Seeding Accounts...');
        const accounts = [];

        // Rajesh Kumar's accounts
        accounts.push(
            {
                accountId: 'ACC001',
                customerId: customers[0]._id,
                fipId: fips[0]._id, // HDFC Bank
                fiType: 'DEPOSIT',
                maskedAccNumber: 'XXXX1234',
                linkRefNumber: uuidv4(),
                status: 'ACTIVE'
            },
            {
                accountId: 'ACC002',
                customerId: customers[0]._id,
                fipId: fips[1]._id, // ICICI Bank
                fiType: 'DEPOSIT',
                maskedAccNumber: 'XXXX5678',
                linkRefNumber: uuidv4(),
                status: 'ACTIVE'
            },
            {
                accountId: 'ACC003',
                customerId: customers[0]._id,
                fipId: fips[3]._id, // HDFC MF
                fiType: 'MUTUAL_FUNDS',
                maskedAccNumber: 'XXXX9012',
                linkRefNumber: uuidv4(),
                status: 'ACTIVE'
            }
        );

        // Priya Sharma's accounts
        accounts.push(
            {
                accountId: 'ACC004',
                customerId: customers[1]._id,
                fipId: fips[2]._id, // SBI
                fiType: 'DEPOSIT',
                maskedAccNumber: 'XXXX3456',
                linkRefNumber: uuidv4(),
                status: 'ACTIVE'
            },
            {
                accountId: 'ACC005',
                customerId: customers[1]._id,
                fipId: fips[0]._id, // HDFC Bank
                fiType: 'TERM_DEPOSIT',
                maskedAccNumber: 'XXXX7890',
                linkRefNumber: uuidv4(),
                status: 'ACTIVE'
            },
            {
                accountId: 'ACC006',
                customerId: customers[1]._id,
                fipId: fips[4]._id, // ICICI Prudential
                fiType: 'INSURANCE_POLICIES',
                maskedAccNumber: 'XXXX1111',
                linkRefNumber: uuidv4(),
                status: 'ACTIVE'
            }
        );

        // Amit Patel's accounts
        accounts.push(
            {
                accountId: 'ACC007',
                customerId: customers[2]._id,
                fipId: fips[1]._id, // ICICI Bank
                fiType: 'DEPOSIT',
                maskedAccNumber: 'XXXX2222',
                linkRefNumber: uuidv4(),
                status: 'ACTIVE'
            },
            {
                accountId: 'ACC008',
                customerId: customers[2]._id,
                fipId: fips[2]._id, // SBI
                fiType: 'RECURRING_DEPOSIT',
                maskedAccNumber: 'XXXX3333',
                linkRefNumber: uuidv4(),
                status: 'ACTIVE'
            },
            {
                accountId: 'ACC009',
                customerId: customers[2]._id,
                fipId: fips[3]._id, // HDFC MF
                fiType: 'SIP',
                maskedAccNumber: 'XXXX4444',
                linkRefNumber: uuidv4(),
                status: 'ACTIVE'
            }
        );

        const createdAccounts = await Account.insertMany(accounts);
        console.log(`✅ Created ${createdAccounts.length} accounts`);

        // Seed FI Data (mock transactions)
        console.log('💰 Seeding FI Data (transactions)...');
        const fiDataRecords = [];
        const merchants = ['Amazon', 'Flipkart', 'Swiggy', 'Uber', 'Netflix', 'Spotify', 'Salary', 'Rent', 'Utilities', 'Groceries'];

        // Generate transactions for each DEPOSIT account
        const depositAccounts = createdAccounts.filter(acc => acc.fiType === 'DEPOSIT');

        for (const account of depositAccounts) {
            // Generate 50-100 transactions over the last 12 months
            const numTransactions = Math.floor(Math.random() * 50) + 50;

            for (let i = 0; i < numTransactions; i++) {
                const daysAgo = Math.floor(Math.random() * 365);
                const transactionDate = new Date();
                transactionDate.setDate(transactionDate.getDate() - daysAgo);

                const isCredit = Math.random() > 0.6; // 40% credit, 60% debit
                const amount = isCredit
                    ? Math.floor(Math.random() * 50000) + 5000 // Credits: 5k-55k
                    : Math.floor(Math.random() * 5000) + 100;  // Debits: 100-5100

                const merchant = merchants[Math.floor(Math.random() * merchants.length)];

                fiDataRecords.push({
                    accountId: account._id,
                    transactionDate,
                    amount,
                    type: isCredit ? 'CREDIT' : 'DEBIT',
                    payload: {
                        merchant: isCredit ? 'Salary/Transfer' : merchant,
                        description: isCredit ? 'Credit transaction' : `Payment to ${merchant}`,
                        mode: Math.random() > 0.5 ? 'UPI' : 'NEFT',
                        reference: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                        balance: Math.floor(Math.random() * 100000) + 10000
                    }
                });
            }
        }

        // Generate mutual fund data
        const mfAccounts = createdAccounts.filter(acc => acc.fiType === 'MUTUAL_FUNDS' || acc.fiType === 'SIP');

        for (const account of mfAccounts) {
            // Generate monthly NAV records for last 12 months
            for (let month = 0; month < 12; month++) {
                const transactionDate = new Date();
                transactionDate.setMonth(transactionDate.getMonth() - month);

                const units = 100 + (month * 10);
                const nav = 50 + Math.random() * 20;

                fiDataRecords.push({
                    accountId: account._id,
                    transactionDate,
                    amount: units * nav,
                    type: 'CREDIT',
                    payload: {
                        schemeName: 'HDFC Equity Fund',
                        units,
                        nav: nav.toFixed(2),
                        currentValue: (units * nav).toFixed(2),
                        folioNumber: `FOL${Math.random().toString(36).substr(2, 9).toUpperCase()}`
                    }
                });
            }
        }

        const createdFIData = await FIData.insertMany(fiDataRecords);
        console.log(`✅ Created ${createdFIData.length} FI data records`);

        console.log('\n✨ Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - FIPs: ${fips.length}`);
        console.log(`   - Customers: ${customers.length}`);
        console.log(`   - Accounts: ${createdAccounts.length}`);
        console.log(`   - FI Data Records: ${createdFIData.length}`);
        console.log('\n💡 Test Credentials:');
        console.log(`   - Customer ID: CUST001 (Rajesh Kumar)`);
        console.log(`   - Customer ID: CUST002 (Priya Sharma)`);
        console.log(`   - Customer ID: CUST003 (Amit Patel)`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run seed
seedData();
