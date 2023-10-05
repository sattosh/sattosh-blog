---
title: 'Cloudfront FunctionsでBasic認証をかける'
excerpt: 'Amazon Cloudfront FunctionsでBasic認証をかけてAWS CDKでデプロイする'
coverImage: '/assets/blog/cloudfront-function/cover.webp'
date: '2023-10-05T18:56:22.000+09:00'
author:
  name: sattosh
  picture: '/assets/blog/authors/jj.jpeg'
ogImage:
  url: '/assets/blog/cloudfront-function/cover.webp'
---


## 初めに

オンプレ時代で手っ取り早い認証といえばBasic認証である/(Apache懐かしい)
開発の補助機能をホスティングするときにAWSだとAWS Cognitoなどの外部認証機があるがわざわざリソースを別途立てるほどでもないなと思い、試しにAmazon Cloudfrontの機能の一つであるCloudfront FunctionsでBasic認証が実現できるか試してみました.(ホスティングはCloudfront+S3)

## Cloudfront Functions

Cloudfront FunctionsはJavaScriptで軽量な関数を記述し、レイテンシーの影響を受けやすいCloudFrontを通過するリクエストとレスポンスの操作、基本認証と承認の実行、エッジでの HTTP レスポンスの生成などをを大規模に実行できます.
ただし、軽量なJavaScriptのRuntime環境であるためECMAScript5.1に準拠されており(v6~9の一部の機能をサポート)、`const`や`Buffer`などの予約語が使えないので注意です。


### 実際にコード

今回はBasic認証ということで[ViewerRequest](https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/lambda-cloudfront-trigger-events.html)のタイミングで発火し、認証情報のチェックを行う関数を買いていきます。

```js:basic_authentication_handler.js
// Basic認証cloudfront function
function handler(event) {
  var request = event.request;
  var headers = request.headers;
  // var authUser = 'hogehoge';
  // var authPass = 'fugafuga';
  // var authString = `Basic ${new Buffer.from(authUser + ':' + authPass).toString('base64')}`;
  var authString = 'Basic aG9nZWhvZ2U6ZnVnYWZ1Z2E=';

  // 認証情報が違う or なかった場合
  if (typeof headers.authorization === 'undefined' || headers.authorization.value !== authString) {
    var response = {
      statusCode: 401,
      statusDescription: 'Unauthorized',
      headers: {
        'www-authenticate': { value: 'Basic' },
      },
    };
    return response;
  }
  // 認証が通ればS3にリクエストを流す
  return request;
}
```


## AWS CDK

関数ができたところで実際にAWSにリソースをデプロイするAWS CDKのスクリプトは以下のようになります。


```ts:dev-tool-viewer-stack.ts
import {
  aws_s3 as s3,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_iam as iam,
  aws_lambda_nodejs as lambda_nodejs,
  aws_lambda as lambda,
  RemovalPolicy,
  StackProps
} from 'aws-cdk-lib';
import { resolve } from 'path';
import { Construct } from 'constructs';

/**
 * 開発ツールのホスティング用の環境設定
 */
export class DevToolViewerStack extends Construct {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id);

    /** Basic認証用Cloudfront function */
    const basicAuthenticationFn = new cloudfront.Function(this, 'BasicAuthenticationFn', {
      code: cloudfront.FunctionCode.fromFile({
        filePath: resolve(__dirname, 'basic_authentication_handler.js'),
      }),
      functionName: `BasicAuthenticationFn`,
    });

    /**  保存バケット設定 */
    this.bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: `dev-tool-viewer`,
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });
    const defaultOrigin = new origins.S3Origin(this.bucket);

    // Origin Access Identity
    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: `dev-tool-viewer`,
    });

    // Origin Access Identityからのアクセスのみ許可するBucket Policyを作成
    const webSiteBucketPolicyStatement = new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      effect: iam.Effect.ALLOW,
      principals: [new iam.CanonicalUserPrincipal(oai.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
      resources: [`${this.bucket.bucketArn}/*`],
    });

    // 4. Bucket PolicyをS3 Bucketに適用
    this.bucket.addToResourcePolicy(webSiteBucketPolicyStatement);

    // cloudfront設定
    this.cloudfront = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: defaultOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        functionAssociations: [
          { function: basicAuthenticationFn, eventType: cloudfront.FunctionEventType.VIEWER_REQUEST },
        ],
      },
      additionalBehaviors: {
        // 認証を介したくないPathがあれば別途定義する
        '/public/*': {
          origin: defaultOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
      defaultRootObject: 'index.html',
    });
  }
}
```



## ひとこと

軽量なRuntimeのせいでfunctions使いにくい