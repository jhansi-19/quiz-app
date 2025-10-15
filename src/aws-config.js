import { Amplify } from 'aws-amplify';

const awsmobile = {
  aws_project_region: 'us-east-1',
  aws_content_delivery_bucket: 'ccfrontend-20251014194826-hostingbucket-dev',
  aws_content_delivery_bucket_region: 'us-east-1',
  aws_content_delivery_url: 'https://d3qc56qfcpana.cloudfront.net',
  Auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_DLkiT6Y7r',
    userPoolWebClientId: '2o27e8efr1t6hmm2gsc3l6aol6',
    oauth: {
      domain: 'us-east-1dlkit6y7r.auth.us-east-1.amazoncognito.com', // e.g., quiz-app-pool.auth.us-east-1.amazoncognito.com
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: 'https://dev.dk984uju67rhc.amplifyapp.com/',
      redirectSignOut: 'https://dev.dk984uju67rhc.amplifyapp.com/',
      responseType: 'code'
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
