import { useState, useCallback } from 'react';
import axios from 'axios';
import useSpotifyToken from './useSpotifyToken';

export default function useSpotifyFollow() {
  const { token, login: redirectToSpotifyLogin } = useSpotifyToken();
  const [followingUsers, setFollowingUsers] = useState({});
  const [notFollowableUsers, setNotFollowableUsers] = useState(new Set());

  const followUser = useCallback(async userId => {
    if (!token) return;
    try {
      await axios.put(
        'https://api.spotify.com/v1/me/following',
        {},
        { headers: { Authorization: `Bearer ${token}` }, params: { type: 'user', ids: userId } }
      );
      setFollowingUsers(prev => ({ ...prev, [userId]: true }));
    } catch (err) {
      if (err.response?.status === 403) {
        setNotFollowableUsers(prev => new Set(prev).add(userId));
      } else if (err.response?.status === 401) {
        localStorage.removeItem('spotify_token');
        redirectToSpotifyLogin();
      } else {
        console.error('Error following user:', err);
      }
    }
  }, [token, redirectToSpotifyLogin]);

  const unfollowUser = useCallback(async userId => {
    if (!token) return;
    try {
      await axios.delete('https://api.spotify.com/v1/me/following', {
        headers: { Authorization: `Bearer ${token}` },
        params: { type: 'user', ids: userId }
      });
      setFollowingUsers(prev => ({ ...prev, [userId]: false }));
    } catch (err) {
      if (err.response?.status === 403) {
        setNotFollowableUsers(prev => new Set(prev).add(userId));
      } else if (err.response?.status === 401) {
        localStorage.removeItem('spotify_token');
        redirectToSpotifyLogin();
      } else {
        console.error('Error unfollowing user:', err);
      }
    }
  }, [token, redirectToSpotifyLogin]);

  return { followingUsers, notFollowableUsers, followUser, unfollowUser };
}
