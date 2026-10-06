require("dotenv").config();

const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const Notice = require("./models/Notice");

async function seed() {
  await connectDB();

  await User.deleteMany({});
  await Notice.deleteMany({});

  const password = await bcrypt.hash("password123", 10);

  const users = await User.insertMany([
    {
      name: "System Admin",
      email: "admin@example.com",
      password,
      role: "admin"
    },
    {
      name: "Demo Staff",
      email: "staff@example.com",
      password,
      role: "staff"
    },
    {
      name: "Demo Student",
      email: "student@example.com",
      password,
      role: "student"
    }
  ]);

  const staff = users.find(u => u.role === "staff");

  await Notice.insertMany([
    {
      title: "Mid-Semester Examination Schedule",
      content: "The mid-semester examination schedule has been published. Students should check the academic portal for room and timing details.",
      category: "exam",
      postedBy: staff._id
    },
    {
      title: "Technical Club Workshop",
      content: "A hands-on Node.js and MongoDB workshop will be conducted in the computer lab this Friday.",
      category: "event",
      postedBy: staff._id
    },
    {
      title: "Assignment Submission Reminder",
      content: "Backend Development Assignment 5 must be submitted through the student portal before the deadline.",
      category: "academic",
      postedBy: staff._id
    }
  ]);

  console.log("Database seeded successfully.");
  console.log("Admin:   admin@example.com / password123");
  console.log("Staff:   staff@example.com / password123");
  console.log("Student: student@example.com / password123");
  process.exit(0);
}

seed().catch(error => {
  console.error(error);
  process.exit(1);
});
