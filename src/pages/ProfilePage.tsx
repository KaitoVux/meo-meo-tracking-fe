import { ProfileForm } from '@/components/auth/ProfileForm'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6">
        <div className="max-w-2xl mx-auto">
          <ProfileForm />
        </div>
      </div>
    </ProtectedRoute>
  )
}
