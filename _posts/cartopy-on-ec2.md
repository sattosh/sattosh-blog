---
title: 'Cartopy on EC2'
excerpt: 'とにかく依存関係の辛い、地理空間データ分析で使われるCartopy。これをAmazonLinux2のOSでEC2を立て、Cartopyが動くまでの導入を書く。'
coverImage: '/assets/blog/cartopy-on-ec2/cartopy-on-ec2.webp'
date: '2022-08-01T15:00:07.322Z'
author:
  name: satokin
  picture: '/assets/blog/authors/jj.jpeg'
ogImage:
  url: '/assets/blog/cartopy-on-ec2/cartopy-on-ec2.webp'
---

# Cartopy on EC2


地理空間データ分析で使われるCartopy。ただ、こいつ自身の内部で使われている共有ライブラリーの依存関係を修正するのが大変なので、AWSサービスの一つであるEC2でAmazonLinux2を使ってCartopyが無事動くまでを書いていきます。

また、今回はAnaconda(miniconda)を使わずにpipでのインストールをしていきます。

「`pip install cartopy`でいいじゃん」

って思うかもしれませんが、cartopyのバージョンとyumのリポジトリにある共有ライブラリの依存関係が合わないので共有ライブラリを一からビルドする必要があったりするんです笑

## 初めに

今回は以下のPythonとCartopyに必要な共有ライブラリのバージョンの条件でインストールしていきます。

- Python  3.9.13
- Cartopy 0.20.3
- PROJ  8.2.1 
- GEOS  3.11.0

#### ※注意: Cartopyの依存関係を整えるだけであって、他のライブラリーなどに影響がないことは保証しません

## 1.下準備

足りない共有ライブラリやコマンドを最初にインストールしていきます。

```shell
$ sudo yum install -y tar gzip gcc gcc-c++ make libtiff-devel libffi-devel curl libcurl-devel openssl-devel libjpeg-devel
```

また、インストールしていく時に共有ライブラリのリンカのパスが通ってないとエラーになるので以下の環境変数を設定します

```shell
$ export LD_LIBRARY_PATH=/usr/local/lib:/usr/local/lib64:$LD_LIBRARY_PATH
$ export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig:/usr/local/lib64/pkgconfig:$PKG_CONFIG_PATH
```

## 2.PROJのインストール

PROJのv8以上を入れる時、sqliteが3.13以上のバージョンじゃなればいけないのですが、AmazonLinux2のsqliteのバージョンが3.11なのでこれを入れ直していきます。

ただし、sqliteをそのまま消すとyumが使えなくなってしまうのでここでは古い方のsqliteを移動させ、新しいsqliteをシンボリックリンクをはることにします。

```shell
$ curl -L https://www.sqlite.org/2019/sqlite-autoconf-3270100.tar.gz |  tar zxf - -C /tmp \
  && cd /tmp/sqlite-autoconf-3270100 \
  && ./configure  \
  && sudo make \
  && sudo make install \
  && sudo mv /usr/bin/sqlite3 /usr/bin/sqlite3_old \
  && sudo ln -s /usr/local/bin/sqlite3 /usr/bin/sqlite3 \
  && cd /tmp \
  && sudo rm -rf sqlite* 
```

無事にsqliteが入ったらPROjのインストールです。

```shell
$ curl -L http://download.osgeo.org/proj/proj-8.2.1.tar.gz | tar zxf - -C /tmp \
  && cd /tmp/proj-8.2.1 \
  && ./configure \
  && sudo make -j $(nproc) \
  && sudo make install \
  && cd /tmp \
  && sudo rm -rf proj* 
```


## 3.GEOSのインストール

GEOSのインストールも一筋縄ではいかなく、cmakeでのインストールなんですがv3以上が必須です。AmazonLinux2では残念ながらv3以下なのでこれも入れ直していきましょう。

cmakeはyumに影響ないのでこれは古いのをそのまま消してしまいましょう。気になるのであれば退避させるようにしてください

```shell
$ sudo yum remove -y cmake \
  && curl -L https://cmake.org/files/v3.18/cmake-3.18.0.tar.gz | tar zxf - -C /tmp \
  && cd /tmp/cmake-3.18.0 \
  && sudo ./bootstrap \
  && sudo make \
  && sudo make install \
  && sudo ln -s /usr/local/bin/cmake /usr/bin/cmake \
  && cd /tmp \
  && sudo rm -rf cmake*
```

cmakeのインストールが済んだら GEOSのインストールです

```shell
$ curl -L http://download.osgeo.org/geos/geos-3.11.0.tar.bz2 | tar jxf - -C /tmp \
  && cd /tmp/geos-3.11.0 \
  && ./configure \
  && sudo make -j $(nproc) \
  && sudo make install \
  && cd /tmp \
  && sudo rm -rf geos*
```

## 3.Pythonのインストール

Pythonはpyenvを用いてインストールしました。

```shell
$ git clone https://github.com/yyuu/pyenv.git ~/.pyenv
$ echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bash_profile
$ echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bash_profile
$ echo 'eval "$(pyenv init -)"' >> ~/.bash_profile
$ source ~/.bashrc
$ pyenv install 3.9.13
$ pyenv global 3.9.13
```


## 4.Cartopyのインストール

さあここまで来たのでCatopyをインストールをしましょう

```shell
$ pip install cycler, numpy, kiwisolver, python-dateutil, pyparsing
$ pip install cartopy matplotlib
```

さあ、これで実行できると思ったのですが一つ躓きました。
なにかというとcartopyで生成した地図をmatplotlibで画像を保存しようとすると `segmentation fault`が発生しました。

原因としてはcartopyが依存しているshaplyが依存関係でエラーを起こしているので、一度shapelyを削除してバイナリーパッケージを取ってこずにソースコードパッケージのshapelyをインストールし直す必要がありました。

```shell
$ pip uninstall shapely
$ pip install --no-binary :all: shapely
```



無事に以下のコードを実行したら画像が生成されることが確認できました。

```python
import cartopy.crs as ccrs
import matplotlib.pyplot as plt

ax = plt.axes(projection=ccrs.PlateCarree())
ax.coastlines()

plt.show()
plt.savefig('test.png')
plt.close()
```

![test.png](/assets/blog/cartopy-on-ec2/test.png)