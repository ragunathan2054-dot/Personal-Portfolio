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
  // Existing fields are kept as-is. name = title, expiry = "expires",
  // credentialUrl = "verify URL". The rest are optional and default safely, so
  // certificates saved before they existed still load without errors.
  certificates: [
    {
      name: String,
      issuer: String,
      credentialId: String,
      issued: String,
      expiry: String,
      logoUrl: String,
      credentialUrl: String,
      kind: { type: String, default: "" },           // course type, e.g. "Skill Builder course"
      skills: { type: [String], default: [] },        // shown as tags (max 8)
      certificateUrl: { type: String, default: "" },  // link to the certificate image / PDF
      issuerCode: { type: String, default: "" },      // short badge text, e.g. "AWS"; empty = generated
      order: { type: Number, default: null },         // manual sort position; empty = by date
      isVisible: { type: Boolean, default: true },    // hidden ones don't show on the public site
    },
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