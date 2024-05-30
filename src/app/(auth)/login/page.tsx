"use client";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { FaDiscord, FaGithub } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
    email: z.string().email({
        message: "Please enter a valid email",
    }),
    password: z
        .string()
        .regex(new RegExp('(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*'), {
            message:
                "Password must contain at least one uppercase letter and one special character",
        })
        .min(8, {
            message: "Password must be at least 8 characters long",
        }),
});

type Schema = z.infer<typeof schema>;

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const form = useForm<Schema>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: Schema) => {
        setLoading(true);
        const loadingId = toast.loading("Logging in...", {
            description:
                "Please hold on while our specialized team of space rabbits verify your credentials",
        });
        const { error } = await api.auth.signin.post(data);

        if (!error) {
            toast.success("Logged in successfully", {
                description: "We will redirect you to where you left off",
            });
            router.push("/");
            router.refresh();
        }

        if (error) {
            switch (error.status) {
                case 401:
                case 422:
                    toast.error("Invalid email or password", {
                        description:
                            "Please check your credentials and try again.",
                    });
                    break;
                default:
                    toast.error("An error occurred. Please try again later.", {
                        description:
                            "The error has been logged and we will investigate it shortly.",
                    });
                    break;
            }
        }

        toast.dismiss(loadingId);
        setLoading(false);
    };

    return (
        <Form {...form}>
            <div className="relative bg-muted rounded-md shadow-lg border border-solid w-[380px] max-w-full transition-all">
                <div className="rounded-md p-8 flex flex-col bg-background border-b border-solid">
                    <Link href="/">
                        <img
                            className="h-8 mb-8"
                            src="/logo.svg"
                            alt="my logo"
                        />
                    </Link>
                    <h1 className="font-semibold mb-2">Login to Superstack</h1>
                    <p className="text-muted-foreground text-sm mb-8">
                        Welcome back! Please login to continue
                    </p>
                    <div className="flex gap-2 w-full mb-4">
                        <Button variant="outline" className="w-full gap-4">
                            <FaGithub className="h-5 w-5" />
                        </Button>
                        <Button variant="outline" className="w-full gap-4">
                            <FaDiscord className="h-5 w-5 fill-[#7289da]" />
                        </Button>
                    </div>
                    <div className="mb-4 w-full flex items-center">
                        <Separator className="flex-1" />
                        <span className="text-muted-foreground text-xs px-2">
                            OR
                        </span>
                        <Separator className="flex-1" />
                    </div>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full"
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="w-full mb-4 text-muted-foreground">
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-xs opacity-80 font-normal" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem className="w-full mb-4 text-muted-foreground">
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-xs opacity-80 font-normal" />
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

                <div className="p-4 text-center text-sm">
                    <span className="text-muted-foreground/80">
                        Don't have an account?{" "}
                    </span>
                    <Link href="/join">Join now</Link>
                </div>
            </div>
        </Form>
    );
}
