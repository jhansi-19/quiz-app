import { Amplify } from 'aws-amplify';

const isSecondaryRegion = window.location.hostname.includes('dev.d2yww64gbp26rj.amplifyapp.com');

const awsconfig = {
  Auth: {
    Cognito: {
      region: isSecondaryRegion ? 'us-west-2' : 'us-east-1',
      userPoolId: isSecondaryRegion ? 'us-west-2_pl4W32FsW' : 'us-east-1_DLkiT6Y7r',
      userPoolClientId: isSecondaryRegion ? '7hrdm80pqb323iqo1tspi9dmin' : '2o27e8efr1t6hmm2gsc3l6aol6',
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
        region: isSecondaryRegion ? 'us-west-2' : 'us-east-1'
      }
    }
  }
};

Amplify.configure(awsconfig);
export default awsconfig;
