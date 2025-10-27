export default function Footer({ user }) {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-purple-400">TalentLink</h3>
            <p className="text-gray-400">Connecting talent with opportunity.</p>
          </div>
          
          {user && (
            <>
              {user.role === 'freelancer' && (
                <div>
                  <h4 className="font-semibold mb-4 text-lg">For Freelancers</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="/projects" className="hover:text-white transition">Find Work</a></li>
                    <li><a href="/dashboard/freelancer" className="hover:text-white transition">My Proposals</a></li>
                    <li><a href="/contracts" className="hover:text-white transition">My Contracts</a></li>
                  </ul>
                </div>
              )}
              
              {user.role === 'client' && (
                <div>
                  <h4 className="font-semibold mb-4 text-lg">For Clients</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="/dashboard/client" className="hover:text-white transition">Post Project</a></li>
                    <li><a href="/dashboard/client" className="hover:text-white transition">My Projects</a></li>
                    <li><a href="/contracts" className="hover:text-white transition">My Contracts</a></li>
                  </ul>
                </div>
              )}
            </>
          )}
          
          <div>
            <h4 className="font-semibold mb-4 text-lg">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-lg">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 TalentLink. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}