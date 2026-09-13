/* filepath: components/newsletter-route.ts */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


// Rate limiting: 5 requests per hour per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required." },
        { status: 400 }
      );
    }

    const newsletterRef = collection(db, "newsletter");
    const q = query(newsletterRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const existing = snapshot.docs[0];
      const data = existing.data();

      if (data.status === "subscribed") {
        return NextResponse.json(
          { success: false, message: "This email is already subscribed." },
          { status: 409 }
        );
      }

      await updateDoc(doc(db, "newsletter", existing.id), {
        status: "subscribed",
        updatedAt: serverTimestamp(),
      });

      return NextResponse.json(
        { success: true, message: "Resubscribed successfully." },
        { status: 200 }
      );
    }

    await addDoc(newsletterRef, {
      email,
      status: "subscribed",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      { success: true, message: "Subscribed successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}


// Rate limiting: 5 requests per hour per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required." },
        { status: 400 }
      );
    }

    const newsletterRef = collection(db, "newsletter");
    const q = query(newsletterRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, message: "Email not found in subscriber list." },
        { status: 404 }
      );
    }

    const docId = snapshot.docs[0].id;
    await updateDoc(doc(db, "newsletter", docId), {
      status: "unsubscribed",
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      { success: true, message: "Unsubscribed successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}


// Rate limiting: 5 requests per hour per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}
export async function GET(): Promise<NextResponse> {
  try {
    const newsletterRef = collection(db, "newsletter");
    const q = query(newsletterRef, where("status", "==", "subscribed"));
    const snapshot = await getDocs(q);

    return NextResponse.json(
      {
        success: true,
        count: snapshot.size,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter count error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
