
function initCleave(selector, options) {
  var els = document.querySelectorAll(selector);
  if (!els || !els.length) return;
  els.forEach(function (el) {
    new Cleave(el, options);
  });
}

// bachelor

initCleave(".bachelor-highSchool-gpa-input", {
  numericOnly: true,
  delimiters: ["."],
  blocks: [1, 1],
});

// IB 总分（25-45，整数）
initCleave(".bachelor-IB-input", {
  numeral: true,
  numeralThousandsGroupStyle: "none", // 不加千位逗号
  numeralDecimalScale: 0,             // 强制整数
  numeralIntegerScale: 2,             // 最多 2 位整数（10–99）
  blocks: [2],
  numericOnly: true,
});

var _ib = document.querySelector(".bachelor-IB-input");
if (_ib) _ib.addEventListener("blur", function () {
  let value = this.value.trim();
  if (value === "") return;

  let num = parseInt(value, 10);
  if (isNaN(num)) {
    this.value = "";
    return;
  }

  if (num < 25) {
    this.value = "25";
  } else if (num > 45) {
    this.value = "45";
  }
});

// AP（4分以上，整数，假设最多99）
initCleave(".bachelor-AP-input", {
  numeral: true,
  numeralThousandsGroupStyle: "none",
  numeralDecimalScale: 0,
  numeralIntegerScale: 2,
  blocks: [2],
  numericOnly: true,
});

// 雅思 Overall（0-9，支持 .5）
initCleave(".bachelor-IELTS-overall-input", {
  numericOnly: true,
  delimiters: ["."],
  blocks: [1, 1],
});

// 雅思单项（0-9，支持 .5）
document.querySelectorAll(".bachelor-IELTS-section-input").forEach((el) => {
  new Cleave(el, {
    numericOnly: true,
    delimiters: ["."],
  blocks: [1, 1],
  });
});

// 托福总分（0-120）
initCleave(".bachelor-TOEFL-total-input", {
  numeral: true,
  numeralIntegerScale: 3,
  numeralDecimalScale: 0,
});

// 托福单项（0-30）
initCleave(".bachelor-TOEFL-section-input", {
  numeral: true,
  numeralIntegerScale: 2,
  numeralDecimalScale: 0,
});

// 多邻国（10-160）
initCleave(".bachelor-DUOLINGO-input", {
  numeral: true,
  numeralIntegerScale: 3,
  numeralDecimalScale: 0,
});

// 活动/科研/获奖/实习（整数，1-999）
initCleave('.bachelor-activity-input, .bachelor-research-input, .bachelor-award-input', {
  numeral: true,
  numeralThousandsGroupStyle: 'none',
  numeralDecimalScale: 0,
  numeralPositiveOnly: true,
  numeralIntegerScale: 3,
});

// 失去焦点时强制 ≥1
document.querySelectorAll('.bachelor-activity-input, .bachelor-research-input, .bachelor-award-input').forEach(function(input) {
  input.addEventListener('blur', function() {
    let value = this.value.trim();
    if (value === '') return;

    let num = parseInt(value, 10);
    if (isNaN(num) || num < 1) {
      this.value = '1';
    }
  });
});

initCleave(".bachelor-PTE-total-input", {
  numeral: true,
  numeralIntegerScale: 2,
  numeralDecimalScale: 0,
});

initCleave(".bachelor-PTE-section-input", {
  numeral: true,
  numeralIntegerScale: 2,
  numeralDecimalScale: 0,
});



// master


// 雅思 Overall（0-9，支持 .5）
initCleave(".master-IELTS-overall-input", {
  numericOnly: true,
  delimiters: ["."],
  blocks: [1, 1],
});

// 雅思单项
document.querySelectorAll(".master-IELTS-section-input").forEach((el) => {
  new Cleave(el, {
    numericOnly: true,
    decimalScale: 1,
    decimalMark: ".",
    delimiter: "",
  });
});

// 托福总分（0-120）
initCleave(".master-TOEFL-total-input", {
  numeral: true,
  numeralIntegerScale: 3,
  numeralDecimalScale: 0,
});

// 托福单项（0-30）
initCleave(".master-TOEFL-section-input", {
  numeral: true,
  numeralIntegerScale: 2,
  numeralDecimalScale: 0,
});

// PTE 总分（10-90）
initCleave(".master-PTE-total-input", {
  numeral: true,
  numeralIntegerScale: 2,
  numeralDecimalScale: 0,
});

// PTE 单项（10-90）
initCleave(".master-PTE-section-input", {
  numeral: true,
  numeralIntegerScale: 2,
  numeralDecimalScale: 0,
});

// 多邻国（10-160）
initCleave(".master-DUOLINGO-input", {
  numeral: true,
  numeralIntegerScale: 3,
  numeralDecimalScale: 0,
});

// 活动/科研/获奖（整数，1-999）
initCleave('.master-activity-input, .master-research-input, .master-award-input', {
  numeral: true,
  numeralThousandsGroupStyle: 'none',
  numeralDecimalScale: 0,
  numeralPositiveOnly: true,
  numeralIntegerScale: 3,
});

document.querySelectorAll('.master-activity-input, .master-research-input, .master-award-input').forEach(function(input) {
  input.addEventListener('blur', function() {
    let value = this.value.trim();
    if (value === '') return;

    let num = parseInt(value, 10);
    if (isNaN(num) || num < 1) {
      this.value = '1';
    }
  });
});