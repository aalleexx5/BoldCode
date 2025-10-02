import React, { useState } from 'react';
import { RequestComment } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Send, MessageSquare } from 'lucide-react';

interface CommentsSectionProps {
  comments: RequestComment[];
  onCommentsChange: (comments: RequestComment[]) => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ comments, onCommentsChange }) => {
  const { user, profile } = useAuth();
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (!newComment.trim() || !user || !profile) return;

    const comment: RequestComment = {
      id: `temp-${Date.now()}`,
      user_id: user.uid,
      user_name: profile.full_name,
      comment: newComment,
      created_at: new Date().toISOString(),
    };

    onCommentsChange([comment, ...comments]);
    setNewComment('');
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-800">Comments</h3>
      </div>

      <div className="border-t border-slate-200 pt-4 mb-4">
        <div className="flex gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            rows={3}
            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Add a comment..."
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed self-end"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="border-l-2 border-slate-200 pl-4">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-700">
                    {comment.user_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {comment.user_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatTimestamp(comment.created_at)}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-700 mt-2 ml-10">{comment.comment}</p>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-6">No comments yet</p>
        )}
      </div>
    </div>
  );
};
