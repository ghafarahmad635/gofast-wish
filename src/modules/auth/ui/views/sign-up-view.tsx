'use client'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import React, { useState } from 'react'
import { formSchemasignup } from '../../schema'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FaGithub, FaGoogle } from "react-icons/fa"
import Link from 'next/link'
import { OctagonAlertIcon, Loader2, Eye, EyeOff } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client.ts'

const SignUpView = () => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(null)

  const form = useForm<z.infer<typeof formSchemasignup>>({
    resolver: zodResolver(formSchemasignup),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = form

  // ----------------------------
  // Email/Password Sign Up
  // ----------------------------
  const onSubmit = async (data: z.infer<typeof formSchemasignup>) => {
    setError(null)
    const { error } = await authClient.signUp.email(
       {
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: "/verify-otp?email=" + encodeURIComponent(data.email),
      },
      {
        onSuccess: () => {
         
          setError(null)
          router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
        },
        onError: ({ error }) => {
          setError(error.message)
        },
      }
    )
    if (error?.message) setError(error.message)
  }

  // ----------------------------
  // Social Logins (Google/GitHub)
  // ----------------------------
  const onSocial = async (provider: "github" | "google") => {
    setError(null)
    setSocialLoading(provider)
    try {
      await authClient.signIn.social(
        {
          provider,
          callbackURL: "/",
        },
        {
          onSuccess: () => {
            setError(null)
            router.push("/")
          },
          onError: ({ error }) => {
            setError(error.message)
          },
        }
      )
    } catch {
      setError("Social login failed. Please try again.")
    } finally {
      setSocialLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-3 md:p-6 max-w-2xl md:max-w-4xl m-auto">
      <Card className="overflow-hidden p-0 w-full">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Let&apos;s get started</h1>
                  <p className="text-muted-foreground text-balance">
                    Create your account
                  </p>
                </div>

                {/* Name */}
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="m@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="********"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-primary"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password */}
                <FormField
                  control={control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="********"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-primary"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit + Reset */}
                <div className="flex gap-3">
                  <Button
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 shrink"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing up...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={() => {
                      reset()
                      setError(null)
                    }}
                    variant="outline"
                    className="w-auto shrink-0"
                  >
                    Reset
                  </Button>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert className="bg-destructive/10 border-none">
                    <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}

                {/* Divider */}
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>

                {/* Social Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    disabled={isSubmitting || !!socialLoading}
                    onClick={() => onSocial('google')}
                    variant="outline"
                    type="button"
                    className="w-full flex justify-center hover:text-white"
                  >
                    {socialLoading === 'google' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FaGoogle />
                    )}
                  </Button>

                  <Button
                    disabled={isSubmitting || !!socialLoading}
                    onClick={() => onSocial('github')}
                    variant="outline"
                    type="button"
                    className="w-full flex justify-center hover:text-white"
                  >
                    {socialLoading === 'github' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FaGithub />
                    )}
                  </Button>
                </div>

                {/* Link to sign in */}
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/sign-in" className="underline underline-offset-4">
                    Sign in
                  </Link>
                </div>
              </div>
            </form>
          </Form>

          {/* Right Side */}
          <div className="bg-radial from-sidebar-accent to-sidebar relative hidden md:flex flex-col gap-y-4 items-center justify-center">
            <img
              src="/GoWish-Background.webp"
              alt="Image"
              className="absolute h-full w-full object-cover"
            />
            <div className="bg-radial from-sidebar-accent to-sidebar absolute w-full h-full opacity-50" />
            <p className="text-2xl font-semibold text-white z-10">Gofast Wish</p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our{" "}
        <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}

export default SignUpView
