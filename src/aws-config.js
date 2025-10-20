import { Amplify } from 'aws-amplify';
import { get, post, put, del } from 'aws-amplify/api';
import { signIn, signOut, signUp, confirmSignUp, getCurrentUser } from 'aws-amplify/auth';

// Primary (us-east-1) configurations
const primaryConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_DLkiT6Y7r',
      userPoolClientId: '2o27e8efr1t6hmm2gsc3l6aol6',
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true
      }
    }
  },
  API: {
    REST: {
      quizApi: {
        endpoint: 'https://poavf33mhl.execute-api.us-east-1.amazonaws.com/prod',
        region: 'us-east-1'
      }
    }
  }
};

// Secondary (us-west-2) configurations
const secondaryConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-west-2_pl4W32FsW',
      userPoolClientId: '7hrdm80pqb323iqo1tspi9dmin',
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true
      }
    }
  },
  API: {
    REST: {
      quizApi: {
        endpoint: 'https://rpw2ot8deh.execute-api.us-west-2.amazonaws.com/prod',
        region: 'us-west-2'
      }
    }
  }
};

// Configure Amplify with primary by default
Amplify.configure(primaryConfig);

// Create wrapper functions for API calls with fallback
export const apiGet = async (apiName, path, options = {}) => {
  try {
    return await get({ apiName, path, options }).response;
  } catch (error) {
    if (error.response?.statusCode >= 500 || error.name === 'NetworkError') {
      console.log('API failure - switching to secondary region');
      Amplify.configure(secondaryConfig);
      return await get({ apiName, path, options }).response;
    }
    throw error;
  }
};

export const apiPost = async (apiName, path, options = {}) => {
  try {
    return await post({ apiName, path, options }).response;
  } catch (error) {
    if (error.response?.statusCode >= 500 || error.name === 'NetworkError') {
      console.log('API failure - switching to secondary region');
      Amplify.configure(secondaryConfig);
      return await post({ apiName, path, options }).response;
    }
    throw error;
  }
};

// Auth wrapper with fallback
export const authSignIn = async (username, password) => {
  try {
    return await signIn({ username, password });
  } catch (error) {
    if (error.name === 'UserPoolNotConfiguredError' || error.name === 'NetworkError') {
      console.log('Auth failure - switching to secondary region');
      Amplify.configure(secondaryConfig);
      return await signIn({ username, password });
    }
    throw error;
  }
};

export default primaryConfig;
