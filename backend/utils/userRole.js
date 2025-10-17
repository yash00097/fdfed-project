export const getRole = (email) => {
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
  const agentEmails = process.env.AGENT_EMAILS ? process.env.AGENT_EMAILS.split(',') : [];

  if (adminEmails.includes(email)) {
    return 'admin';
  }
  if (agentEmails.includes(email)) {
    return 'agent';
  }
  return 'normalUser';
};