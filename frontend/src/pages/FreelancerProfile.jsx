import { useState, useEffect } from "react";
import { Edit2, Save, Camera, MapPin } from "lucide-react";
import SkillSelector from "../components/SkillSelector";
import { api } from "../api/client"; // changed from authAPI → api

export default function FreelancerProfile({ user, setUser }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    hourly_rate: "",
    availability: "part-time",
    portfolio: "",
    skills: [],
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileRes = await api.getFreelancerProfile();
      const profile = profileRes.data;

      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        bio: user.bio || "",
        location: user.location || "",
        hourly_rate: profile.hourly_rate || "",
        availability: profile.availability || "part-time",
        portfolio: profile.portfolio || "",
        skills: profile.skills || [],
      });
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  //  Handle image file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  //Save handler
  const handleSave = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // --- Step 1: Update User info (with avatar) ---
      const userForm = new FormData();
      userForm.append("first_name", formData.first_name);
      userForm.append("last_name", formData.last_name);
      userForm.append("bio", formData.bio);
      userForm.append("location", formData.location);
      if (avatarFile) userForm.append("avatar", avatarFile);

      await api.updateUser(userForm, true);

      // --- Step 2: Update Freelancer profile ---
      await api.updateProfile({
        skill_ids: formData.skills.map((s) => s.id),
        hourly_rate: formData.hourly_rate,
        availability: formData.availability,
        portfolio: formData.portfolio,
      });

      // --- Step 3: Refresh user data ---
      const meRes = await api.me();
      setUser(meRes.data);

      setSuccess("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      console.error("Profile update failed:", err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("❌ Failed to update profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Edit2 size={18} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Save size={18} />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Profile Photo */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={
                  avatarPreview ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-purple-100"
              />
              {editing && (
                <label
                  htmlFor="avatarUpload"
                  className="absolute bottom-1 right-1 bg-purple-600 p-2 rounded-full cursor-pointer hover:bg-purple-700"
                >
                  <Camera className="text-white" size={16} />
                  <input
                    id="avatarUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div>
              <p className="text-lg font-semibold">
                {formData.first_name} {formData.last_name}
              </p>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                disabled={!editing}
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                disabled={!editing}
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Location & Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline mr-2" size={16} />
              Location
            </label>
            <input
              type="text"
              disabled={!editing}
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
              placeholder="City, Country"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              disabled={!editing}
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
              placeholder="Tell clients about yourself..."
            />
          </div>

          {/* Skills & Portfolio */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">
              Professional Information
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              {editing ? (
                <SkillSelector
                  selectedSkills={formData.skills}
                  setSelectedSkills={(skills) =>
                    setFormData({ ...formData, skills })
                  }
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portfolio
              </label>
              <textarea
                disabled={!editing}
                value={formData.portfolio}
                onChange={(e) =>
                  setFormData({ ...formData, portfolio: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                placeholder="Describe your work or add portfolio links..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
