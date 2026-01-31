
function activateTab(tabId) {
  var el = document.getElementById(tabId);
  if (!el || !window.bootstrap) return;
  var tab = window.bootstrap.Tab.getOrCreateInstance(el);
  tab.show();
}


function safeAddListener(id, handler) {
  var el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("change", handler);
}

import { matchBachelorPrograms } from "./calc/matchBachelor.js";

// ------------------ bachelor start ------------------

$(function () {
  // 初始化多选下拉框（目标院校和目标专业�?
    const $bachelorSchool = $("#select_bachelor_to_school");
  const $bachelorMajor = $("#select_bachelor_to_major");

  if ($bachelorSchool.data("select2")) {
    $bachelorSchool.select2("destroy");
  }
  if ($bachelorMajor.data("select2")) {
    $bachelorMajor.select2("destroy");
  }

  $bachelorSchool.select2({
    placeholder: "搜索并选择学校...",
    allowClear: true,
    dropdownParent: $(document.body),
    minimumInputLength: 1,
    ajax: {
      delay: 300,
      transport: function (params, success, failure) {
        const countryCodes = getSelectedBachelorCountryCodes();
        if (!countryCodes.length) {
          success({ data: { items: [], total: 0 } });
          return;
        }
        const payload = params.data || {};
        return $.ajax({
          url: "/api/v1/universities/search",
          method: "POST",
          contentType: "application/json",
          dataType: "json",
          data: JSON.stringify(payload),
        }).then(success).fail(failure);
      },
      url: function () {
        return "/api/v1/universities/search";
      },
      dataType: "json",
      data: function (params) {
        const countryCodes = getSelectedBachelorCountryCodes();
        const countryCode = countryCodes.join(",");
        const payload = {
          q: params.term || "",
          country_code: countryCode,
          page: params.page || 1,
          size: 20,
        };
        console.log("[university search] request", payload);
        return payload;
      },
      processResults: function (resp, params) {
        console.log("[university search] response", resp);
        const data = resp?.data || {};
        const items = Array.isArray(data.items) ? data.items : [];
        const results = items.map((item) => ({
          id: item.id,
          text: item.name_cn || item.name_en || item.name_en_short || item.id,
        }));
        const page = params.page || 1;
        const total = Number(data.total || 0);
        return {
          results,
          pagination: {
            more: page * 20 < total,
          },
        };
      },
    },
  });

  $bachelorMajor.select2({
    placeholder: "搜索并选择专业...",
    allowClear: true,
    dropdownParent: $(document.body),
    minimumInputLength: 1,
    ajax: {
      delay: 300,
      transport: function (params, success, failure) {
        const schoolIds = $("#select_bachelor_to_school").val() || [];
        if (!schoolIds.length) {
          success({ data: { items: [], total: 0 } });
          return;
        }
        const payload = params.data || {};
        return $.ajax({
          url: "/api/v1/programs/search",
          method: "POST",
          contentType: "application/json",
          dataType: "json",
          data: JSON.stringify(payload),
        }).then(success).fail(failure);
      },
      url: function () {
        return "/api/v1/programs/search";
      },
      dataType: "json",
      data: function (params) {
        const schoolIds = $("#select_bachelor_to_school").val() || [];
        const payload = {
          university_ids: schoolIds.map((id) => Number(id)),
          degree_level: "bachelor",
          q: params.term || "",
          page: params.page || 1,
          size: 20,
        };
        console.log("[program search] request", payload);
        return payload;
      },
      processResults: function (resp, params) {
        console.log("[program search] response", resp);
        const data = resp?.data || {};
        const items = Array.isArray(data.items) ? data.items : [];
        const schoolMap = new Map();
        const selectedSchoolData = $("#select_bachelor_to_school").select2("data") || [];
        selectedSchoolData.forEach((item) => {
          if (item && item.id != null) {
            schoolMap.set(String(item.id), item.text || "");
          }
        });
        const results = items.map((item) => {
          const mv = item.match_view || {};
          return {
            id: mv.program_id,
            text: `${mv.major_name_cn || ""} - ${schoolMap.get(String(mv.university_id)) || mv.university_id || ""}`,
          };
        });
        const normalizedResults = results
          .map((item) => ({
            id: item.id != null ? String(item.id) : "",
            text: item.text || ""
          }))
          .filter((item) => item.id !== "");
        const page = params.page || 1;
        const total = Number(data.total || 0);
        return {
          results: normalizedResults,
          pagination: {
            more: page * 20 < total,
          },
        };
      },
    },
  });

  bindBachelorTargetCountryToggle();

  $("#select_master_to_school").select2({
    placeholder: "请选择目标院校（可多选）",
    allowClear: true,
  });

  $("#select_master_to_major").select2({
    placeholder: "请选择目标专业（可多选）",
    allowClear: true,
  });
  $("#select_master_graduated_school").select2({
    dropdownParent: $("#ModalMasterApply"),
    //  minimumResultsForSearch: Infinity,
    placeholder: "请选择本科就读院校",
    // allowClear: true,
    data: [
      {
        text: "Group 1",
        children: [
          {
            id: 1,
            text: "Option 1.1",
          },
          {
            id: 2,
            text: "Option 1.2",
          },
        ],
      },
      {
        text: "Group 2",
        children: [
          {
            id: 3,
            text: "Option 2.1",
          },
          {
            id: 4,
            text: "Option 2.2",
          },
        ],
      },
    ],
  });
  $("#select_master_graduated_major").select2({
    dropdownParent: $("#ModalMasterApply"),
    //  minimumResultsForSearch: Infinity,
    placeholder: "请选择本科专业",
    // allowClear: true,
    data: [
      {
        text: "Group 1",
        children: [
          {
            id: 1,
            text: "Option 1.1",
          },
          {
            id: 2,
            text: "Option 1.2",
          },
        ],
      },
      {
        text: "Group 2",
        children: [
          {
            id: 3,
            text: "Option 2.1",
          },
          {
            id: 4,
            text: "Option 2.2",
          },
        ],
      },
      {
        text: "Group 2",
        children: [
          {
            id: 3,
            text: "Option 2.1",
          },
          {
            id: 4,
            text: "Option 2.2",
          },
        ],
      },
      {
        text: "Group 2",
        children: [
          {
            id: 3,
            text: "Option 2.1",
          },
          {
            id: 4,
            text: "Option 2.2",
          },
        ],
      },
      {
        text: "Group 2",
        children: [
          {
            id: 3,
            text: "Option 2.1",
          },
          {
            id: 4,
            text: "Option 2.2",
          },
        ],
      },
      {
        text: "Group 2",
        children: [
          {
            id: 3,
            text: "Option 2.1",
          },
          {
            id: 4,
            text: "Option 2.2",
          },
        ],
      },
    ],
  });
});



function getSelectedBachelorCountryCodes() {
  const map = [
    { id: "checkbox_bachelor_uk", code: "UK" },
    { id: "checkbox_bachelor_australia", code: "AU" },
    { id: "checkbox_bachelor_hongkong", code: "HK" },
    { id: "checkbox_bachelor_singapore", code: "SG" },
    { id: "checkbox_bachelor_usa", code: "US" },
  ];
  const codes = [];
  map.forEach((item) => {
    const el = document.getElementById(item.id);
    if (el && el.checked) {
      codes.push(item.code);
    }
  });
  return codes;
}

function updateBachelorTargetInputs() {
  const $bachelorSchool = $("#select_bachelor_to_school");
  const $bachelorMajor = $("#select_bachelor_to_major");
  const hasCountry = getSelectedBachelorCountryCodes().length > 0;
  const hasSchoolSelected = ($bachelorSchool.val() || []).length > 0;
  const hasMajorSelected = ($bachelorMajor.val() || []).length > 0;

  setSelect2Disabled($bachelorSchool, !hasCountry);
  setSelect2Disabled($bachelorMajor, !hasCountry || !hasSchoolSelected);

  if (!hasCountry && (hasSchoolSelected || hasMajorSelected)) {
    $bachelorSchool.val(null).trigger("change");
    $bachelorMajor.val(null).trigger("change");
  }

}

function setSelect2Disabled($el, disabled) {
  $el.prop("disabled", disabled);
  const instance = $el.data("select2");
  if (instance && instance.options) {
    try {
      instance.options.set("disabled", disabled);
    } catch (e) {
      // Ignore if select2 version doesn't support options.set
    }
  }
  $el.trigger("change.select2");
}

function bindBachelorTargetCountryToggle() {
  [
    "checkbox_bachelor_uk",
    "checkbox_bachelor_australia",
    "checkbox_bachelor_hongkong",
    "checkbox_bachelor_singapore",
    "checkbox_bachelor_usa",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("change", updateBachelorTargetInputs);
    }
  });

  updateBachelorTargetInputs();
}

// Enable major only when schools are selected
$(document).on("change", "#select_bachelor_to_school", function () {
  updateBachelorTargetInputs();
});

// Store selected program IDs when majors change
$(document).on("change", "#select_bachelor_to_major", function () {
  const ids = ($(this).val() || []).map((v) => Number(v)).filter((v) => !Number.isNaN(v));
  localStorage.setItem("dc_selected_program_ids", JSON.stringify(ids));
  updateBachelorTargetInputs();
});




function normalizeIeltsScore(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return "";
  const num = Number(cleaned);
  if (!Number.isFinite(num) || num < 0) return "";
  if (num > 9) return "";
  const rounded = Math.round(num * 2) / 2;
  return rounded.toFixed(1);
}

function formatIeltsInputs(ids) {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const formatted = normalizeIeltsScore(el.value);
    if (el.value.trim() === "" && formatted === "") return;
    el.value = formatted;
  });
}

$(document).on(
  "blur",
  ".bachelor-IELTS-overall-input, .bachelor-IELTS-section-input, .master-IELTS-overall-input, .master-IELTS-section-input",
  function () {
    const formatted = normalizeIeltsScore(this.value);
    if (this.value.trim() === "" && formatted === "") return;
    this.value = formatted;
  }
);

// Render master summary on confirm
$(document).on("click", "#btn-modal-master-confirm", function () {
  formatIeltsInputs([
    "score_ielts_overall",
    "score_ielts_listening",
    "score_ielts_reading",
    "score_ielts_writing",
    "score_ielts_speaking",
  ]);
  const data = collectMasterFormData();

  // Replace select2 values with display text
  data.target_schools = getSelect2Texts($("#select_master_to_school"));
  data.target_majors = getSelect2Texts($("#select_master_to_major"));
  data.graduated_school = getSelect2SingleText($("#select_master_graduated_school"));
  data.graduated_major = getSelect2SingleText($("#select_master_graduated_major"));

  renderMasterSummary(data);
  showMasterCards();
});


// Render bachelor summary on confirm
$(document).on("click", "#btn-modal-bachelor-confirm", function () {
  formatIeltsInputs([
    "input_bachelor_IELTS_overall",
    "input_bachelor_IELTS_listening",
    "input_bachelor_IELTS_reading",
    "input_bachelor_IELTS_writing",
    "input_bachelor_IELTS_speaking",
  ]);
  const data = collectBachelorFormData();

  // Replace select2 values with display text
  data.target_schools = getSelect2Texts($("#select_bachelor_to_school"));
  data.target_majors = getSelect2Texts($("#select_bachelor_to_major"));

  renderBachelorSummary(data);
  showBachelorCards();
  $("#btn-generate-result").prop("disabled", false);
});

// A-Level：勾选时显示并启用四个下拉框，取消时隐藏并清�?
safeAddListener("checkbox_bachelor_alevel", function () {
    const container = document.getElementById(
      "bachelor_alevel_scores_container"
    );
    const selects = container.querySelectorAll("select");

    if (this.checked) {
      container.style.display = "flex"; 
      selects.forEach((sel) => (sel.disabled = false));
    } else {
      container.style.display = "none";
      selects.forEach((sel) => {
        sel.disabled = true;
        sel.value = "";
      });
    }
  });

// IB
safeAddListener("checkbox_bachelor_ib", function () {
    const input = document.getElementById("input_bachelor_score_ib");
    if (this.checked) {
      input.disabled = false;
    } else {
      input.disabled = true;
      input.value = "";
    }
  });

// AP
safeAddListener("checkbox_bachelor_ap", function () {
    const input = document.getElementById("input_bachelor_score_ap");
    if (this.checked) {
      input.disabled = false;
    } else {
      input.disabled = true;
      input.value = "";
    }
  });

// 雅思
safeAddListener("checkbox_bachelor_ielts", function () {
    const container = document.getElementById("bachelor_ielts_score_container");
    const inputs = container.querySelectorAll("input");

    if (this.checked) {
      container.style.display = "flex";
      inputs.forEach((inp) => (inp.disabled = false));
    } else {
      container.style.display = "none";
      inputs.forEach((inp) => {
        inp.disabled = true;
        inp.value = "";
      });
    }
  });

// 托福 TOEFL
safeAddListener("checkbox_bachelor_toefl", function () {
    const container = document.getElementById("bachelor_toefl_score_container");
    const inputs = container.querySelectorAll("input");

    if (this.checked) {
      container.style.display = "flex";
      inputs.forEach((inp) => (inp.disabled = false));
    } else {
      container.style.display = "none";
      inputs.forEach((inp) => {
        inp.disabled = true;
        inp.value = "";
      });
    }
  });

// PTE
safeAddListener("checkbox_bachelor_pte", function () {
    const container = document.getElementById("bachelor_pte_score_container");
    const inputs = container.querySelectorAll("input");

    if (this.checked) {
      container.style.display = "flex";
      inputs.forEach((inp) => (inp.disabled = false));
    } else {
      container.style.display = "none";
      inputs.forEach((inp) => {
        inp.disabled = true;
        inp.value = "";
      });
    }
  });

// 多邻�?Duolingo
safeAddListener("checkbox_bachelor_duolingo", function () {
    const input = document.getElementById("score_duolingo");
    if (this.checked) {
      input.disabled = false;
      // 如果你希望勾选后才显示，可以取消注释下面这行
      // input.style.display = 'block';
    } else {
      input.disabled = true;
      input.value = "";
      // input.style.display = 'none';
    }
  });

// 活动
safeAddListener("checkbox_bachelor_activity", function () {
    const input = document.getElementById("input_bachelor_activity");
    if (this.checked) {
      input.disabled = false;
    } else {
      input.disabled = true;
      input.value = "";
    }
  });

// 科研/论文
safeAddListener("checkbox_bachelor_research", function () {
    const input = document.getElementById("input_bachelor_research");
    if (this.checked) {
      input.disabled = false;
    } else {
      input.disabled = true;
      input.value = "";
    }
  });

// 获奖
safeAddListener("checkbox_bachelor_award", function () {
    const input = document.getElementById("input_bachelor_award");
    if (this.checked) {
      input.disabled = false;
    } else {
      input.disabled = true;
      input.value = "";
    }
  });

// ------------------ bachelor end ------------------

// ------------------ master start ------------------

$(function () {
  // 初始化多选下拉框（目标院校和目标专业�?
  $("#select_master_to_school").select2({
    placeholder: "请选择目标院校（可多选）",
    allowClear: true,
  });

  $("#select_master_to_major").select2({
    placeholder: "请选择目标专业（可多选）",
    allowClear: true,
  });
});

// 雅�?IELTS
safeAddListener("checkbox_master_ielts", function () {
    const container = document.getElementById("master_ielts_score_container");
    const inputs = container.querySelectorAll("input");

    if (this.checked) {
      container.style.display = "flex";
      inputs.forEach((inp) => (inp.disabled = false));
    } else {
      container.style.display = "none";
      inputs.forEach((inp) => {
        inp.disabled = true;
        inp.value = "";
      });
    }
  });

// 托福 TOEFL
safeAddListener("checkbox_master_toefl", function () {
    const container = document.getElementById("master_toefl_score_container");
    const inputs = container.querySelectorAll("input");

    if (this.checked) {
      container.style.display = "flex";
      inputs.forEach((inp) => (inp.disabled = false));
    } else {
      container.style.display = "none";
      inputs.forEach((inp) => {
        inp.disabled = true;
        inp.value = "";
      });
    }
  });

// PTE
safeAddListener("checkbox_master_pte", function () {
    const container = document.getElementById("master_pte_score_container");
    const inputs = container.querySelectorAll("input");

    if (this.checked) {
      container.style.display = "flex";
      inputs.forEach((inp) => (inp.disabled = false));
    } else {
      container.style.display = "none";
      inputs.forEach((inp) => {
        inp.disabled = true;
        inp.value = "";
      });
    }
  });

// 多邻�?Duolingo
safeAddListener("checkbox_master_duolingo", function () {
    const input = document.getElementById("score_duolingo");
    if (this.checked) {
      input.disabled = false;
    } else {
      input.disabled = true;
      input.value = "";
    }
  });

// 活动
safeAddListener("checkbox_master_activity", function () {
    const input = document.getElementById("input_master_activity");
    if (this.checked) {
      input.disabled = false;
    } else {
      input.disabled = true;
      input.value = "";
    }
  });

// 科研/论文
safeAddListener("checkbox_master_research", function () {
    const input = document.getElementById("input_master_research");
    if (this.checked) {
      input.disabled = false;
    } else {
      input.disabled = true;
      input.value = "";
    }
  });

// 获奖
safeAddListener("checkbox_master_award", function () {
    const input = document.getElementById("input_master_award");
    if (this.checked) {
      input.disabled = false;
    } else {
      input.disabled = true;
      input.value = "";
    }
  });

// 国外专业相关
safeAddListener("checkbox_master_work_abroad_related", function () {
    const input = document.getElementById("input_master_work_abroad_related");
    if (this.checked) {
      input.disabled = false;
    } else {
      input.disabled = true;
      input.value = "";
    }
  });

// 国外专业不相�?
safeAddListener("checkbox_master_work_abroad_unrelated", function () {
    const input = document.getElementById("input_master_work_abroad_unrelated");
    if (this.checked) {
      input.disabled = false;
    } else {
      input.disabled = true;
      input.value = "";
    }
  });

// 国内专业相关
safeAddListener("checkbox_master_work_domestic_related", function () {
    const input = document.getElementById("input_master_work_domestic_related");
    if (this.checked) {
      input.disabled = false;
    } else {
      input.disabled = true;
      input.value = "";
    }
  });

// 国内专业不相�?
safeAddListener("checkbox_master_work_domestic_unrelated", function () {
    const input = document.getElementById(
      "input_master_work_domestic_unrelated"
    );
    if (this.checked) {
      input.disabled = false;
    } else {
      input.disabled = true;
      input.value = "";
    }
  });

// ------------------ master end ------------------

// TODO:Get&Render
const PROGRAMS = [
  {
    id: "ucl-cs",
    country: "英国",
    school: "UCL",
    major: "Computer Science BSc",
    tier: "top", // top / strong / match / safe (你自己定�?
    requirements: {
      gpaMin: 85, // 0-100 体系门槛（或后面你换成更细的�?
      ieltsOverallMin: 7.0,
      ieltsEachMin: 6.5,
      toeflTotalMin: 100,
      alevelPreferred: ["A*", "A*", "A"], // 可�?
      apMinCount4: 3,
    },
    weights: {
      academics: 0.5,
      language: 0.25,
      curriculum: 0.15,
      profile: 0.1,
    },
    tags: [
      "high_gpa_bar",
      "high_language_bar",
      "stem",
      "theory_heavy",
      "research_plus",
    ],
  },
  {
    id: "unimelb-biotech",
    country: "澳大利亚",
    school: "University of Melbourne",
    major: "Biotechnology",
    tier: "strong",
    requirements: { gpaMin: 80, ieltsOverallMin: 6.5, ieltsEachMin: 6.0 },
    weights: { academics: 0.45, language: 0.2, curriculum: 0.2, profile: 0.15 },
    tags: ["stem", "lab", "research_plus", "balanced"],
  },
];

// ------------------ GetModalInformation Start ------- Bachelor & Master------------------

function collectBachelorFormData() {
  const data = {
    // 1. 留学目标
    target_countries: [],
    target_schools: [],
    target_majors: [],

    // 2. 高中经历
    highschool_type: null,
    highschool_gpa: "",

    // 3. 语言成绩
    language_scores: {
      ielts: null,
      toefl: null,
      pte: null,
      duolingo: null,
    },

    // 4. 国际课程
    international_courses: {
      alevel: [],
      ib: null,
      ap: null,
    },

    // 5. 活动及获�?
    activities: "",
    research: "",
    awards: "",
  };

  // ========================
  // 1. 留学目标国家（多�?checkbox�?
  // ========================
  const countries = [
    { id: "checkbox_bachelor_uk", value: "英国" },
    { id: "checkbox_bachelor_australia", value: "澳大利亚" },
    { id: "checkbox_bachelor_hongkong", value: "香港" },
    { id: "checkbox_bachelor_singapore", value: "新加坡" },
    { id: "checkbox_bachelor_usa", value: "美国" },
  ];

  countries.forEach((item) => {
    const checkbox = document.getElementById(item.id);
    if (checkbox && checkbox.checked) {
      data.target_countries.push(item.value);
    }
  });

  // ========================
  // 2. 目标院校（Select2 多选）
  // ========================
  const schoolSelect = $("#select_bachelor_to_school");
  if (schoolSelect.length) {
    data.target_schools = schoolSelect.val() || []; // Select2 �?val() 返回数组
  }

  // ========================
  // 3. 目标专业（Select2 多选）
  // ========================
  const majorSelect = $("#select_bachelor_to_major");
  if (majorSelect.length) {
    data.target_majors = majorSelect.val() || [];
  }

  // ========================
  // 4. 高中类型（单选）
  // ========================
  const highSchoolRadios = document.querySelectorAll(
    'input[name="radio_highSchool_domestic_or_international"]'
  );
  highSchoolRadios.forEach((radio) => {
    if (radio.checked) {
      if (radio.id === "radio_bachelor_highSchool_domestic") {
        data.highschool_type = "体制内";
      } else if (radio.id === "radio_bachelor_highSchool_international") {
        data.highschool_type = "国际学校";
      } else if (radio.id === "radio_bachelor_highSchool_abroad") {
        data.highschool_type = "国外高中";
      }
    }
  });

  // 高中 GPA
  const gpaInput = document.getElementById("input_bachelor_highschool_gpa");
  if (gpaInput) {
    data.highschool_gpa = gpaInput.value.trim();
  }

  // ========================
  // 5. 语言成绩
  // ========================
  // 雅�?
  if (document.getElementById("checkbox_bachelor_ielts").checked) {
    data.language_scores.ielts = {
      overall:
        document.getElementById("input_bachelor_IELTS_overall")?.value.trim() ||
        "",
      listening:
        document
          .getElementById("input_bachelor_IELTS_listening")
          ?.value.trim() || "",
      reading:
        document.getElementById("input_bachelor_IELTS_reading")?.value.trim() ||
        "",
      writing:
        document.getElementById("input_bachelor_IELTS_writing")?.value.trim() ||
        "",
      speaking:
        document
          .getElementById("input_bachelor_IELTS_speaking")
          ?.value.trim() || "",
    };
  }

  // 托福
  if (document.getElementById("checkbox_bachelor_toefl").checked) {
    data.language_scores.toefl = {
      total:
        document.getElementById("input_bachelor_TOEFL_total")?.value.trim() ||
        "",
      reading:
        document.getElementById("input_bachelor_TOEFL_reading")?.value.trim() ||
        "",
      listening:
        document
          .getElementById("input_bachelor_TOEFL_listening")
          ?.value.trim() || "",
      speaking:
        document
          .getElementById("input_bachelor_TOEFL_speaking")
          ?.value.trim() || "",
      writing:
        document.getElementById("input_bachelor_TOEFL_writing")?.value.trim() ||
        "",
    };
  }

  // PTE
  if (document.getElementById("checkbox_bachelor_pte").checked) {
    data.language_scores.pte = {
      total:
        document.getElementById("input_bachelor_PTE_total")?.value.trim() || "",
      reading:
        document.getElementById("input_bachelor_PTE_reading")?.value.trim() ||
        "",
      listening:
        document.getElementById("input_bachelor_PTE_listening")?.value.trim() ||
        "",
      speaking:
        document.getElementById("input_bachelor_PTE_speaking")?.value.trim() ||
        "",
      writing:
        document.getElementById("input_bachelor_PTE_writing")?.value.trim() ||
        "",
    };
  }

  // 多邻�?
  if (document.getElementById("checkbox_bachelor_duolingo").checked) {
    data.language_scores.duolingo =
      document.getElementById("input_bachelor_Duolingo_total")?.value.trim() ||
      "";
  }

  // ========================
  // 6. 国际课程
  // ========================
  // A-Level
  if (document.getElementById("checkbox_bachelor_alevel").checked) {
    const scores = [];
    for (let i = 1; i <= 4; i++) {
      const select = document.getElementById(
        `select_bachelor_score_alevel_${i}`
      );
      if (select && select.value) {
        scores.push(select.value);
      }
    }
    data.international_courses.alevel = scores;
  }

  // IB
  if (document.getElementById("checkbox_bachelor_ib").checked) {
    data.international_courses.ib =
      document.getElementById("input_bachelor_score_ib")?.value.trim() || "";
  }

  // AP
  if (document.getElementById("checkbox_bachelor_ap").checked) {
    data.international_courses.ap =
      document.getElementById("input_bachelor_score_ap")?.value.trim() || "";
  }

  // ========================
  // 7. 活动及获�?
  // ========================
  if (document.getElementById("checkbox_bachelor_activity").checked) {
    data.activities =
      document.getElementById("input_bachelor_activity")?.value.trim() || "";
  }

  if (document.getElementById("checkbox_bachelor_research").checked) {
    data.research =
      document.getElementById("input_bachelor_research")?.value.trim() || "";
  }

  if (document.getElementById("checkbox_bachelor_award").checked) {
    data.awards =
      document.getElementById("input_bachelor_award")?.value.trim() || "";
  }

  return data;
}

function collectMasterFormData() {
  const data = {
    // 1. 留学目标
    target_countries: [],
    target_schools: [],
    target_majors: [],

    // 2. 本科经历
    undergraduate_type: null,
    undergraduate_gpa: "",
    graduated_school: "",
    graduated_major: "",

    // 3. 语言成绩
    language_scores: {
      ielts: null,
      toefl: null,
      pte: null,
      duolingo: null,
    },

    // 4. 活动及获�?- 高质�?
    activities: "",
    research: "",
    awards: "",

    // 5. 工作经历 - 高质�?
    work_experience: {
      abroad_related: "",
      abroad_unrelated: "",
      domestic_related: "",
      domestic_unrelated: "",
    },
  };

  // ========================
  // 1. 留学目标国家（多�?checkbox�?
  // ========================
  const countries = [
    { id: "checkbox_master_uk", value: "英国" },
    { id: "checkbox_master_australia", value: "澳大利亚" },
    { id: "checkbox_master_hongkong", value: "香港" },
    { id: "checkbox_master_singapore", value: "新加坡" },
    { id: "checkbox_master_usa", value: "美国" },
  ];

  countries.forEach((item) => {
    const checkbox = document.getElementById(item.id);
    if (checkbox && checkbox.checked) {
      data.target_countries.push(item.value);
    }
  });

  // ========================
  // 2. 目标院校 & 专业（Select2 多选）
  // ========================
  const schoolSelect = $("#select_master_to_school");
  if (schoolSelect.length) {
    data.target_schools = schoolSelect.val() || [];
  }

  const majorSelect = $("#select_master_to_major");
  if (majorSelect.length) {
    data.target_majors = majorSelect.val() || [];
  }

  // ========================
  // 3. 本科经历
  // ========================
  // 类型（国�?国外本科�?
  const undergradRadios = document.querySelectorAll(
    'input[name="radio_undergraduate_domestic_or_abroad"]'
  );
  undergradRadios.forEach((radio) => {
    if (radio.checked) {
      data.undergraduate_type =
        radio.id === "radio_master_undergraduate_domestic"
          ? "国内本科"
          : "国外本科";
    }
  });

  // GPA
  const gpaInput = document.getElementById("input_master_undergraduate_gpa");
  if (gpaInput) {
    data.undergraduate_gpa = gpaInput.value.trim();
  }

  // 毕业院校（单�?Select2�?
  const schoolSelectGrad = $("#select_master_graduated_school");
  if (schoolSelectGrad.length) {
    data.graduated_school = schoolSelectGrad.val() || "";
  }

  // 毕业专业（单�?Select2�?
  const majorSelectGrad = $("#select_master_graduated_major");
  if (majorSelectGrad.length) {
    data.graduated_major = majorSelectGrad.val() || "";
  }

  // ========================
  // 4. 语言成绩
  // ========================
  // 雅�?
  if (document.getElementById("checkbox_master_ielts")?.checked) {
    data.language_scores.ielts = {
      overall:
        document.getElementById("score_ielts_overall")?.value.trim() || "",
      listening:
        document.getElementById("score_ielts_listening")?.value.trim() || "",
      reading:
        document.getElementById("score_ielts_reading")?.value.trim() || "",
      writing:
        document.getElementById("score_ielts_writing")?.value.trim() || "",
      speaking:
        document.getElementById("score_ielts_speaking")?.value.trim() || "",
    };
  }

  // 托福
  if (document.getElementById("checkbox_master_toefl")?.checked) {
    data.language_scores.toefl = {
      total: document.getElementById("score_toefl_total")?.value.trim() || "",
      reading:
        document.getElementById("score_toefl_reading")?.value.trim() || "",
      listening:
        document.getElementById("score_toefl_listening")?.value.trim() || "",
      speaking:
        document.getElementById("score_toefl_speaking")?.value.trim() || "",
      writing:
        document.getElementById("score_toefl_writing")?.value.trim() || "",
    };
  }

  // PTE
  if (document.getElementById("checkbox_master_pte")?.checked) {
    data.language_scores.pte = {
      total: document.getElementById("score_pte_total")?.value.trim() || "",
      reading: document.getElementById("score_pte_reading")?.value.trim() || "",
      listening:
        document.getElementById("score_pte_listening")?.value.trim() || "",
      speaking:
        document.getElementById("score_pte_speaking")?.value.trim() || "",
      writing: document.getElementById("score_pte_writing")?.value.trim() || "",
    };
  }

  // 多邻�?
  if (document.getElementById("checkbox_master_duolingo")?.checked) {
    data.language_scores.duolingo =
      document.getElementById("score_duolingo")?.value.trim() || "";
  }

  // ========================
  // 5. 活动及获�?
  // ========================
  if (document.getElementById("checkbox_master_activity")?.checked) {
    data.activities =
      document.getElementById("input_master_activity")?.value.trim() || "";
  }

  if (document.getElementById("checkbox_master_research")?.checked) {
    data.research =
      document.getElementById("input_master_research")?.value.trim() || "";
  }

  if (document.getElementById("checkbox_master_award")?.checked) {
    data.awards =
      document.getElementById("input_master_award")?.value.trim() || "";
  }

  // ========================
  // 6. 工作经历
  // ========================
  if (document.getElementById("checkbox_master_work_abroad_related")?.checked) {
    data.work_experience.abroad_related =
      document
        .getElementById("input_master_work_abroad_related")
        ?.value.trim() || "";
  }

  if (
    document.getElementById("checkbox_master_work_abroad_unrelated")?.checked
  ) {
    data.work_experience.abroad_unrelated =
      document
        .getElementById("input_master_work_abroad_unrelated")
        ?.value.trim() || "";
  }

  if (
    document.getElementById("checkbox_master_work_domestic_related")?.checked
  ) {
    data.work_experience.domestic_related =
      document
        .getElementById("input_master_work_domestic_related")
        ?.value.trim() || "";
  }

  if (
    document.getElementById("checkbox_master_work_domestic_unrelated")?.checked
  ) {
    data.work_experience.domestic_unrelated =
      document
        .getElementById("input_master_work_domestic_unrelated")
        ?.value.trim() || "";
  }

  return data;
}

// ------------------ GetModalInformation End ------- Bachelor & Master------------------

// ------------------ RenderModalInformationToHtml Start ------- Bachelor & Master------------------

function formatScore5(s) {
  // overall - L - R - W - S
  if (!s) return "-";
  const o = s.overall || "-";
  const l = s.listening || "-";
  const r = s.reading || "-";
  const w = s.writing || "-";
  const sp = s.speaking || "-";
  // 保持你原来展示格�?
  return `${o} - ${l} - ${r} - ${w} - ${sp}`;
}

function formatAlevel(scores) {
  if (!Array.isArray(scores) || scores.length === 0) return "-";
  // 你原来是多个 <a>，这里用空格分隔；想�?tag 也可以再升级
  return scores.join(" ");
}


function getSelect2Texts($el) {
  if (!$el || !$el.length) return [];
  const data = $el.select2("data") || [];
  return data
    .map((item) => (item && item.text ? String(item.text).trim() : ""))
    .filter((item) => item !== "");
}

function getSelect2SingleText($el) {
  const items = getSelect2Texts($el);
  return items.length ? items[0] : "";
}

// ---------- Renderers ----------
function renderBachelorSummary(data) {
  // 左侧
  setText("summary_apply_type", "本科申请");
  renderList("summary_target_countries", data.target_countries);
  renderList("summary_bachelor_target_schools", data.target_schools);
  renderList("summary_bachelor_target_majors", data.target_majors);

  // 如果这张卡片同时也展示研究生目标（但当前是本科申请），就清空研究生区
  renderList("summary_master_target_schools", []);
  renderList("summary_master_target_majors", []);

  // 中间：高�?国际课程/语言
  setText("summary_highschool_type", data.highschool_type, "-");
  setText("summary_highschool_gpa", data.highschool_gpa, "-");

  // 国际课程
  setText(
    "summary_alevel",
    formatAlevel(data.international_courses?.alevel),
    "-"
  );
  setText("summary_ib", data.international_courses?.ib, "-");
  setText("summary_ap", data.international_courses?.ap, "-");

  // 语言
  setText("summary_ielts", formatScore5(data.language_scores?.ielts), "-");
  setText(
    "summary_toefl",
    formatScore5({
      overall: data.language_scores?.toefl?.total,
      listening: data.language_scores?.toefl?.listening,
      reading: data.language_scores?.toefl?.reading,
      writing: data.language_scores?.toefl?.writing,
      speaking: data.language_scores?.toefl?.speaking,
    }),
    "-"
  );
  setText(
    "summary_pte",
    formatScore5({
      overall: data.language_scores?.pte?.total,
      listening: data.language_scores?.pte?.listening,
      reading: data.language_scores?.pte?.reading,
      writing: data.language_scores?.pte?.writing,
      speaking: data.language_scores?.pte?.speaking,
    }),
    "-"
  );
  setText("summary_duolingo", data.language_scores?.duolingo, "-");

  // 右侧：活动科研获奖（本科�?
  setNumberOrZero("summary_activities", data.activities);
  setNumberOrZero("summary_research", data.research);
  setNumberOrZero("summary_awards", data.awards);

  // 工作经历（本科没有）清零
  setNumberOrZero("summary_work_abroad_related", "");
  setNumberOrZero("summary_work_abroad_unrelated", "");
  setNumberOrZero("summary_work_domestic_related", "");
  setNumberOrZero("summary_work_domestic_unrelated", "");

  // 大学经历（本科这里通常不展示）清空
  setText("summary_undergrad_type", "-", "-");
  setText("summary_grad_school", "-", "-");
  setText("summary_grad_major", "-", "-");
  setText("summary_undergrad_gpa", "-", "-");
}

function renderMasterSummary(data) {
  // 左侧
  setText("summary_apply_type", "研究生申请");
  renderList("summary_target_countries", data.target_countries);
  renderList("summary_master_target_schools", data.target_schools);
  renderList("summary_master_target_majors", data.target_majors);

  // 清空本科目标�?
  renderList("summary_bachelor_target_schools", []);
  renderList("summary_bachelor_target_majors", []);

  // 中间：大学经�?
  setText("summary_undergrad_type", data.undergraduate_type, "-");
  setText("summary_grad_school", data.graduated_school, "-");
  setText("summary_grad_major", data.graduated_major, "-");
  setText("summary_undergrad_gpa", data.undergraduate_gpa, "-");

  // 高中/国际课程（研究生一般不用）清空
  setText("summary_highschool_type", "-", "-");
  setText("summary_highschool_gpa", "-", "-");
  setText("summary_alevel", "-", "-");
  setText("summary_ib", "-", "-");
  setText("summary_ap", "-", "-");

  // 语言
  setText("summary_ielts", formatScore5(data.language_scores?.ielts), "-");
  setText(
    "summary_toefl",
    formatScore5({
      overall: data.language_scores?.toefl?.total,
      listening: data.language_scores?.toefl?.listening,
      reading: data.language_scores?.toefl?.reading,
      writing: data.language_scores?.toefl?.writing,
      speaking: data.language_scores?.toefl?.speaking,
    }),
    "-"
  );
  setText(
    "summary_pte",
    formatScore5({
      overall: data.language_scores?.pte?.total,
      listening: data.language_scores?.pte?.listening,
      reading: data.language_scores?.pte?.reading,
      writing: data.language_scores?.pte?.writing,
      speaking: data.language_scores?.pte?.speaking,
    }),
    "-"
  );
  setText("summary_duolingo", data.language_scores?.duolingo, "-");

  // 活动科研获奖
  setNumberOrZero("summary_activities", data.activities);
  setNumberOrZero("summary_research", data.research);
  setNumberOrZero("summary_awards", data.awards);

  // 工作经历
  setNumberOrZero(
    "summary_work_abroad_related",
    data.work_experience?.abroad_related
  );
  setNumberOrZero(
    "summary_work_abroad_unrelated",
    data.work_experience?.abroad_unrelated
  );
  setNumberOrZero(
    "summary_work_domestic_related",
    data.work_experience?.domestic_related
  );
  setNumberOrZero(
    "summary_work_domestic_unrelated",
    data.work_experience?.domestic_unrelated
  );
}

function showBachelorCards() {
  // 隐藏所�?master
  document.querySelectorAll(".card-master").forEach((el) => {
    el.style.display = "none";
  });

  // 显示 bachelor
  document.querySelectorAll(".card-bachelor").forEach((el) => {
    el.style.display = "";
  });
}

function showMasterCards() {
  // 隐藏所�?bachelor
  document.querySelectorAll(".card-bachelor").forEach((el) => {
    el.style.display = "none";
  });

  // 显示 master
  document.querySelectorAll(".card-master").forEach((el) => {
    el.style.display = "";
  });
}

// ------------------ RenderModalInformationToHtml Start ------- Bachelor & Master------------------

// ------------------ ResetInformationCard Start ------- Bachelor & Master------------------

function hideAllCards() {
  document.querySelectorAll(".card-bachelor, .card-master").forEach((el) => {
    el.style.display = "none";
  });
}

// ---------- summary helpers ----------
function setText(id, value, fallback = "-") {
  const el = document.getElementById(id);
  if (!el) return;
  const v =
    value === null || value === undefined || String(value).trim() === ""
      ? fallback
      : String(value).trim();
  el.textContent = v;
}

function setNumberOrZero(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  const v = value === null || value === undefined ? "" : String(value).trim();
  el.textContent = v === "" ? "0" : v;
}

function renderList(ulId, arr) {
  const ul = document.getElementById(ulId);
  if (!ul) return;
  ul.innerHTML = "";

  const list = Array.isArray(arr) ? arr.filter(Boolean) : [];
  if (list.length === 0) {
    const li = document.createElement("li");
    li.className = "text-dark mb-0";
    li.textContent = "-";
    ul.appendChild(li);
    return;
  }

  list.forEach((item) => {
    const li = document.createElement("li");
    li.className = "text-dark mb-0";
    li.textContent = item;
    ul.appendChild(li);
  });
}

function resetSummaryUI() {
  setText("summary_apply_type", "-");

  renderList("summary_target_countries", []);
  renderList("summary_bachelor_target_schools", []);
  renderList("summary_bachelor_target_majors", []);
  renderList("summary_master_target_schools", []);
  renderList("summary_master_target_majors", []);

  setText("summary_undergrad_type", "-");
  setText("summary_grad_school", "-");
  setText("summary_grad_major", "-");
  setText("summary_undergrad_gpa", "-");

  setText("summary_highschool_type", "-");
  setText("summary_highschool_gpa", "-");

  setText("summary_alevel", "-");
  setText("summary_ib", "-");
  setText("summary_ap", "-");

  setText("summary_ielts", "-");
  setText("summary_toefl", "-");
  setText("summary_pte", "-");
  setText("summary_duolingo", "-");

  setNumberOrZero("summary_activities", "");
  setNumberOrZero("summary_research", "");
  setNumberOrZero("summary_awards", "");

  setNumberOrZero("summary_work_abroad_related", "");
  setNumberOrZero("summary_work_abroad_unrelated", "");
  setNumberOrZero("summary_work_domestic_related", "");
  setNumberOrZero("summary_work_domestic_unrelated", "");
}

// ---------- form reset helpers ----------
function resetCheckboxes(prefix) {
  document
    .querySelectorAll(`input[type="checkbox"][id^="${prefix}"]`)
    .forEach((cb) => {
      cb.checked = false;
    });
}

function resetRadios(name) {
  document
    .querySelectorAll(`input[type="radio"][name="${name}"]`)
    .forEach((r) => {
      r.checked = false;
    });
}

function resetInputs(prefix) {
  document.querySelectorAll(`input[id^="${prefix}"]`).forEach((inp) => {
    // 只清文本/数字类，避免误伤 checkbox/radio
    if (
      inp.type === "text" ||
      inp.type === "number" ||
      inp.type === "tel" ||
      inp.type === "email"
    ) {
      inp.value = "";
    }
  });
}

function resetSelects(prefix) {
  document.querySelectorAll(`select[id^="${prefix}"]`).forEach((sel) => {
    sel.value = "";
  });
}

// Select2 清空（多�?单选通用�?
function resetSelect2(selector) {
  const $el = $(selector);
  if ($el.length) {
    $el.val(null).trigger("change");
  }
}

function resetBachelorFormUI() {
  // 你的 id 基本都是 checkbox_bachelor_ / input_bachelor_ / select_bachelor_
  resetCheckboxes("checkbox_bachelor_");
  resetInputs("input_bachelor_");
  resetSelects("select_bachelor_");
  resetRadios("radio_highSchool_domestic_or_international");

  // Select2（根据你 collect 里用到的�?
  resetSelect2("#select_bachelor_to_school");
  resetSelect2("#select_bachelor_to_major");
  updateBachelorTargetInputs();
}

function resetMasterFormUI() {
  resetCheckboxes("checkbox_master_");
  resetInputs("input_master_");
  resetSelects("select_master_");
  resetRadios("radio_undergraduate_domestic_or_abroad");

  // Select2（根据你 collect 里用到的�?
  resetSelect2("#select_master_to_school");
  resetSelect2("#select_master_to_major");
  resetSelect2("#select_master_graduated_school");
  resetSelect2("#select_master_graduated_major");
}

// ------------------ ResetInformationCard End ------- Bachelor & Master------------------

// ------------------ Chart.js Radar (student profile) ------------------

// function hexToRGB(hex, alpha) {
//   var r = parseInt(hex.slice(1, 3), 16),
//       g = parseInt(hex.slice(3, 5), 16),
//       b = parseInt(hex.slice(5, 7), 16);

//   if (alpha) {
//     return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
//   } else {
//     return "rgb(" + r + ", " + g + ", " + b + ")";
//   }
// }


// let studentRadarChart = null;

// function initStudentRadarChart() {
//   const canvas = document.getElementById("studentRadarChart");
//   if (!canvas) return;

//   const ctx = canvas.getContext("2d");

//   // 如果 Chart.js 是全局脚本引入，模块里有时�?window.Chart 更稳
//   const ChartCtor = window.Chart || Chart;

//   studentRadarChart = new ChartCtor(ctx, {
//     type: "radar",
//     data: {
//       labels: ["学术", "语言", "课程", "综合"],
//       datasets: [
//         {
//           label: "学生画像",
//           data: [0, 0, 0, 0],
//           backgroundColor: hexToRGB("#FF5E40",0.2),
//             borderColor: hexToRGB("#FF5E40",0.2),
//         },
//       ],
//     },
//     options: {
//       responsive: true,
//       maintainAspectRatio: false,
//       scales: {
//         r: {
//           min: 0,
//           max: 100,
//           ticks: { stepSize: 20 },
//         },
//       },
//       plugins: {
//         legend: { display: true },
//         tooltip: {
//           callbacks: {
//             label: function (ctx) {
//               const v = ctx.raw;
//               return `${ctx.dataset.label}: ${v}`;
//             },
//           },
//         },
//       },
//     },
//   });
// }

// function updateStudentRadarChart(studentVector) {
//   if (!studentRadarChart) return;

//   const dims = [
//     { key: "academics", label: "学术" },
//     { key: "language", label: "语言" },
//     { key: "curriculum", label: "课程" },
//     { key: "profile", label: "综合" },
//   ];

//   const missing = [];
//   const values = dims.map((d) => {
//     const v = studentVector?.parts?.[d.key];
//     if (v === null || v === undefined) {
//       missing.push(d.label);
//       return 0;
//     }
//     return Math.round(v);
//   });

//   studentRadarChart.data.labels = dims.map((d) => d.label);
//   studentRadarChart.data.datasets[0].data = values;
//   studentRadarChart.update();

//   const hint = document.getElementById("studentRadarHint");
//   if (hint) {
//     hint.textContent = missing.length
//       ? `未填�?未提供：${missing.join("�?)}（雷达图�?0 显示）`
//       : "";
//   }
// }


$(document).on("click", "#btn-summary-reset", function () {
  resetSummaryUI();
  resetBachelorFormUI();
  resetMasterFormUI();
  $("#btn-generate-result").prop("disabled", true);
  // clear result tree if exists
  var tree = document.getElementById("result_tree");
  if (tree) tree.innerHTML = "";
  activateTab("review-tab");
});


$(document).on("click", "#btn-generate-result", function () {
  if ($(this).prop("disabled")) return;
  if (window.bootstrap) {
    var el = document.getElementById("finish-tab");
    if (el) {
      var tab = window.bootstrap.Tab.getOrCreateInstance(el);
      tab.show();
    }
  }
});
