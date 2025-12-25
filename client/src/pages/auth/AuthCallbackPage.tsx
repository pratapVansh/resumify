import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { getCurrentUser } from '@/store/slices/authSlice';
import PageLoader from '@/components/common/PageLoader';

/**
 * Auth Callback Page
 * Handles OAuth redirect and token storage
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        // Handle error
        console.error('OAuth error:', error);
        navigate('/login?error=' + error);
        return;
      }

      if (token) {
        // Store access token
        localStorage.setItem('accessToken', token);

        // Fetch user data
        try {
          await dispatch(getCurrentUser()).unwrap();
          navigate('/dashboard');
        } catch (err) {
          console.error('Failed to get user:', err);
          navigate('/login?error=fetch_user_failed');
        }
      } else {
        navigate('/login?error=no_token');
      }
    };

    handleCallback();
  }, [searchParams, navigate, dispatch]);

  return <PageLoader text="Completing sign in..." fullScreen />;
}
