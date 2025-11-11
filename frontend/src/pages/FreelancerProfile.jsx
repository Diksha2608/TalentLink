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
    role_title: '',
    social_links: { linkedin: '', github: '', website: '', other: '' },
    languages: [{ language: 'English', level: 'Native' }],
    experiences: [],
    education: [],
  });

  const [portfolioFiles, setPortfolioFiles] = useState([]);

  useEffect(() => { loadProfile(); }, []);

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
        role_title: profile.role_title || '',
        social_links: profile.social_links || { linkedin: '', github: '', website: '', other: '' },
        languages: profile.languages && profile.languages.length ? profile.languages : [{ language: 'English', level: 'Native' }],
        experiences: profile.experiences || [],
        education: profile.education || [],
      });
      setPortfolioFiles(profile.portfolio_files || []); 
      setAvatarPreview(user?.avatar || null);
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
        role_title: formData.role_title,
        social_links: formData.social_links,
        languages: formData.languages,
        experiences: formData.experiences,
        education: formData.education,
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
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
              <Edit2 size={18} /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
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

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
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
                    <span key={skill.id} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">{skill.name}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio (text or links)</label>
                <textarea disabled={!editing} value={formData.portfolio} onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100" placeholder="Links or description..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"><LinkIcon className="inline mr-1" size={14} /> Social Links</label>
                <div className="grid grid-cols-2 gap-2">
                  <input disabled={!editing} value={formData.social_links.linkedin || ''} onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, linkedin: e.target.value } })} className="px-3 py-2 border rounded-lg text-sm" placeholder="LinkedIn" />
                  <input disabled={!editing} value={formData.social_links.github || ''} onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, github: e.target.value } })} className="px-3 py-2 border rounded-lg text-sm" placeholder="GitHub" />
                  <input disabled={!editing} value={formData.social_links.website || ''} onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, website: e.target.value } })} className="px-3 py-2 border rounded-lg text-sm" placeholder="Website" />
                  <input disabled={!editing} value={formData.social_links.other || ''} onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, other: e.target.value } })} className="px-3 py-2 border rounded-lg text-sm" placeholder="Other" />
                </div>
              </div>
            </div>

            {/* Experience / Education / Languages */}
{/* Languages */}
<div className="mt-4">
  <h4 className="font-semibold mb-2">Languages</h4>
  {(formData.languages || []).map((l, i) => (
    <div key={i} className="flex gap-2 mb-2">
      <input
        disabled={!editing}
        value={l.language}
        onChange={(e) => {
          const copy = [...formData.languages];
          copy[i] = { ...copy[i], language: e.target.value };
          setFormData({ ...formData, languages: copy });
        }}
        className="w-full px-2 py-1.5 border rounded text-sm"
        placeholder="Language"
      />
      <input
        disabled={!editing}
        value={l.level}
        onChange={(e) => {
          const copy = [...formData.languages];
          copy[i] = { ...copy[i], level: e.target.value };
          setFormData({ ...formData, languages: copy });
        }}
        className="w-28 px-2 py-1.5 border rounded text-sm"
        placeholder="Level"
      />
    </div>
  ))}
</div>

{/* Experience editor (month-year calendars) */}
<div className="mt-6">
  <h4 className="font-semibold mb-2">Experience</h4>

  {editing && (
    <div className="border-2 border-dashed rounded-lg p-3 bg-purple-50 mb-3">
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input
          className="px-2 py-1.5 border rounded text-sm"
          placeholder="Job Title"
          value={formData._newExpTitle || ''}
          onChange={(e) =>
            setFormData({ ...formData, _newExpTitle: e.target.value })
          }
        />
        <input
          className="px-2 py-1.5 border rounded text-sm"
          placeholder="Company"
          value={formData._newExpCompany || ''}
          onChange={(e) =>
            setFormData({ ...formData, _newExpCompany: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <MonthYearInput
          value={formData._newExpStart || ''}
          onChange={(v) =>
            setFormData({ ...formData, _newExpStart: v })
          }
        />
        <MonthYearInput
          value={formData._newExpEnd || ''}
          onChange={(v) =>
            setFormData({ ...formData, _newExpEnd: v })
          }
        />
      </div>

      <textarea
        className="w-full px-2 py-1.5 border rounded text-xs"
        rows={2}
        placeholder="Description"
        value={formData._newExpDesc || ''}
        onChange={(e) =>
          setFormData({ ...formData, _newExpDesc: e.target.value })
        }
      />

      <button
        type="button"
        onClick={() => {
          const t = (formData._newExpTitle || '').trim();
          const c = (formData._newExpCompany || '').trim();
          if (!t || !c) return;

          const next = {
            id: Date.now(),
            title: t,
            company: c,
            startDate: formData._newExpStart || '',
            endDate: formData._newExpEnd || '',
            description: formData._newExpDesc || '',
            current: false,
          };

          setFormData({
            ...formData,
            experiences: [...formData.experiences, next],
            _newExpTitle: '',
            _newExpCompany: '',
            _newExpStart: '',
            _newExpEnd: '',
            _newExpDesc: '',
          });
        }}
        className="mt-2 w-full bg-purple-600 text-white py-1.5 rounded text-sm font-semibold"
      >
        Add
      </button>
    </div>
  )}

  {(formData.experiences || []).map((e) => (
    <div
      key={e.id}
      className="border rounded-lg p-2 flex justify-between text-xs mb-2"
    >
      <div className="min-w-0">
        <div className="font-semibold">{e.title}</div>
        <div className="text-gray-600">{e.company}</div>
        <div className="text-gray-500">
          {e.startDate || '—'} → {e.endDate || (e.current ? 'Present' : '—')}
        </div>
        {e.description && (
          <div className="text-gray-600 mt-1 line-clamp-2">{e.description}</div>
        )}
      </div>

      {editing && (
        <button
          className="text-red-500"
          onClick={() =>
            setFormData({
              ...formData,
              experiences: formData.experiences.filter(
                (x) => x.id !== e.id
              ),
            })
          }
        >
          <X size={16} />
        </button>
      )}
    </div>
  ))}
</div>

{/* Education editor */}
<div className="mt-6">
  <h4 className="font-semibold mb-2">Education</h4>

  {editing && (
    <div className="border-2 border-dashed rounded-lg p-3 bg-purple-50 mb-3">
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input
          className="px-2 py-1.5 border rounded text-sm"
          placeholder="Degree"
          value={formData._newEduDegree || ''}
          onChange={(e) =>
            setFormData({ ...formData, _newEduDegree: e.target.value })
          }
        />
        <input
          className="px-2 py-1.5 border rounded text-sm"
          placeholder="Institution"
          value={formData._newEduInst || ''}
          onChange={(e) =>
            setFormData({ ...formData, _newEduInst: e.target.value })
          }
        />
        <input
          className="px-2 py-1.5 border rounded text-sm"
          placeholder="Field"
          value={formData._newEduField || ''}
          onChange={(e) =>
            setFormData({ ...formData, _newEduField: e.target.value })
          }
        />
        <input
          type="number"
          className="px-2 py-1.5 border rounded text-sm"
          placeholder="Year"
          value={formData._newEduYear || ''}
          onChange={(e) =>
            setFormData({ ...formData, _newEduYear: e.target.value })
          }
        />
      </div>

      <button
        type="button"
        onClick={() => {
          const d = (formData._newEduDegree || '').trim();
          const i = (formData._newEduInst || '').trim();
          if (!d || !i) return;

          const next = {
            id: Date.now(),
            degree: d,
            institution: i,
            field: formData._newEduField || '',
            year: formData._newEduYear || '',
          };

          setFormData({
            ...formData,
            education: [...formData.education, next],
            _newEduDegree: '',
            _newEduInst: '',
            _newEduField: '',
            _newEduYear: '',
          });
        }}
        className="w-full bg-purple-600 text-white py-1.5 rounded text-sm font-semibold"
      >
        Add
      </button>
    </div>
  )}

  {(formData.education || []).map((e) => (
    <div
      key={e.id}
      className="border rounded-lg p-2 flex justify-between text-xs mb-2"
    >
      <div className="min-w-0">
        <div className="font-semibold">{e.degree}</div>
        <div className="text-gray-600">{e.institution}</div>
        <div className="text-gray-500">
          {e.field} {e.year ? `• ${e.year}` : ''}
        </div>
      </div>

      {editing && (
        <button
          className="text-red-500"
          onClick={() =>
            setFormData({
              ...formData,
              education: formData.education.filter(
                (x) => x.id !== e.id
              ),
            })
          }
        >
          <X size={16} />
        </button>
      )}
    </div>
  ))}
</div>
</div>

          {/* Portfolio Files Manager */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Portfolio Files</h3>
              <label className={`px-3 py-1.5 border rounded-lg text-sm cursor-pointer ${editing ? 'hover:border-purple-400' : 'opacity-50 cursor-not-allowed'}`}>
                <Upload size={14} className="inline mr-2" /> Upload
                <input type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={uploadMorePortfolio} disabled={!editing} />
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
            {portfolioFiles.length === 0 ? (
              <p className="text-sm text-gray-600">No files uploaded yet.</p>
            ) : (
              <ul className="divide-y">
                {portfolioFiles.map((f) => (
                  <li key={f.id} className="py-2 flex items-center justify-between">
                    <div className="min-w-0">
                      <a className="text-sm text-purple-700 hover:underline truncate" href={f.file_url || f.file} target="_blank" rel="noreferrer">
                        {f.file_name}
                      </a>
                      <p className="text-xs text-gray-500">{(f.file_size/1024).toFixed(1)} KB</p>
                    </div>
                    {editing && (
                      <button onClick={() => deletePortfolioFile(f.id)} className="text-red-600 hover:text-red-700">
                        <X size={16} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
