"use client"

import { useState, useEffect } from "react"
// Supabase client removed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Shield, Calendar, Edit3, Save, X } from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  const [editData, setEditData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          const { data: profile } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', user.email)
            .single()
          
          setUserProfile(profile)
          if (profile) {
            setEditData({
              first_name: profile.first_name || "",
              last_name: profile.last_name || "",
              email: profile.email || user.email || "",
              phone: profile.phone || "",
            })
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast.error("Failed to load profile", {
          description: "There was an error loading your profile data"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    getUserData()
  }, [supabase])

  const handleSave = async () => {
    if (!userProfile?.id) return
    
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({
          first_name: editData.first_name,
          last_name: editData.last_name,
          phone: editData.phone,
        })
        .eq('id', userProfile.id)

      if (error) throw error

      toast.success("Profile updated", {
        description: "Your profile has been updated successfully"
      })
      
      setIsEditing(false)
      // Refresh user profile data
      const { data: updatedProfile } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userProfile.id)
        .single()
      
      setUserProfile(updatedProfile)
    } catch (error: any) {
      toast.error("Update failed", {
        description: error.message || "Failed to update profile"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getUserInitials = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name.charAt(0)}${userProfile.last_name.charAt(0)}`.toUpperCase()
    }
    if (user?.email) {
      const emailParts = user.email.split('@')[0]
      return emailParts.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a2141e] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#a2141e] hover:bg-[#8a0f1a]"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-[#a2141e] hover:bg-[#8a0f1a]"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage src={userProfile?.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-[#150057] to-[#a2141e] text-white text-2xl font-bold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold text-gray-900">
                  {userProfile?.first_name && userProfile?.last_name 
                    ? `${userProfile.first_name} ${userProfile.last_name}`
                    : user?.email || 'User'
                  }
                </h3>
                <p className="text-gray-500">{user?.email}</p>
                {userProfile?.role && (
                  <div className="flex items-center gap-1 mt-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-600 font-medium">
                      {userProfile.role}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Member since</p>
                    <p className="text-sm font-medium">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email verified</p>
                    <p className="text-sm font-medium text-green-600">
                      {user?.email_confirmed_at ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={isEditing ? editData.first_name : (userProfile?.first_name || '')}
                    onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={isEditing ? editData.last_name : (userProfile?.last_name || '')}
                    onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={isEditing ? editData.phone : (userProfile?.phone || '')}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
