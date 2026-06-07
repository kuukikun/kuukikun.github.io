# Handoff：空気の喫茶店 · 首页改版（极简门户式）

## Overview（这是什么）
把个人博客 **空気の喫茶店**（`kuukikun.github.io`，Astro 项目）的**首页**从「右栏铺一整篇长自述」改成 **极简门户式首页**：左栏身份＋导航，右栏只放一句轮换的文章摘录 + 最近三篇 + MORE。长自述移到独立的 INTRO 子页，ABOUT 子页换成一段短文案。

## About the Design Files（关于本包里的文件）
本包里的 HTML 是**设计参照（design reference）**，用来说明最终的样子和行为，**不是直接上线的代码**。任务是把这些设计**在现有 Astro 代码库里复刻出来**，沿用项目已有的布局组件、全局样式与 Markdown/Content collection 数据源——而不是把这份 HTML 原样塞进去。

- `reference/home_minimal.html` —— **最终首页**的高保真参照（含 tokens、响应式、轮换组件、移动端折叠菜单）。**以它为准。**
- `reference/options_overview.html` —— 当初的方案对比稿（极简 / 铺满 / 杂志 + ABOUT 文案预览），仅供理解决策背景，**不用实现里面的「铺满」「杂志」两版**。

## Fidelity
**High-fidelity。** 颜色、字号、间距、交互都已确定，请按 `home_minimal.html` 像素级复刻；字体若与现站不同见下方「字体」说明。

---

## 现有结构（改前）
- 首页右栏 = 一篇五段长自述（Hello／「空気」由来／「喫茶店」由来）。
- 左栏 = 标题、导语「存放一些零碎的想法。」、导航 `ESSAYS / PHOTOS / ABOUT`、「近况」。
- 右栏自述下方接 `Recent` 列表。

## 改动清单（改后）
1. **导航**：顶部新增 `INTRO`，变为 `INTRO / ESSAYS / PHOTOS / ABOUT`。
   - 去掉任何字头/图标，纯文字 + 字间距。
   - 当前所在/悬停项 = 文字变赭石红 `--accent` + 左侧出现一个 **7px 橙色圆点**（淡入 0.25s）。点位用 `::before` 预留，hover 不抖动。
   - **⚠️ 导航是全站持久布局**：`INTRO / ESSAYS / PHOTOS / ABOUT` 这几个标签必须在**每一个页面**都常驻显示（沿用现站做法）。包括点 **MORE →** 进到 essays 列表页之后，左栏这些标签**依然在、不能消失**。实现上放进全站 Layout（如 `src/layouts/Base.astro` 的侧栏），各页面只换右侧主区内容。
2. **INTRO 子页**（新）：把原首页那篇**长自述**原样搬到 `/intro/`。内容不变。
3. **首页右栏**：删掉长自述，改为极简：
   - **一句轮换的文章摘录**（大字，赭石红引号），4.2s 交叉淡入轮换；`prefers-reduced-motion` 时不轮换、显示第一句。
   - **最近三篇**（日期 + 标题，三条），下接 **MORE →** 指向 `/essays/`。
4. **ABOUT 子页**：**保持现网站实际内容不变**，只删掉开头那一段（`「空気」とは…遇见你很高兴～` 这一整块），其余（`## 近况` / `## 途中` / `## 联系`）原样保留。详见《ABOUT 子页 · 改动》。
5. **左栏「近况」保留**不动；导语「存放一些零碎的想法。」保留。
6. **移动端（<760px）**：两栏塌成单栏；导航收进 `MENU` 折叠按钮（汉堡），点击展开。

---

## Screens / Views

### 1) 首页 `/`（index）
- **Layout**：居中容器 `max-width:1080px`，`padding:96px 40px 120px`。内部 CSS Grid 两列：`grid-template-columns: 282px 1fr; gap:74px; align-items:start`。
- **左栏（sidebar）**，自上而下：
  - **品牌标题** `空気の喫茶店`：30px / 600 / `--accent` / `letter-spacing:.02em`，链到 `/`。
  - **导语** `存放一些零碎的想法。`：15px / `--ink2` / line-height 1.8 / 下边距 40px。
  - **导航** `nav.menu`：纵向 flex，`gap:21px`；每项 14px / 600 / `letter-spacing:.22em` / 字体用 Noto Serif JP；颜色 `--ink2`；hover 或 `aria-current` → `--accent` 且左侧橙点淡入。
  - **分隔线** 1px `--line`，`margin:6px 0 30px`。
  - **「近况」标题** 14px / `--muted` / `letter-spacing:.04em`。
  - **「近况」正文** 14.5px / `--ink2` / line-height 2，含 `in-house lawyer`（英文用 Noto Serif JP 体）。
  - **装饰圆点** 9px / `--accent`，`margin-top:32px`。
- **右栏（main，极简）**：flex 纵向、垂直居中，`min-height:430px`。
  - **轮换句** `.quote`：30px / 500 / `--ink` / line-height 1.85 / `max-width:18ch`；引号 `「」` 用 `--accent`；切换时 opacity 过渡 0.9s。
  - **「最近」块** `margin-top:64px`：
    - 小标题 `最近`：12px / `letter-spacing:.3em` / `--muted` / Noto Serif JP。
    - 三条 `a.r3`：flex，`gap:18px`，`padding:11px 0`，顶部 1px `--line`；日期 `.d` 12px / `--faint` / `min-width:78px`；标题 `.n` 15px / `--ink2`，**hover 整行 → 标题变 `--accent`**。
    - `MORE →`：13px / `letter-spacing:.18em` / `--muted`，hover → `--accent`，指向 `/essays/`。

### 2) INTRO 子页 `/intro/`
- 原首页那篇长自述，原文照搬。建议沿用站内文章/正文版式（与 essays 正文一致的字号行距）。

### 3) ABOUT 子页 `/about/`（只做一处删除，其余不动）
保持现网站 ABOUT 页的实际内容与版式，**仅删除标题下方那一段自我介绍块**。下面是现页内容，~~删除线~~ 标出要删的部分：

```
# 这里是空気                                  ← 保留

~~「空気」とは、吸いて吐いた物である。做最酷的 Lawyer。~~            ← 删
~~现居神户，慶應義塾大学法学研究科・民事法学専攻修士毕业，研究方向民法。~~  ← 删
~~愿你在此驻足片刻，沏一壶茶，享受一分宁静。遇见你很高兴～~~          ← 删

## 近况                                       ← 保留（全文不动）
结束了为期 4 个月的就职活动，今春入职一家跨国企业的法务，今后希望能作为 in-house lawyer 在企业法务领域有所精进。
本科时参与了导师的一项法学书籍翻译工作，或许你会读到我翻译的章节——以这样的方式相遇，也是一种幸运吧。喜欢的组合是 ヨルシカ、YOASOBI、ずっと真夜中でいいのに、あたらよ。

## 途中                                       ← 保留（全文不动）
- 2018.09 – 2022.06 杭州
- 2022.09 – 2023.03 札幌
- 2023.04 – 2025.03 東京
- 2025.04 – 神戸
*City of stars, are you shining just for me?* — La La Land

## 联系                                       ← 保留（全文不动）
- Instagram @riku_99l   - X (Twitter) @kuukimori   - 知乎专栏 空气喫茶店
- Gmail billah109lu@gmail.com   - 微信公众号 空气森林
本站由 Astro 构建，部署于 GitHub Pages。欢迎和我闲聊～
```
注：标题 `# 这里是空気` **保留**（不在删除范围内）。删除后它直接接 `## 近况`。

---

## Interactions & Behavior
- **导航橙点**：`::before` 圆点常驻但 `opacity:0; transform:scale(.45)`；hover/当前页 → `opacity:1; scale(1)`，过渡 0.25s。给「点亮」预留宽度，避免 hover 抖动。
- **轮换句**：`setInterval` 4200ms；每次先 `opacity:0`（900ms）→ 换 `innerHTML` → `opacity:1`。`prefers-reduced-motion: reduce` 时**不启动**，停在第一句。数组少于 2 句也不轮换。
- **最近三篇 / MORE**：普通链接跳转。
- **移动端菜单**：`<760px` 时 `nav.menu` 默认 `display:none`，`MENU` 按钮 toggle `.open` 显示；同步 `aria-expanded`。

## State Management
基本无状态。仅两个本地 UI 状态：轮换句的当前索引（`setInterval` 内部变量）、移动端菜单开合（class 切换）。Astro 里可用一段 `<script>`（client 侧）实现，或拆成一个小岛屿组件（如用 React/Vue/Svelte 集成）。

---

## Design Tokens
```
--paper:  #f5f1ea   /* 页面背景，暖纸色 */
--ink:    #36322d   /* 主文字 */
--ink2:   #544f48   /* 次级文字 */
--muted:  #a7a094   /* 标签/小标题 */
--faint:  #c4bdb0   /* 日期 */
--accent: #bf5b30   /* 赭石红：品牌/激活/hover/橙点 */
--line:   #e4ded2   /* 分隔细线 */

content max-width: 1080px
sidebar width:     282px   (desktop)
sidebar↔main gap:  74px    (desktop)
mobile breakpoint: 760px
```
**间距**：页面 padding 桌面 `96/40/120`，移动 `36/24/72`。导航 gap 21px，近况行距 2，轮换句 line-height 1.85。
**字号**：品牌 30、导语 15、导航 14、近况标题 14、近况正文 14.5、轮换句 30（移动 24）、最近标题 12、最近条目 15、日期 12、MORE 13。

## 字体（重要）
参照里用了 **Noto Serif SC + Noto Serif JP**（Google Fonts）作为中日宋体。请确认现站实际用的衬线字体：
- 若现站已有指定中日文衬线字体 → **沿用现站字体**，仅照搬字号/行距/字距。
- 若没有 → 可引入 Noto Serif SC / JP，或保持现状字体即可，视觉以「宋体/明朝体衬线」为准。
日文假名（はじまり、空気 等）需要覆盖 → 保证字体栈里有 JP 衬线兜底。

## 文案 / 内容来源
- **轮换句**：现为 4 句，**摘自作者本人文章**（占位起步）。在 `home_minimal.html` 里集中在 `EXCERPTS` 数组，作者会自行增删。实现时请做成**易编辑的数据源**（一个数组 / 一个 data 文件 / frontmatter 字段均可），不要硬编码散落各处。
- **最近三篇**：应从现有文章数据（Astro content collection / Markdown）**按日期取最新 3 条**，而非写死。`MORE →` 去 `/essays/`。
- **「近况」**：当前是手写两行，可保留为站点配置里的一个字段，方便随时改。

## 最终文案

**导语（首页左栏）**
> 存放一些零碎的想法。

**近况（首页左栏）**
> 从东京搬到了神户。
> 大概是一位，脑子里装着许多奇怪想法的 in-house lawyer 吧。

**ABOUT 子页**：不替换、不重写——只删上面《ABOUT 子页 · 改动》中标 ~~删~~ 的那一块，其余照现网站保留。

**轮换句（首页，摘自文章，可增删）**
> 「空気」とは、吸って吐いた物である。
> 比起故事的主角，它更像记录者一般的存在。
> 阅读，是一种更为沉默的交流。
> 那些细腻的事物——脆弱，却又绚烂。

---

## Assets
无图片资源。最近列表里的缩略图在「极简」版**不需要**（仅「铺满/杂志」版用过，本次不实现）。所有视觉用纯 CSS + 字体实现。

## Files（本包文件）
- `reference/home_minimal.html` —— 最终首页参照（**实现以此为准**）。
- `reference/options_overview.html` —— 方案对比稿（仅背景参考；只取「极简」版）。
- `README.md` —— 本文件。

## 给实现者的一句话
现站是 **Astro**。请：① 改 `src/pages/index.astro`（或对应首页模板）为极简布局；② 新建 `/intro/` 放长自述；③ `/about/` **只删开头那一段**（其余不动）；④ 导航组件加 `INTRO` 与橙点 hover 态，并确保它在**全站 Layout** 里、每页常驻；⑤ 轮换句与移动端菜单用一小段 client 脚本或小岛屿组件；⑥ 最近三篇从内容集合按日期取最新。视觉严格对照 tokens 与 `home_minimal.html`。
