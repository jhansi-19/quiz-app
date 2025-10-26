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

// Track current region
let currentRegion = 'primary';
let failoverInProgress = false;

// Configure Amplify with primary by default
Amplify.configure(primaryConfig);

// Helper function to switch regions
const switchToSecondary = () => {
  if (currentRegion === 'secondary' || failoverInProgress) return;

  failoverInProgress = true;
  console.log('🚨 SWITCHING TO SECONDARY REGION (us-west-2)');
  
  Amplify.configure(secondaryConfig);
  currentRegion = 'secondary';
  
  const failoverEvent = {
    timestamp: new Date().toISOString(),
    from: 'primary',
    to: 'secondary',
    reason: 'Primary region failure detected'
  };
  
  const events = JSON.parse(localStorage.getItem('failover_events') || '[]');
  events.push(failoverEvent);
  localStorage.setItem('failover_events', JSON.stringify(events));
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('regionFailover', { detail: failoverEvent }));
  }
  
  failoverInProgress = false;
};

// Enhanced error detection
const shouldFailover = (error) => {
  if (error.name === 'NetworkError' || error.message?.includes('Network')) return true;
  if (error.name === 'TimeoutError' || error.message?.includes('timeout') || error.code === 'ETIMEDOUT') return true;
  if (error.response?.statusCode >= 500 || error.response?.statusCode === 502 || error.response?.statusCode === 400) return true;
  if (error.message?.includes('ECONNREFUSED') || error.message?.includes('Failed to fetch')) return true;
  if (error.response?.statusCode === 503) return true;
  if (error.name === 'UserPoolNotFoundException' || error.name === 'NotAuthorizedException' || error.name === 'InvalidParameterException') return true;
  if (error.response?.statusCode === 403 && error.message?.includes('Missing Authentication')) return false; // Exclude auth token issues
  return false;
};

// Health check function
const checkRegionHealth = async () => {
  if (currentRegion === 'secondary' || failoverInProgress) return;

  try {
    await apiGet('quizApi', '/new-quizzes/GK1', { timeout: 5000 }); // Use existing endpoint
    console.log('✅ Health check passed (primary region)');
  } catch (error) {
    if (shouldFailover(error)) {
      console.log('⚠️ Health check failed - initiating failover');
      switchToSecondary();
    }
  }
};

if (typeof window !== 'undefined') {
  setInterval(checkRegionHealth, 30000); // Check every 30 seconds
}

// API GET wrapper
export const apiGet = async (apiName, path, options = {}, retryCount = 0) => {
  try {
    const response = await get({ apiName, path, options }).response;
    return response;
  } catch (error) {
    console.error(`❌ API GET Error (${currentRegion} region):`, error.name, error.message);
    if (shouldFailover(error) && retryCount === 0 && currentRegion === 'primary') {
      switchToSecondary();
      console.log('🔄 Retrying GET request on secondary region...');
      await new Promise(resolve => setTimeout(resolve, 500));
      return apiGet(apiName, path, options, retryCount + 1);
    }
    throw error;
  }
};

// API POST wrapper
export const apiPost = async (apiName, path, options = {}, retryCount = 0) => {
  try {
    const response = await post({ apiName, path, options }).response;
    return response;
  } catch (error) {
    console.error(`❌ API POST Error (${currentRegion} region):`, error.name, error.message);
    if (shouldFailover(error) && retryCount === 0 && currentRegion === 'primary') {
      switchToSecondary();
      console.log('🔄 Retrying POST request on secondary region...');
      await new Promise(resolve => setTimeout(resolve, 500));
      return apiPost(apiName, path, options, retryCount + 1);
    }
    throw error;
  }
};

// API PUT wrapper
export const apiPut = async (apiName, path, options = {}, retryCount = 0) => {
  try {
    const response = await put({ apiName, path, options }).response;
    return response;
  } catch (error) {
    console.error(`❌ API PUT Error (${currentRegion} region):`, error.name, error.message);
    if (shouldFailover(error) && retryCount === 0 && currentRegion === 'primary') {
      switchToSecondary();
      console.log('🔄 Retrying PUT request on secondary region...');
      await new Promise(resolve => setTimeout(resolve, 500));
      return apiPut(apiName, path, options, retryCount + 1);
    }
    throw error;
  }
};

// API DELETE wrapper
export const apiDelete = async (apiName, path, options = {}, retryCount = 0) => {
  try {
    const response = await del({ apiName, path, options }).response;
    return response;
  } catch (error) {
    console.error(`❌ API DELETE Error (${currentRegion} region):`, error.name, error.message);
    if (shouldFailover(error) && retryCount === 0 && currentRegion === 'primary') {
      switchToSecondary();
      console.log('🔄 Retrying DELETE request on secondary region...');
      await new Promise(resolve => setTimeout(resolve, 500));
      return apiDelete(apiName, path, options, retryCount + 1);
    }
    throw error;
  }
};

// Auth SignIn wrapper
export const authSignIn = async (username, password, retryCount = 0) => {
  try {
    const result = await signIn({ username, password });
    return result;
  } catch (error) {
    console.error(`❌ Auth SignIn Error (${currentRegion} region):`, error.name, error.message);
    const cognitoFailureErrors = ['NetworkError', 'ServiceException', 'InternalErrorException', 'NotAuthorizedException'];
    if (cognitoFailureErrors.includes(error.name) && retryCount === 0 && currentRegion === 'primary') {
      switchToSecondary();
      console.log('🔄 Retrying sign-in on secondary region...');
      await new Promise(resolve => setTimeout(resolve, 500));
      return authSignIn(username, password, retryCount + 1);
    }
    throw error;
  }
};

// Auth SignUp wrapper
export const authSignUp = async (username, password, email, retryCount = 0) => {
  try {
    const result = await signUp({
      username,
      password,
      options: { userAttributes: { email } }
    });
    return result;
  } catch (error) {
    console.error(`❌ Auth SignUp Error (${currentRegion} region):`, error.name, error.message);
    if ((error.name === 'NetworkError' || error.name === 'ServiceException') && retryCount === 0 && currentRegion === 'primary') {
      switchToSecondary();
      console.log('🔄 Retrying sign-up on secondary region...');
      await new Promise(resolve => setTimeout(resolve, 500));
      return authSignUp(username, password, email, retryCount + 1);
    }
    throw error;
  }
};

// Auth ConfirmSignUp wrapper
export const authConfirmSignUp = async (username, code, retryCount = 0) => {
  try {
    const result = await confirmSignUp({ username, confirmationCode: code });
    return result;
  } catch (error) {
    console.error(`❌ Auth Confirm Error (${currentRegion} region):`, error.name, error.message);
    if ((error.name === 'NetworkError' || error.name === 'ServiceException') && retryCount === 0 && currentRegion === 'primary') {
      switchToSecondary();
      console.log('🔄 Retrying confirmation on secondary region...');
      await new Promise(resolve => setTimeout(resolve, 500));
      return authConfirmSignUp(username, code, retryCount + 1);
    }
    throw error;
  }
};

// Auth SignOut wrapper
export const authSignOut = async () => {
  try {
    await signOut();
  } catch (error) {
    console.error('Sign out error:', error);
  }
};

// Auth GetCurrentUser wrapper
export const authGetCurrentUser = async (retryCount = 0) => {
  try {
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    if ((error.name === 'NetworkError' || error.name === 'ServiceException') && retryCount === 0 && currentRegion === 'primary') {
      switchToSecondary();
      console.log('🔄 Retrying get user on secondary region...');
      await new Promise(resolve => setTimeout(resolve, 500));
      return authGetCurrentUser(retryCount + 1);
    }
    throw error;
  }
};

// Helper function to get current region
export const getCurrentRegion = () => currentRegion;

// Manual failover function (for testing)
export const manualFailover = () => {
  if (currentRegion === 'primary') switchToSecondary();
  else console.log('Already on secondary region');
};

export default primaryConfig;
