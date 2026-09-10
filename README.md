<div align="center">

# suzuhana.moe

![TypeScript](https://devbio.me/api/tools/badges/typescript.svg) ![React](https://devbio.me/api/tools/badges/react.svg) ![Next.js](https://devbio.me/api/tools/badges/nextjs.svg)
![Tailwind CSS](https://devbio.me/api/tools/badges/tailwindcss.svg) ![Cloudflare](https://devbio.me/api/tools/badges/cloudflare.svg)

一个 22/7（ナナニジ）成员的社交媒体归档站。

[访问网站](https://suzuhana.moe)

</div>


## 功能

- **成员资料**：查看成员档案、时间线与各平台入口。
- **Twitter / X 归档**：贴文分页、日历定位、媒体网格与灯箱。
- **Instagram 归档**：图片与视频混合轮播。
- **筛选**：按日期范围与排序浏览归档。

## 快速开始

### 环境要求

- Node.js 20.9+
- npm（推荐使用 `npm ci` 安装依赖）

### 安装与本地运行

```bash
npm ci
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

> `dev`、`build`、`preview`、`deploy` 在执行前会自动运行 `archive:sync` 重新生成归档注册表，无需手动触发。

## 项目结构

```text
data/<slug>/
  profile.json                # 成员资料
  timeline.json               # 时间线，可选
  twitter/                    # user、meta、tweets、media_map JSON
  instagram/                  # user、meta、posts JSON
src/
  app/
    page.tsx                  # 首页
    [slug]/                   # 成员及平台页面（含 @right 侧栏）
    api/archive/[slug]/       # Twitter 贴文和媒体分页接口
  components/                 # 页面组件与媒体控件
  lib/
    members.ts                # 成员配置
    api.ts                    # 服务端数据层与类型
    archive-filters.ts        # 日期筛选与排序
  generated/archive-registry.ts  # 归档注册表（自动生成，勿手动编辑）
scripts/                      # 数据与注册表生成脚本
public/                       # 静态资源（字体、响应头等）
.rawdata/                     # 本地原始归档，不提交 Git
open-next.config.ts           # OpenNext 配置
wrangler.toml                 # Cloudflare Worker 配置
```

**数据流**：`data/<slug>/*.json` →（`npm run archive:sync` 生成注册表）→ `src/lib/api.ts`（标准化 / 筛选 / 分页）→ 页面组件。

归档页通过 URL 查询参数保存筛选条件：

```text
/moe/tweets?from=2020-01-01&to=2020-12-31&order=asc
```

- 日期范围包含起止当天；`asc` 为升序，默认降序。
- 贴文页另支持 `date=YYYY-MM-DD` 进行日历定位。

## 可用脚本

| 命令                         | 说明                                     |
| ---------------------------- | ---------------------------------------- |
| `npm run dev`                | 本地开发服务器（自动 `archive:sync`）    |
| `npm run build`              | 构建 Next.js 应用（自动 `archive:sync`） |
| `npm run start`              | 启动生产构建                             |
| `npm run lint`               | 运行 ESLint 检查                         |
| `npm run archive:sync`       | 重新生成归档注册表                       |
| `npm run generate:instagram` | 导入 Instagram 归档数据                  |
| `npm run preview`            | OpenNext 本地预览 Worker                 |
| `npm run deploy`             | 部署到 Cloudflare Workers                |
| `npm run upload`             | 上传 OpenNext 构建产物                   |
| `npm run cf-typegen`         | 生成 Cloudflare 环境类型                 |

## 数据维护

归档数据保存在 `data/<slug>/`，成员 `slug` 需与数据目录名一致。`accounts.twitter`、`accounts.instagram` 可省略；`accounts.blog` 当前为必填字符串。姓名及空格直接填写在成员配置与 `profile.json.name` 中。首页使用成员配置头像，平台页面优先使用对应 `user.json` 的头像。

### 添加成员

1. 在 [`src/lib/members.ts`](./src/lib/members.ts) 的 `MEMBERS` 中添加成员，`slug` 与数据目录名一致。
2. 创建 `data/<slug>/profile.json`，参考结构如下：
```json
{
  "name": "白沢かなえ",
  "status": "已卒業",
  "color": "#C2C3D9",
  "character": "丸山茜",
  "birthday": "７月18日",
  "birthplace": "佐賀県",
  "blood_type": "O型",
  "height": "162cm",
  "message": "土踏まずがないことが密かな悩みです。よろしくお願いします！",
  "assets": {
    "formula": "https://nananiji.zzzhxxx.top/assets/photo/kanae/11th.jpeg",
    "signature": "https://nananiji.zzzhxxx.top/assets/kanae-sig.svg",
    "type": "vertical"
  }
}
```
3. 按需添加时间线及平台数据，运行 `npm run archive:sync`。
4. 检查成员入口和平台页面，提交配置、数据与生成的注册表。

### 导入 Instagram

[`scripts/generate-instagram-data.mjs`](./scripts/generate-instagram-data.mjs) 读取 Instaloader 风格的平铺文件。例如，第二项为视频时：

```text
.rawdata/__shiro227/
  2020-10-20_13-24-09_UTC.txt
  2020-10-20_13-24-09_UTC_1.jpg
  2020-10-20_13-24-09_UTC_2.jpg
  2020-10-20_13-24-09_UTC_2.mp4
```

```bash
npm run generate:instagram -- \
  --input .rawdata/__shiro227 \
  --output data/kanae/instagram \
  --screen-name __shiro227 \
  --name "白沢かなえ" \
  --base-url https://res.227wiki.eu.org/archive/instagram/__shiro227

npm run archive:sync
```

脚本会覆盖输出目录中的 `posts.json`、`meta.json` 和 `user.json`，不上传或转码媒体。视频需要同序号图片作为封面，媒体编号需连续。其他参数见 `npm run generate:instagram -- --help`。

### 维护 Twitter / X

请使用第三方工具获取推特数据，推荐使用[twitter-web-exporter](https://github.com/prinsss/twitter-web-exporter)：

| 文件             | 内容                                |
| ---------------- | ----------------------------------- |
| `user.json`      | 平台资料                            |
| `meta.json`      | 归档元数据                          |
| `tweets.json`    | 贴文、日期、正文和互动数据          |
| `media_map.json` | 媒体 ID 与图片、视频 URL 的对应关系 |

数据类型与兼容格式见 [`src/lib/api.ts`](./src/lib/api.ts)。修改后运行 `npm run archive:sync`，**不要手动编辑生成的注册表**。

媒体 JSON 保存完整 URL。当前归档路径为 `https://res.227wiki.eu.org/archive/x/<handle>/...` 与 `https://res.227wiki.eu.org/archive/instagram/<handle>/...`，文件名与路径大小写须与存储一致。

## 部署到 Cloudflare Workers

首次本机部署需要先执行 `npx wrangler login`，并确认 [`wrangler.toml`](./wrangler.toml) 中的 Worker 名称。

```bash
npm run archive:sync
npx opennextjs-cloudflare build
npm run preview
```

预览确认后退出预览进程，再执行：

```bash
npm run deploy
```

说明：

- `npm run build` 只构建 Next.js；部署所需的 `.open-next/` 由 OpenNext 构建生成。
- `preview` 和 `deploy` 不会重新构建，代码或数据修改后须重新执行上述构建步骤。
- 当前 Worker 仅配置 `ASSETS` 静态资源绑定并启用 `nodejs_compat`，没有 R2、D1 或 KV 绑定。R2 媒体通过公开地址访问。
- 如需只上传版本，在 OpenNext 构建后执行 `npx opennextjs-cloudflare upload`；现有 `npm run upload` 不包含 OpenNext 构建，不能用于从零生成 Worker 产物。
