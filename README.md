恢复npm官方镜像
npm config delete registry
.npmrc加上以下内容
```
registry=https://registry.npmmirror.com
electron_mirror=https://cdn.npmmirror.com/binaries/electron/
electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-binaries/
```

```bash
以下皆不需要开启代理
$ npm i cnpm -g
$ cnpm i 
或者
$npm i  cnpm更快一点

```

### Development

```bash
$ npm run dev
```

### Build

```bash
doawnloading那一步会卡住。等。不需要开代理。因为配置了electron镜像源，所以很快的
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```


坑
+ 之前在dependencies安装sass,结果npm i 报错。