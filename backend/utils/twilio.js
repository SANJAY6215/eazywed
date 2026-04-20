import twilio from "twilio"
import { TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE, NODE_ENV } from "../config/env.js"

const hasValidTwilioConfig =
  typeof TWILIO_SID === "string" &&
  TWILIO_SID.startsWith("AC") &&
  typeof TWILIO_AUTH_TOKEN === "string" &&
  TWILIO_AUTH_TOKEN.trim().length > 0 &&
  typeof TWILIO_PHONE === "string" &&
  TWILIO_PHONE.trim().length > 0

const client = hasValidTwilioConfig ? twilio(TWILIO_SID, TWILIO_AUTH_TOKEN) : null

export const sendOTP = async (phone, otp) => {
  if (NODE_ENV === "development" || !client) {
    console.log(`Mock SMS to ${phone}: Your OTP is ${otp}`)
    return
  }
  await client.messages.create({
    body: `Your EazyWed OTP is ${otp}`,
    from: TWILIO_PHONE,
    to: phone,
  })
}
