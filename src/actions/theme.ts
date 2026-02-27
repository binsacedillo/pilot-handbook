'use server'

// Theme logic deprecated: setThemeCookie removed. App is now locked to Light Mode.
// export async function setThemeCookie(theme: "light" | "dark") {
//   const cookieStore = await cookies();
//   cookieStore.set("theme", theme, {
//     httpOnly: false,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//     path: "/",
//     maxAge: 60 * 60 * 24 * 365,
//   });
// }
