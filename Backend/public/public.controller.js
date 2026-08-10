import Content from "../shared/models/Content.js";
import Message from "../shared/models/Message.js";

export async function getPublicContent(req, res) {
  let content = await Content.findOne();
  if (!content) content = await Content.create({});
  res.json(content);
}

export async function submitContactMessage(req, res) {
  const { name, email, message } = req.body;
  await Message.create({ name, email, message });
  res.json({ success: true });
}