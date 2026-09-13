/* filepath: components/analytics-route.ts */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore";

interface PageViewBody {
  page: string;
  sessionId: string;
  userAgent?: string;
  referrer?: string;
}

interface PageViewDoc {
  page: string;
  sessionId: string;
  userAgent: string;
  referrer: string;
  createdAt: Timestamp;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: PageViewBody = await request.json();

    if (!body.page || typeof body.page !== "string") {
      return NextResponse.json(
        { success: false, message: "Page path is required." },
        { status: 400 }
      );
    }

    if (!body.sessionId || typeof body.sessionId !== "string") {
      return NextResponse.json(
        { success: false, message: "Session ID is required." },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get("user-agent") || body.userAgent || "unknown";
    const referrer = request.headers.get("referer") || body.referrer || "direct";

    await addDoc(collection(db, "page_views"), {
      page: body.page,
      sessionId: body.sessionId,
      userAgent,
      referrer,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json(
      { success: true, message: "Page view tracked." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Analytics track error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

interface AnalyticsSummary {
  totalViews: number;
  uniqueSessions: number;
  topPages: Array<{ page: string; views: number }>;
  avgSessionDuration: number;
  dailyViews: Array<{ date: string; views: number }>;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const now = new Date();
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    const endDate = endDateParam
      ? new Date(endDateParam)
      : now;

    endDate.setHours(23, 59, 59, 999);

    const viewsRef = collection(db, "page_views");
    const q = query(
      viewsRef,
      where("createdAt", ">=", Timestamp.fromDate(startDate)),
      where("createdAt", "<=", Timestamp.fromDate(endDate)),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    const docs: PageViewDoc[] = snapshot.docs.map((d) => d.data() as PageViewDoc);

    const totalViews = docs.length;

    const sessionIds = new Set<string>();
    docs.forEach((d) => sessionIds.add(d.sessionId));
    const uniqueSessions = sessionIds.size;

    const pageCounts: Record<string, number> = {};
    docs.forEach((d) => {
      pageCounts[d.page] = (pageCounts[d.page] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const dailyCounts: Record<string, number> = {};
    docs.forEach((d) => {
      const date = d.createdAt.toDate().toISOString().split("T")[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });
    const dailyViews = Object.entries(dailyCounts)
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const sessionGroups: Record<string, PageViewDoc[]> = {};
    docs.forEach((d) => {
      if (!sessionGroups[d.sessionId]) sessionGroups[d.sessionId] = [];
      sessionGroups[d.sessionId].push(d);
    });

    let totalDuration = 0;
    let sessionCountWithDuration = 0;
    Object.values(sessionGroups).forEach((sessionDocs) => {
      if (sessionDocs.length >= 2) {
        const times = sessionDocs.map((d) => d.createdAt.toDate().getTime()).sort((a, b) => a - b);
        const duration = (times[times.length - 1] - times[0]) / 1000;
        totalDuration += duration;
        sessionCountWithDuration += 1;
      }
    });
    const avgSessionDuration = sessionCountWithDuration > 0 ? totalDuration / sessionCountWithDuration : 0;

    const summary: AnalyticsSummary = {
      totalViews,
      uniqueSessions,
      topPages,
      avgSessionDuration: Math.round(avgSessionDuration),
      dailyViews,
    };

    return NextResponse.json(
      { success: true, data: summary },
      { status: 200 }
    );
  } catch (error) {
    console.error("Analytics summary error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
