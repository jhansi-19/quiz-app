import { Amplify, Auth } from 'aws-amplify';
import { API } from '@aws-amplify/api';

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

// Override Amplify's API and Auth methods for automatic fallback
const originalAPIGet = API.get;
API.get = async (apiName, path, init) => {
  try {
    return await originalAPIGet(apiName, path, init); // Try primary
  } catch (error) {
    if (error.response && (error.response.status >= 500 || error.name === 'NetworkError')) {
      console.log('API failure - switching to secondary region');
      Amplify.configure(secondaryConfig); // Switch to secondary
      return await originalAPIGet(apiName, path, init); // Retry with secondary
    }
    throw error;
  }
};

const originalAuthSignIn = Auth.signIn;
Auth.signIn = async (username, password) => {
  try {
    return await originalAuthSignIn(username, password); // Try primary
  } catch (error) {
    if (error.name === 'UserPoolNotConfiguredError' || error.name === 'NetworkError') {
      console.log('Auth failure - switching to secondary region');
      Amplify.configure(secondaryConfig); // Switch to secondary
      return await originalAuthSignIn(username, password); // Retry with secondary
    }
    throw error;
  }
};

// Export for compatibility
export default primaryConfig;
