import LoginForm from "@/components/auth/login-form"
import { TestCredentialsHelper } from "@/components/auth/test-credentials-helper"

export default function LoginPage() {
  return (
    <div className="flex flex-col">
      <LoginForm />

      {/* Test Credentials Helper - Only show in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 z-50">
          <details className="group">
            <summary className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors list-none">
              <span className="flex items-center gap-2">
                <span>Test Credentials</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </span>
            </summary>
            <div className="absolute bottom-full right-0 mb-2 w-[500px]">
              <TestCredentialsHelper />
            </div>
          </details>
        </div>
      )}
    </div>
  )
}
