---
title: 'AWS WAFv2を使って国単位でアクセス許可をする方法'
excerpt: 'AWS WAFv2を使って特定のAPI Gatewayへのアクセスを国ごとで許可をする.まあ,特定のPathだけはどこからもアクセスできるようにする方法をAWS CDKで記載.'
coverImage: '/assets/blog/geo-strict-waf/cover.webp'
date: '2023-10-02T11:18:24.000+09:00'
author:
  name: sattosh
  picture: '/assets/blog/authors/jj.jpeg'
ogImage:
  url: '/assets/blog/geo-strict-waf/cover.webp'
---


## やりたいこと

ある要件でフロントで使っているAPIを日本以外のアクセスを禁止する必要がありました.
しかし,使用しているAPI Gatewayは外部のサービスからもアクセスを受けるものであり,外部サービスは国内外で冗長化されているのである程度絞ったとしてもどこの国かを制限することに対してリスクがありました.


## 対応

AWS WAF自体はAPI Gateway全体につける仕様であり,上記の条件を満たすためには以下の二つのうちどれかです.

1. エンドポイントを分ける(API Gatewayをもう一つ作成)して,片方だけにWAFをかける
2. 特定のPathだけ国別のアクセス許可をしないようにする

今回は2を採用して対応しました.


## 結果

AWS CDKを使って以下のようにリソースを定義しました

```typescript
import * as cdk from 'aws-cdk-lib';
import {
  aws_apigateway as apigateway,
  aws_waf as waf,
  aws_wafv2 as wafv2,
  aws_wafregional as wafregional,
  aws_lambda_nodejs as aws_lambda_nodejs,
  aws_lambda as lambda,
} from 'aws-cdk-lib';
import { resolve } from 'path';

import { Construct } from 'constructs';

export class SandboxApigatewayWafStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // API Gateway用のLambda関数を作成
    const handler = new aws_lambda_nodejs.NodejsFunction(this, 'handler', {
      entry: resolve(__dirname, '../lib/lambda/handler.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
    });

    // API Gatewayを作成
    const api = new apigateway.RestApi(this, 'api', {
      restApiName: 'sandbox-apigateway-waf',
      deployOptions: {
        stageName: 'prod',
      },
    });

    // API GatewayのリソースにLambda関数を紐付け
    const integration = new apigateway.LambdaIntegration(handler);

    // API Gatewayのリソースを作成
    const resource1 = api.root.addResource('hello');
    const resource2 = api.root.addResource('world');
    resource1.addMethod('GET', integration);
    resource2.addMethod('GET', integration);

    //　WAFを作成
    const apiWaf = new wafv2.CfnWebACL(this, 'apiWaf', {
      name: 'sample-geo-restriction',
      defaultAction: {
        allow: {},
      },
      scope: 'REGIONAL',
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'sample-geo-restriction',
        sampledRequestsEnabled: true,
      },
      rules: [
        {
          priority: 0,
          name: 'partial-access-prohibited',
          statement: {
            andStatement: {
              statements: [
                {
                  notStatement: {
                    statement: {
                      geoMatchStatement: {
                        countryCodes: ['JP'],
                      },
                    },
                  },
                },
                {
                  notStatement: {
                    statement: {
                      regexMatchStatement: {
                        fieldToMatch: {
                          uriPath: {},
                        },
                        textTransformations: [{ priority: 0, type: 'NONE' }],
                        regexString: '/hello',
                      },
                    },
                  },
                },
              ],
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'AWS-GeoRestrictionRule',
            sampledRequestsEnabled: true,
          },
          action: {
            block: {},
          },
        },
      ],
    });

    // apiにwafを紐付け
    const webAclAccociation = new wafv2.CfnWebACLAssociation(this, 'apiWafAssociation', {
      resourceArn: api.deploymentStage.stageArn,
      webAclArn: apiWaf.attrArn,
    });
  }
}
```

今回の条件として

`日本以外のアクセス` かつ `/hello以外のPath` をBlockする

ようにしています.


### 実際のWAFの挙動

海外からのIPのアクセスとしてEC2を別リージョンに立ててcurlなどでアクセスしてもよかったのですが,今回は[www.webpagetest.org](https://www.webpagetest.org/)というサービスを使用してUSからアクセスさせてみました.

↓実際のアクセス結果です./worldだけ他の国からのアクセスをBlockしています
![error](/assets/blog/geo-strict-waf/result.webp)


↓もちろん日本からのアクセスはどちらからも大丈夫です
![ok](/assets/blog/geo-strict-waf/web_result.webp)

