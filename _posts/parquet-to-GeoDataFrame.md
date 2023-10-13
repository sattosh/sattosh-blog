---
title: 'AWS S3にあるGeoParquet形式のファイルをGeoDataFrameに落とす'
excerpt: '普段Pythonを使わないのでとても初歩的な内容だけどメモとして'
coverImage: '/assets/blog/parquet-to-GeoDataFrame/cover.webp'
date: '2023-10-12T19:23:58.000+09:00'
author:
  name: sattosh
  picture: '/assets/blog/authors/jj.jpeg'
ogImage:
  url: '/assets/blog/parquet-to-GeoDataFrame/cover.webp'
---

## はじめに

とても初歩的な内容ですが地理情報が入っているParquet形式(GeoParquet)ファイルをAWS S3に保存しておいたものを取得し,GeoPandasのGeoDataFrame形式に落とし込むという内容です.

普段PythonもParquetファイルも使わないので勉強になりました.


## 解決策1 ~ByteIOを使う~

一番シンプルだしこれでいいと思います.

```python:sample1.py
import io
import boto3
import geopandas as gpd

bucket_name = "hoge"
parquet_file_key = "fuga/test.parquet"

s3 = boto3.client("s3")
content = s3.get_object(Bucket=bucket_name, Key=parquet_file_key)["Body"].read()
gdf = gpd.read_parquet(io.BytesIO(content))
```

## 解決策2 ~DataFrameを経由する~

最初なぜかDataFrameを経由しないといけないと思い込んでいたのでいろいろつまりました.
たぶんawswrangler.s3.read_parquetを使わないといけないと思ってたからですかね.

### ファイルの読み込み

awswrangler.s3.read_parquetを使って読み込む場合は以下のようになります.

```python
import geopandas as gpd
from awswrangler import s3

bucket_name = "hoge"
parquet_file_key = "fuga/test.parquet"

df = s3.read_parquet(path=f's3://${bucket_name}/${parquet_file_key}')
```

ただしこのまま読み込むとDataFrameとして読み込むので、地理情報が入っているカラムは[Well-known Binary(WKB)形式](https://ja.wikipedia.org/wiki/Well-known_text)で格納されてしまいこのままではGeoDataFrameに変換できません.


GeoDataFrame形式にする場合は地理情報のカラムのデータをshapely geometry objectsに変換する必要があるので以下のように一度変換させます.([GeoPandasのドキュメント](https://geopandas.org/en/stable/docs/reference/api/geopandas.GeoDataFrame.html))

```python
from shapely.wkb import loads

df['geometry'] = df['geometry'].apply(loads)
```

そうすることでGeoDataFrameに変換できます

```python
gdf = gpd.GeoDataFrame(df, geometry="geometry", crs="EPSG:4326")
```

最終的なコードはこちら↓

```python:sample2.py
import geopandas as gpd
from awswrangler import s3
from shapely.wkb import loads

bucket_name = "hoge"
parquet_file_key = "fuga/test.parquet"

df = s3.read_parquet(path=f's3://${bucket_name}/${parquet_file_key}')
df['geometry'] = df['geometry'].apply(loads)

gdf = gpd.GeoDataFrame(df, geometry="geometry", crs="EPSG:4326")
```



## 結論

pythonのお勉強せねば

