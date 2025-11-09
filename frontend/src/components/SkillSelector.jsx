// frontend/src/components/SkillSelector.jsx
import { useState, useEffect } from 'react';
import client from '../api/client';

export default function SkillSelector({ selectedSkills, setSelectedSkills }) {
  const [allSkills, setAllSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    client
      .get('/skills/')
      .then((res) => {
        console.log("API skills response:", res.data); // Debug log

        // ✅ Safely extract skills array
        const skillsArray = Array.isArray(res.data)
          ? res.data
          : res.data.results || res.data.skills || [];

        setAllSkills(skillsArray);
      })
      .catch((err) => {
        console.error("Error fetching skills:", err);
        setAllSkills([]); // Prevent crash if request fails
      });
  }, []);

  // ✅ Prevent error if allSkills is not an array for any reason
  const filteredSkills = Array.isArray(allSkills)
    ? allSkills.filter((skill) =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const toggleSkill = (skill) => {
    if (selectedSkills.find((s) => s.id === skill.id)) {
      setSelectedSkills(selectedSkills.filter((s) => s.id !== skill.id));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  return (
    <div>
      {/* Search box */}
      <input
        type="text"
        placeholder="Search skills..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
      />

      {/* Selected skills list */}
      <div className="flex flex-wrap gap-2 mb-4">
        {selectedSkills.map((skill) => (
          <span
            key={skill.id}
            className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm cursor-pointer"
            onClick={() => toggleSkill(skill)}
          >
            {skill.name} ×
          </span>
        ))}
      </div>

      {/* All skills list */}
      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
        {filteredSkills.length > 0 ? (
          filteredSkills.map((skill) => (
            <div
              key={skill.id}
              onClick={() => toggleSkill(skill)}
              className={`px-3 py-2 rounded cursor-pointer ${
                selectedSkills.find((s) => s.id === skill.id)
                  ? 'bg-purple-100 text-purple-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              {skill.name}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center py-2">
            No skills found.
          </p>
        )}
      </div>
    </div>
  );
}
