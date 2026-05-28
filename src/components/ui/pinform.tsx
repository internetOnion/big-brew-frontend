import { useState } from "react"
import { Delete } from "lucide-react"
import { Button } from "@/components/ui/button"
export default function PinForm() {
  const [pin, setPin] = useState("")
  const handleNumber = (num: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num)
    }
  }
  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1))
  }
  const handleLogin = () => {
    // TODO: Replace with actual PIN validation
    if (pin === "123456") {
      // TODO: Add redirect to menu/POS page
      console.log("PIN correct, unlocking...")
    } else {
      alert("Incorrect PIN")
      setPin("")
    }
  }
  const keypad = [
    "1", "2", "3",
    "4", "5", "6",
    "7", "8", "9",
    "", "0", "del",
  ]
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          Big Brew
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Barista Login
        </p>
      </div>
      {/* PIN Indicator - iPhone Style Dots */}
      <div className="mb-12 flex gap-4">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className={`h-5 w-5 rounded-full border-2 transition-all duration-200 ${
              index < pin.length
                ? "scale-110 border-primary bg-primary"
                : "border-muted-foreground bg-transparent"
            }`}
          />
        ))}
      </div>
      {/* Keypad */}
      <div className="grid w-full max-w-sm grid-cols-3 gap-4">
        {keypad.map((key, index) => {
          if (key === "") {
            return <div key={index} />
          }
          if (key === "del") {
            return (
              <Button
                key={index}
                variant="outline"
                size="lg"
                className="h-20 rounded-2xl text-xl"
                onClick={handleDelete}
              >
                <Delete className="h-6 w-6" />
              </Button>
            )
          }
          return (
            <Button
              key={index}
              variant="outline"
              size="lg"
              className="h-20 rounded-2xl text-3xl font-medium"
              onClick={() => handleNumber(key)}
            >
              {key}
            </Button>
          )
        })}
      </div>
      {/* Unlock Button */}
      <Button
        size="lg"
        className="mt-8 h-16 w-full max-w-sm rounded-2xl text-xl font-medium"
        onClick={handleLogin}
        disabled={pin.length !== 6}
      >
        Unlock
      </Button>
    </div>
  )
}