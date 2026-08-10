import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
  site: {
    logoText: { type: String, default: "AK" },
    logoImageUrl: { type: String, default: "" },
    heroBadgeText: { type: String, default: "AK" },
    heroPhotoUrl: { type: String, default: "" }, // new — your real photo, shown instead of the initials badge
  },
  hero: {
    eyebrow: String,
    headline: String,
    description: String,
    roles: [String],
    buttons: [{ label: String, link: String }],
    resumeUrl: String,
  },
  about: {
    paragraphs: [String],
    stats: [{ number: String, label: String }],
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
    { name: String, issuer: String, credentialId: String, issued: String, expiry: String, logoUrl: String },
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

export default mongoose.model("Content", contentSchema);