// frontend/src/pages/ReviewsPage.jsx
import { Star } from 'lucide-react';
import ReviewList from '../components/ReviewList';

export default function ReviewsPage({ user }) {
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view reviews</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Star className="text-purple-600" />
            My Reviews & Ratings
          </h1>
          <p className="text-gray-600">View and respond to client feedback</p>
        </div>

        {/* Your existing ReviewList component handles everything */}
        <ReviewList userId={user.id} currentUserId={user.id} />
      </div>
    </div>
  );
}