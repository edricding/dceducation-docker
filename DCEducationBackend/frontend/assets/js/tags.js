
function showCenterToast(message, type) {
  if (typeof Toastify !== "function") return;
  var bg = type === "success" ? "#22c55e" : type === "error" ? "#ef4444" : "#3b82f6";
  Toastify({
    text: message,
    duration: 2500,
    gravity: "top",
    position: "center",
    close: true,
    backgroundColor: bg,
  }).showToast();
}

﻿// ==============================
// tags.js锛堣瀺鍚堢増锛?
// - 淇濈暀浣犲師鏉ョ殑锛歴elect2 鍒濆鍖?+ DataTable + delete 琛屽垹闄?
// - 鏂板锛?countrySelect -> #universitySelect 鐨?select2 ajax 鑱斿姩
// ==============================

// 浣犲師鏉ョ殑鍒濆鍖栵紙淇濈暀锛?
$(function() {
  const majorsTable = $('#majorsList').DataTable();
  let currentTagRow = null;

  function buildTagRow() {
    return (
      '<tr>' +
        '<td><input type="text" class="form-control form-control-sm tag-key" placeholder="tag_key"></td>' +
        '<td>' +
          '<select class="form-select form-select-sm tag-value">' +
            '<option value="0">0</option>' +
            '<option value="1">1</option>' +
            '<option value="2">2</option>' +
            '<option value="3">3</option>' +
          '</select>' +
        '</td>' +
        '<td class="text-end">' +
          '<button type="button" class="btn btn-light btn-sm btn-remove-tag-row"><i class="ti ti-x"></i></button>' +
        '</td>' +
      '</tr>'
    );
  }

  // ????? -> ??????????? id ????
  initCountryUniversitySelect2();

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ???????????????
  $(document).on("click", "#btn-search-programs", async function () {
    const $btn = $(this);
    const oldHtml = $btn.html();
    const countryCode = ($("#countrySelect").val() || "").trim();
    const degreeLevel = ($("#degreeSelect").val() || "all").trim();
    const universityId = $("#universitySelect").val();
    if (!universityId) {
      majorsTable.clear().draw();
      return;
    }
    try {
      $btn.prop("disabled", true).html('<i class="ti ti-loader"></i> Loading...');
      majorsTable.clear();
      majorsTable.rows.add([
        ["Loading...", "", "", "", ""],
      ]);
      majorsTable.draw();

      const items = await fetchAllPrograms({
        country_code: countryCode,
        university_id: Number(universityId),
        degree_level: degreeLevel || "all",
      });
      if (!items.length) {
        majorsTable.clear();
        majorsTable.rows.add([
          ["No data", "", "", "", ""],
        ]);
        majorsTable.draw();
      } else {
        const rows = items.map((it) => {
          const mv = it.match_view || {};
          const nameText = mv.major_name_cn || mv.major_name_en || "";
          const statusText = mv.program_tags_set_or_not ? '<span class="badge text-light-primary">已更新</span>' : '<span class="badge text-light-danger">默认</span>';
          return [
            mv.major_name_cn || "",
            mv.major_name_en || "",
            mv.degree_level || "",
            statusText,
            '<button type="button" class="btn btn-sm btn-primary set-tag-btn tag-action-btn" title="Set" aria-label="Set" data-program-id="' +
              escapeHtml(mv.program_id ?? "") +
              '" data-program-name="' +
              escapeHtml(nameText) +
              '"><i class="ti ti-pencil"></i></button>',
          ];
        });
        majorsTable.clear();
        majorsTable.rows.add(rows);
        majorsTable.draw();
      }
    } catch (e) {
      console.error(e);
      majorsTable.clear();
      majorsTable.rows.add([
        ["No data", "", "", "", ""],
      ]);
      majorsTable.draw();
    } finally {
      $btn.prop("disabled", false).html(oldHtml);
    }
  });

  
  $(document).on("click", ".set-tag-btn", async function () {
    const $btn = $(this);
    currentTagRow = $btn.closest("tr");

    const programId = $btn.data("program-id") || "";
    const programName = $btn.data("program-name") || "";

    const $form = $("#tagForm");
    if ($form.length) {
      $form[0].reset();
    }
    $("#tagProgramId").val(programId);
    $("#tagProgramName").val(programName);
    $("#reqIeltsOverallMin").val("");
    $("#reqIeltsEachMin").val("");
    $("#reqToeflMin").val("");
    $("#reqPteMin").val("");
    $("#reqDuolingoMin").val("");
    $("#reqIeltsOverallRec").val("");
    $("#reqToeflTotalRec").val("");
    $("#reqPteTotalRec").val("");
    $("#reqDuolingoTotalRec").val("");
    $("#weightAcademics").val("");
    $("#weightLanguage").val("");
    $("#weightCurriculum").val("");
    $("#weightProfile").val("");
    $("#tierValue").val("");

    try {
      const resp = await fetch(`/api/v1/programs/${programId}/meta`);
      const data = await resp.json().catch(function () { return null; });
      if (!resp.ok || !data || data.code !== 0) {
        showCenterToast("Load failed", "error");
        return;
      }
      const meta = data.data || {};
      const req = meta.requirements || {};
      const weights = meta.weights || {};
      const tags = Array.isArray(meta.tags) ? meta.tags : [];
      const keywords = Array.isArray(meta.keywords) ? meta.keywords : [];

      // requirements
      $("#reqIeltsOverallMin").val(req.ielts_overall_min ?? "");
      $("#reqIeltsEachMin").val(req.ielts_each_min ?? "");
      $("#reqToeflMin").val(req.toefl_min ?? "");
      $("#reqPteMin").val(req.pte_min ?? "");
      $("#reqDuolingoMin").val(req.duolingo_min ?? "");
      $("#reqIeltsOverallRec").val(req.ielts_overall_rec ?? "");
      $("#reqToeflTotalRec").val(req.toefl_rec ?? "");
      $("#reqPteTotalRec").val(req.pte_rec ?? "");
      $("#reqDuolingoTotalRec").val(req.duolingo_rec ?? "");

      // weights
      $("#weightAcademics").val(weights.academics_weight ?? "");
      $("#weightLanguage").val(weights.language_weight ?? "");
      $("#weightCurriculum").val(weights.curriculum_weight ?? "");
      $("#weightProfile").val(weights.profile_weight ?? "");

      // tier (from keywords tier if exists)
      if (keywords.length) {
        $("#tierValue").val(keywords[0].tier ?? "");
      }

      // tags selection
      const selected = new Set();
      tags.forEach(function (t) {
        if (t.tag_key) selected.add(t.tag_key);
        if (t.tag_high_gpa_bar && Number(t.tag_high_gpa_bar) > 0) selected.add("tag_high_gpa_bar");
        if (t.tag_high_language_bar && Number(t.tag_high_language_bar) > 0) selected.add("tag_high_language_bar");
        if (t.tag_high_curriculum_bar && Number(t.tag_high_curriculum_bar) > 0) selected.add("tag_high_curriculum_bar");
        if (t.tag_research_plus && Number(t.tag_research_plus) > 0) selected.add("tag_research_plus");
        if (t.tag_stem && Number(t.tag_stem) > 0) selected.add("tag_stem");
      });

      const modalEl = document.getElementById("tagModal");
      if (modalEl && window.bootstrap) {
        const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
      }

      // apply selection (after modal shown)
      setTimeout(function () {
        const $select = $("#tagMultiSelect");
        if ($select.length) {
          $select.val(Array.from(selected));
          $select.trigger("change");
        }
      }, 0);
    } catch (e) {
      console.error(e);
      showCenterToast("Network error", "error");
    }
  });


  function initTagMultiSelect() {
    const $select = $("#tagMultiSelect");
    if ($select.length === 0 || typeof $select.select2 !== "function") return;
    if ($select.hasClass("select2-hidden-accessible")) {
      $select.select2("destroy");
    }
    $select.select2({
      width: "100%",
      placeholder: $select.data("placeholder") || "请选择",
      allowClear: true,
      dropdownParent: $("#tagModal")
    });
  }

  $(document).on("shown.bs.modal", "#tagModal", function () {
    initTagMultiSelect();
  });

  $(document).on("click", "#btn-add-tag-row", function () {
    $("#tagRows").append(buildTagRow());
  });

  $(document).on("click", ".btn-remove-tag-row", function () {
    const $rows = $("#tagRows");
    if ($rows.children().length <= 1) return;
    $(this).closest("tr").remove();
  });

  $(document).on("click", "#btn-save-tags", function () {
    if (currentTagRow) {
      currentTagRow.find("td").eq(2).text("已设置");
    }
    const modalEl = document.getElementById("tagModal");
    if (modalEl && window.bootstrap) {
      const modal = window.bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }
  });
});

/* Formatting function for row details - modify as you need */
function format ( d ) {
  // `d` is the original data object for the row
  return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
    '<tr>'+
      '<td>Full name:</td>'+
      '<td>'+d.name+'</td>'+
    '</tr>'+
    '<tr>'+
      '<td>Extension number:</td>'+
      '<td>'+d.extn+'</td>'+
    '</tr>'+
    '<tr>'+
      '<td>Extra info:</td>'+
      '<td>And any further details here (images etc)...</td>'+
    '</tr>'+
  '</table>';
}

// Delete button removed per request


// ==============================
// 鉁?鏂板锛氬浗瀹?-> 瀛︽牎 select2 鑱斿姩
// 渚濊禆锛氶〉闈㈡湁 #countrySelect 鍜?#universitySelect
// 鍚庣鎺ュ彛锛?
// - POST /api/v1/universities/search  { country_code, q, page, size }
// ==============================
function initCountryUniversitySelect2() {
  const $country = $("#countrySelect");
  const $university = $("#universitySelect");

  // 椤甸潰娌℃湁杩欎袱涓?select 灏变笉鍋氳仈鍔紙閬垮厤褰卞搷浣犲叾瀹冮〉闈級
  if ($country.length === 0 || $university.length === 0) return;
  const API = ""; // 同域用相对路径；跨域可填 "http://db.dceducation.com.cn"

  function normalizePaged(resp) {
    // 鍏煎锛歿code,message,data:{page,size,total,items}}
    const data = resp && resp.data ? resp.data : resp;
    const items = (data && data.items) ? data.items : [];
    const total = (data && typeof data.total === "number") ? data.total : items.length;
    return { items, total };
  }

  function safeDestroySelect2($el) {
    if ($el.hasClass("select2-hidden-accessible")) {
      $el.select2("destroy");
    }
  }

  function initUniversitySelect(countryCode) {
    // 閲嶇疆瀛︽牎涓嬫媺
    safeDestroySelect2($university);
    $university.empty();
    $university.val(null).trigger("change");

    if (!countryCode) {
      $university.prop("disabled", true);
      return;
    }

    $university.prop("disabled", false);

    $university.select2({
      width: "100%",
      placeholder: "请选择学校",
      allowClear: true,
      minimumInputLength: 1,
      ajax: {
        dataType: "json",
        delay: 250,
        transport: function (params, success, failure) {
          return $.ajax({
            url: API + "/api/v1/universities/search",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
              country_code: countryCode,
              q: params.data?.term || "",
              page: params.data?.page || 1,
              size: 20,
            }),
            success: success,
            error: failure,
          });
        },
        processResults: function (resp, params) {
          params.page = params.page || 1;
          const { items, total } = normalizePaged(resp);

          const results = items.map(it => ({
            id: it.id,
            text: it.name_cn
          }));

          const hasMore = (params.page * 20) < total;

          return {
            results,
            pagination: { more: hasMore }
          };
        }
      }
    });
  }

  // 选择国家后：启用并初始化学校下拉
  $country.on("change", function () {
    const countryCode = $(this).val();
    $university.val(null).trigger("change");
    initUniversitySelect(countryCode);
  });

  // 鍒濆锛氬鏍＄鐢?
  initUniversitySelect(null);
}

async function fetchAllPrograms({ country_code, university_id, degree_level }) {
  const all = [];
  let page = 1;
  const size = 100;
  const level = (degree_level || "all").trim() || "all";
  while (true) {
    const resp = await fetch("/api/v1/programs/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        country_code: country_code || "",
        university_ids: [university_id],
        degree_level: level,
        q: "",
        page,
        size,
      }),
    });
    const data = await resp.json().catch(() => null);
    if (!resp.ok || !data) {
      throw new Error("programs search failed");
    }
    const payload = data.data || data;
    const items = payload.items || [];
    const total = typeof payload.total === "number" ? payload.total : items.length;
    all.push(...items);
    if (all.length >= total || items.length === 0) break;
    page += 1;
  }
  return all;
}

