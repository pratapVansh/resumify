/**
 * Passport Configuration for Google OAuth
 */

import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import User, { IUser } from '../models/User.js';

/**
 * Configure Google OAuth Strategy
 */
export const configurePassport = (): void => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

  if (!googleClientId || !googleClientSecret) {
    console.warn('⚠️ Google OAuth credentials not configured. Google login will not work.');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackUrl,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile: Profile, done) => {
        try {
          console.log('Google OAuth: Processing profile for', profile.emails?.[0]?.value);
          
          // Extract user data from Google profile
          const email = profile.emails?.[0]?.value;
          const googleId = profile.id;
          const firstName = profile.name?.givenName;
          const lastName = profile.name?.familyName;
          const picture = profile.photos?.[0]?.value;

          if (!email) {
            console.error('Google OAuth: No email found in profile');
            return done(new Error('No email found in Google profile'), undefined);
          }

          // Check if user exists with Google ID
          let user = await User.findOne({ googleId });

          if (!user) {
            // Check if user exists with email
            user = await User.findOne({ email });

            if (user) {
              // Link Google account to existing user
              console.log('Google OAuth: Linking Google account to existing user');
              user.googleId = googleId;
              if (picture) user.avatar = picture;
              user.isEmailVerified = true;
              await user.save();
            } else {
              // Create new user
              console.log('Google OAuth: Creating new user');
              user = await User.create({
                email,
                googleId,
                firstName,
                lastName,
                avatar: picture,
                isEmailVerified: true,
              });
            }
          } else {
            console.log('Google OAuth: User found with Google ID');
          }

          return done(null, user);
        } catch (error) {
          console.error('Google OAuth strategy error:', error);
          return done(error as Error, undefined);
        }
      }
    )
  );

  /**
   * Serialize user to session
   */
  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  /**
   * Deserialize user from session
   */
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
