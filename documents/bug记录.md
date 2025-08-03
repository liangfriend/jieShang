+ 调号的变音符号高度是有问题的，现在只有treble的flat做了正确的调整
+ whiteboard从其他处按住鼠标拖到内部，拖动会出现问题
+ whiteBoard更新漫游状态会导致whiteBoard位置重置
+ 声部离得近的时候音符left要换
+ 连音线的位置更新
+ 连音线的端点计算
+ map没有被正确销毁

## 优化

+ 连音线只需获取container中间位置即可，计算时却需要slotWidth,这个应该优化掉
+ 休止符的音符替换