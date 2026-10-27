import "dotenv/config";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";

import { User } from "../models/auth/user.model.js";

let muted = false;

const output = new Writable({
  write(chunk, encoding, callback) {
    if (!muted) stdout.write(chunk, encoding);
    callback();
  },
});

const rl = createInterface({ input: stdin, output, terminal: true });

rl.on("SIGINT", () => {
  console.log("\nCancelled.");
  process.exit(1);
});

async function ask(question: string): Promise<string> {
  const answer = await rl.question(question);
  return answer.trim();
}

async function askPassword(question: string): Promise<string> {
  stdout.write(question);
  muted = true;
  const answer = await rl.question("");
  muted = false;
  stdout.write("\n");
  return answer;
}

function validate(name: string, email: string, password: string) {
  if (name.length < 2 || name.length > 100) {
    throw new Error("Name must be between 2 and 100 characters.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Please enter a valid email address.");
  }

  if (password.length < 12) {
    throw new Error("Password must be at least 12 characters long.");
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("Password is too long (bcrypt allows at most 72 bytes).");
  }
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing from your environment.");
  }

  if (!stdin.isTTY) {
    throw new Error("Run this script in an interactive terminal.");
  }

  const name = await ask("Admin full name: ");
  const email = (await ask("Admin email: ")).toLowerCase();
  const password = await askPassword("Admin password (hidden): ");
  const confirmation = await askPassword("Confirm password (hidden): ");
  rl.close();

  if (password !== confirmation) {
    throw new Error("Passwords do not match.");
  }

  validate(name, email, password);

  await mongoose.connect(mongoUri);

  // Never touch an existing account.
  if (await User.exists({ email })) {
    throw new Error(`An account already exists for ${email}. No changes made.`);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await User.create({
    name,
    email,
    passwordHash,
    role: "admin",
    authProvider: "local",
    isVerified: true,
  });

  console.log(`\nAdmin account created for ${name} (${email}).`);
}

main()
  .catch((error) => {
    console.error("\nAdmin seed failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    rl.close();
    await mongoose.disconnect();
  });