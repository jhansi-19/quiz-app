const awsconfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_DLkiT6Y7r',  // Primary (uncomment for normal operation)
      // userPoolId: 'us-west-2_pl4W32FsW',    // Secondary (uncomment during DR, replace with your us-west-2 User Pool ID)
      userPoolClientId: '2o27e8efr1t6hmm2gsc3l6aol6',  // Primary (uncomment for normal operation)
      // userPoolClientId: '7hrdm80pqb323iqo1tspi9dmin',  // Secondary (uncomment during DR, replace with your us-west-2 Client ID)
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true
      }
    }
  },
  
  API: {
    REST: {
      quizApi: {
        endpoint: 'https://poavf33mhl.execute-api.us-east-1.amazonaws.com/prod',  // Primary (uncomment for normal operation)
        // endpoint: 'https://rpw2ot8deh.execute-api.us-west-2.amazonaws.com/prod',  // Secondary (uncomment during DR, replace with your us-west-2 API Gateway ID)
        region: 'us-east-1'  // Primary (uncomment for normal operation)
        // region: 'us-west-2'  // Secondary (uncomment during DR)
      }
    }
  }
};

export default awsconfig;
