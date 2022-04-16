# Webpack 编译流程

- 配置初始化
- 内容编译
- 输出编译后内容

# Tapbale

## tapable 工作流程

- 实例化 hook 注册事件监听
- 通过 hook 触发事件监听
- 执行懒编译生成的可执行代码

Hook 本质是 tapbale 实例对象

Hook 执行机制可分为同步和异步

## Hook 执行特点
- Hook: 普通钩子，监听器之间互相独立不干扰
- BailHook: 熔断钩子，某个监听返回非 undefined 时后续不执行
- WaterfallHook: 瀑布钩子，上一个监听的返回值可传递至下一个
- LoopHook: 循环钩子，如果当前未返回 false 则一直执行

## tapable 库同步钩子
- SyncHook
- SyncBailHook
- SyncWaterfallHook
- SyncLoopHook

## tapable 库异步串行钩子
- AsyncSeriesHook
- AsyncSeriesBailHook
- AsyncSeriesWaterfallHook

## tapable 库异步并行钩子
- AsyncParalleHook
- AsyncParalleBailHook