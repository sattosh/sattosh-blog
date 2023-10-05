---
title: 'GDAL入門 〜タイル画像化〜'
excerpt: 'GDALのコマンドを使って一枚の画像からタイル画像を生成します'
coverImage: '/assets/blog/gdal-intro/cover.webp'
date: '2023-08-31T11:25:19.000+09:00'
author:
  name: sattosh
  picture: '/assets/blog/authors/jj.jpeg'
ogImage:
  url: '/assets/blog/gdal-intro/cover.webp'
---

## はじめに

気象情報の解析値を色付けして画像にしたはいいが一枚画像だと全て読み込んで地図にレンダリングするまでどうしても時間がかかってしまいます.(特に一枚自体の画像のサイズが大きければ比例して最初の表示に時間がかかります)

この時に一枚の大きな画像をある決まった間隔で細分化してやると画像を取得するのに並列化ができ,効率よく地図画面に表示できます(タイル化).

今回はGDAL(Geospatial Data Abstraction Library)のコマンドを使って一枚の画像をタイル化していきます.


## 1. 画像に地理情報を付与する

今回使用するのは以下の雨量の解析データの画像です.
(ブログ上では表示をwebp形式にしていますがもとはPNG画像でした)

![analyzed_rainfall](/assets/blog/gdal-intro/origin.webp)

このままだと地球上のどこのデータ化わからないので地理参照情報が埋め込まれたイメージファイル形式であるGeoTIFFに変えます.

```sh
gdal_translate -of GTiff -a_ullr 118.031250 47.975000 149.968750 20.025000 -a_srs '+proj=longlat EPSG:3857' origin.png georeferenced.tif
```

何をしているかというと画像の四隅が緯度経度でどこの位置に当たるのかと,投影方法をEPSG:3857(WEBメルカトル)で指定しています

この時もと画像が別の投影方法であった場合一度GeoTIFF画像にした時に別の投影方法に帰る場合はgdalwarpを使います

```sh
gdalwarp -t_src <元の座標系> -te_src <出力座標系> <入力画像ファイル> <出力画像ファイル>
```


## 2. タイル化

地理情報を追加できたらあとはタイル化です.
このときGDALをインストールした際に付属されるPythonスクリプトを使って分割していきます.

```sh
gdal2tiles.py georeferenced.tif dist -z4-13 --xyz --processes=4
```

上記のコマンドではZoom率4~13でXYZタイル地図画像に細分化行い,このとき並列処理として4つのプロセスで処理したものをdistのディレクトリに吐き出していくコマンドです.

もちろんZoom率を増やすと細分数が増加し処理時間が長くなるので注意です


## 結果

細分化したタイル画像をホスティングし,地図ライブラリで読み込んでやると以下のように表示されます.

![wide](/assets/blog/gdal-intro/wide.webp)


またZoomして表示してもすぐに表示できますし,場合によっては解像度の高い画像に差し替えることでZoomした時により細かい情報を閲覧できるようにすることもできます

![zoom](/assets/blog/gdal-intro/zoom.webp)



