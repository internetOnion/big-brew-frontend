import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      setError("Enter an email and password to continue.")
      return
    }

    setError("")
    // TODO: Add login API call
    console.log("Login submitted:", email.trim())
    // Navigate to dashboard (you can change this route)
    navigate("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md rounded-[2rem] shadow-xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to continue to the dashboard
            </p>
          </div>
          {error ? (
            <p className="mb-4 text-sm text-destructive">{error}</p>
          ) : null}
          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl"
                required
              />
            </div>
            {/* Password */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>
            {/* Login Button */}
            <Button
              type="submit"
              className="h-12 w-full rounded-xl text-base font-medium"
            >
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}