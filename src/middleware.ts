import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet: Array<{ name: string; value: string; options: Record<string, any> }>) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        supabaseResponse.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // Refresh session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith("/admin") && !request.nextUrl.pathname.startsWith("/admin/login")) {
        if (!user) {
            const redirectUrl = new URL("/admin/login", request.url);
            return NextResponse.redirect(redirectUrl);
        }
    }

    // Redirect to admin if already logged in and trying to access login
    if (request.nextUrl.pathname === "/admin/login" && user) {
        const redirectUrl = new URL("/admin", request.url);
        return NextResponse.redirect(redirectUrl);
    }

    return supabaseResponse;
}

export const config = {
    matcher: ["/admin/:path*"],
};
