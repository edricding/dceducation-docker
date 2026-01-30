// assets/js/app_tags_students.js

const STUDENT_TAGS_ENDPOINT = "/api/v1/student-tags";


function showCenterToast(message, type) {
  if (typeof Toastify === "undefined") return;
  let bg = "rgb(var(--primary),1)";
  if (type === "success") bg = "rgb(var(--success),1)";
  if (type === "error") bg = "rgb(var(--danger),1)";
  Toastify({
    text: message,
    duration: 2500,
    gravity: "centerToast",
    position: "center",
    style: { background: bg }
  }).showToast();
}

function getToken() {
  return localStorage.getItem("dc_token") || "";
}

function toNumberOrNull(v, isFloat) {
  const t = String(v || "").trim();
  if (!t) return null;
  const n = isFloat ? parseFloat(t) : parseInt(t, 10);
  return Number.isFinite(n) ? n : null;
}

function setVal(id, value) {
  const $el = $(id);
  if (!$el.length) return;
  if (value === null || value === undefined) {
    $el.val("");
  } else {
    $el.val(String(value));
  }
}

function fillStudentTags(data) {
  if (!data) return;

  setVal("#select_high_gpa_0", data.high_gpa_operator);
  setVal("#select_high_gpa_1", data.high_gpa_value);

  setVal("#select_high_language_ielts_0", data.high_language_ielts_operator);
  setVal("#select_high_language_ielts_1", data.high_language_ielts_value);

  setVal("#select_high_language_toefl_0", data.high_language_toefl_operator);
  setVal("#select_high_language_toefl_1", data.high_language_toefl_value);

  setVal("#select_high_language_pte_0", data.high_language_pte_operator);
  setVal("#select_high_language_pte_1", data.high_language_pte_value);

  setVal("#select_high_language_duolingo_0", data.high_language_duolingo_operator);
  setVal("#select_high_language_duolingo_1", data.high_language_duolingo_value);

  setVal("#select_strong_curriculum_alevel_0", data.strong_curriculum_alevel_operator);
  setVal("#select_strong_curriculum_alevel_1", data.strong_curriculum_alevel_value);

  setVal("#select_strong_curriculum_ib_0", data.strong_curriculum_ib_operator);
  setVal("#select_strong_curriculum_ib_1", data.strong_curriculum_ib_value);

  setVal("#select_strong_curriculum_ap_0", data.strong_curriculum_ap_operator);
  setVal("#select_strong_curriculum_ap_1", data.strong_curriculum_ap_value);

  setVal("#select_strong_profile_00", data.strong_profile_options);
  setVal("#select_strong_profile_0", data.strong_profile_options_operator);
  setVal("#select_strong_profile_1", data.strong_profile_options_value);
}

function collectStudentTags() {
  return {
    high_gpa_operator: $("#select_high_gpa_0").val() || null,
    high_gpa_value: toNumberOrNull($("#select_high_gpa_1").val(), true),

    high_language_ielts_operator: $("#select_high_language_ielts_0").val() || null,
    high_language_ielts_value: toNumberOrNull($("#select_high_language_ielts_1").val(), true),

    high_language_toefl_operator: $("#select_high_language_toefl_0").val() || null,
    high_language_toefl_value: toNumberOrNull($("#select_high_language_toefl_1").val(), false),

    high_language_pte_operator: $("#select_high_language_pte_0").val() || null,
    high_language_pte_value: toNumberOrNull($("#select_high_language_pte_1").val(), false),

    high_language_duolingo_operator: $("#select_high_language_duolingo_0").val() || null,
    high_language_duolingo_value: toNumberOrNull($("#select_high_language_duolingo_1").val(), false),

    strong_curriculum_alevel_operator: $("#select_strong_curriculum_alevel_0").val() || null,
    strong_curriculum_alevel_value: $("#select_strong_curriculum_alevel_1").val() || null,

    strong_curriculum_ib_operator: $("#select_strong_curriculum_ib_0").val() || null,
    strong_curriculum_ib_value: toNumberOrNull($("#select_strong_curriculum_ib_1").val(), false),

    strong_curriculum_ap_operator: $("#select_strong_curriculum_ap_0").val() || null,
    strong_curriculum_ap_value: toNumberOrNull($("#select_strong_curriculum_ap_1").val(), false),

    strong_profile_options: $("#select_strong_profile_00").val() || null,
    strong_profile_options_operator: $("#select_strong_profile_0").val() || null,
    strong_profile_options_value: toNumberOrNull($("#select_strong_profile_1").val(), false),
  };
}

async function fetchStudentTags() {
  const token = getToken();
  const resp = await fetch(STUDENT_TAGS_ENDPOINT, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await resp.json().catch(() => null);
  if (!resp.ok || !data) return null;
  return data.data || null;
}

async function saveStudentTags() {
  const payload = collectStudentTags();
  const token = getToken();

  const resp = await fetch(STUDENT_TAGS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await resp.json().catch(() => null);
  if (!resp.ok) {
    const msg = data?.message || "Save failed";
    showCenterToast(msg, "error");
    return null;
  }

  return data?.data || null;
}

$(function () {
  fetchStudentTags().then((data) => {
    if (data) fillStudentTags(data);
  });

  $("#btn-tags-students-update").on("click", async function () {
    const $btn = $(this);
    const old = $btn.html();
    $btn.prop("disabled", true).html("Updating...");
    const saved = await saveStudentTags();
    if (saved) {
      fillStudentTags(saved);
      showCenterToast("Updated successfully", "success");
    }
    $btn.prop("disabled", false).html(old);
  });
});



