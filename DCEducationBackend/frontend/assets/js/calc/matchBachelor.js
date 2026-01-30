/***********************
 * 0) Utils
 ***********************/
function isValidValue(v) {
  // 按你当前需求：null/undefined/""/"0"/0 都视为未提供
  if (v === null || v === undefined) return false;
  if (typeof v === "number") return v !== 0 && !Number.isNaN(v);
  if (typeof v === "string") return v.trim() !== "" && v.trim() !== "0";
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

const clamp = (x, min, max) => Math.max(min, Math.min(max, x));

function safeNumber(x) {
  if (x === null || x === undefined) return null;
  const s = String(x).trim();
  if (s === "" || s === "0") return null; // ⭐按你需求：0当未提供
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function normalizeLinear(value, min, max) {
  if (value === null) return null;
  if (max <= min) return null;
  const t = (value - min) / (max - min);
  return clamp(t * 100, 0, 100);
}

/** 忽略 null/undefined/NaN，并自动归一 */
function weightedMean(parts, weights) {
  let wSum = 0;
  let vSum = 0;
  for (const key of Object.keys(weights)) {
    const w = weights[key];
    const v = parts[key];
    if (v === null || v === undefined) continue;
    if (typeof v === "number" && Number.isNaN(v)) continue;
    wSum += w;
    vSum += v * w;
  }
  if (wSum === 0) return null;
  return vSum / wSum;
}

function compareOp(value, op, threshold) {
  if (value === null || value === undefined) return false;
  if (threshold === null || threshold === undefined) return false;
  const v = Number(value);
  const t = Number(threshold);
  if (!Number.isFinite(v) || !Number.isFinite(t)) return false;
  switch (String(op || "").trim()) {
    case "min":
      return v > t;
    case "min_inclusive":
      return v >= t;
    case "max":
      return v < t;
    case "max_inclusive":
      return v <= t;
    case "eq":
      return v == t;
    default:
      return false;
  }
}

function alevelScoreFromGrade(grade) {
  if (!grade) return null;
  const g = String(grade).trim();
  return ALEVEL_MAP[g] ?? null;
}

function alevelValueToScore(value) {
  if (!value) return null;
  // handle patterns like A*A*A, A*AA, AAA
  let grades = [];
  if (String(value).includes("*")) {
    const tmp = String(value).replace(/\s+/g, "");
    const tokens = tmp.split("*");
    for (let i = 0; i < tokens.length; i++) {
      const base = tokens[i];
      if (!base) continue;
      if (base == "A") grades.push("A*");
      else grades.push(base);
    }
  } else {
    grades = String(value).split("");
  }
  const scores = grades.map(alevelScoreFromGrade).filter((v) => v !== null);
  if (!scores.length) return null;
  return scores.reduce((s, v) => s + v, 0) / scores.length;
}

function applyStudentTagThresholds(bachelorData, parts, thresholds, tags) {
  if (!thresholds) return;

  // high_gpa based on raw GPA
  const gpaRaw = safeNumber(bachelorData.highschool_gpa);
  if (compareOp(gpaRaw, thresholds.high_gpa_operator, thresholds.high_gpa_value)) {
    tags.push("high_gpa");
  }

  // high_language: any test meets its threshold
  const ieltsOverall = safeNumber(bachelorData.language_scores?.ielts?.overall);
  const toeflTotal = safeNumber(bachelorData.language_scores?.toefl?.total);
  const pteTotal = safeNumber(bachelorData.language_scores?.pte?.total);
  const duoTotal = safeNumber(bachelorData.language_scores?.duolingo);

  const langHit =
    compareOp(ieltsOverall, thresholds.high_language_ielts_operator, thresholds.high_language_ielts_value) ||
    compareOp(toeflTotal, thresholds.high_language_toefl_operator, thresholds.high_language_toefl_value) ||
    compareOp(pteTotal, thresholds.high_language_pte_operator, thresholds.high_language_pte_value) ||
    compareOp(duoTotal, thresholds.high_language_duolingo_operator, thresholds.high_language_duolingo_value);

  if (langHit) tags.push("high_language");

  // strong_curriculum
  const alevelScore = scoreALevel(bachelorData.international_courses?.alevel || []);
  const alevelThresholdScore = alevelValueToScore(thresholds.strong_curriculum_alevel_value);
  const alevelHit = compareOp(alevelScore, thresholds.strong_curriculum_alevel_operator, alevelThresholdScore);
  const ibHit = compareOp(safeNumber(bachelorData.international_courses?.ib), thresholds.strong_curriculum_ib_operator, thresholds.strong_curriculum_ib_value);
  const apHit = compareOp(safeNumber(bachelorData.international_courses?.ap), thresholds.strong_curriculum_ap_operator, thresholds.strong_curriculum_ap_value);
  if (alevelHit || ibHit || apHit) tags.push("strong_curriculum");

  // strong_profile: count filled sections
  const count = [bachelorData.activities, bachelorData.research, bachelorData.awards].filter((v) => String(v || "").trim() !== "").length;
  const profileHit = compareOp(count, thresholds.strong_profile_options_operator, thresholds.strong_profile_options_value);
  if (profileHit) tags.push("strong_profile");
}

/***********************
 * 1) GPA -> 0~100
 ***********************/
function normalizeHighschoolGPA(gpaRaw) {
  const g = safeNumber(gpaRaw);
  if (!isValidValue(g)) return null;

  // <=4.3: 4.x制；否则视为 100 制
  if (g <= 4.3) return normalizeLinear(g, 2.5, 4.0);
  return normalizeLinear(g, 60, 100);
}

/***********************
 * 2) Language score -> 0~100 (take best)
 ***********************/
function scoreIELTS(ielts) {
  if (!ielts) return null;
  const overall = safeNumber(ielts.overall);
  if (!isValidValue(overall)) return null;

  const overallScore = normalizeLinear(overall, 5.5, 8.0);
  if (overallScore === null) return null;

  const subs = ["listening", "reading", "writing", "speaking"]
    .map((k) => safeNumber(ielts[k]))
    .filter((v) => isValidValue(v));

  let penalty = 0;
  if (subs.length) {
    const minSub = Math.min(...subs);
    if (minSub < 6.0) penalty += 10;
    if (minSub < 5.5) penalty += 20;
  }

  return clamp(overallScore - penalty, 0, 100);
}

function scoreTOEFL(toefl) {
  if (!toefl) return null;
  const total = safeNumber(toefl.total);
  if (!isValidValue(total)) return null;
  return normalizeLinear(total, 70, 110);
}

function scorePTE(pte) {
  if (!pte) return null;
  const total = safeNumber(pte.total);
  if (!isValidValue(total)) return null;
  return normalizeLinear(total, 50, 75);
}

function scoreDuolingo(raw) {
  const d = safeNumber(raw);
  if (!isValidValue(d)) return null;
  return normalizeLinear(d, 90, 135);
}

function computeLanguageScore(language_scores) {
  if (!language_scores) return null;
  const candidates = [
    scoreIELTS(language_scores.ielts),
    scoreTOEFL(language_scores.toefl),
    scorePTE(language_scores.pte),
    scoreDuolingo(language_scores.duolingo),
  ].filter((v) => v !== null);

  return candidates.length ? Math.max(...candidates) : null;
}

/***********************
 * 3) Curriculum score -> 0~100 (take best system)
 ***********************/
const ALEVEL_MAP = { "A*": 100, A: 92, B: 82, C: 72, D: 62, E: 52 };

function scoreALevel(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;

  const vals = arr
    .map((x) => ALEVEL_MAP[String(x).trim()] ?? null)
    .filter((v) => v !== null);

  if (!vals.length) return null;

  vals.sort((a, b) => b - a);
  const top = vals.slice(0, 3);
  return top.reduce((s, v) => s + v, 0) / top.length;
}

function scoreIB(raw) {
  const ib = safeNumber(raw);
  if (!isValidValue(ib)) return null;
  return normalizeLinear(ib, 24, 45);
}

function scoreAP(raw) {
  const n = safeNumber(raw); // 你定义为 >=4 的门数
  if (!isValidValue(n)) return null;
  return normalizeLinear(n, 0, 8);
}

function computeCurriculumScore(courses) {
  if (!courses) return null;
  const candidates = [
    scoreALevel(courses.alevel),
    scoreIB(courses.ib),
    scoreAP(courses.ap),
  ].filter((v) => v !== null);

  return candidates.length ? Math.max(...candidates) : null;
}

/***********************
 * 4) Profile score -> 0~100 (null if totally empty)
 ***********************/
const KEYWORDS = {
  research: ["research", "paper", "publication", "lab", "论文", "科研", "发表", "期刊", "会议", "专利"],
  awardsTop: ["international", "world", "gold", "一等奖", "国家级", "国际", "全球", "金奖", "Olympiad", "IMO", "IOI", "IPhO"],
  leadership: ["captain", "president", "founder", "leader", "社长", "主席", "创办", "负责人", "队长"],
  community: ["volunteer", "community", "charity", "志愿", "公益", "社区"],
};

function keywordHitScore(text, keywords) {
  if (!text) return 0;
  const t = String(text).toLowerCase();
  let hits = 0;
  for (const k of keywords) if (t.includes(String(k).toLowerCase())) hits += 1;
  return hits;
}

function scoreProfile({ activities, research, awards }) {
  const a = String(activities || "").trim();
  const r = String(research || "").trim();
  const w = String(awards || "").trim();

  if (!a && !r && !w) return null;

  const lenScore = clamp((a.length + r.length + w.length) / 600, 0, 1) * 40;

  const kwScore =
    clamp(keywordHitScore(r, KEYWORDS.research) * 10, 0, 25) +
    clamp(keywordHitScore(w, KEYWORDS.awardsTop) * 12, 0, 25) +
    clamp(keywordHitScore(a + " " + w, KEYWORDS.leadership) * 6, 0, 15) +
    clamp(keywordHitScore(a, KEYWORDS.community) * 4, 0, 10);

  return clamp(lenScore + kwScore, 0, 100);
}

/***********************
 * 5) Student vector (parts + total + tags)
 ***********************/
function buildStudentVector(bachelorData, options = {}) {
  const parts = {
    academics: normalizeHighschoolGPA(bachelorData.highschool_gpa),
    language: computeLanguageScore(bachelorData.language_scores),
    curriculum: computeCurriculumScore(bachelorData.international_courses),
    profile: scoreProfile({
      activities: bachelorData.activities,
      research: bachelorData.research,
      awards: bachelorData.awards,
    }),
  };

  const weights = options.studentWeights || {
    academics: 0.45,
    language: 0.25,
    curriculum: 0.20,
    profile: 0.10,
  };

  const total = weightedMean(parts, weights);

  // tags
  const tags = [];
  if (options.studentTagsThresholds) {
    applyStudentTagThresholds(bachelorData, parts, options.studentTagsThresholds, tags);
  } else {
    if (parts.academics !== null && parts.academics >= 88) tags.push("high_gpa");
    if (parts.language !== null && parts.language >= 85) tags.push("high_language");
    if (parts.curriculum !== null && parts.curriculum >= 85) tags.push("strong_curriculum");
    if (parts.profile !== null && parts.profile >= 75) tags.push("strong_profile");
  }

  // stem interest from selected target majors (program stem tag)
  if (options.stemSelected === true) {
    tags.push("stem_interest");
  } else if (options.stemSelected === null || options.stemSelected === undefined) {
    const majorsText = (bachelorData.target_majors || []).join(" ").toLowerCase();
    if (/(cs|computer|data|ai|engineer|math|physics|biology|chem)/.test(majorsText)) {
      tags.push("stem_interest");
    }
  }

  return { parts, total: total ?? 0, tags, raw: bachelorData };
}

/***********************
 * 6) Requirement penalty (only when student provided that metric)
 ***********************/
function requirementPenalty(student, program) {
  const req = program.requirements || {};
  let penalty = 0;

  // GPA
  if (req.gpaMin != null && isValidValue(student.parts.academics)) {
    if (student.parts.academics < req.gpaMin) {
      penalty += (req.gpaMin - student.parts.academics) * (req.gpaPenaltyFactor ?? 1.2);
    }
  }

  // IELTS overall / each
  const ielts = student.raw.language_scores?.ielts;
  const ieltsOverall = safeNumber(ielts?.overall);
  if (req.ieltsOverallMin != null && isValidValue(ieltsOverall)) {
    if (ieltsOverall < req.ieltsOverallMin) penalty += (req.ieltsOverallMin - ieltsOverall) * (req.ieltsOverallPenaltyFactor ?? 18);
  }
  if (req.ieltsEachMin != null) {
    const subs = ["listening", "reading", "writing", "speaking"]
      .map((k) => safeNumber(ielts?.[k]))
      .filter((v) => isValidValue(v));
    if (subs.length) {
      const minSub = Math.min(...subs);
      if (minSub < req.ieltsEachMin) penalty += (req.ieltsEachMin - minSub) * (req.ieltsEachPenaltyFactor ?? 22);
    }
  }

  // TOEFL / PTE / Duolingo (可选门槛)
  const toeflTotal = safeNumber(student.raw.language_scores?.toefl?.total);
  if (req.toeflTotalMin != null && isValidValue(toeflTotal)) {
    if (toeflTotal < req.toeflTotalMin) penalty += (req.toeflTotalMin - toeflTotal) * (req.toeflPenaltyFactor ?? 1.0);
  }

  const pteTotal = safeNumber(student.raw.language_scores?.pte?.total);
  if (req.pteTotalMin != null && isValidValue(pteTotal)) {
    if (pteTotal < req.pteTotalMin) penalty += (req.pteTotalMin - pteTotal) * (req.ptePenaltyFactor ?? 2.0);
  }

  const duoTotal = safeNumber(student.raw.language_scores?.duolingo);
  if (req.duolingoMin != null && isValidValue(duoTotal)) {
    if (duoTotal < req.duolingoMin) penalty += (req.duolingoMin - duoTotal) * (req.duolingoPenaltyFactor ?? 1.5);
  }

  return penalty;
}

function requirementBonus(student, program) {
  const req = program.requirements || {};
  let bonus = 0;

  // IELTS overall recommended
  const ieltsOverall = safeNumber(student.raw.language_scores?.ielts?.overall);
  if (req.ieltsOverallRec != null && isValidValue(ieltsOverall)) {
    if (ieltsOverall >= req.ieltsOverallRec) bonus += (req.ieltsOverallRecBonusFactor ?? 4);
  }

  // TOEFL total recommended
  const toeflTotal = safeNumber(student.raw.language_scores?.toefl?.total);
  if (req.toeflTotalRec != null && isValidValue(toeflTotal)) {
    if (toeflTotal >= req.toeflTotalRec) bonus += (req.toeflRecBonusFactor ?? 3);
  }

  // PTE total recommended
  const pteTotal = safeNumber(student.raw.language_scores?.pte?.total);
  if (req.pteTotalRec != null && isValidValue(pteTotal)) {
    if (pteTotal >= req.pteTotalRec) bonus += (req.pteRecBonusFactor ?? 3);
  }

  // Duolingo recommended
  const duoTotal = safeNumber(student.raw.language_scores?.duolingo);
  if (req.duolingoRec != null && isValidValue(duoTotal)) {
    if (duoTotal >= req.duolingoRec) bonus += (req.duolingoRecBonusFactor ?? 2);
  }

  return bonus;
}

function tagBonus(studentTags, programTags) {
  if (!Array.isArray(studentTags) || !Array.isArray(programTags)) return 0;

  const setS = new Set(studentTags);
  let bonus = 0;

  if (programTags.includes("high_gpa_bar") && setS.has("high_gpa")) bonus += 6;
  if (programTags.includes("high_language_bar") && setS.has("high_language")) bonus += 6;
  if (programTags.includes("research_plus") && setS.has("strong_profile")) bonus += 4;
  if (programTags.includes("stem") && setS.has("stem_interest")) bonus += 4;

  const overlap = programTags.filter((t) => setS.has(t)).length;
  bonus += clamp(overlap, 0, 6);

  return bonus;
}

function scoreProgramFit(student, program) {
  const weights = program.weights || { academics: 0.45, language: 0.25, curriculum: 0.20, profile: 0.10 };

  const base = weightedMean(student.parts, weights) ?? 0;
  const penalty = requirementPenalty(student, program);
  const bonus = tagBonus(student.tags, program.tags) + requirementBonus(student, program);

  let tierAdj = 0;
  if (program.tier === "top") tierAdj = -3;
  if (program.tier === "safe") tierAdj = +2;

  const finalScore = clamp(base + bonus + tierAdj - penalty, 0, 100);
  return { finalScore, base, bonus, penalty, tierAdj };
}

/***********************
 * 7) Main: match bachelor programs
 ***********************/
export function matchBachelorPrograms(bachelorData, programs, options = {}) {
  const targetMajors = (bachelorData.target_majors || []).map((s) => String(s).toLowerCase());
  const hasStemSelected =
    targetMajors.length &&
    Array.isArray(programs) &&
    programs.some((p) => {
      if (!Array.isArray(p.tags) || !p.tags.includes("stem")) return false;
      const mj = `${p.major || ""} ${p.id || ""}`.toLowerCase();
      return targetMajors.some((k) => k && mj.includes(k));
    });

  const student = buildStudentVector(bachelorData, { ...options, stemSelected: hasStemSelected });

  const allowedCountries = options.allowedCountries || ["???", "??????", "???", "?????"];
  const targetCountries = (bachelorData.target_countries || []).filter((c) => allowedCountries.includes(c));
  const countryFilter = targetCountries.length ? targetCountries : allowedCountries;

  const majorBonusValue = options.majorBonus ?? 3;

  const results = programs
    .filter((p) => countryFilter.includes(p.country))
    .map((p) => {
      const fit = scoreProgramFit(student, p);

      let majorBonus = 0;
      if (targetMajors.length) {
        const mj = `${p.major || ""} ${p.id || ""}`.toLowerCase();
        const hit = targetMajors.some((k) => k && mj.includes(k));
        if (hit) majorBonus = majorBonusValue;
      }

      const score = clamp(fit.finalScore + majorBonus, 0, 100);

      return {
        ...p,
        score,
        explain: {
          studentTotal: student.total,
          parts: student.parts,
          tags: student.tags,
          ...fit,
          majorBonus,
        },
      };
    })
    .sort((a, b) => b.score - a.score);

  return { student, results };
}

/***********************
 * 8) Chart.js Radar helper (optional)
 ***********************/
export function buildRadarChartJsData(studentVector, label = "学生画像") {
  const dims = [
    { key: "academics", label: "学术" },
    { key: "language", label: "语言" },
    { key: "curriculum", label: "课程" },
    { key: "profile", label: "综合" },
  ];

  const missing = [];
  const values = dims.map((d) => {
    const v = studentVector.parts?.[d.key];
    if (v === null || v === undefined) {
      missing.push(d.key);
      return 0;
    }
    return Math.round(v);
  });

  return {
    chartData: {
      labels: dims.map((d) => d.label),
      datasets: [{ label, data: values }],
    },
    meta: { total: studentVector.total ?? 0, missing, rawParts: studentVector.parts },
  };
}
