import type { NextApiRequest, NextApiResponse } from "next";

const VALID_CREDENTIALS = {
  email: "user@example.com",
  password: "Password123!",
};

type Data = {
  message: string;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed." });
  }

  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  await delay(800);

  if (
    email.trim().toLowerCase() !== VALID_CREDENTIALS.email ||
    password !== VALID_CREDENTIALS.password
  ) {
    return res.status(401).json({ message: "Incorrect email or password." });
  }

  return res.status(200).json({ message: "Logged in successfully. Welcome back!" });
}
