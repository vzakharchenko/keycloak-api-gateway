const fs = require('fs');

const cdk = require('@aws-cdk/core');
const iam = require('@aws-cdk/aws-iam');
const dynamodb = require('@aws-cdk/aws-dynamodb');
const s3 = require('@aws-cdk/aws-s3');
const s3Deployment = require('@aws-cdk/aws-s3-deployment');
const lambda = require('@aws-cdk/aws-lambda');
const cloudfront = require('@aws-cdk/aws-cloudfront');

const {bucketName, keycloakUrl} = process.env;
const roleArn = process.env.arnRole;

class KeycloakCloudFrontExampleStack extends cdk.Stack {

  constructor(parent, id, props) {
    super(parent, id, props);

    const role = iam.Role.fromRoleArn(this, `Role ${bucketName}`, roleArn, {mutable: false});
    const bucket = new s3.Bucket(this, 'lambda-edge-bucket', {
      accessControl: s3.BucketAccessControl.AUTHENTICATED_READ,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      bucketName,
    });
    this.updateConfig(bucketName);
    const lambdaEdge = new lambda.Function(this, 'lambda-edge-example', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'lambda.handler',
      code: lambda.Code.fromAsset('../dist/lambda'),
      functionName: `function_${bucketName}`,
      role,
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
    });
    const VersionLambdaEdge = new lambda.Version(this, 'lambda-edge-example Version', {
      lambda: lambdaEdge,
      description: `lambda-edge-example Version ${Math.random() * (99999 - 1) + 1}`,
    });

    const accessIdentityId = `access-identity-${bucketName}`;

    const comment = `OriginAccessIdentity-${bucketName}`;
    const oai = new cloudfront.OriginAccessIdentity(this, accessIdentityId, {
      comment,
    });

    bucket.addToResourcePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [oai.grantPrincipal],
      actions: ['s3:GetObject'],
      resources: [`arn:aws:s3:::${bucketName}/*`],
    }));
    const sessionTable = new dynamodb.Table(this, `Session ${bucketName}`, {
      tableName: bucketName,
      partitionKey: {name: 'sessionId', type: dynamodb.AttributeType.STRING},
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      timeToLiveAttribute: 'exp',
    });
    sessionTable.grantFullAccess(role);
    const frontWebDistribution = new cloudfront.CloudFrontWebDistribution(this, `cloudfront-${bucketName}`, {
      originConfigs: [{
        s3OriginSource: {
          s3BucketSource: bucket,
          originAccessIdentity: oai,
        },
        behaviors: [
          {
            isDefaultBehavior: true,
            allowedMethods: cloudfront.CloudFrontAllowedMethods.ALL,
            forwardedValues: {
              cookies: {forward: 'all'},
              headers: [
                'Authorization',
                'Referer',
                'Origin',
              ],
              queryString: true,
            },
            lambdaFunctionAssociations: [{
              lambdaFunction: VersionLambdaEdge,
              eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
            }],
          },
        ],
      }],
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      defaultRootObject: 'index.html',
    });
        // eslint-disable-next-line no-new
    new s3Deployment.BucketDeployment(this, `BucketDeployment ${bucket}`, {
      destinationBucket: bucket,
      role,
      distribution: frontWebDistribution,
      sources: [
        s3Deployment.Source.asset('../../development/build'),
      ],
    });
  }

  updateConfig(bucketName) {
    const apiConfig = JSON.parse(fs.readFileSync('../dist/lambda/ApiConfig.json', 'utf8'));
    apiConfig.defaultAdapterOptions.keycloakJson['auth-server-url'] = `${keycloakUrl}/auth/`;
    apiConfig.storageTypeSettings = {
      tableName: bucketName,
      region: 'us-east-1',
      apiVersion: '2012-08-10',
    };
    fs.writeFileSync('../dist/lambda/ApiConfig.json', JSON.stringify(apiConfig));
  }


}

const app = new cdk.App({context: {}});
// eslint-disable-next-line no-new
new KeycloakCloudFrontExampleStack(app, `example-${bucketName}`,
  {
    env: {
      account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
    },
  });
app.synth();

