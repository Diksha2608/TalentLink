
import { useState, useEffect } from 'react';
import { User, Mail, MapPin, DollarSign, Edit2, Save, Upload, X, Link as LinkIcon, Camera } from 'lucide-react';
import SkillSelector from '../components/SkillSelector';
import { authAPI } from '../api/auth';
import MonthYearInput from '../components/MonthYearInput';

export default function FreelancerProfile({ user, setUser }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    hourly_rate: '',
    availability: 'part-time',
    portfolio: '',
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
      const profileResponse = await authAPI.getFreelancerProfile();
      const profile = profileResponse.data;
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        bio: user.bio || '',
        location: user.location || '',
        hourly_rate: profile.hourly_rate || '',
        availability: profile.availability || 'part-time',
        portfolio: profile.portfolio || '',
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
      console.error('Failed to load profile:', err);
    }
  };

  const onPickAvatar = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return setError('Please select an image');
    if (f.size > 5 * 1024 * 1024) return setError('Photo must be under 5MB');
    setAvatarFile(f);
    const r = new FileReader();
    r.onloadend = () => setAvatarPreview(r.result);
    r.readAsDataURL(f);
  };

  const uploadMorePortfolio = async (e) => {
    try {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      const fd = new FormData();
      files.forEach((file, i) => fd.append(`portfolio_file_${i}`, file));
      const res = await authAPI.uploadPortfolioFiles(fd); 
      setPortfolioFiles((prev) => [...res.data.uploaded, ...prev].slice(0, 5));
      setSuccess(`${res.data.count} file(s) uploaded`);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload file(s)');
    }
  };

  const deletePortfolioFile = async (fileId) => {
    try {
      await authAPI.deletePortfolioFile(fileId);
      setPortfolioFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch {
      setError('Failed to delete file');
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const userFD = new FormData();
      userFD.append('first_name', formData.first_name);
      userFD.append('last_name', formData.last_name);
      userFD.append('bio', formData.bio);
      userFD.append('location', formData.location);
      if (avatarFile) userFD.append('avatar', avatarFile);
      await authAPI.updateUser(userFD); 

      // Update freelancer profile
      await authAPI.updateProfile({
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

      const me = await authAPI.me();
      setUser(me.data);
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
              <Edit2 size={18} /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                Cancel
              </button>
              <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm">
                <Save size={18} /> {loading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Avatar + Basic */}
          <div className="flex items-start gap-6">
            <div className="relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-purple-500" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <Camera size={28} className="text-gray-400" />
                </div>
              )}
              {editing && (
                <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer">
                  <Upload size={14} />
                  <input type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
                </label>
              )}
            </div>

            <div className="flex-1 grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" disabled={!editing} value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" disabled={!editing} value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1"><Mail className="inline mr-2" size={14} /> Email</label>
                <input type="email" disabled value={user?.email} className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600" />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
            </div>
          </div>

          {/* Location + Bio */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1"><MapPin className="inline mr-2" size={14} /> Location</label>
              <input type="text" disabled={!editing} value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100" placeholder="City, Country" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Title</label>
              <input type="text" disabled={!editing} value={formData.role_title} onChange={(e) => setFormData({ ...formData, role_title: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100" placeholder="e.g., Senior React Developer" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea disabled={!editing} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={4} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100" placeholder="Tell clients about yourself..." />
          </div>

          {/* Professional */}
          <div className="border-t pt-5">
            <h3 className="text-lg font-semibold mb-3">Professional Information</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"><DollarSign className="inline mr-1" size={14} /> Hourly Rate (₹)</label>
                <input type="number" disabled={!editing} value={formData.hourly_rate} onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <div className={`flex gap-2 ${!editing ? 'opacity-70' : ''}`}>
                  {['full-time','part-time','contract'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      disabled={!editing}
                      onClick={() => setFormData({ ...formData, availability: opt })}
                      className={`px-3 py-1.5 rounded-lg text-xs border ${formData.availability===opt ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'}`}
                    >
                      {opt.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              {editing ? (
                <SkillSelector selectedSkills={formData.skills} setSelectedSkills={(skills) => setFormData({ ...formData, skills })} />
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
