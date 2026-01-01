// components/admin/login-form.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "../../components/ui/field";
import { Input } from "../../components/ui/input";
import { useLogin } from "../../hooks/useAuth";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const login = useLogin()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const form = new FormData(e.currentTarget);
        const email = (form.get("email") as string) || "";
        const password = (form.get("password") as string) || "";

        e.preventDefault()
        try {
            await login.mutateAsync({ username: email, password })
            router.push("/admin");
        } catch (err: any) {
            alert('Login error: ' + err?.message)
        }
    }


    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                            </Field>
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                </div>
                                <Input id="password" name="password" type="password" required />
                            </Field>

                            {error && (
                                <div className="text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <Field>
                                <Button type="submit" disabled={login.isPending}>
                                    {login.isPending ? "Logging in…" : "Login"}
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
