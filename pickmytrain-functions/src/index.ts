import { setGlobalOptions } from "firebase-functions";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

setGlobalOptions({ maxInstances: 10 });

admin.initializeApp();
const db = admin.firestore();

// Configure your Gmail credentials via Firebase environment config
// Run: firebase functions:secrets:set GMAIL_USER and GMAIL_PASS
import { defineSecret } from "firebase-functions/params";
const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_PASS = defineSecret("GMAIL_PASS");

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP to user's email
export const sendOTP = onCall(
  { secrets: [GMAIL_USER, GMAIL_PASS] },
  async (request) => {
    const { email, userId } = request.data;

    if (!email || !userId) {
      throw new HttpsError("invalid-argument", "Email and userId are required.");
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP in Firestore
    await db.collection("otps").doc(userId).set({ otp, expiresAt, email });

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER.value(),
        pass: GMAIL_PASS.value(),
      },
    });

    await transporter.sendMail({
      from: `"PickMyTrain Security" <${GMAIL_USER.value()}>`,
      to: email,
      subject: "Your PickMyTrain Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #1e40af; margin: 0;">PickMyTrain</h2>
            <p style="color: #64748b; margin-top: 4px;">Security Verification</p>
          </div>
          <div style="background: white; border-radius: 12px; padding: 24px; text-align: center; border: 1px solid #e2e8f0;">
            <p style="color: #334155; margin: 0 0 16px;">Your one-time verification code is:</p>
            <div style="font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #1e40af; margin: 16px 0;">
              ${otp}
            </div>
            <p style="color: #94a3b8; font-size: 13px; margin: 16px 0 0;">
              This code expires in <strong>5 minutes</strong>. Do not share it with anyone.
            </p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      `,
    });

    return { success: true };
  }
);

// Verify OTP entered by user
export const verifyOTP = onCall(async (request) => {
  const { userId, otp } = request.data;

  if (!userId || !otp) {
    throw new HttpsError("invalid-argument", "userId and otp are required.");
  }

  const snap = await db.collection("otps").doc(userId).get();

  if (!snap.exists) {
    throw new HttpsError("not-found", "OTP not found. Please request a new one.");
  }

  const data = snap.data()!;

  if (Date.now() > data.expiresAt) {
    await db.collection("otps").doc(userId).delete();
    throw new HttpsError("deadline-exceeded", "OTP has expired. Please request a new one.");
  }

  if (data.otp !== otp) {
    throw new HttpsError("unauthenticated", "Invalid OTP. Please try again.");
  }

  // OTP verified — delete it so it can't be reused
  await db.collection("otps").doc(userId).delete();

  return { success: true };
});
