"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { RiArrowRightLine } from "react-icons/ri";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
    code: z
        .string()
        .min(8)
        .max(8)
        .refine((val) => /^\d+$/.test(val), {
            message: "Code can only contain numbers",
        }),
});
type Schema = z.infer<typeof schema>;

export const VerifyEmailForm = () => {
    const router = useRouter();
    const session = useAuth();

    const [loading, setLoading] = useState(false);
    const form = useForm<Schema>({
        resolver: zodResolver(schema),
        defaultValues: {
            code: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof schema>) => {
        setLoading(true);
        const loadingId = toast.loading("Verifying your email...", {
            description: "Please hold on while we finish verifying your email",
        });

        const { error } = await api.auth.verify.post(data);

        if (!error) {
            toast.success("Email verified successfully", {
                description: "We will redirect you to where you left off",
            });
            router.push("/");
            router.refresh();
        }

        if (error) {
            toast.error("Error verifying email", {
                description: "Code is invalid or has expired",
            });
        }

        toast.dismiss(loadingId);
        setLoading(false);
    };

    if (!session.isAuthenticated) {
        return null;
    }

    return (
        <Form {...form}>
            <div className="relative bg-muted rounded-md shadow-lg border border-solid w-[380px] max-w-full">
                <div className="rounded-md p-8 flex flex-col bg-background border-b border-solid">
                    <Link href="/">
                        <img className="h-8 mb-8" src="/logo.svg" alt="my logo" />
                    </Link>
                    <h1 className="font-semibold mb-2">Check your email</h1>
                    <p className="text-muted-foreground text-sm mb-8">
                        We've sent a code to <span className="font-semibold">{session.user.email}</span>! Enter your
                        verification code to continue.
                    </p>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem className="w-full mb-4 text-muted-foreground">
                                    <FormLabel className="whitespace-nowrap">Verification Code</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage className="text-xs opacity-80 font-normal" />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full gap-2" disabled={loading}>
                            <span>Continue</span>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RiArrowRightLine />}
                        </Button>
                    </form>
                </div>
                <div className="px-8 py-4 text-sm">
                    <span className="text-muted-foreground/80">
                        If you didn't receive a code or your code has expired,{" "}
                    </span>
                    <Link
                        href="#"
                        onClick={async () => {
                            const loadingId = toast.loading("Resending email verification...", {
                                description:
                                    "Our professional office raccoons are working hard to send you a new code. Please wait a moment.",
                            });
                            const { error } = await api.auth.resend.post();

                            if (!error) {
                                toast.success("Email sent!", {
                                    description: "Check your email for the verification code at " + session.user.email,
                                });
                            }

                            if (error) {
                                switch (error.status) {
                                    default:
                                        toast.error("An error occurred. Please try again later.", {
                                            description:
                                                "The error has been logged and we will investigate it shortly.",
                                        });
                                        break;
                                }
                            }

                            toast.dismiss(loadingId);
                        }}
                    >
                        click here to resend your code.
                    </Link>
                </div>
            </div>
        </Form>
    );
};
