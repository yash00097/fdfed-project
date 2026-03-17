export const getRole = (email) => {
  if (!email) return 'normalUser';

  // Normalize the input email
  const normalizedEmail = email.toLowerCase().trim();

  // Always trim() each entry to handle spaces that may appear after commas in .env
  const adminEmails = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',').map(e => e.toLowerCase().trim()).filter(Boolean)
    : [];

  const agentEmails = process.env.AGENT_EMAILS
    ? process.env.AGENT_EMAILS.split(',').map(e => e.toLowerCase().trim()).filter(Boolean)
    : [];

  if (adminEmails.includes(normalizedEmail)) return 'admin';
  if (agentEmails.includes(normalizedEmail)) return 'agent';
  return 'normalUser';
};