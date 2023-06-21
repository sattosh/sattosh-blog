---
title: 'ffmpegの覚え書き ~その１ pad~'
excerpt: 'ブログ用に表示する画像のサイズを4:3に固定するために足りない部分は埋めるように指定する方法'
coverImage: '/assets/blog/ffmpeg/ffmpeg.webp'
date: '2023-06-22T00:50:47.000+09:00'
author:
  name: sattosh
  picture: '/assets/blog/authors/jj.jpeg'
ogImage:
  url: '/assets/blog/ffmpeg/ffmpeg.webp'
tags:
  - ffmpeg
---

## はじめに

ブログを掲載したときに表示の画像でなんの記事かわかるようにしたほうがいいなっていうのがありました。
ただ、静的ファイルをcloudflare pagesでホスティングするに当たってなるべく軽量であること＋画像のアスペクト比は統一したいと思ったのでffmpegでなんとかできないか調べたのでその覚え書きです。

## 画像のアスペクト比

始めは写真と同じ様に4:3にしようと思いましたが無駄にスペースをとるので16:9にしました🙃
そしてアスペクト比を変えるときにある問題にぶつかりました。

**変換したときに画素が足りなくなった部分を補填しなくてはならない**

PythonであればPillow(PIL)が使い慣れていたのでサクッとできますが基本的にプロジェクごとにパッケージ管理したい性分で、どこでも実行したいからと言ってグローバルな環境にモジュールを入れたくアリませんでした。

## FFmpegとは？

[Wikipedia](https://ja.wikipedia.org/wiki/FFmpeg)より

```text
FFmpeg（エフエフエムペグ）は動画と音声を記録・変換・再生するためのフリーソフトウェアである[7]。
Unix系オペレーティングシステム (OS) 生まれであるが現在ではクロスプラットフォームであり、
libavcodec（動画/音声のコーデックライブラリ）、libavformat（動画/音声のコンテナライブラリ）、
libswscale（色空間・サイズ変換ライブラリ）、libavfilter（動画のフィルタリングライブラリ）などを含む。
ライセンスはコンパイル時のオプションによりLGPLかGPLに決定される。コマンドラインから使用することができる。
対応コーデックが多く、多彩なオプションを使用可能なため、幅広く利用されている。
```

## いざ変換

いきなり結論を書きます。(解説は後述)

#### **元画像の横幅が縦幅より長いとき**
```sh
$ ffmpeg -i <元画像のPATH> -vf "pad=iw:(iw*9/16):(ow-iw)/2:(oh-ih)/2color=#FFFFFF00" <生成する画像のPATH>
```

#### **元画像の縦幅が横幅より長いとき**
```sh
$ ffmpeg -i <元画像のPATH> -vf "pad=(ih*16/9):ih:(ow-iw)/2:(oh-ih)/2:color=#FFFFFF00" <生成する画像のPATH>
```

##  ざっくり解説

CLIオプションですが`-i`が入力する画像のPATHを指定するようになっていて、`-vf`が後ろに記載されたフィルターグラフに基づき入力から出力へ変換してくれるようなオプションになっています。

フィルターグラフについてはffmpeg-filtersの[ドキュメント](https://ffmpeg.org/ffmpeg-filters.html)を参照すると確認できます。

### pad

[Document](https://ffmpeg.org/ffmpeg-filters.html#pad-1)
padは入力された画像に対してパッディングをする様にしていするフィルターグラフです。
`pad=`に続くパラメーターは以下の通りです

```
パラメータ定義 - <width>:<height>:<x>:<y>:<color>:<eval>:<aspect>

・ width,w / height,h
  パディングを加えた出力画像のサイズを表す式を指定する。width または height の値が 0 の場合、対応する入力サイズが出力に使われます。
  width 式は height 式で設定された値を参照することができ、その逆も同様です。
  width と height のデフォルト値は 0 です。
・ x / y
  出力画像の上/左境界を基準に、入力画像をパッド領域内に配置するオフセットを指定する。
  x式はy式で設定された値を参照することができ、逆も同様です。xとyのデフォルト値は0です。
  xまたはyが負数に評価されると、入力画像がパディングされた領域の中央に来るように変更されます。
・ color
  パッドされた領域の色を指定する。このオプションの構文は、ffmpeg-utilsマニュアルの(ffmpeg-utils) "Color "セクションを参照。
  https://ffmpeg.org/ffmpeg-utils.html#color-syntax
  colorのデフォルト値は "black "である。
・ eval
  width、height、x、y式を評価するタイミングを指定する。
  以下の値を受け付ける：
  - 'init'
    フィルタの初期化中、またはコマンドの処理中に一度だけ式を評価します。
  - 'frame'
    入ってくるフレームごとに式を評価する。
  デフォルト値は 'init' である。
・ aspect
  パッドは解像度の代わりにアスペクトにする。
```

またpadの中で指定できる変数は以下の通りです

```
・ in_w(iw) / in_h(ih)
  入力画像の幅と高さ。
・ out_w(ow) / out_h(oh)
  width式とheight式で指定される、出力の幅と高さ（パディングされた領域のサイズ）。
・ x / y
  x式とy式で指定されたxオフセットとyオフセット、まだ指定されていない場合はNAN。
・ a
  iw / ih と総理
```


以上