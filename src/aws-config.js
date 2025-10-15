import { Amplify } from 'aws-amplify';

const awsmobile = {
  aws_project_region: 'us-east-1',
  aws_content_delivery_bucket: 'ccfrontend-20251014194826-hostingbucket-dev',
  aws_content_delivery_bucket_region: 'us-east-1',
  aws_content_delivery_url: 'https://d3qc56qfcpana.cloudfront.net',
  
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_DLkiT6Y7r',
      userPoolClientId: '2o27e8efr1t6hmm2gsc3l6aol6',
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true,
        username: false
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

Amplify.configure(awsmobile);

export default awsmobile;
