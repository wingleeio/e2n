import { VerifyEmailForm } from "@/app/(auth)/verify/verify-email-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function VerifyEmail() {
    const session = auth();

    if (session.isAuthenticated && session.user.email_verified) {
        redirect("/");
    }

    return <VerifyEmailForm />;
}
