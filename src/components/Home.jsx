import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate()
  const [postText, setPostText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const [currentUserID, setCurrentUserID] = useState('');
  const [followStatus, setFollowStatus] = useState({});
  const [showFollowingOnly, setShowFollowingOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const token = localStorage.getItem('authToken');
  const username = localStorage.getItem('username');

  const fetchPosts = async (showLoader = false) => {
    try {
      if (showLoader) setRefreshing(true);
      setError('');

      const url = showFollowingOnly
        ? 'https://chatbackends-1.onrender.com/user/following/feed'
        : 'https://chatbackends-1.onrender.com/user/feed';

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === 'success') {
        const posts = res.data.data.reverse();
        setAllPosts(posts);
        setCurrentUserID(res.data.currentUserID || '');

        if (res.data.following) {
          const following = res.data.following;
          const initialFollow = {};
          posts.forEach(post => {
            if (post.userID && post.userID !== res.data.currentUserID) {
              if (!(post.userID in initialFollow)) {
                initialFollow[post.userID] = following.includes(post.userID) ? 'follow' : 'unfollow';
              }
            }
          });
          setFollowStatus(initialFollow);
        }
      } else {
        setError('Failed to load posts');
      }
    } catch (err) {
      setError('Error loading posts');
      console.error('Error fetching posts:', err);
    } finally {
      if (showLoader) setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) fetchPosts(true);
  }, [token, showFollowingOnly]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    navigate('/');
  };

  const handleCreatePost = async () => {
    if (!token) {
      setError('Please log in.');
      return;
    }
    if (!postText.trim()) {
      setError('Post cannot be empty.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await axios.post(
        'https://chatbackends-1.onrender.com/user/post',
        { post: postText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (res.data.status === 'success') {
        setPostText('');

        setTimeout(async () => {
          await fetchPosts(false);
        }, 500);

      } else {
        setError(res.data.message || 'Post creation failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating post');
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userID, currentStatus) => {
    try {
      const res = await axios.post(
        `https://chatbackends-1.onrender.com/user/follow/${userID}`,
        { status: currentStatus === 'follow' ? 'unfollow' : 'follow' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.data.status === 'success') {
        setFollowStatus(prev => ({
          ...prev,
          [userID]: currentStatus === 'follow' ? 'unfollow' : 'follow',
        }));
      } else {
        alert(res.data.message || 'Follow/unfollow failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error during follow/unfollow');
    }
  };

  const handleManualRefresh = () => {
    fetchPosts(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 text-white p-8">
      {/* Top Bar */}
      <div className="max-w-md mx-auto flex justify-between items-center bg-slate-800 rounded-xl p-4 mb-6 shadow">
        <div className="font-semibold text-lg">Welcome, {username}</div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md font-semibold transition"
        >
          Logout
        </button>
      </div>

      {/* Create Post */}
      <div className="max-w-md mx-auto bg-slate-800 rounded-xl p-6 shadow space-y-4">
        <h2 className="text-xl font-bold">Create a Post</h2>
        <textarea
          className="w-full h-24 p-3 rounded-md bg-slate-700 text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={postText}
          onChange={e => setPostText(e.target.value)}
          placeholder="What's on your mind?"
          disabled={loading}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          onClick={handleCreatePost}
          disabled={loading || !postText.trim()}
          className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 rounded-md font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>

      {/* Posts Feed */}
      <div className="max-w-md mx-auto mt-10 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {showFollowingOnly ? 'Following Posts' : 'All Posts'}
            {refreshing && <span className="text-sm text-purple-400 ml-2">(Refreshing...)</span>}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="bg-slate-600 hover:bg-slate-700 px-3 py-1 rounded-md text-sm font-semibold transition disabled:opacity-50"
            >
              {refreshing ? '⟳' : '↻'} Refresh
            </button>
            <button
              onClick={() => setShowFollowingOnly(prev => !prev)}
              className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-md text-sm font-semibold transition"
            >
              {showFollowingOnly ? 'Show All' : 'Show Following'}
            </button>
          </div>
        </div>

        {allPosts.length === 0 && !refreshing ? (
          <div className="text-center text-gray-400 py-8">
            <p>No posts to show</p>
          </div>
        ) : (
          allPosts.map(post =>
            post ? (
              <div
                key={post._id}
                className="bg-slate-800 border border-purple-600 rounded-xl p-4 space-y-2 transition-all duration-300 hover:border-purple-500"
              >
                <p className="text-gray-300">{post.post}</p>
                <p className="text-sm text-purple-400">
                  by <span className="font-semibold">{post.name}</span> ({post.email})
                </p>
                <p className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleString()}</p>

                {post.userID && post.userID !== currentUserID && (
                  <button
                    onClick={() => handleFollow(post.userID, followStatus[post.userID])}
                    className={`mt-2 px-3 py-1 rounded-md font-semibold transition-colors duration-200 ${followStatus[post.userID] === 'follow'
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : 'bg-purple-700 hover:bg-purple-600'
                      }`}
                  >
                    {followStatus[post.userID] === 'follow' ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>
            ) : null
          )
        )}
      </div>
    </div>
  );
};

export default Home;