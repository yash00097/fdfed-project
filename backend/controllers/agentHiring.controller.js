import AgentApplication from '../models/agentApplication.model.js';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import { sendEmail } from '../utils/emailService.js';
import fs from 'fs';
import path from 'path';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const normalizeEmail = (email = '') => email.toLowerCase().trim();

const normalizeNamePart = (value = '') =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const normalizeText = (value = '') =>
  typeof value === 'string' ? value.trim() : '';

const isValidDateString = (value = '') => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const isHttpUrl = (value = '') => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const getReservedAgentEmails = async (excludedApplicationId = null) => {
  const reservedEmails = new Set();

  const users = await User.find({}, 'email');
  users.forEach((user) => {
    const email = normalizeEmail(user.email);
    if (email) reservedEmails.add(email);
  });

  const applicationQuery = { agentEmail: { $exists: true, $ne: '' } };
  if (excludedApplicationId) {
    applicationQuery._id = { $ne: excludedApplicationId };
  }

  const applications = await AgentApplication.find(applicationQuery, 'agentEmail');
  applications.forEach((application) => {
    const email = normalizeEmail(application.agentEmail);
    if (email) reservedEmails.add(email);
  });

  const envEmails = (process.env.AGENT_EMAILS || '')
    .split(',')
    .map((email) => normalizeEmail(email))
    .filter(Boolean);

  envEmails.forEach((email) => reservedEmails.add(email));

  return reservedEmails;
};

const buildSuggestedAgentEmail = (app, reservedEmails) => {
  const presentYear = new Date().getFullYear();
  const nameOptions = [
    [app.firstName, app.lastName].filter(Boolean).join(''),
    app.firstName,
    app.userId?.username,
    'agent',
  ]
    .map((value) => normalizeNamePart(value))
    .filter(Boolean);

  for (const normalizedName of [...new Set(nameOptions)]) {
    const attemptedNumbers = new Set();

    while (attemptedNumbers.size < 100) {
      const randomNumber = String(Math.floor(Math.random() * 100)).padStart(2, '0');
      if (attemptedNumbers.has(randomNumber)) continue;

      attemptedNumbers.add(randomNumber);
      const candidateEmail = `${normalizedName}${randomNumber}wheels${presentYear}@gmail.com`;

      if (!reservedEmails.has(candidateEmail)) {
        reservedEmails.add(candidateEmail);
        return candidateEmail;
      }
    }
  }

  return '';
};

// Submit application (logged-in user only)
export const submitApplication = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // JWT only carries id + role — fetch email from DB
    const userDoc = await User.findById(userId).select('email role');
    if (!userDoc) return next(errorHandler(404, 'User not found'));
    const email = userDoc.email;

    if (req.user.role === 'agent') return next(errorHandler(400, 'You are already an agent.'));

    const existing = await AgentApplication.findOne({ userId });
    if (existing) return next(errorHandler(400, 'Application already submitted.'));

    const {
      // Personal
      firstName, lastName, dateOfBirth, gender,
      // Contact
      phone, address, city, state, pincode,
      // Identity
      aadharNumber, idProofUrl,
      // Driving
      drivingLicenseNumber, licenseExpiryDate, drivingLicenseUrl,
      // Work Experience
      currentJob, previousJob, yearsOfExperience, hasCarSalesExperience,
      // Automobile Knowledge
      carKnowledge, vehicleTransactionExperience,
      // Work Location
      preferredWorkingCity, willingToTravel,
      // Availability
      employmentType, availableWorkingDays,
      // Skills
      languagesKnown, customerHandlingExperience, salesExperience,
      // References
      referenceName, referencePhone,
      // Motivation
      motivation,
      // Documents
      resumeUrl, addressProofUrl,
    } = req.body;

    const formData = {
      firstName: normalizeText(firstName),
      lastName: normalizeText(lastName),
      dateOfBirth: normalizeText(dateOfBirth),
      gender: normalizeText(gender),
      phone: normalizeText(phone),
      address: normalizeText(address),
      city: normalizeText(city),
      state: normalizeText(state),
      pincode: normalizeText(pincode),
      aadharNumber: normalizeText(aadharNumber),
      idProofUrl: normalizeText(idProofUrl),
      drivingLicenseNumber: normalizeText(drivingLicenseNumber),
      licenseExpiryDate: normalizeText(licenseExpiryDate),
      drivingLicenseUrl: normalizeText(drivingLicenseUrl),
      currentJob: normalizeText(currentJob),
      previousJob: normalizeText(previousJob),
      yearsOfExperience: normalizeText(yearsOfExperience),
      carKnowledge: normalizeText(carKnowledge),
      vehicleTransactionExperience: normalizeText(vehicleTransactionExperience),
      preferredWorkingCity: normalizeText(preferredWorkingCity),
      employmentType: normalizeText(employmentType),
      availableWorkingDays: normalizeText(availableWorkingDays),
      languagesKnown: normalizeText(languagesKnown),
      customerHandlingExperience: normalizeText(customerHandlingExperience),
      salesExperience: normalizeText(salesExperience),
      referenceName: normalizeText(referenceName),
      referencePhone: normalizeText(referencePhone),
      motivation: normalizeText(motivation),
      resumeUrl: normalizeText(resumeUrl),
      addressProofUrl: normalizeText(addressProofUrl),
    };

    // Required field validation
    const required = { firstName: formData.firstName, lastName: formData.lastName, dateOfBirth: formData.dateOfBirth, gender: formData.gender, phone: formData.phone, address: formData.address, city: formData.city, state: formData.state, pincode: formData.pincode,
      aadharNumber: formData.aadharNumber, idProofUrl: formData.idProofUrl, drivingLicenseNumber: formData.drivingLicenseNumber, licenseExpiryDate: formData.licenseExpiryDate, drivingLicenseUrl: formData.drivingLicenseUrl,
      yearsOfExperience: formData.yearsOfExperience, carKnowledge: formData.carKnowledge, preferredWorkingCity: formData.preferredWorkingCity, employmentType: formData.employmentType,
      availableWorkingDays: formData.availableWorkingDays, languagesKnown: formData.languagesKnown, motivation: formData.motivation, resumeUrl: formData.resumeUrl, addressProofUrl: formData.addressProofUrl };

    const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length) return next(errorHandler(400, `Missing required fields: ${missing.join(', ')}`));

    if (!['Male', 'Female', 'Other'].includes(formData.gender)) {
      return next(errorHandler(400, 'Please select a valid gender.'));
    }

    if (!['Full-time', 'Part-time'].includes(formData.employmentType)) {
      return next(errorHandler(400, 'Please select a valid employment type.'));
    }

    if (!/^\d{10}$/.test(formData.phone)) return next(errorHandler(400, 'Phone must be exactly 10 digits.'));
    if (!/^\d{6}$/.test(formData.pincode)) return next(errorHandler(400, 'Pincode must be exactly 6 digits.'));
    if (!/^\d{12}$/.test(formData.aadharNumber)) return next(errorHandler(400, 'Aadhar must be exactly 12 digits.'));

    if (!isValidDateString(formData.dateOfBirth)) {
      return next(errorHandler(400, 'Please enter a valid date of birth.'));
    }

    if (formData.dateOfBirth > new Date().toISOString().split('T')[0]) {
      return next(errorHandler(400, 'Date of birth cannot be in the future.'));
    }

    if (!isValidDateString(formData.licenseExpiryDate)) {
      return next(errorHandler(400, 'Please enter a valid license expiry date.'));
    }

    if (formData.licenseExpiryDate < new Date().toISOString().split('T')[0]) {
      return next(errorHandler(400, 'License expiry date must be today or later.'));
    }

    if (formData.referencePhone && !/^\d{10}$/.test(formData.referencePhone)) {
      return next(errorHandler(400, 'Reference phone must be exactly 10 digits.'));
    }

    const documentUrls = {
      idProofUrl: formData.idProofUrl,
      drivingLicenseUrl: formData.drivingLicenseUrl,
      resumeUrl: formData.resumeUrl,
      addressProofUrl: formData.addressProofUrl,
    };

    const invalidDocument = Object.entries(documentUrls).find(([, value]) => !isHttpUrl(value));
    if (invalidDocument) {
      return next(errorHandler(400, `Invalid document URL provided for ${invalidDocument[0]}.`));
    }

    const app = await AgentApplication.create({
      userId, email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      aadharNumber: formData.aadharNumber,
      idProofUrl: formData.idProofUrl,
      drivingLicenseNumber: formData.drivingLicenseNumber,
      licenseExpiryDate: formData.licenseExpiryDate,
      drivingLicenseUrl: formData.drivingLicenseUrl,
      currentJob: formData.currentJob,
      previousJob: formData.previousJob,
      yearsOfExperience: formData.yearsOfExperience,
      hasCarSalesExperience: hasCarSalesExperience === 'true' || hasCarSalesExperience === true,
      carKnowledge: formData.carKnowledge,
      vehicleTransactionExperience: formData.vehicleTransactionExperience,
      preferredWorkingCity: formData.preferredWorkingCity,
      willingToTravel: willingToTravel === 'true' || willingToTravel === true,
      employmentType: formData.employmentType,
      availableWorkingDays: formData.availableWorkingDays,
      languagesKnown: formData.languagesKnown,
      customerHandlingExperience: formData.customerHandlingExperience,
      salesExperience: formData.salesExperience,
      referenceName: formData.referenceName,
      referencePhone: formData.referencePhone,
      motivation: formData.motivation,
      resumeUrl: formData.resumeUrl,
      addressProofUrl: formData.addressProofUrl,
    });

    res.status(201).json({ success: true, application: app });
  } catch (err) {
    next(err);
  }

};


// Get current user's own application status
export const getMyApplication = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const app = await AgentApplication.findOne({ userId });
    if (!app) {
      return res.status(200).json({ success: true, application: null });
    }
    res.status(200).json({ success: true, application: app });
  } catch (err) {
    next(err);
  }
};

// Get single application by ID (Admin)
export const getApplicationById = async (req, res, next) => {
  try {
    const app = await AgentApplication.findById(req.params.id).populate('userId', 'username avatar');
    if (!app) return next(errorHandler(404, 'Application not found.'));
    const reservedEmails = await getReservedAgentEmails(app._id);
    const suggestedAgentEmail = app.agentEmail || buildSuggestedAgentEmail(app, reservedEmails);
    res.status(200).json({
      success: true,
      application: {
        ...app.toObject(),
        suggestedAgentEmail,
      },
    });
  } catch (err) {
    next(err);
  }
};

// List all applications (admin only)
export const listApplications = async (req, res, next) => {
  try {
    const apps = await AgentApplication.find()
      .populate('userId', 'username email avatar')
      .sort({ createdAt: -1 });
    const reservedEmails = await getReservedAgentEmails();
    const applications = apps.map((app) => ({
      ...app.toObject(),
      suggestedAgentEmail: app.agentEmail || buildSuggestedAgentEmail(app, reservedEmails),
    }));
    res.status(200).json({ success: true, applications });
  } catch (err) {
    next(err);
  }
};

// Approve application (admin only)
export const approveApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const normalizedAgentEmail = normalizeEmail(req.body.agentEmail);

    // Validate the admin-assigned agent email
    if (!normalizedAgentEmail || !EMAIL_REGEX.test(normalizedAgentEmail)) {
      return next(errorHandler(400, 'A valid agent email must be provided.'));
    }

    const app = await AgentApplication.findById(id).populate('userId', 'email username');
    if (!app) return next(errorHandler(404, 'Application not found'));
    if (app.status === 'approved') return next(errorHandler(400, 'Already approved'));

    const reservedEmails = await getReservedAgentEmails(app._id);
    if (reservedEmails.has(normalizedAgentEmail)) {
      return next(errorHandler(400, 'This agent email already exists. Please use a different email.'));
    }

    // Store the assigned agent email & update status
    app.status = 'approved';
    app.agentEmail = normalizedAgentEmail;
    await app.save();

    // Add the ASSIGNED agentEmail to .env
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    const agentEmailsMatch = envContent.match(/^AGENT_EMAILS=.*$/m);

    let emails = [];
    if (agentEmailsMatch) {
      emails = agentEmailsMatch[0]
        .replace(/^AGENT_EMAILS=/, '')
        .split(',')
        .map(e => e.trim())
        .filter(Boolean);
      if (!emails.includes(app.agentEmail)) {
        emails.push(app.agentEmail);
      }
      const newLine = 'AGENT_EMAILS=' + emails.join(',');
      envContent = envContent.replace(/^AGENT_EMAILS=.*$/m, newLine);
    } else {
      emails = [app.agentEmail];
      envContent += '\nAGENT_EMAILS=' + app.agentEmail;
    }

    fs.writeFileSync(envPath, envContent);

    // Update live process.env immediately — no server restart needed
    process.env.AGENT_EMAILS = emails.join(',');

    // Notify the applicant with their new agent credentials
    await sendEmail(
      app.email,
      'PrimeWheels — Your Agent Account is Ready! 🎉',
      `Congratulations ${app.userId?.username || app.firstName || ''}!\n\nYour application to become a PrimeWheels agent has been approved.\n\nYour dedicated agent email credentials have been created:\n\n  📧 Agent Email: ${app.agentEmail}\n\nTo activate your agent account:\n1. Sign out of your current account\n2. Create a new account (or sign in) using the above email address\n3. You will automatically receive full agent privileges\n\nWelcome to the PrimeWheels team!\n\n— PrimeWheels Admin`
    );

    res.status(200).json({ success: true, message: 'Application approved. Agent email assigned and notification sent.' });
  } catch (err) {
    next(err);
  }
};

// Reject application (admin only)
export const rejectApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminMessage } = req.body;
    const app = await AgentApplication.findById(id).populate('userId', 'email username');
    if (!app) return next(errorHandler(404, 'Application not found'));
    if (app.status === 'rejected') return next(errorHandler(400, 'Already rejected'));

    app.status = 'rejected';
    app.adminMessage = adminMessage || '';
    await app.save();

    // Send rejection email
    await sendEmail(
      app.email,
      'PrimeWheels — Agent Application Update',
      `Dear ${app.userId?.username || 'Applicant'},\n\nThank you for your interest in joining PrimeWheels as an agent.\n\nAfter careful review, we regret to inform you that your application has not been selected at this time.${adminMessage ? '\n\nReason: ' + adminMessage : ''}\n\nWe encourage you to apply again in the future.\n\n— PrimeWheels Admin`
    );

    res.status(200).json({ success: true, message: 'Application rejected and email sent.' });
  } catch (err) {
    next(err);
  }
};
