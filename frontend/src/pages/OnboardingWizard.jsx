import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';
import OnboardingStepper from '../components/OnboardingStepper';
import SkillSelector from '../components/SkillSelector';
import { authAPI } from '../api/auth';

export default function OnboardingWizard({ user, setUser }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    skills: [],
    hourly_rate: '',
    availability: 'part-time',
    portfolio: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const totalSteps = 5;

  useEffect(() => {
    if (user && user.role === 'client') {
      navigate('/dashboard/client');
    }
  }, [user, navigate]);

  const handleNext = () => {
    // Validation for each step
    if (step === 0 && formData.skills.length === 0) {
      setError('Please select at least one skill');
      return;
    }
    if (step === 1 && (!formData.hourly_rate || formData.hourly_rate <= 0)) {
      setError('Please enter a valid hourly rate');
      return;
    }
    if (step === 3 && !formData.bio) {
      setError('Please tell us about yourself');
      return;
    }
    if (step === 4 && !formData.portfolio) {
      setError('Please describe your portfolio or add project links');
      return;
    }

    setError('');
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setError('');
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      await authAPI.updateUser({
        bio: formData.bio,
      });

      const profileData = {
        skill_ids: formData.skills.map((s) => s.id),
        hourly_rate: formData.hourly_rate,
        availability: formData.availability,
        portfolio: formData.portfolio,
      };

      await authAPI.updateProfile(profileData);

      const userResponse = await authAPI.me();
      setUser(userResponse.data);

      navigate('/dashboard/freelancer');
    } catch (err) {
      console.error('Onboarding failed:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (user.role === 'client') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600 text-lg">
            Let's set up your freelancer profile to get discovered by clients
          </p>
        </div>

        <OnboardingStepper currentStep={step} totalSteps={totalSteps} />

        <div className="bg-white rounded-lg shadow-xl p-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6 flex items-start">
              <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {step === 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-2">Select Your Skills</h2>
              <p className="text-gray-600 mb-6">Choose the skills you want to offer to clients</p>
              <SkillSelector
                selectedSkills={formData.skills}
                setSelectedSkills={(skills) => setFormData({ ...formData, skills })}
              />
              <p className="text-sm text-gray-500 mt-4">
                💡 Tip: Select 3-10 relevant skills to increase your visibility
              </p>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-semibold mb-2">Set Your Hourly Rate</h2>
              <p className="text-gray-600 mb-6">What's your expected hourly rate in INR?</p>
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 text-lg">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                    placeholder="500.00"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  💡 Research market rates for your skills (₹300-₹5000/hour typical range in India)
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold mb-2">Availability</h2>
              <p className="text-gray-600 mb-6">How much time can you dedicate to freelance work?</p>
              <div className="space-y-3">
                {[
                  { value: 'full-time', label: 'Full-time', desc: '40+ hours per week' },
                  { value: 'part-time', label: 'Part-time', desc: '20-40 hours per week' },
                  { value: 'contract', label: 'Contract', desc: 'Project-based, flexible hours' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-5 border-2 rounded-lg cursor-pointer transition ${
                      formData.availability === option.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="availability"
                      value={option.value}
                      checked={formData.availability === option.value}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      className="mr-4 w-5 h-5 text-purple-600"
                    />
                    <div>
                      <span className="font-semibold text-lg block">{option.label}</span>
                      <span className="text-gray-600 text-sm">{option.desc}</span>
                    </div>
                    {formData.availability === option.value && (
                      <CheckCircle className="ml-auto text-purple-600" size={24} />
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-semibold mb-2">About You</h2>
              <p className="text-gray-600 mb-6">
                Write a compelling bio that highlights your experience and expertise
              </p>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Example: I'm a full-stack developer with 5+ years of experience building scalable web applications. I specialize in React, Node.js, and cloud infrastructure. I've helped numerous startups launch their products and scale their platforms..."
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 Aim for 100-200 words. Mention your experience, specialties, and what makes you unique
              </p>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-semibold mb-2">Portfolio & Work Samples</h2>
              <p className="text-gray-600 mb-6">
                Showcase your best work to attract clients
              </p>
              <textarea
                value={formData.portfolio}
                onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe your portfolio or add links to your work:

- Link to portfolio website
- GitHub profile
- Behance/Dribbble profiles
- Previous project links
- Case studies

Example: 
- Built e-commerce platform for XYZ Corp (www.example.com)
- Designed mobile app UI for 100k+ users
- GitHub: github.com/yourprofile"
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 Add clickable links to your best work. Clients love seeing real examples!
              </p>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Back
            </button>
            {step < totalSteps - 1 ? (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold shadow-md hover:shadow-lg transition"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Completing Profile...' : 'Complete Profile'}
              </button>
            )}
          </div>

          {/* Progress indicator */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Step {step + 1} of {totalSteps}
          </div>
        </div>
      </div>
    </div>
  );
}