import { redirect } from "next/navigation"

export default function SignUpPage() {
  // Redirect to login page - registration is disabled
  // Only authorized administrators can create accounts for personnel
  redirect('/auth/login')
}
