const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "PrimeWheels Backend API",
    version: "1.0.0",
    description: "Swagger documentation for PrimeWheels backend services.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Auth" },
    { name: "User" },
    { name: "Sell" },
    { name: "Agent" },
    { name: "Agent Hiring" },
    { name: "Inventory" },
    { name: "Request" },
    { name: "Upload" },
    { name: "Admin" },
    { name: "Notification" },
    { name: "Purchase" },
    { name: "Review" },
    { name: "Test Drive" },
    { name: "System" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "access_token",
        description: "JWT auth cookie set after sign-in.",
      },
    },
    schemas: {
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation completed" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          statusCode: { type: "integer", example: 400 },
          message: { type: "string", example: "Bad request" },
        },
      },
    },
  },
  paths: {
    "/backend": {
      get: {
        tags: ["System"],
        summary: "Backend health message",
        responses: {
          200: { description: "Backend hello message" },
        },
      },
    },

    "/backend/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Create a new user account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string", example: "johndoe123" },
                  email: { type: "string", format: "email", example: "john.doe@example.com" },
                  password: { type: "string", format: "password", example: "SecurePass!123" }
                },
                required: ["username", "email", "password"]
              }
            }
          }
        },
        responses: { 200: { description: "User registered" }, 400: { description: "Validation error" } },
      },
    },
    "/backend/auth/signin": {
      post: {
        tags: ["Auth"],
        summary: "Sign in user and set auth cookie",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email", example: "admin@primewheels.com" },
                  password: { type: "string", format: "password", example: "yourpassword_here" }
                },
                required: ["email", "password"]
              }
            }
          }
        },
        responses: { 200: { description: "Signed in" }, 401: { description: "Invalid credentials" } },
      },
    },
    "/backend/auth/google": {
      post: {
        tags: ["Auth"],
        summary: "Sign in with Google",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string", example: "John Doe" },
                  email: { type: "string", format: "email", example: "john@gmail.com" },
                  photo: { type: "string", example: "https://lh3.googleusercontent.com/a/..." }
                },
                required: ["username", "email", "photo"]
              }
            }
          }
        },
        responses: { 200: { description: "Signed in with Google" } },
      },
    },
    "/backend/auth/signout": {
      get: {
        tags: ["Auth"],
        summary: "Sign out user",
        responses: { 200: { description: "Signed out" } },
      },
    },
    "/backend/auth/request-otp": {
      post: {
        tags: ["Auth"],
        summary: "Request password reset OTP",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" }
                },
                required: ["email"]
              }
            }
          }
        },
        responses: { 200: { description: "OTP sent" } },
      },
    },
    "/backend/auth/verify-otp": {
      post: {
        tags: ["Auth"],
        summary: "Verify reset OTP",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" },
                  otp: { type: "string", example: "123456" }
                },
                required: ["email", "otp"]
              }
            }
          }
        },
        responses: { 200: { description: "OTP verified" } },
      },
    },
    "/backend/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" },
                  otp: { type: "string", example: "123456" },
                  newPassword: { type: "string", format: "password", example: "NewSecurePass!456" }
                },
                required: ["email", "otp", "newPassword"]
              }
            }
          }
        },
        responses: { 200: { description: "Password reset successful" } },
      },
    },

    "/backend/user/analytics": {
      get: {
        tags: ["User"],
        summary: "Get user analytics",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Analytics fetched" }, 401: { description: "Unauthorized" } },
      },
    },
    "/backend/user/detailed/{id}": {
      get: {
        tags: ["User"],
        summary: "Get detailed user by id",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "User ID whose full profile and analytics should be fetched", schema: { type: "string", example: "64abcd789012" } }],
        responses: { 200: { description: "User details fetched" }, 404: { description: "User not found" } },
      },
    },
    "/backend/user/{id}": {
      get: {
        tags: ["User"],
        summary: "Get user by id",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "User ID to fetch basic profile", schema: { type: "string", example: "64abcd789012" } }],
        responses: { 200: { description: "User fetched" } },
      },
    },
    "/backend/user/update/{id}": {
      put: {
        tags: ["User"],
        summary: "Update user profile",
        description: "Multipart endpoint. Field name for image is avatar.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Your own User ID (must match logged-in user)", schema: { type: "string", example: "64abcd789012" } }],
        requestBody: {
          required: false,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string", example: "newusername" },
                  email: { type: "string", format: "email", example: "newmail@example.com" },
                  currentPassword: { type: "string", format: "password", example: "OldPass123" },
                  oldPassword: { type: "string", format: "password", example: "OldPass123" },
                  newPassword: { type: "string", format: "password", example: "NewPass123" },
                  password: { type: "string", format: "password", example: "NewPass123" },
                  avatar: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "User updated" } },
      },
    },
    "/backend/user/delete/{id}": {
      delete: {
        tags: ["User"],
        summary: "Delete user by id",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Your own User ID (must match logged-in user)", schema: { type: "string", example: "64abcd789012" } }],
        responses: { 200: { description: "User deleted" } },
      },
    },

    "/backend/sell-car/sell": {
      post: {
        tags: ["Sell"],
        summary: "Submit sell car request",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  brand: { type: "string", example: "BMW" },
                  model: { type: "string", example: "X5" },
                  vehicleType: { type: "string", example: "SUV" },
                  transmission: { type: "string", example: "Automatic" },
                  fuelType: { type: "string", example: "Petrol" },
                  manufacturedYear: { type: "integer", example: 2022 },
                  seater: { type: "integer", example: 5 },
                  exteriorColor: { type: "string", example: "Black" },
                  carNumber: { type: "string", example: "KA-01-AB-1234" },
                  traveledKm: { type: "integer", example: 12000 },
                  price: { type: "integer", example: 4500000 },
                  description: { type: "string", example: "Single owner, excellent condition." },
                  address: { type: "string", example: "123 MG Road" },
                  city: { type: "string", example: "Bangalore" },
                  state: { type: "string", example: "Karnataka" },
                  pincode: { type: "string", example: "560001" },
                  sellerName: { type: "string", example: "Sandeep" },
                  sellerphone: { type: "string", example: "9876543210" },
                  photos: { type: "array", items: { type: "string" }, minItems: 4, example: ["https://res.cloudinary.com/demo/image/upload/car1.jpg", "https://res.cloudinary.com/demo/image/upload/car2.jpg", "https://res.cloudinary.com/demo/image/upload/car3.jpg", "https://res.cloudinary.com/demo/image/upload/car4.jpg"] },
                  accidentHistory: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        incidentType: { type: "string", example: "Minor scratch" },
                        accidentDate: { type: "string", format: "date", example: "2023-04-10" },
                        repairStatus: { type: "string", example: "Repaired" },
                        airbagsDeployed: { type: "boolean", example: false },
                        insuranceClaimed: { type: "boolean", example: true },
                        description: { type: "string", example: "Rear bumper repainted" }
                      }
                    }
                  },
                  ownershipHistory: {
                    type: "array",
                    minItems: 1,
                    items: {
                      type: "object",
                      properties: {
                        ownerSequence: { type: "integer", example: 1 },
                        usageCategory: { type: "string", example: "Personal" },
                        registrationCity: { type: "string", example: "Bangalore" },
                        ownershipDuration: { type: "string", example: "3 years" }
                      },
                      required: ["ownerSequence", "usageCategory"]
                    }
                  },
                  insuranceDetails: {
                    type: "object",
                    properties: {
                      policyType: { type: "string", example: "Comprehensive" },
                      providerName: { type: "string", example: "ICICI Lombard" },
                      expiryDate: { type: "string", format: "date", example: "2027-12-31" },
                      ncbPercentage: { type: "number", example: 20 }
                    },
                    required: ["policyType", "providerName", "expiryDate", "ncbPercentage"]
                  },
                  documentUploads: {
                    type: "object",
                    properties: {
                      rcFront: { type: "string", example: "https://res.cloudinary.com/demo/image/upload/rc-front.jpg" },
                      rcBack: { type: "string", example: "https://res.cloudinary.com/demo/image/upload/rc-back.jpg" },
                      insuranceCopy: { type: "string", example: "https://res.cloudinary.com/demo/image/upload/insurance.jpg" },
                      pucCertificate: { type: "string", example: "https://res.cloudinary.com/demo/image/upload/puc.jpg" },
                      serviceLogs: { type: "array", minItems: 1, items: { type: "string" }, example: ["https://res.cloudinary.com/demo/image/upload/service1.jpg"] },
                      nocDocument: { type: "string", example: "https://res.cloudinary.com/demo/image/upload/noc.jpg" }
                    },
                    required: ["rcFront", "rcBack", "insuranceCopy", "pucCertificate", "serviceLogs", "nocDocument"]
                  }
                },
                required: ["brand", "model", "vehicleType", "transmission", "manufacturedYear", "fuelType", "seater", "exteriorColor", "carNumber", "traveledKm", "price", "description", "sellerName", "sellerphone", "photos", "ownershipHistory", "insuranceDetails", "documentUploads"]
              }
            }
          }
        },
        responses: { 200: { description: "Sell request submitted" } },
      },
    },

    "/backend/agent/assigned": {
      get: {
        tags: ["Agent"],
        summary: "Get cars assigned to agent",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "status", in: "query", required: false, description: "Optional status filter. Defaults to pending", schema: { type: "string", example: "pending" } }],
        responses: { 200: { description: "Assigned cars fetched" } },
      },
    },
    "/backend/agent/accept/{id}": {
      post: {
        tags: ["Agent"],
        summary: "Accept a car for verification",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Car ID to accept for verification", schema: { type: "string", example: "64car00123456" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  verificationDays: { type: "integer", minimum: 1, maximum: 10, example: 3 }
                },
                required: ["verificationDays"]
              }
            }
          }
        },
        responses: { 200: { description: "Car accepted" } },
      },
    },
    "/backend/agent/verification": {
      get: {
        tags: ["Agent"],
        summary: "List cars for verification",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Verification list fetched" } },
      },
    },
    "/backend/agent/stats": {
      get: {
        tags: ["Agent"],
        summary: "Get agent stats",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Stats fetched" } },
      },
    },
    "/backend/agent/leaderboard": {
      get: {
        tags: ["Agent"],
        summary: "Get agent leaderboard",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Leaderboard fetched" } },
      },
    },
    "/backend/agent/detailed/{id}": {
      get: {
        tags: ["Agent"],
        summary: "Get detailed agent view (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Agent User ID (role must be agent)", schema: { type: "string", example: "64agent123456" } }],
        responses: { 200: { description: "Detailed agent fetched" }, 403: { description: "Forbidden" } },
      },
    },
    "/backend/agent/approve/{id}": {
      post: {
        tags: ["Agent"],
        summary: "Approve car verification",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Car ID currently under your verification", schema: { type: "string", example: "64car00123456" } }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  engine: { type: "number", example: 1998 },
                  torque: { type: "number", example: 320 },
                  power: { type: "number", example: 181 },
                  groundClearance: { type: "number", example: 198 },
                  topSpeed: { type: "number", example: 210 },
                  fuelTank: { type: "number", example: 60 },
                  driveType: { type: "string", example: "AWD" }
                }
              }
            }
          }
        },
        responses: { 200: { description: "Car approved" } },
      },
    },
    "/backend/agent/reject/{id}": {
      post: {
        tags: ["Agent"],
        summary: "Reject car verification",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Car ID currently under your verification", schema: { type: "string", example: "64car00123456" } }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  rejectionReason: { type: "string", example: "VIN plate mismatch during verification." }
                }
              }
            }
          }
        },
        responses: { 200: { description: "Car rejected" } },
      },
    },

    "/backend/agent-hiring/my-application": {
      get: {
        tags: ["Agent Hiring"],
        summary: "Get current user's agent application",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Application fetched" } },
      },
    },
    "/backend/agent-hiring/apply": {
      post: {
        tags: ["Agent Hiring"],
        summary: "Submit agent application",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  firstName: { type: "string", example: "John" },
                  lastName: { type: "string", example: "Doe" },
                  dateOfBirth: { type: "string", format: "date", example: "1996-05-20" },
                  gender: { type: "string", enum: ["Male", "Female", "Other"], example: "Male" },
                  phone: { type: "string", example: "9876543210" },
                  address: { type: "string", example: "45 Residency Road" },
                  city: { type: "string", example: "Bangalore" },
                  state: { type: "string", example: "Karnataka" },
                  pincode: { type: "string", example: "560001" },
                  aadharNumber: { type: "string", example: "123412341234" },
                  idProofUrl: { type: "string", example: "https://res.cloudinary.com/demo/image/upload/id-proof.jpg" },
                  drivingLicenseNumber: { type: "string", example: "KA0120240001234" },
                  licenseExpiryDate: { type: "string", format: "date", example: "2030-12-31" },
                  drivingLicenseUrl: { type: "string", example: "https://res.cloudinary.com/demo/image/upload/license.jpg" },
                  currentJob: { type: "string", example: "Sales Executive" },
                  previousJob: { type: "string", example: "Field Sales" },
                  yearsOfExperience: { type: "string", example: "4" },
                  hasCarSalesExperience: { oneOf: [{ type: "boolean" }, { type: "string", enum: ["true", "false"] }], example: true },
                  carKnowledge: { type: "string", example: "Strong knowledge of hatchback and SUV segments" },
                  vehicleTransactionExperience: { type: "string", example: "Handled 30+ pre-owned vehicle closures" },
                  preferredWorkingCity: { type: "string", example: "Bangalore" },
                  willingToTravel: { oneOf: [{ type: "boolean" }, { type: "string", enum: ["true", "false"] }], example: true },
                  employmentType: { type: "string", enum: ["Full-time", "Part-time"], example: "Full-time" },
                  availableWorkingDays: { type: "string", example: "Mon-Sat" },
                  languagesKnown: { type: "string", example: "English, Hindi, Kannada" },
                  customerHandlingExperience: { type: "string", example: "Handled walk-ins and lead follow-ups" },
                  salesExperience: { type: "string", example: "B2C automobile sales for 3 years" },
                  referenceName: { type: "string", example: "Ravi Kumar" },
                  referencePhone: { type: "string", example: "9123456789" },
                  motivation: { type: "string", example: "I enjoy helping buyers choose the right car." },
                  resumeUrl: { type: "string", example: "https://res.cloudinary.com/demo/raw/upload/resume.pdf" },
                  addressProofUrl: { type: "string", example: "https://res.cloudinary.com/demo/image/upload/address-proof.jpg" }
                },
                required: ["firstName", "lastName", "dateOfBirth", "gender", "phone", "address", "city", "state", "pincode", "aadharNumber", "idProofUrl", "drivingLicenseNumber", "licenseExpiryDate", "drivingLicenseUrl", "yearsOfExperience", "carKnowledge", "preferredWorkingCity", "employmentType", "availableWorkingDays", "languagesKnown", "motivation", "resumeUrl", "addressProofUrl"]
              }
            }
          }
        },
        responses: { 200: { description: "Application submitted" } },
      },
    },
    "/backend/agent-hiring/applications": {
      get: {
        tags: ["Agent Hiring"],
        summary: "List all applications (admin)",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Applications fetched" } },
      },
    },
    "/backend/agent-hiring/{id}": {
      get: {
        tags: ["Agent Hiring"],
        summary: "Get application by id (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Agent Application ID", schema: { type: "string", example: "64app123456" } }],
        responses: { 200: { description: "Application fetched" } },
      },
    },
    "/backend/agent-hiring/approve/{id}": {
      post: {
        tags: ["Agent Hiring"],
        summary: "Approve application (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Agent Application ID to approve", schema: { type: "string", example: "64app123456" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  agentEmail: { type: "string", format: "email", example: "john23wheels2026@gmail.com" }
                },
                required: ["agentEmail"]
              }
            }
          }
        },
        responses: { 200: { description: "Application approved" } },
      },
    },
    "/backend/agent-hiring/reject/{id}": {
      post: {
        tags: ["Agent Hiring"],
        summary: "Reject application (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Agent Application ID to reject", schema: { type: "string", example: "64app123456" } }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  adminMessage: { type: "string", example: "Insufficient field sales experience for current intake." }
                }
              }
            }
          }
        },
        responses: { 200: { description: "Application rejected" } },
      },
    },

    "/backend/cars/inventory": {
      get: {
        tags: ["Inventory"],
        summary: "Get available cars with filters",
        parameters: [
          { name: "brand", in: "query", schema: { type: "string" } },
          { name: "model", in: "query", schema: { type: "string" } },
          { name: "vehicleType", in: "query", schema: { type: "string" } },
          { name: "transmission", in: "query", schema: { type: "string" } },
          { name: "fuelType", in: "query", schema: { type: "string" } },
          { name: "seater", in: "query", schema: { type: "integer" } },
          { name: "exteriorColor", in: "query", schema: { type: "string" } },
          { name: "manufacturedYear", in: "query", schema: { type: "integer" } },
          { name: "traveledKm", in: "query", schema: { type: "integer" } },
          { name: "price", in: "query", schema: { type: "integer" } },
          { name: "priceRange", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Inventory fetched" } },
      },
    },
    "/backend/cars/top-brands": {
      get: {
        tags: ["Inventory"],
        summary: "Get top sold brands",
        parameters: [
          { name: "months", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Top brands fetched" } },
      },
    },
    "/backend/cars/{id}": {
      get: {
        tags: ["Inventory"],
        summary: "Get single car by id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Car fetched" }, 404: { description: "Car not found" } },
      },
    },

    "/backend/request-car/request": {
      post: {
        tags: ["Request"],
        summary: "Create car request",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  brand: { type: "string", example: "Audi" },
                  model: { type: "string", example: "A4" },
                  vehicleType: { type: "string", example: "Sedan" },
                  transmission: { type: "string", example: "Automatic" },
                  fuelType: { type: "string", example: "Petrol" },
                  manufacturedYearRange: {
                    type: "object",
                    properties: {
                      minYear: { type: "integer", example: 2018 },
                      maxYear: { type: "integer", example: 2023 }
                    },
                    required: ["minYear", "maxYear"]
                  }
                },
                required: ["brand", "model", "vehicleType", "transmission", "fuelType", "manufacturedYearRange"]
              }
            }
          }
        },
        responses: { 200: { description: "Request created" } },
      },
    },
    "/backend/request-car/my": {
      get: {
        tags: ["Request"],
        summary: "Get my car requests",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Requests fetched" } },
      },
    },
    "/backend/request-car/all": {
      get: {
        tags: ["Request"],
        summary: "Get all requests (admin)",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "All requests fetched" } },
      },
    },
    "/backend/request-car/{id}": {
      delete: {
        tags: ["Request"],
        summary: "Delete request by id",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Car Request ID created by request-car/request", schema: { type: "string", example: "64req123456" } }],
        responses: { 200: { description: "Request deleted" } },
      },
    },

    "/backend/request/request": {
      post: {
        tags: ["Request"],
        summary: "Create car request (alternate mount)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  brand: { type: "string", example: "Audi" },
                  model: { type: "string", example: "A4" },
                  vehicleType: { type: "string", example: "Sedan" },
                  transmission: { type: "string", example: "Automatic" },
                  fuelType: { type: "string", example: "Petrol" },
                  manufacturedYearRange: {
                    type: "object",
                    properties: {
                      minYear: { type: "integer", example: 2018 },
                      maxYear: { type: "integer", example: 2023 }
                    },
                    required: ["minYear", "maxYear"]
                  }
                },
                required: ["brand", "model", "vehicleType", "transmission", "fuelType", "manufacturedYearRange"]
              }
            }
          }
        },
        responses: { 200: { description: "Request created" } },
      },
    },
    "/backend/request/my": {
      get: {
        tags: ["Request"],
        summary: "Get my car requests (alternate mount)",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Requests fetched" } },
      },
    },
    "/backend/request/all": {
      get: {
        tags: ["Request"],
        summary: "Get all requests (admin, alternate mount)",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "All requests fetched" } },
      },
    },
    "/backend/request/{id}": {
      delete: {
        tags: ["Request"],
        summary: "Delete request by id (alternate mount)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Car Request ID created by request/request", schema: { type: "string", example: "64req123456" } }],
        responses: { 200: { description: "Request deleted" } },
      },
    },

    "/backend/upload/photo": {
      post: {
        tags: ["Upload"],
        summary: "Upload photo to cloud storage",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  photo: { type: "string", format: "binary" },
                },
                required: ["photo"],
              },
            },
          },
        },
        responses: { 200: { description: "Photo uploaded" } },
      },
    },

    "/backend/admin/analytics": {
      get: {
        tags: ["Admin"],
        summary: "Get admin analytics",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Admin analytics fetched" } },
      },
    },
    "/backend/admin/details": {
      get: {
        tags: ["Admin"],
        summary: "Get admin details",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Admin details fetched" } },
      },
    },
    "/backend/admin/public-stats": {
      get: {
        tags: ["Admin"],
        summary: "Get public admin stats",
        responses: { 200: { description: "Public stats fetched" } },
      },
    },

    "/backend/notification": {
      get: {
        tags: ["Notification"],
        summary: "Get user notifications",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Notifications fetched" } },
      },
    },
    "/backend/notification/unread-count": {
      get: {
        tags: ["Notification"],
        summary: "Get unread notification count",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Unread count fetched" } },
      },
    },
    "/backend/notification/mark-all-read": {
      put: {
        tags: ["Notification"],
        summary: "Mark all notifications as read",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "All notifications marked read" } },
      },
    },
    "/backend/notification/{id}/mark-read": {
      put: {
        tags: ["Notification"],
        summary: "Mark one notification as read",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Notification ID to mark as read", schema: { type: "string", example: "64note123456" } }],
        responses: { 200: { description: "Notification marked read" } },
      },
    },
    "/backend/notification/{id}": {
      delete: {
        tags: ["Notification"],
        summary: "Delete notification",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Notification ID to delete", schema: { type: "string", example: "64note123456" } }],
        responses: { 200: { description: "Notification deleted" } },
      },
    },

    "/backend/purchase/create": {
      post: {
        tags: ["Purchase"],
        summary: "Create purchase",
        description: "Use car as the selected Car _id from inventory/car-details APIs. Use buyer as the logged-in buyer User _id.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  car: { type: "string", description: "Car _id of the car being purchased (copy from inventory response car._id or /backend/cars/{id})", example: "64car00123456" },
                  buyer: { type: "string", description: "Buyer User _id (logged-in user id)", example: "64user123456" },
                  firstName: { type: "string", example: "John" },
                  lastName: { type: "string", example: "Doe" },
                  email: { type: "string", format: "email", example: "john@example.com" },
                  phone: { type: "string", example: "9876543210" },
                  address: { type: "string", example: "123 Main St" },
                  city: { type: "string", example: "Bangalore" },
                  state: { type: "string", example: "Karnataka" },
                  pincode: { type: "string", example: "560001" },
                  paymentMethod: { type: "string", example: "UPI" },
                  totalPrice: { type: "number", example: 500000 }
                },
                required: ["car", "buyer", "firstName", "lastName", "email", "phone", "address", "city", "state", "pincode", "totalPrice"]
              }
            }
          }
        },
        responses: { 201: { description: "Purchase created" } },
      },
    },
    "/backend/purchase/user/{userId}": {
      get: {
        tags: ["Purchase"],
        summary: "Get purchases by user id",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "userId", in: "path", required: true, description: "Buyer User _id (copy from signed-in user profile _id)", schema: { type: "string", example: "64user123456" } }],
        responses: { 200: { description: "User purchases fetched" } },
      },
    },
    "/backend/purchase/car/{carId}": {
      get: {
        tags: ["Purchase"],
        summary: "Get purchase by car id",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "carId", in: "path", required: true, description: "Car _id (copy from car object _id in inventory or car-details response)", schema: { type: "string", example: "64car00123456" } }],
        responses: { 200: { description: "Purchase fetched" } },
      },
    },
    "/backend/purchase/{id}": {
      get: {
        tags: ["Purchase"],
        summary: "Get purchase by id",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Purchase _id (copy from /backend/purchase/create response _id or purchase list response)", schema: { type: "string", example: "64pur123456" } }],
        responses: { 200: { description: "Purchase fetched" } },
      },
    },
    "/backend/purchase": {
      get: {
        tags: ["Purchase"],
        summary: "Get all purchases",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "All purchases fetched" } },
      },
    },

    "/backend/reviews": {
      get: {
        tags: ["Review"],
        summary: "Get all reviews (public)",
        responses: { 200: { description: "Reviews fetched" } },
      },
      post: {
        tags: ["Review"],
        summary: "Create review",
        description: "Multipart endpoint. Field name for images is photos.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  purchaseId: { type: "string", description: "Purchase ID eligible for review", example: "64pur123456" },
                  photos: { type: "array", minItems: 2, items: { type: "string", format: "binary" } },
                  rating: { type: "integer", minimum: 1, maximum: 5 },
                  comment: { type: "string" },
                },
                required: ["purchaseId", "photos", "rating", "comment"]
              },
            },
          },
        },
        responses: { 201: { description: "Review created" } },
      },
    },
    "/backend/reviews/eligible": {
      get: {
        tags: ["Review"],
        summary: "Get eligible purchases for review",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Eligible purchases fetched" } },
      },
    },
    "/backend/reviews/my-reviews": {
      get: {
        tags: ["Review"],
        summary: "Get current user reviews",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "User reviews fetched" } },
      },
    },
    "/backend/reviews/{id}": {
      put: {
        tags: ["Review"],
        summary: "Update review",
        description: "Multipart endpoint. Field name for images is photos.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Review ID created earlier by the same user", schema: { type: "string", example: "64rev123456" } }],
        requestBody: {
          required: false,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  photos: { type: "array", items: { type: "string", format: "binary" } },
                  rating: { type: "integer", minimum: 1, maximum: 5 },
                  comment: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Review updated" } },
      },
      delete: {
        tags: ["Review"],
        summary: "Delete review",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Review ID to delete (must belong to logged-in user)", schema: { type: "string", example: "64rev123456" } }],
        responses: { 200: { description: "Review deleted" } },
      },
    },

    "/backend/testdrive/request": {
      post: {
        tags: ["Test Drive"],
        summary: "Request a test drive",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  carId: { type: "string", description: "Car ID for which the buyer wants a test drive", example: "64car00123456" },
                  requestedDateTime: { type: "string", format: "date-time", example: "2026-04-01T10:00:00.000Z" },
                  location: { type: "string", example: "PrimeWheels HSR Branch" },
                  notes: { type: "string", example: "Please call before arrival." }
                  },
                  required: ["carId", "requestedDateTime", "location"]
              }
            }
          }
        },
        responses: { 201: { description: "Test drive requested" } },
      },
    },
    "/backend/testdrive/my": {
      get: {
        tags: ["Test Drive"],
        summary: "Get my test drives",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "My test drives fetched" } },
      },
    },
    "/backend/testdrive/cancel/{id}": {
      post: {
        tags: ["Test Drive"],
        summary: "Cancel test drive",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "The unique ID of the specific Test Drive booking (NOT the Car ID or User ID)", schema: { type: "string", example: "64abcd123456" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  cancellationReason: { type: "string", example: "I changed my mind and no longer want to buy this car." }
                },
                required: ["cancellationReason"]
              }
            }
          }
        },
        responses: { 200: { description: "Test drive canceled" } },
      },
    },
    "/backend/testdrive/agent/pending": {
      get: {
        tags: ["Test Drive"],
        summary: "Get pending requests for assigned agent",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Pending test drives fetched" } },
      },
    },
    "/backend/testdrive/agent/list": {
      get: {
        tags: ["Test Drive"],
        summary: "Get all test drives for assigned agent",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "status", in: "query", required: false, description: "Optional filter: pending, accepted, rejected, completed, cancelled", schema: { type: "string", example: "accepted" } }],
        responses: { 200: { description: "Agent test drives fetched" } },
      },
    },
    "/backend/testdrive/{id}/approve": {
      post: {
        tags: ["Test Drive"],
        summary: "Approve test drive request",
        description: "Agent-only endpoint. Normal users will receive 403 Forbidden.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Test Drive ID (must currently be pending and unassigned)", schema: { type: "string", example: "64td123456" } }],
        responses: {
          200: { description: "Test drive approved" },
          403: { description: "Forbidden: Agent access required" }
        },
      },
    },
    "/backend/testdrive/{id}/reject": {
      post: {
        tags: ["Test Drive"],
        summary: "Reject test drive request",
        description: "Agent-only endpoint. Normal users will receive 403 Forbidden.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Test Drive ID (must currently be accepted and assigned to you)", schema: { type: "string", example: "64td123456" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  rejectionReason: { type: "string", example: "Agent unavailable at requested slot." }
                },
                required: ["rejectionReason"]
              }
            }
          }
        },
        responses: {
          200: { description: "Test drive rejected" },
          403: { description: "Forbidden: Agent access required or not assigned agent" }
        },
      },
    },
    "/backend/testdrive/{id}/complete": {
      post: {
        tags: ["Test Drive"],
        summary: "Complete test drive",
        description: "Agent-only endpoint. Normal users will receive 403 Forbidden.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Test Drive ID (must currently be accepted and assigned to you)", schema: { type: "string", example: "64td123456" } }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  feedback: { type: "string", example: "Customer liked ride quality and asked for final quote." }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Test drive completed" },
          403: { description: "Forbidden: Agent access required or not assigned agent" }
        },
      },
    },
    "/backend/testdrive/all": {
      get: {
        tags: ["Test Drive"],
        summary: "Get all test drives (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "status", in: "query", required: false, description: "Optional admin filter: pending, accepted, rejected, completed, cancelled", schema: { type: "string", example: "pending" } }],
        responses: { 200: { description: "All test drives fetched" } },
      },
    },
  },
};

export default openApiSpec;
