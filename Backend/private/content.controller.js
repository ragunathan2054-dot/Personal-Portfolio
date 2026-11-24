import Content from "../shared/models/Content.js";
import Message from "../shared/models/Message.js";

export async function getContentForEdit(req, res) {
  let content = await Content.findOne();
  if (!content) content = await Content.create({});
  res.set("Cache-Control", "no-store");
  res.json(content);
}

export async function updateContent(req, res) {
  const content = await Content.findOneAndUpdate(
    {},
    { $set: req.body },
    { new: true, upsert: true, runValidators: true }
  );
  res.json(content);
}

// Admin-only inbox for messages submitted through the public contact form.
export async function getMessages(req, res) {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
}

export async function deleteMessage(req, res) {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ success: true });
}