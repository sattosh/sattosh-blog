---
title: 'ブログ,はじめました'
excerpt: '急に思い立ってブログサイトをたちあげました.理由としては特になく,ただQiitaやZennに載せる記事と違って,ただただ自分が書きたいように書いておくだけです.'
coverImage: '/assets/blog/hello-world/cf-logo-v.svg'
date: '2022-07-30T05:35:07.322Z'
author:
  name: sattosh
  picture: '/assets/blog/authors/jj.jpeg'
ogImage:
  url: '/assets/blog/hello-world/cf-logo-v-rgb.webp'
tags:
  - cloudflare
  - nextjs
---

## きっかけ

急に思い立ってブログサイトをたちあげました.理由としては特になく,ただQiitaやZennに載せる記事と違って,ただただ自分が書きたいように書いておこうと思います.
ただの技術記事であれば色々なサービス(はてなブックマークとか)もあるのですが,自分の趣味が写真なのでフォトギャラリー的なのをこれを機に技術向上のためにNext.jsで作ってみようと思います.

(きっと誰かのためになることはないとは思います,,,,笑)


## Hosting Serviceの選定

さて,ブログを立ち上げるにあたってどのプラットフォームでホスティングさせるかが最初悩みました.
候補として挙げたのは下の４つです.

- Netlify
- Vercel
- Cloudflare Pages
- AWS(Cloudfront+S3+Lambda@Edge or Amplify)

Netlifyは過去に使っていてとても導入が簡単であることは知っていたのですが,日本国内にエッジサーバーがないのを知って,ほぼ自分でしかみないサイトなのでわざわざ自分から遠いところにアクセスする必要はないかなと思い今回はパスにしました.

AWSはAmplifyの場合はAmplifyに沿ったやり方をすれば簡単かもしれませんが,逆をいうとAmplifyに沿わなくなったときがとても辛いのと,S3などを使った場合は自分でAWS CDKを使ってCI/CDを作る必要があったため遠慮しました.

残るはVercelとCloudflareですが,Photo Galleryを作ろうと思った時に画像を大量に配信することになるかもしれないなって思った時にCloudflare Imagesがあり,画像の変換まで組み込めそうだと思ってCloudflareにしました.

## (ちょっと)詰まったところ

いざデプロイまでしようとしたところ,CloudflareのNode.jsのruntimeが12だったので,現状のNext.jsの必要なバージョンを満たしていなく,build時にエラーが出てしまいます.

解決方法は簡単で,Cloudflareのプロジェクトの環境変数NODE_VERSIONを以下のように指定すれば大丈夫でした.(実際はUI上から指定)

```shell
NODE_VERSION : v16.15.0
```

ちなみに同時にyarnも同胞されていて助かりました.


初回デプロイ時にCloudflare側から謎のエラー(Failed to publish assets.)が吐き出されましたが,もう一度デプロイしてやると普通にデプロイできました.


![error](/assets/blog/hello-world/error.webp)






