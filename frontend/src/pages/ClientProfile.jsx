import { useState, useEffect } from 'react';
import { User, Mail, MapPin, Building, Edit2, Save, Upload } from 'lucide-react';
import { authAPI } from '../api/auth';

export default function ClientProfile({ user, setUser }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [idFile, setIdFile] = useState(null);

  const [clientProfile, setClientProfile] = useState(null);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    company_name: '',
    company_website: '',
  });

  useEffect(() => {
    let mounted = true;
    authAPI.getClientProfile()
      .then((res) => {
        if (!mounted) return;
        setClientProfile(res.data);
        setFormData((prev) => ({
          ...prev,
          company_name: res.data?.company_name || '',
          company_website: res.data?.company_website || '',
        }));
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const handleAvatarChange = (e) => {
    if (e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleIdUpload = (e) => {
    if (e.target.files[0]) {
      setIdFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // 1) Update User (name/bio/location/avatar)
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('location', formData.location);
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }
      await authAPI.updateUser(formDataToSend);

      // 2) Update Client Profile (company fields + ID document)
      if (idFile || formData.company_name || formData.company_website) {
        const clientFd = new FormData();
        if (formData.company_name) clientFd.append('company_name', formData.company_name);
        if (formData.company_website) clientFd.append('company_website', formData.company_website);
        if (idFile) clientFd.append('id_document', idFile);
        await authAPI.updateClientProfile(clientFd);
      }

      // 3) Refresh snapshots
      const [userResponse, clientResponse] = await Promise.all([
        authAPI.me(),
        authAPI.getClientProfile(),
      ]);
      setUser(userResponse.data);
      setClientProfile(clientResponse.data);

      setSuccess('Profile updated successfully!');
      setEditing(false);
      setAvatarFile(null);
      setIdFile(null);
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const idUrl = clientProfile?.id_document_url || clientProfile?.id_document || null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
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
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

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

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Profile Photo */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-purple-600" />
              )}
            </div>
            {editing && (
              <div>
                <label className="cursor-pointer px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-flex items-center gap-2">
                  <Upload size={18} />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                {avatarFile && <p className="text-sm text-green-600 mt-2">Photo selected: {avatarFile.name}</p>}
              </div>
            )}
          </div>

          {/* Verification Badge */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Verification Status</h3>
                <p className="text-sm text-blue-700">
                  {clientProfile?.is_verified ? '✅ Verified Client' : '⏳ Pending Verification'}
                </p>
                {clientProfile?.verification_submitted_at && !clientProfile?.is_verified && (
                  <p className="text-xs text-blue-600 mt-1">
                    Submitted: {new Date(clientProfile.verification_submitted_at).toLocaleString()}
                  </p>
                )}
                {idUrl && (
                  <a
                    href={idUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-700 underline mt-1 inline-block"
                  >
                    View ID on file
                  </a>
                )}
              </div>
              {!clientProfile?.is_verified && editing && (
                <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2">
                  <Upload size={18} />
                  Upload ID
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleIdUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {idFile && <p className="text-sm text-green-600 mt-2">ID uploaded: {idFile.name}</p>}
          </div>

          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline mr-2" size={16} />
                First Name
              </label>
              <input
                type="text"
                disabled={!editing}
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 disabled:bg-gray-100"
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
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline mr-2" size={16} />
              Email
            </label>
            <input
              type="email"
              disabled
              value={user?.email}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline mr-2" size={16} />
              Location
            </label>
            <input
              type="text"
              disabled={!editing}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 disabled:bg-gray-100"
              placeholder="City, Country"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="inline mr-2" size={16} />
              Company Name (Optional)
            </label>
            <input
              type="text"
              disabled={!editing}
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 disabled:bg-gray-100"
              placeholder="Your company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About / Bio
            </label>
            <textarea
              disabled={!editing}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 disabled:bg-gray-100"
              placeholder="Tell freelancers about your company or projects..."
            />
          </div>

          {/* Stats */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Client Statistics</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{clientProfile?.projects_posted ?? user?.projects_posted ?? 0}</div>
                <div className="text-sm text-gray-600">Projects Posted</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{clientProfile?.active_projects ?? user?.active_projects ?? 0}</div>
                <div className="text-sm text-gray-600">Active Projects</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{user?.rating_avg || 0}/5</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
