import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import * as dotenv from 'dotenv';

import {
  DockerImageFunction,
  DockerImageCode,
  FunctionUrlAuthType,
  Architecture,
} from 'aws-cdk-lib/aws-lambda';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';

dotenv.config({               // load backend/.env
  path: path.resolve(__dirname, '../../.env'),
});

export class RagCdkInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /** Build context = backend/  */
    const apiImageCode = DockerImageCode.fromImageAsset(
      path.resolve(__dirname, '../../'),          // <── root with Dockerfile
      { platform: Platform.LINUX_AMD64 }
    );

    const apiFunction = new DockerImageFunction(this, 'ApiFunc', {
      code: apiImageCode,
      architecture: Architecture.X86_64,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(120),
      environment: {
        IS_USING_IMAGE_RUNTIME: 'True',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
        // add other env vars as needed
      },
    });

    const fnUrl = apiFunction.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });

    new cdk.CfnOutput(this, 'FunctionUrl', { value: fnUrl.url });
  }
}
