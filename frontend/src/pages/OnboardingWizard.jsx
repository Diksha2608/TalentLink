import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, CheckCircle, AlertCircle, Plus, X, File, ChevronRight, Sparkles, Calendar } from 'lucide-react';
import OnboardingStepper from '../components/OnboardingStepper';
import SkillSelector from '../components/SkillSelector';
import { authAPI } from '../api/auth';
import CalendarInput from "../components/CalendarInput";
import MonthYearInput from "../components/MonthYearInput";
import LocationSelectLite from "../components/LocationSelectLite";

const WORK_CATEGORIES = [
  { id: 'web-dev', name: 'Web Development', icon: '💻', desc: 'Websites & Apps' },
  { id: 'mobile-dev', name: 'Mobile Dev', icon: '📱', desc: 'iOS, Android' },
  { id: 'design', name: 'Design', icon: '🎨', desc: 'UI/UX, Graphics' },
  { id: 'writing', name: 'Writing', icon: '✍️', desc: 'Content, Copy' },
  { id: 'marketing', name: 'Marketing', icon: '📊', desc: 'Digital, SEO' },
  { id: 'data', name: 'Data Science', icon: '📈', desc: 'Analytics, ML' },
  { id: 'admin', name: 'Admin', icon: '💼', desc: 'VA, Support' },
  { id: 'engineering', name: 'Engineering', icon: '⚙️', desc: 'CAD, Architecture' },
  { id: 'finance', name: 'Finance', icon: '💰', desc: 'Accounting' },
  { id: 'legal', name: 'Legal', icon: '⚖️', desc: 'Compliance' },
  { id: 'other', name: 'Other', icon: '🔧', desc: 'Your specialty' },
];
const LANGUAGE_LEVELS = ['Basic', 'Conversational', 'Fluent', 'Native'];
const COMMON_LANGUAGES = ['English', 'Hindi', 'Gujarati', 'Spanish', 'French', 'German', 'Chinese', 'Arabic', 'Portuguese', 'Japanese', 'Marathi', 'Tamil', 'Telugu'];

export default function OnboardingWizard({ user, setUser }) {
  const [step, setStep] = useState(0);
  const totalSteps = 10;
  const navigate = useNavigate();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [formData, setFormData] = useState({
    linkedin: '', github: '', portfolio_site: '', other_url: '',
    category: '', custom_category: '',
    skills: [],
    role_title: '', hourly_rate: '',
    experiences: [], newExp: { title: '', company: '', startDate: '', endDate: '', current: false, description: '' },
    education: [], newEdu: { degree: '', institution: '', field: '', year: '' },
    languages: [{ language: 'English', level: 'Native' }],
    bio: '',
    photoFile: null, photoPreview: null, phone: '', birthdate: '', location: user?.location || '',
    portfolioFiles: [],
    availability: 'part-time', 
    portfolio: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('access_token');
  if (!mounted || (!user && !token)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-purple-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (user?.role === 'client') {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <div className="text-4xl mb-2">🎯</div>
          <h2 className="text-xl font-bold mb-2 text-gray-900">Welcome, Client!</h2>
          <p className="text-gray-600 mb-4 text-xs">This onboarding is for freelancers</p>
          <button onClick={() => navigate('/dashboard/client')} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 font-semibold shadow-lg text-sm">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const setFD = (patch) => setFormData((p) => ({ ...p, ...patch }));

  const validate = () => {
    setError('');
    switch (step) {
      case 1:
        if (!formData.category) return setError('Please select a category'), false;
        if (formData.category === 'other' && !formData.custom_category.trim()) return setError('Please describe your specialty'), false;
        return true;
      case 2:
        if (formData.skills.length === 0) return setError('Add at least one skill'), false;
        if (formData.skills.length > 20) return setError('Maximum 20 skills'), false;
        return true;
      case 3:
        if (!formData.role_title.trim()) return setError('Title is required'), false;
        if (formData.role_title.length < 5) return setError('Title too short (min 5 chars)'), false;
        if (!formData.hourly_rate || Number(formData.hourly_rate) <= 0) return setError('Valid rate required'), false;
        if (Number(formData.hourly_rate) > 50000) return setError('Rate too high'), false;
        return true;
      case 6:
        if (!formData.languages.length) return setError('Add at least one language'), false;
        for (let lang of formData.languages) {
          if (!lang.language) return setError('Select all languages'), false;
        }
        return true;
      case 7:
        if (!formData.bio || formData.bio.length < 50) return setError('Bio must be 50+ characters'), false;
        if (formData.bio.length > 2000) return setError('Bio too long (max 2000)'), false;
        return true;
      case 8:
        if (!formData.phone.trim()) return setError('Phone required'), false;
        if (!/^\+?\d{10,15}$/.test(formData.phone.replace(/[\s()-]/g, ''))) return setError('Invalid phone'), false;
        if (!formData.birthdate) return setError('Birthdate required'), false;
        const age = new Date().getFullYear() - new Date(formData.birthdate).getFullYear();
        if (age < 16) return setError('Must be 16+ years old'), false;
        if (age > 100) return setError('Invalid birthdate'), false;
        if (!formData.location.trim()) return setError('Location required'), false;
        return true;
      case 9:
        if (formData.portfolioFiles.length > 5) return setError('Max 5 files'), false;
        for (let file of formData.portfolioFiles) {
          if (file.size > 10 * 1024 * 1024) return setError(`"${file.name}" exceeds 10MB`), false;
        }
        return true;
      default:
        return true;
    }
  };

  const next = () => { if (validate() && step < totalSteps - 1) setStep(step + 1); };
  const back = () => setStep((s) => (s > 0 ? s - 1 : 0));
  const skippable = [0, 4, 5, 9].includes(step);
  const skip = () => { if (skippable && step < totalSteps - 1) { setError(''); setStep(step + 1); } };

  const addExperience = () => {
    const e = formData.newExp;
    if (!e.title.trim()) return setError('Job title required');
    if (!e.company.trim()) return setError('Company required');
    if (e.startDate && e.endDate && !e.current && e.startDate > e.endDate) return setError('Invalid dates');
    setError('');
    setFD({ experiences: [...formData.experiences, { ...e, id: Date.now() }], newExp: { title: '', company: '', startDate: '', endDate: '', current: false, description: '' } });
  };
  const removeExperience = (id) => setFD({ experiences: formData.experiences.filter((x) => x.id !== id) });

  const addEducation = () => {
    const e = formData.newEdu;
    if (!e.degree.trim()) return setError('Degree required');
    if (!e.institution.trim()) return setError('Institution required');
    setError('');
    setFD({ education: [...formData.education, { ...e, id: Date.now() }], newEdu: { degree: '', institution: '', field: '', year: '' } });
  };
  const removeEducation = (id) => setFD({ education: formData.education.filter((x) => x.id !== id) });

  const addLanguage = () => setFD({ languages: [...formData.languages, { language: '', level: 'Basic' }] });
  const updateLanguage = (i, patch) => setFD({ languages: formData.languages.map((l, idx) => (idx === i ? { ...l, ...patch } : l)) });
  const removeLanguage = (i) => formData.languages.length > 1 && setFD({ languages: formData.languages.filter((_, idx) => idx !== i) });

  const handlePhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return setError('Photo must be under 5MB');
    if (!f.type.startsWith('image/')) return setError('Please upload an image');
    const reader = new FileReader();
    reader.onloadend = () => setFD({ photoFile: f, photoPreview: reader.result });
    reader.readAsDataURL(f);
  };

  const handlePortfolioFiles = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 5 - formData.portfolioFiles.length;
    if (files.length > remaining) { setError(`Only ${remaining} more file(s) allowed`); return; }
    const validFiles = files.filter(f => {
      if (f.size > 10 * 1024 * 1024) { setError(`"${f.name}" exceeds 10MB`); return false; }
      return true;
    });
    setFD({ portfolioFiles: [...formData.portfolioFiles, ...validFiles] });
  };
  const removePortfolioFile = (idx) => setFD({ portfolioFiles: formData.portfolioFiles.filter((_, i) => i !== idx) });
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024; const sizes = ['B', 'KB', 'MB']; const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true); setError('');
    try {
      const userFormData = new FormData();
      userFormData.append('bio', formData.bio);
      userFormData.append('location', formData.location);
      userFormData.append('phone', formData.phone);
      userFormData.append('birthdate', formData.birthdate);
      if (formData.photoFile) userFormData.append('avatar', formData.photoFile);
      await authAPI.updateUser(userFormData); 

      const profileData = {
        skill_ids: formData.skills.map((s) => s.id),
        hourly_rate: formData.hourly_rate,
        availability: formData.availability,
        portfolio: formData.portfolio,
        social_links: {
          linkedin: formData.linkedin,
          github: formData.github,
          website: formData.portfolio_site,
          other: formData.other_url,
        },
        category: formData.category === 'other' ? null : formData.category,
        custom_category: formData.category === 'other' ? formData.custom_category : '',
        role_title: formData.role_title,
        languages: formData.languages,
        experiences: formData.experiences,
        education: formData.education,
      };
      await authAPI.updateProfile(profileData); 
      if (formData.portfolioFiles.length > 0) {
        const portfolioFormData = new FormData();
        formData.portfolioFiles.forEach((file, i) => portfolioFormData.append(`portfolio_file_${i}`, file));
        await authAPI.uploadPortfolioFiles(portfolioFormData); 
      }

      const me = await authAPI.me();
      setUser(me.data);
      navigate('/dashboard/freelancer');
    } catch (err) {
      console.error('Onboarding failed:', err);
      setError(err.response?.data?.detail || 'Failed to save. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepSubtitle = {
    0: "Connect your profiles",
    1: "What do you do?",
    2: "Your skills",
    3: "Set your value",
    4: "Work experience",
    5: "Education",
    6: "Languages",
    7: "Your story",
    8: "Personal details",
    9: "Portfolio files"
  }[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto">
        
        <div className="sticky top-0 z-20 bg-gradient-to-br from-purple-50 via-white to-indigo-50/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
          <div className="px-3 py-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="text-purple-600" size={20} />
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent leading-snug">
                Welcome to TalentLink
              </h1>
              <Sparkles className="text-purple-600" size={20} />
            </div>
            <div className="px-3 py-2">
              <OnboardingStepper currentStep={step} totalSteps={totalSteps} />
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-4 p-3">
          {/* Main Content */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-xl p-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 py-2 rounded mb-3 flex items-start text-sm">
                <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 240px)' }}>
              {/* STEP 0: Social */}
              {step === 0 && (
                <div className="space-y-2">
                  <h2 className="text-lg font-bold mb-2 text-gray-900">🔗 Connect Profiles</h2>
                  <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="LinkedIn URL" value={formData.linkedin} onChange={(e) => setFD({ linkedin: e.target.value })} />
                  <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="GitHub URL" value={formData.github} onChange={(e) => setFD({ github: e.target.value })} />
                  <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Portfolio Website" value={formData.portfolio_site} onChange={(e) => setFD({ portfolio_site: e.target.value })} />
                  <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Other URL" value={formData.other_url} onChange={(e) => setFD({ other_url: e.target.value })} />
                </div>
              )}

              {/* STEP 1: Category */}
              {step === 1 && (
                <div>
                  <h2 className="text-lg font-bold mb-2 text-gray-900">🎯 Your Expertise</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {WORK_CATEGORIES.map((c) => (
                      <button key={c.id} onClick={() => { setFD({ category: c.id }); setError(''); }}
                        className={`p-3 border rounded-lg text-left text-sm transition ${formData.category === c.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{c.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">{c.name}</div>
                            <div className="text-xs text-gray-600 truncate">{c.desc}</div>
                          </div>
                          {formData.category === c.id && <CheckCircle className="text-purple-600 flex-shrink-0" size={16} />}
                        </div>
                      </button>
                    ))}
                  </div>
                  {formData.category === 'other' && (
                    <input className="w-full px-3 py-2 border rounded-lg mt-2 text-sm" placeholder="Your specialty (e.g., GIS Analyst)" value={formData.custom_category} onChange={(e) => setFD({ custom_category: e.target.value })} />
                  )}
                </div>
              )}

              {/* STEP 2: Skills */}
              {step === 2 && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900">⚡ Your Skills</h2>
                  <p className="text-xs text-purple-600 mb-2">{formData.skills.length}/20 selected</p>
                  <SkillSelector selectedSkills={formData.skills} setSelectedSkills={(skills) => setFD({ skills })} />
                </div>
              )}

              {/* STEP 3: Title, Rate, Availability */}
              {step === 3 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-bold text-gray-900">💼 Your Value</h2>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Professional Title *</label>
                    <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Senior Developer" value={formData.role_title} onChange={(e) => setFD({ role_title: e.target.value })} maxLength={100} />
                    <p className="text-[11px] text-gray-500">{formData.role_title.length}/100</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Hourly Rate (₹) *</label>
                      <input type="number" min="100" className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.hourly_rate} onChange={(e) => setFD({ hourly_rate: e.target.value })} placeholder="500" />
                      {formData.hourly_rate && <p className="text-[11px] text-purple-600 mt-1">≈ ₹{(formData.hourly_rate * 160).toLocaleString()}/month</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Availability</label>
                      <div className="flex gap-2">
                        {['full-time','part-time','contract'].map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setFD({ availability: opt })}
                            className={`px-3 py-1.5 rounded-lg text-xs border ${formData.availability===opt ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'}`}
                          >
                            {opt.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Experience */}
              {step === 4 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-bold text-gray-900">🚀 Experience</h2>
                  <div className="border-2 border-dashed rounded-lg p-3 bg-purple-50">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        className="px-2 py-1.5 border rounded text-sm"
                        placeholder="Job Title"
                        value={formData.newExp.title}
                        onChange={(e) => setFD({ newExp: { ...formData.newExp, title: e.target.value } })}
                      />
                      <input
                        className="px-2 py-1.5 border rounded text-sm"
                        placeholder="Company"
                        value={formData.newExp.company}
                        onChange={(e) => setFD({ newExp: { ...formData.newExp, company: e.target.value } })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Start</label>
                        <MonthYearInput
                          value={formData.newExp.startDate} 
                          onChange={(v) => setFD({ newExp: { ...formData.newExp, startDate: v } })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">End</label>
                        <MonthYearInput
                          value={formData.newExp.endDate}   
                          onChange={(v) => setFD({ newExp: { ...formData.newExp, endDate: v } })}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs mb-2">
                      <input
                        type="checkbox"
                        checked={formData.newExp.current}
                        onChange={(e) =>
                          setFD({ newExp: { ...formData.newExp, current: e.target.checked, endDate: '' } })
                        }
                      />
                      Current
                    </label>

                    {formData.newExp.current && (
                      <p className="text-[11px] text-gray-600 mb-2">End date not required for current roles.</p>
                    )}

                    <textarea
                      className="w-full px-2 py-1.5 border rounded text-xs"
                      rows={2}
                      placeholder="Description"
                      value={formData.newExp.description}
                      onChange={(e) => setFD({ newExp: { ...formData.newExp, description: e.target.value } })}
                      maxLength={500}
                    />
                    <button
                      type="button"
                      onClick={addExperience}
                      className="w-full bg-purple-600 text-white py-1.5 rounded text-sm font-semibold"
                    >
                      <Plus size={16} className="inline mr-1" /> Add
                    </button>
                  </div>

                  {formData.experiences.map((exp) => (
                    <div key={exp.id} className="border rounded-lg p-2 flex justify-between text-xs">
                      <div>
                        <div className="font-semibold">{exp.title}</div>
                        <div className="text-gray-600">{exp.company}</div>
                      </div>
                      <button onClick={() => removeExperience(exp.id)} className="text-red-500">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}


              {/* STEP 5: Education  */}
              {step === 5 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-bold text-gray-900">🎓 Education</h2>
                  <div className="border-2 border-dashed rounded-lg p-3 bg-purple-50">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input className="px-2 py-1.5 border rounded text-sm" placeholder="Degree" value={formData.newEdu.degree} onChange={(e) => setFD({ newEdu: { ...formData.newEdu, degree: e.target.value } })} />
                      <input className="px-2 py-1.5 border rounded text-sm" placeholder="Institution" value={formData.newEdu.institution} onChange={(e) => setFD({ newEdu: { ...formData.newEdu, institution: e.target.value } })} />
                      <input className="px-2 py-1.5 border rounded text-sm" placeholder="Field" value={formData.newEdu.field} onChange={(e) => setFD({ newEdu: { ...formData.newEdu, field: e.target.value } })} />
                      <input type="number" className="px-2 py-1.5 border rounded text-sm" placeholder="Year" value={formData.newEdu.year} onChange={(e) => setFD({ newEdu: { ...formData.newEdu, year: e.target.value } })} min="1950" max={new Date().getFullYear() + 10} />
                    </div>
                    <button type="button" onClick={addEducation} className="w-full bg-purple-600 text-white py-1.5 rounded text-sm font-semibold"><Plus size={16} className="inline mr-1" /> Add</button>
                  </div>
                  {formData.education.map((ed) => (
                    <div key={ed.id} className="border rounded-lg p-2 flex justify-between text-xs">
                      <div>
                        <div className="font-semibold">{ed.degree}</div>
                        <div className="text-gray-600">{ed.institution}</div>
                      </div>
                      <button onClick={() => removeEducation(ed.id)} className="text-red-500"><X size={16} /></button>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 6: Languages */}
              {step === 6 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-bold text-gray-900">🌍 Languages</h2>
                  {formData.languages.map((l, i) => (
                    <div key={i} className="flex gap-2">
                      <select className="flex-1 px-2 py-2 border rounded text-sm" value={l.language} onChange={(e) => updateLanguage(i, { language: e.target.value })}>
                        <option value="">Select</option>
                        {COMMON_LANGUAGES.map((x) => (<option key={x} value={x}>{x}</option>))}
                      </select>
                      <select className="w-32 px-2 py-2 border rounded text-sm" value={l.level} onChange={(e) => updateLanguage(i, { level: e.target.value })}>
                        {LANGUAGE_LEVELS.map((x) => (<option key={x} value={x}>{x}</option>))}
                      </select>
                      {formData.languages.length > 1 && <button onClick={() => removeLanguage(i)} className="text-red-500"><X size={20} /></button>}
                    </div>
                  ))}
                  <button onClick={addLanguage} className="w-full border-2 border-dashed py-2 rounded text-purple-600 text-sm"><Plus size={16} className="inline mr-1" /> Add Language</button>
                </div>
              )}

              {/* STEP 7: Bio */}
              {step === 7 && (
                <div>
                  <h2 className="text-lg font-bold mb-2 text-gray-900">✨ Your Story</h2>
                  <textarea className="w-full px-3 py-2 border rounded-lg text-sm" rows={8} value={formData.bio} onChange={(e) => setFD({ bio: e.target.value })} placeholder="I'm a passionate developer..." maxLength={2000} />
                  <p className="text-[11px] text-gray-500 mt-1">{formData.bio.length}/2000 (min 50)</p>
                </div>
              )}

              {/* STEP 8: Personal */}
              {step === 8 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-bold mb-2 text-gray-900">👤 Personal Info</h2>

                  <div className="flex justify-center mb-2">
                    <div className="relative">
                      {formData.photoPreview ? (
                        <img src={formData.photoPreview} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-purple-500" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                          <Camera size={28} className="text-gray-400" />
                        </div>
                      )}
                      <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer">
                        <Upload size={14} />
                        <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Phone *</label>
                      <input
                        type="tel"
                        className="w-full px-2 py-2 border rounded-lg text-sm"
                        value={formData.phone}
                        onChange={(e) => setFD({ phone: e.target.value })}
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Birthdate *</label>
                     
                      <CalendarInput
                        value={formData.birthdate}               
                        onChange={(v)=> setFD({ birthdate: v })}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <label className="block text-xs font-semibold mb-1">Location *</label>
                  <LocationSelectLite
                    value={formData.location}
                    onChange={(v)=> setFD({ location: v })}
                  />
                  <div>
                    <label className="block text-xs font-semibold mb-1">Portfolio (optional)</label>
                    <textarea className="w-full px-2 py-2 border rounded-lg text-xs" rows={3} value={formData.portfolio} onChange={(e) => setFD({ portfolio: e.target.value })} placeholder="Links or description..." maxLength={1000} />
                  </div>
                </div>
              )}

              {/* STEP 9: Files */}
              {step === 9 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-bold mb-2 text-gray-900">📁 Portfolio Files</h2>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center bg-purple-50">
                    <Upload className="mx-auto text-purple-400 mb-2" size={28} />
                    <label className="cursor-pointer">
                      <div className="text-sm font-semibold text-purple-600">Upload Files</div>
                      <input type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={handlePortfolioFiles} className="hidden" />
                      <p className="text-[11px] text-gray-500 mt-1">Max 5 files • 10MB each</p>
                    </label>
                  </div>
                  {formData.portfolioFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold">{formData.portfolioFiles.length}/5 files</p>
                      {formData.portfolioFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 border rounded text-xs">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <File size={14} className="text-purple-500 flex-shrink-0" />
                            <span className="truncate">{file.name}</span>
                            <span className="text-gray-500">({formatFileSize(file.size)})</span>
                          </div>
                          <button onClick={() => removePortfolioFile(idx)} className="text-red-500 flex-shrink-0"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-xl p-3 text-white">
              <h3 className="font-bold mb-2 text-sm">Your Progress</h3>
              <div className="text-center mb-2">
                <div className="text-2xl font-bold">{Math.round((step / totalSteps) * 100)}%</div>
                <div className="text-[11px] opacity-90">Complete</div>
              </div>
              <div className="space-y-1 text-xs">
                {[
                  { s: 0, t: 'Social Profiles', opt: true },
                  { s: 1, t: 'Work Category', opt: false },
                  { s: 2, t: 'Skills', opt: false },
                  { s: 3, t: 'Title, Rate & Availability', opt: false },
                  { s: 4, t: 'Experience', opt: true },
                  { s: 5, t: 'Education', opt: true },
                  { s: 6, t: 'Languages', opt: false },
                  { s: 7, t: 'Bio', opt: false },
                  { s: 8, t: 'Personal Info', opt: false },
                  { s: 9, t: 'Portfolio Files', opt: true },
                ].map((item) => (
                  <div key={item.s} className={`flex items-center gap-2 ${step === item.s ? 'font-bold' : 'opacity-75'}`}>
                    {step > item.s ? <CheckCircle size={12} /> : step === item.s ? <ChevronRight size={12} /> : <div className="w-3 h-3 rounded-full border-2 border-white opacity-40"></div>}
                    <span>{item.t}</span>
                    {item.opt && <span className="text-[10px] opacity-60">(opt)</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-100">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="text-xl font-bold text-purple-600">{totalSteps - step}</div>
                  <div className="text-[11px] text-gray-600">Steps Left</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">{step}</div>
                  <div className="text-[11px] text-gray-600">Completed</div>
                </div>
              </div>
            </div> */}

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
              <h4 className="font-bold text-blue-900 mb-2 text-sm">💡 Tips</h4>
              <div className="space-y-1 text-xs text-blue-800">
                {step === 0 && <p>• Link profiles to build trust</p>}
                {step === 1 && <p>• Choose your main expertise</p>}
                {step === 2 && <p>• Add 5–10 relevant skills</p>}
                {step === 3 && <p>• Research market rates</p>}
                {step === 4 && <p>• Highlight achievements</p>}
                {step === 5 && <p>• Add recent degrees first</p>}
                {step === 6 && <p>• Be honest about levels</p>}
                {step === 7 && <p>• Show your personality!</p>}
                {step === 8 && <p>• Use a professional photo</p>}
                {step === 9 && <p>• Upload your best work</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Navigation */}
        <div className="sticky bottom-0 z-20 bg-white/90 backdrop-blur border-t">
          <div className="max-w-6xl mx-auto px-3 py-2 flex justify-between items-center">
            <button onClick={back} disabled={step === 0} className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-40 text-sm">
              Back
            </button>



            <div className="flex gap-2">
              {skippable && (
                <button onClick={skip} className="px-3 py-1.5 text-gray-600 hover:text-purple-600 text-sm font-medium">
                  Skip →
                </button>
              )}

              {step < totalSteps - 1 ? (
                <button onClick={next} className="px-5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-bold text-sm shadow-lg flex items-center gap-1">
                  Continue <ChevronRight size={14} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className="px-5 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-bold text-sm shadow-lg disabled:opacity-50 flex items-center gap-1">
                  {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-1"></div>Saving...</> : <><Sparkles size={14} /> Complete</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
