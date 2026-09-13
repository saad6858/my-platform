/* filepath: components/og-route.tsx */
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest): Promise<ImageResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "My Platform";
    const description =
      searchParams.get("description") || "Premium portfolio and business platform.";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--bg-primary)",
            backgroundImage:
              "radial-gradient(circle at 50% 0%, var(--bg-secondary) 0%, var(--bg-primary) 60%)",
            padding: "60px",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage:
                "radial-gradient(circle at 20% 80%, rgba(16,185,129,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.08) 0%, transparent 50%)",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: "var(--accent-primary)",
                }}
              />
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "var(--accent-secondary)",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                My Platform
              </span>
            </div>
            <h1
              style={{
                fontSize: "64px",
                fontWeight: 800,
                color: "var(--text-primary)",
                textAlign: "center",
                lineHeight: 1.15,
                maxWidth: "900px",
                fontFamily: "Inter, sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: "28px",
                color: "var(--text-secondary)",
                textAlign: "center",
                maxWidth: "800px",
                lineHeight: 1.4,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {description}
            </p>
            <div
              style={{
                display: "flex",
                gap: "16px",
                marginTop: "32px",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "4px",
                  borderRadius: "2px",
                  backgroundColor: "var(--accent-primary)",
                }}
              />
              <div
                style={{
                  width: "40px",
                  height: "4px",
                  borderRadius: "2px",
                  backgroundColor: "var(--accent-quaternary)",
                }}
              />
              <div
                style={{
                  width: "20px",
                  height: "4px",
                  borderRadius: "2px",
                  backgroundColor: "var(--accent-tertiary)",
                }}
              />
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG image generation error:", error);
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
            fontSize: "48px",
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
          }}
        >
          My Platform
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
