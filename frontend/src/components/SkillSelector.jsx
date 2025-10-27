// frontend/src/components/SkillSelector.jsx
import { useState, useEffect } from 'react';
import client from '../api/client';

export default function SkillSelector({ selectedSkills, setSelectedSkills }) {
  const [allSkills, setAllSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    client.get('/skills/').then((res) => setAllSkills(res.data));
  }, []);

  const filteredSkills = allSkills.filter((skill) =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSkill = (skill) => {
    if (selectedSkills.find((s) => s.id === skill.id)) {
      setSelectedSkills(selectedSkills.filter((s) => s.id !== skill.id));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search skills..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
      />
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
      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
        {filteredSkills.map((skill) => (
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
        ))}
      </div>
    </div>
  );
}