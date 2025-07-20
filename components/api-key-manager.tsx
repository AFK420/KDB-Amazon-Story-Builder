"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Key, CheckCircle, AlertCircle, ExternalLink, Copy } from "lucide-react"

interface APIKeyManagerProps {
  onApiKeyConfigured: () => void
}

export default function APIKeyManager({ onApiKeyConfigured }: APIKeyManagerProps) {
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationStatus, setValidationStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const validateAndSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setErrorMessage("Please enter your Gemini API key")
      setValidationStatus("error")
      return
    }

    // Basic API key format validation
    if (!apiKey.startsWith("AIza") || apiKey.length < 35) {
      setErrorMessage(
        "Invalid API key format. Gemini API keys should start with 'AIza' and be at least 35 characters long.",
      )
      setValidationStatus("error")
      return
    }

    setIsValidating(true)
    setValidationStatus("idle")
    setErrorMessage("")

    try {
      console.log("Sending API key configuration request...")

      const response = await fetch("/api/configure-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      })

      console.log("Response status:", response.status)

      let data
      try {
        data = await response.json()
        console.log("Response data:", data)
      } catch (jsonError) {
        console.error("Failed to parse response JSON:", jsonError)
        throw new Error("Invalid response from server")
      }

      if (response.ok && data.valid) {
        setValidationStatus("success")
        onApiKeyConfigured()
        // Clear the API key from state for security
        setApiKey("")
      } else {
        setValidationStatus("error")
        setErrorMessage(data.error || "Invalid API key. Please check your key and try again.")
      }
    } catch (error: any) {
      console.error("Error validating API key:", error)
      setValidationStatus("error")
      setErrorMessage("Failed to validate API key. Please check your connection and try again.")
    } finally {
      setIsValidating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      validateAndSaveApiKey()
    }
  }

  const copyExampleKey = () => {
    setApiKey("AIzaSyAEINcwxcqF5BoSVDkLIyMTIHxqZjjtfsc")
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Setup with Provided Key */}
      <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="text-green-900 dark:text-green-100 flex items-center gap-2">
            <Key className="w-5 h-5" />
            Quick Setup - Use Provided API Key
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            Click the button below to use the pre-configured API key for immediate testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900 rounded-lg mb-4">
            <code className="text-sm font-mono text-green-800 dark:text-green-200 flex-1">
              AIzaSyAEINcwxcqF5BoSVDkLIyMTIHxqZjjtfsc
            </code>
            <Button size="sm" variant="outline" onClick={copyExampleKey}>
              <Copy className="w-4 h-4 mr-1" />
              Use This Key
            </Button>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            This is a working API key provided for testing. You can also get your own free key from Google AI Studio
            below.
          </p>
        </CardContent>
      </Card>

      {/* API Key Setup Instructions */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <Key className="w-5 h-5" />
            Get Your Own Gemini API Key
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            Follow these steps to get your free Gemini API key from Google AI Studio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>
              Visit{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Google AI Studio
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>Sign in with your Google account</li>
            <li>Click "Create API Key" button</li>
            <li>Select "Create API key in new project" or choose an existing project</li>
            <li>Copy the generated API key (starts with "AIza")</li>
            <li>Paste it in the field below and click "Configure"</li>
          </ol>
          <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Your API key is stored securely and only used for generating your story content.
              Gemini API offers generous free usage limits perfect for novel writing.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* API Key Input */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Gemini API Key</CardTitle>
          <CardDescription>Enter your Gemini API key to enable AI-powered chapter generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Gemini API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your Gemini API key (e.g., AIzaSy...)"
                className="pr-10"
                disabled={isValidating}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
                disabled={isValidating}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {validationStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {validationStatus === "success" && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                API key configured successfully! You can now use AI chapter generation.
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={validateAndSaveApiKey} disabled={isValidating || !apiKey.trim()} className="w-full">
            {isValidating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Validating...
              </>
            ) : (
              <>
                <Key className="w-4 h-4 mr-2" />
                Configure API Key
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Security:</strong> Your API key is encrypted and stored securely. It's only used to generate content
          for your stories and is never shared with third parties.
        </AlertDescription>
      </Alert>
    </div>
  )
}
