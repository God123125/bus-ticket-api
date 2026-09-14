import { OAuth2Client } from "google-auth-library";

const clientId = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clientId);

export async function verifyGoogleToken(idToken: string) {
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not defined in environment variables.");
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId,
  });
  const payload = ticket.getPayload();
  return payload;
}
