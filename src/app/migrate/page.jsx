'use client';

import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";

export default function MigratePage() {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/migrate-views');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error checking status:', error);
      setMessage('❌ Error checking migration status');
    }
  };

  const runMigration = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/migrate-views', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.message}`);
        // Refresh status after migration
        setTimeout(checkStatus, 1000);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Migration error:', error);
      setMessage('❌ Migration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 px-4">
        <div className="max-w-4xl mx-auto py-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Database Migration</h1>
            <p className="text-gray-600 mb-8">
              Add the views field to existing blog posts that don't have it.
            </p>

            {/* Status Display */}
            {status && (
              <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">Current Status</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{status.stats?.totalPosts || 0}</div>
                    <div className="text-sm text-gray-600">Total Posts</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{status.stats?.postsWithViews || 0}</div>
                    <div className="text-sm text-gray-600">With Views</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{status.stats?.postsWithoutViews || 0}</div>
                    <div className="text-sm text-gray-600">Need Migration</div>
                  </div>
                </div>

                {status.stats?.needsMigration ? (
                  <div className="p-4 bg-orange-100 border border-orange-300 rounded-lg">
                    <p className="text-orange-800 font-medium">
                      ⚠️ Some posts need the views field added
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
                    <p className="text-green-800 font-medium">
                      ✅ All posts have the views field
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Sample Posts */}
            {status?.samplePosts && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Posts</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Title</th>
                        <th className="text-left p-2">Views</th>
                        <th className="text-left p-2">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {status.samplePosts.map((post, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{post.title}</td>
                          <td className="p-2">
                            <span className={post.views === 'NOT SET' ? 'text-red-600' : 'text-green-600'}>
                              {post.views}
                            </span>
                          </td>
                          <td className="p-2 text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Migration Button */}
            <div className="space-y-4">
              <button
                onClick={runMigration}
                disabled={isLoading || (status && !status.stats?.needsMigration)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isLoading || (status && !status.stats?.needsMigration)
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Running Migration...' : 'Add Views Field to Posts'}
              </button>

              <button
                onClick={checkStatus}
                className="ml-4 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Refresh Status
              </button>
            </div>

            {/* Message Display */}
            {message && (
              <div className="mt-6 p-4 rounded-lg bg-gray-100">
                <p className="text-sm">{message}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What this migration does:</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Adds a "views" field to all posts that don't have one</li>
                <li>• Sets initial view counts to realistic random numbers (50-2000)</li>
                <li>• Preserves existing view counts for posts that already have them</li>
                <li>• Makes the view tracking system work properly</li>
              </ul>
            </div>

            {/* Navigation */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex space-x-4">
                <a 
                  href="/blog" 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  → View Blog Posts
                </a>
                <a 
                  href="/admin" 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  → Admin Panel
                </a>
                <a 
                  href="/" 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  → Homepage
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}