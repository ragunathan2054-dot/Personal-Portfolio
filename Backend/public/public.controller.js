import Content from "../shared/models/Content.js";
import Message from "../shared/models/Message.js";
import { publicCertificates } from "../shared/utils/certificates.js";

export async function getPublicContent(req, res) {
  let content = await Content.findOne();
  if (!content) content = await Content.create({});
  const data = content.toJSON();
  data.certificates = publicCertificates(data.certificates);
  // Browsers must check back each visit, so admin edits show up right away.
  res.set("Cache-Control", "no-cache");
  res.json(data);
}

export async function submitContactMessage(req, res) {
  const { name, email, message } = req.body;
  await Message.create({ name, email, message });
  res.json({ success: true });
}