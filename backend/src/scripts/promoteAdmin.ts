// Run with: npm run promote-admin -- your.email@example.com
// Grants admin access to an existing account. There is deliberately no
// in-app way to do this — admin access should only ever be granted from
// the server/database side, not through the website itself.
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db";
import User from "../models/User";

const email = process.argv[2];

if (!email) {
  console.error("Usage: npm run promote-admin -- your.email@example.com");
  process.exit(1);
}

const run = async () => {
  await connectDB();
  const user = await User.findOne({ email });

  if (!user) {
    console.error(`No account found with email: ${email}`);
    process.exit(1);
  }

  user.isAdmin = true;
  await user.save();
  console.log(`${email} is now an admin.`);
  await mongoose.disconnect();
  process.exit(0);
};

run();