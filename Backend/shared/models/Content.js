import mongoose from "mongoose";
import { defineModel } from "../../config/db.js";

const contentSchema = new mongoose.Schema({
  site: {
    logoText: { type: String, default: "RN" },
    logoImageUrl: { type: String, default: "" },
    heroBadgeText: { type: String, default: "RN" },
    heroPhotoUrl: { type: String, default: "" },
  },
  hero: {
    eyebrow: String,
    headline: String,
    description: String,
    roles: [String],
    resumeButtonLabel: { type: String, default: "Download Resume" },
    resumeUrl: String,
    buttons: [{ label: String, link: String }],
  },
  about: {
    paragraphs: [String],
    stats: [{ number: String, label: String }],
    education: [{ kind: String, period: String, institution: String, course: String, details: String }],
    timeline: [{ years: String, title: String, description: String }],
  },
  skills: [
    {
      name: String,
      category: { type: String, enum: ["cloud", "dev", "design", "sec"] },
      level: { type: Number, min: 0, max: 100 },
      years: String,
      description: String,
      usedIn: String,
      note: String,
    },
  ],
  projects: [
    {
      tag: String,
      title: String,
      desc: String,
      status: String,
      version: String,
      commits: String,
      stack: [String],
      features: [String],
      challenge: String,
      solution: String,
      demo: String,
      repo: String,
    },
  ],
  certificates: [
    { name: String, issuer: String, credentialId: String, issued: String, expiry: String, logoUrl: String, credentialUrl: String },
  ],
  contact: {
    email: String,
    location: String,
    linkedin: String,
    github: String,
    availability: String,
    showForm: { type: Boolean, default: true },
  },
});

export default defineModel("Content", contentSchema);