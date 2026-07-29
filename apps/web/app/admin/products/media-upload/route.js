import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { AuthRequiredError, customerApi } from "@/lib/auth";

/**
 * Issues Vercel Blob client-upload tokens for product media (spec §5.3 PDP
 * gallery). The actual file bytes go BROWSER → Blob directly — this route
 * never receives the file itself, only authorises the upload, so there is
 * no serverless body-size limit to fight and nothing to proxy.
 *
 * Security: the token is only ever issued to a signed-in MERCHANDISER (or
 * PLATFORM_ADMIN, owner-continuity — see packages/utils/src/rbac.js
 * PERMISSION_MATRIX) — mirrors the API's own `@RequireRoles` on product
 * create/update (spec §3.2 segregation of duties: this is commerce data,
 * not the compliance profile, but still gated to the roles that own
 * products). Content type and size are enforced server-side in the token
 * grant itself, not just as a client `accept` hint, so a modified client
 * request still can't smuggle a non-image or oversized file.
 */
const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_ROLES = ["merchandiser", "platform_admin"];

export async function POST(request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        let operator;
        try {
          operator = await customerApi("/operator/me");
        } catch (error) {
          if (error instanceof AuthRequiredError) {
            throw new Error("Sign in required");
          }
          throw error;
        }
        if (!ALLOWED_ROLES.includes(operator.role)) {
          throw new Error("Only merchandisers can upload product media");
        }

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_SIZE_BYTES,
          addRandomSuffix: true,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    // Vercel Blob's client SDK reads `error` off the JSON body on failure.
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
