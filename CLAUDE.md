# CLAUDE.md — 个人博客 renew（Hexo → Astro）

> 本文件给 Claude Code 阅读，用于指导博客的重建与迁移。
> 工作语言：与我对话用**中文**；代码、标识符、文件名用英文。
> 重要约定：**每个阶段先给方案、等我确认，再动手**；提交粒度要小、每次只做一件事。

---

## 0. 开始前必须先确认的事（不要直接动手）

请先读取我现有的 Hexo 仓库并回答，再开始迁移：

1. 仓库类型：仓库名是 `<用户名>.github.io`（用户主页，部署在根路径），还是普通项目仓库（部署在 `/<repo>` 子路径）？
   - 这决定 `astro.config.mjs` 是否需要设 `base`：**主页仓库不要设 `base`；项目仓库需要设 `base: '/<repo>'`**。
2. 现有文章数量、front-matter 字段结构、图片存放位置（`source/` 下还是文章同目录 asset folder）。
3. 现用的 Hexo 主题、是否有需要保留的自定义页面（友链、归档、标签等）。
4. 是否绑定了自定义域名（有 `CNAME` 文件则迁移时保留）。

产出一份《迁移盘点 + 计划》给我过目后再进入阶段 1。

---

## 1. 项目目标

把现有 Hexo 博客重建为一个**全新设计**的 Astro 站点，继续部署在 **GitHub Pages（github.io）**。

- 定位：个人博客，**图文同时展示**。
- 两条内容流：**随笔（essay）** 与 **摄影日记（photo）**。
- 首页是**个人主页式**：文字为主的简介 + 侧栏导航，正文区是随笔与摄影日记混合的「最近」列表。
- 语言：**中文为主，偶尔日文**（不需要做完整 i18n 路由，用文章 `lang` 字段标记即可）。

---

## 2. 技术栈与约定

- 框架：**Astro 6（stable）**。Node `^22.12` 或 `^24`。包管理器用 npm（或 pnpm，二选一并提交对应 lockfile）。
- 内容：**Content Collections（Content Layer API）**，文章写 Markdown / MDX，front-matter 用 Zod schema 做类型校验。
- 图片：一律用 `astro:assets` 的 `<Image />` / `<Picture />` 组件做自动优化（多尺寸 + 现代格式 + 懒加载）。首屏封面图加 `priority`。
- 语言：TypeScript。零运行时 JS 优先（Astro 默认零 JS，交互按需用 island）。
- 不引入重型 UI 框架；样式用原生 CSS + CSS 变量（见第 5 节设计 token）。

---

## 3. 信息架构（页面与路由）

| 路由 | 内容 |
|---|---|
| `/` | 个人主页：侧栏（站名 + 简介 + 导航 + 近况）+ 正文区（简介段落 + 混合「最近」列表） |
| `/essays/` | 随笔列表 |
| `/photos/` | 摄影日记列表 |
| `/posts/[slug]/` | 文章详情页（随笔与摄影日记共用，按 type 切换排版） |
| `/about/` | 关于 |
| `/archive/`（可选） | 按时间归档 |

- 侧栏在桌面端常驻，移动端折叠为顶部菜单。
- 详情页：随笔以正文阅读为主（行宽收窄到舒适区，约 30–36em）；摄影日记以图为主，支持图集（gallery）+ 图注，正文为辅。

---

## 4. 内容模型（Content Collections）

推荐**单一 `posts` 集合**，用 `type` 区分两条流，这样首页「最近」混合列表最简单。

`src/content.config.ts`（示意，最终以 Astro 6 写法为准）：

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      type: z.enum(['essay', 'photo']),        // 随笔 / 摄影日记
      title: z.string(),
      date: z.coerce.date(),
      summary: z.string().optional(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),               // 列表缩略 / 首屏图
      gallery: z
        .array(
          z.object({
            src: image(),
            alt: z.string(),
            caption: z.string().optional(),
          }),
        )
        .optional(),                           // 摄影日记用
      lang: z.enum(['zh', 'ja']).default('zh'),
      draft: z.boolean().default(false),
    }),
});

export const collections = { posts };
```

- 图片建议存在 `src/content/posts/<slug>/` 下随文放置，以便 `image()` 校验 + `<Image />` 优化（避免放 `public/`，那样不会被优化）。
- `draft: true` 的文章不出现在生产构建。

---

## 5. 设计系统（胶片 / 模拟感的编辑式博客）

整体气质：温暖、低饱和、安静的杂志感，点缀一抹**复古游戏机式的暖橙**作为高亮色（红白机 / Nuphy 旋钮的印象）。标题衬线、留白充足、照片是主角。**v1 做浅色（light）即可，深色模式留作后续可选项。**

**高亮色（accent）的用法**：`--accent` 是全站唯一的「特别色」，只用在——选中文字的 `::selection` 高亮、链接与 hover、当前导航项、以及**自定义鼠标指针**（橙色复古指针）。其余分类标签保持低调中性色，让橙色始终醒目。

```css
:root {
  /* 色彩 */
  --bg:        #F6F3ED; /* 象牙底 */
  --bg-soft:   #EDE6DA; /* 标签 / 卡片底 */
  --ink:       #211C17; /* 正文墨色 */
  --ink-soft:  #5A534A; /* 次级文字 */
  --muted:     #8C8278; /* 弱化 / 元信息 */
  --line:      #E5DFD3; /* 发丝分隔线 */
  --accent:    #E35414; /* 复古暖橙：链接 / hover / active / 鼠标指针 */
  --accent-ink:#C2440F; /* 橙字落浅底时用的深一档（保证对比度可读） */
  --accent-soft:#F6DBCB; /* 柔和橙：圆角高亮胶囊底（克制、统一于标签风格） */
  --accent-tint:rgba(227,84,20,0.16); /* ::selection 的柔和橙底 */
  --tag-essay: #7A5A38; /* essay 标签字（底 --bg-soft） */
  --accent-2:  #3E6356; /* 深苔绿：photo 标签字（底 #E3EAE6） */

  /* 字体 */
  --font-serif: 'Noto Serif SC', 'Songti SC', serif;   /* 标题 + 正文 */
  --font-sans:  'Inter', 'Noto Sans SC', system-ui, sans-serif; /* 日期 / 标签 / UI */
  --font-mono:  ui-monospace, 'SFMono-Regular', monospace;

  /* 形状 / 节奏 */
  --radius:    8px;
  --radius-sm: 4px;     /* 图片缩略 */
  --maxw-read: 34em;    /* 正文阅读行宽 */
}
```

排版规则：
- 标题、正文用 `--font-serif`；日期、分类标签、导航小字用 `--font-sans` 形成对比。
- 字号：详情页正文约 17–18px、`line-height` 约 1.85；列表标题 16px。
- 标签：ESSAY = 底 `--bg-soft` / 字 `--tag-essay`；PHOTO = 底 `#E3EAE6` / 字 `--accent-2`。圆角胶囊，**大写英文** + 适度字距（约 `0.08em`）。
- **导航与分区标签用大写英文**（`ESSAYS` / `PHOTOS` / `ABOUT`，列表小标题 `RECENT`），字距约 `0.1em`；站名、文章标题、正文用中文。导航字体用 `--font-sans`，当前项用 `--accent` / `--accent-ink`。
- 高亮（**柔和、圆角，统一于标签风格**）：`::selection { background: var(--accent-tint); color: var(--accent-ink); }`（柔和橙底、深橙字，不用纯橙底白字）；正文内的强调/高亮文字（`<mark>` / `.hl`）用**圆角胶囊**——`--accent-soft` 底 + `--accent-ink` 字 + `--radius-sm` 圆角（克制使用）。
- 鼠标指针：自定义为**复古旋钮（rotary knob）**（橙色，约 18–20px），要的是「旋钮」而非「遥感」。扁平分层做立体感——白色描边（在深浅照片上都可见）、深一档橙向右下偏移当阴影面、亮橙作顶面；并画一条**指向约 11 点方向的白色指示刻度线** + 中心轴点，作为旋钮的标志特征；不要用渐变/模糊。`cursor: url(knob.svg) 10 10, auto`，只在内容区/可点击元素启用。触屏设备无指针，自动忽略即可。
- **全站响应式（移动端一等公民）**：桌面端侧栏常驻；移动端侧栏收起为顶部 `☰` 菜单，简介、`RECENT` 与列表单列堆叠，缩略图与字号相应缩小。开发时桌面与移动两套断点都要验证。
- 细节：纸张颗粒（grain overlay，`opacity` 约 `0.05`、点距约 `2.5px` 的细点纹，提供轻微质感）、柔和阴影、慢一点的淡入；导航极简。
- CJK 字体务必确认中文与（偶尔的）日文都渲染正常。

---

## 6. 图片规范（摄影博客的关键）

- 所有内容图用 `<Image />`（或图集用 `<Picture />`），由 Astro 生成响应式 `srcset` 与现代格式。
- 首屏 / 封面大图加 `priority`，使其 eager 加载、高 `fetchpriority`。
- 原图放 `src/content/posts/<slug>/`，不要放 `public/`（`public/` 不会被优化）。
- 摄影日记的图集：保留拍摄信息可写进 `caption`（如机型/胶片/地点）。我的器材：Fujifilm X-M5、DJI Pocket 3、iPhone 17 Pro。

---

## 7. 部署（GitHub Pages）

用官方 `withastro/action`：

1. `astro.config.mjs` 设 `site`（=`https://<用户名>.github.io`）；**仅当是项目仓库**才加 `base: '/<repo>'`。
2. 新建 `.github/workflows/deploy.yml`，用官方 Action 在 push 到 `main` 时自动构建并部署。
3. GitHub 仓库 Settings → Pages → Source 选 **GitHub Actions**。
4. 有自定义域名则保留 `public/CNAME`。
5. 提交 lockfile，让 Action 自动识别包管理器。

---

## 8. 迁移分期（每期先方案后实施）

1. **盘点**：读现有 Hexo 仓库，产出迁移清单（见第 0 节）。
2. **脚手架 + 内容迁移**：建 Astro 骨架；把 Markdown 与图片迁入 `src/content/posts/`，转换 front-matter 到新 schema（旧 → 新字段映射先给我确认）。
3. **设计系统**：落第 5 节 token，建基础布局组件（侧栏、列表行、标签、图片组件）。
4. **页面**：首页（个人主页式）→ 详情页（随笔 / 摄影日记两种排版）→ 列表/归档/关于。
5. **图片管线 + 部署**：接 `<Image />` 优化、配置 Pages 部署、上线校验（链接、CJK 字体、Core Web Vitals）。

---

## 9. 工作约定

- 先方案、后实施；每阶段结束给我一段「做了什么 / 下一步」。
- 提交信息用英文、粒度小。
- 不擅自改 schema 或设计 token，要改先说明理由。
- 涉及外部信息（Astro API 写法等）以**官方文档**为准。
