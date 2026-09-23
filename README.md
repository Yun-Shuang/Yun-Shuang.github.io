# MSB — Mapping Schizophrenia Brain

Team website of the MSB group (PI: Prof. Dr. Yun-Shuang Fan), School of Life Science and Technology, UESTC.
Built as a pure static site (HTML/CSS/JS, no build step) and hosted on GitHub Pages.

**Live:** https://yun-shuang.github.io

## 站点结构

```
├── index.html              首页（标题区 / 研究方向 / 近期研究文章 / 团队成员照 / 负责人 / 科研项目）
├── research/               研究方向（读取 _data/research.json）
├── staff/                  团队成员（读取 _data/members.json，含活动相册轮播）
├── publications/           学术成果（读取 _data/publications.json，按年分组 + 站内分页）
├── contact/                联系方式（邮箱 + 微信公众号二维码）
├── member-json/            成员信息生成器（在线填表 → 一键下载 json，免手写）
├── _data/
│   ├── members/            成员数据：每人一个 <id>.json（成员自助维护，PR 审批）
│   │   └── _template.json  新成员模板
│   ├── members.json        聚合产物（Actions 自动生成，请勿手改）
│   ├── research.json       研究方向数据（标题/描述/关键词要点/代表论文/成员）
│   ├── highlights.json     首页"近期研究文章"（论文 + 封面图路径 + 链接）
│   ├── publications.json   论文数据（Actions 每周自动同步 OpenAlex）
│   └── gallery.json        活动相册清单（Actions 根据 assets/img/gallery/ 自动同步）
├── assets/                 css / js / i18n 语言包 / 图片
├── scripts/
│   ├── sync_publications.py  论文同步脚本（默认 OpenAlex；--source scholar 走本地 Google Scholar）
│   ├── build_members.py    成员数据聚合脚本
│   ├── build_gallery.py    相册清单聚合脚本
│   └── validate_members.py 成员数据校验脚本（PR 自动检查）
└── .github/workflows/      deploy / sync-publications / build-members / build-gallery / validate-members
```

## 内容维护速查

> 详细版维护手册（含相册管理、权限、同步机制、常见问题）：
> **[docs/网站维护指南.md](docs/网站维护指南.md)**；成员改个人信息看 [docs/成员自助维护指南.md](docs/成员自助维护指南.md)。

| 想改什么 | 编辑哪个文件 | 说明 |
|---|---|---|
| 研究方向 | `_data/research.json` | 首页只显示方向名（点击跳到研究页对应位置）；研究页显示描述、关键词要点、代表论文、成员。`papers`/`points` 留空则自动隐藏
| 近期研究文章 | `_data/highlights.json` | 论文标题/期刊/引用数/链接；封面图放到 `assets/img/covers/paper-1.jpg` ~ `paper-5.jpg`（缺图会自动显示文字卡片） |
| 负责人教育/工作经历、科研项目 | `assets/i18n/zh.json` + `en.json` | `home.pi.*`、`home.funding.*` 开头的键，中英各改一份 |
| 首页标题与简介 | 同上两个语言包 | `home.title`、`home.lead` |
| 团队成员照（首页） | `assets/img/team-photo.jpg` | 同名覆盖即可 |
| 导航 Logo | `assets/img/full-name.png` | 同名覆盖（透明 PNG） |
| 首页图标 | `assets/img/icon-only.png` | 同名覆盖 |
| 活动相册 | `assets/img/gallery/` 文件夹 | 增/删照片只动文件夹，`_data/gallery.json` 由 Actions 自动同步；说明文字在 gallery.json 里改 |
| 成员信息 | `_data/members/<id>.json` | 见下方"成员信息自助维护" |
| 其它页面文案 | `assets/i18n/zh.json` + `en.json` | 键名前缀对应页面：`staff.*`（团队成员页）、`publications.*`（成果页）、`contact.*`（联系页）、`gallery.title`（相册标题）、`nav.*`（导航） |
| 联系邮箱 | `contact/index.html` + `assets/js/site.js` 页脚 | 两处同步改 |

## 自动化机制

| 工作流 | 触发 | 作用 |
|---|---|---|
| `deploy.yml` | push 到 main | 部署到 GitHub Pages |
| `sync-publications.yml` | 每周一 02:00 UTC / 手动 | 从 OpenAlex 抓取论文 → 更新 `_data/publications.json`；失败时保留旧数据并告警 |
| `validate-members.yml` | 成员数据 PR | 自动校验 JSON 格式与必填字段 |
| `build-members.yml` | 成员数据合并进 main | 重新聚合 `members.json` 并自动提交 |
| `build-gallery.yml` | 相册文件夹有变动 | 重新生成 `gallery.json` 并自动提交 |

> 为什么用 OpenAlex 而不是直接抓 Google Scholar？Google 会拦截 GitHub
> Actions 的机房 IP（验证码），无法在云端稳定自动抓取。OpenAlex 是开放
> 学术数据库（数据含引用数、h 指数、DOI 链接），云端可稳定访问。
> 如需精确的 Scholar 数字，可在本地运行：
> `pip install scholarly && python scripts/sync_publications.py --source scholar`

## 成员信息自助维护

推荐使用[成员信息生成器](https://yun-shuang.github.io/member-json/)在线填表生成 json，
在 GitHub 网页提交 Pull Request，管理员（CODEOWNERS）审批合并后自动上线。
**成员 id 规则**：英文姓名转小写、空格换成连字符（名-姓顺序），如 `San Zhang` → `san-zhang`；
详细图文流程见 [docs/成员自助维护指南.md](docs/成员自助维护指南.md)。

## 本地预览

```bash
python -m http.server 8000
# 打开 http://localhost:8000
```

## 待办

- [ ] `.github/CODEOWNERS` 追加其他管理员的 GitHub 用户名
- [ ] 首页"近期研究文章"封面图：放到 `assets/img/covers/paper-1.jpg` ~ `paper-5.jpg`
- [ ] 部分成员（吴秀梅、闫畅、叶茂威、程磊）为占位信息，待本人补充入学年份/研究方向/照片
