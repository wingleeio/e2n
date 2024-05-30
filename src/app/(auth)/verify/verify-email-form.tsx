"use client";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { RiArrowRightLine } from "react-icons/ri";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
    code: z.string().min(8).max(8).regex(new RegExp("^d"), {
        message: "Code can only be numbers",
    }),
});
type Schema = z.infer<typeof schema>;

export const VerifyEmailForm = () => {
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
    };

    return (
        <Form {...form}>
            <div className="relative bg-muted rounded-md shadow-lg border border-solid w-[380px] max-w-full">
                <div className="rounded-md p-8 flex flex-col bg-background">
                    <Link href="/">
                        <img
                            className="h-8 mb-8"
                            src="/logo.svg"
                            alt="my logo"
                        />
                    </Link>
                    <h1 className="font-semibold mb-2">Check your email</h1>
                    <p className="text-muted-foreground text-sm mb-8">
                        We've sent you a code to verify your email! Enter your
                        verification code to continue.
                    </p>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full"
                    >
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem className="w-full mb-4 text-muted-foreground">
                                    <div className="flex justify-between items-center gap-4">
                                        <FormLabel className="whitespace-nowrap">
                                            Verification Code
                                        </FormLabel>
                                        <FormMessage className="text-xs opacity-80 font-normal text-right" />
                                    </div>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full gap-2"
                            disabled={loading}
                        >
                            <span>Continue</span>
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RiArrowRightLine />
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </Form>
    );
};
