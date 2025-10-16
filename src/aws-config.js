const awsconfig = {
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

export default awsconfig;
