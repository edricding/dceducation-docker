## 总体目标
对本科（bachelor）学生的学术、语言、课程、背景进行评分，并与项目要求与标签进行匹配，输出综合适配分数及解释信息。

## 0) 工具函数
- `isValidValue` / `safeNumber`：把空值、0、NaN 当作“未提供”。
- `normalizeLinear`：线性归一化到 0~100。
- `weightedMean`：忽略空值后按权重加权平均。
- `compareOp`：支持 `min / min_inclusive / max / max_inclusive / eq` 的阈值比较。
- `alevelValueToScore`：把 A-level 的 `AAA / A*A*A` 等格式转成数值分数。
- `applyStudentTagThresholds`：基于 `student_tags`（学生阈值设置）生成标签。

## 1) GPA 评分
`normalizeHighschoolGPA`：
- <= 4.3：按 2.5~4.0 线性映射。
- > 4.3：按 60~100 线性映射。

## 2) 语言评分
- IELTS / TOEFL / PTE / Duolingo 各自归一化。
- IELTS 单科低分有惩罚。
- `computeLanguageScore` 取多项里的最高值。

## 3) 课程体系评分
- A-level：取最高 3 门平均。
- IB / AP：线性归一化。
- `computeCurriculumScore` 取最高值。

## 4) 背景评分
- 活动/科研/奖项的文字长度 + 关键词命中综合得分。

## 5) 构建学生向量
`buildStudentVector` 生成 `parts`（academics / language / curriculum / profile）和 `total`：
- 如果传入 `options.studentTagsThresholds`：按阈值判定 `high_gpa / high_language / strong_curriculum / strong_profile`。
- 否则使用旧的固定分数阈值。
- `stem_interest`：
  - 若 `options.stemSelected === true`，直接加入；
  - 否则用目标专业关键词兜底判断。

## 6) 项目要求惩罚与加分
- `requirementPenalty`：当学生提供了对应信息但低于项目要求时扣分。
- `requirementBonus`：达到推荐分数时加分。
- `tagBonus`：学生标签与项目标签匹配时加分（如 `stem` + `stem_interest`）。

## 7) 主流程 `matchBachelorPrograms`
- 根据学生目标专业判断是否选择到带 `stem` 标签的项目。
- 按国家过滤项目（目标国家为空则用默认国家）。
- 对每个项目计算：基础分 + 标签加分 + tier 修正 + 专业匹配加分 - 惩罚。
- 按分数降序输出，并附带解释信息。

## 8) 雷达图辅助
`buildRadarChartJsData`：将学生四项分数转换成雷达图数据结构，并标记缺失项。
