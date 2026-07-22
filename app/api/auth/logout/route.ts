import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear the admin_session cookie
  response.cookies.set({
    name: "admin_session",
    value: "",
    httpOnly: true,
    expires: new Date(0), // expire immediately
    path: "/",
  });
  
  return response;
}
