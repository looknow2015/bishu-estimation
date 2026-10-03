# 比数 · BISHU

面向中文用户的趣味估算游戏。当前题库共 20 题，使用蓝白半透明轻玻璃图标。

## 在线访问与发布

游戏地址：https://looknow2015.github.io/bishu-estimation/

GitHub Pages 使用 GitHub Actions 发布 `dist/` 中的静态网页。推送到 `main` 的 `dist/` 更新会自动发布，也可在 Actions 中手动运行发布工作流。

## 运行

无需安装依赖即可打开 `dist/index.html`。也可在项目目录启动静态服务器：

```sh
python3 -m http.server 8000 --directory dist
```

然后访问 http://localhost:8000 。答题进度保存在当前浏览器的本地存储中。

## 内容

- `dist/`：可直接运行的网页与优化后的图标。
- `question-bank.json`：题目、答案、条件与公开来源。
- `artwork/glass-icons/`：当前整套透明 PNG 图标与生成提示词。
- `artwork/`：历史样稿和素材记录。
- `scripts/`：配图整理和总览生成脚本。
- `.openai/hosting.json`：原 Sites 项目的托管配置。

修改题库时，同步更新 `dist/questions.js` 中的 `QUESTIONS` 数据。图标仅为题意示意，不显示答案数量或真实比例。

## 图标整理

网页已包含可用图标，正常运行不需要执行整理脚本。脚本使用 Node.js 与 `sharp`；目前脚本的 `sharp` 路径指向制作环境，换电脑后需调整为本机安装路径。

## 授权

目前未设置开源许可证。
