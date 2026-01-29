// ---------basic tree start---- //
$("#result_tree").jstree({
  core: {
    themes: {
      variant: "large",
    },
    data: [
      {
        text: "美国",
        icon: "fa fa-flag text-warning",
        state: {
          selected: false,
        },
        type: "demo",
        children: [
          {
            text: "加州大学洛杉矶分校UCLA - QS TOP46 - USNEWS TOP13",
            icon: "fa fa-book text-warning",
            state: {
              selected: true,
            },
            a_attr: {
              "data-bs-toggle": "modal",
              "data-bs-target": "#ModalAnalysisResult",
            },
            // "a_attr": {
            //     "class": "a-style"
            // },
            children: [
              {
                text: "计算机科学 - Computer Science",
                icon: "fa fa-chevron-right text-light",
                state: {
                  selected: true,
                },
                a_attr: {
                  "data-bs-toggle": "modal",
                  "data-bs-target": "#ModalAnalysisResult",
                },
              },
            ],
          },
          {
            text: "华盛顿大学UW - QS TOP81 - USNEWS TOP8",
            icon: "fa fa-book text-warning",
            state: {
              selected: true,
            },
            a_attr: {
              "data-bs-toggle": "modal",
              "data-bs-target": "#ModalAnalysisResult",
            },
            children: [
              {
                text: "计算机科学 - Computer Science",
                icon: "fa fa-chevron-right text-light",
                state: {
                  selected: true,
                },
                a_attr: {
                  "data-bs-toggle": "modal",
                  "data-bs-target": "#ModalAnalysisResult",
                },
              },
            ],
          },
        ],
      },
      {
        text: "英国",
        icon: "fa fa-flag text-warning",
        state: {
          selected: false,
        },
        type: "demo",
        children: [
          {
            text: "伦敦大学学院UCL - QS TOP9",
            icon: "fa fa-book text-warning",
            state: {
              selected: true,
            },
            a_attr: {
              "data-bs-toggle": "modal",
              "data-bs-target": "#ModalAnalysisResult",
            },
            children: [
              {
                text: "计算机科学 - Computer Science",
                icon: "fa fa-chevron-right text-light",
                state: {
                  selected: true,
                },
                a_attr: {
                  "data-bs-toggle": "modal",
                  "data-bs-target": "#ModalAnalysisResult",
                },
              },
            ],
          },
        ],
      },
      {
        text: "澳大利亚",
        icon: "fa fa-flag text-warning",
        state: {
          selected: false,
        },
        type: "demo",
        children: [
          {
            text: "墨尔本大学 - QS TOP19",
            icon: "fa fa-book text-warning",
            state: {
              selected: true,
            },
            a_attr: {
              "data-bs-toggle": "modal",
              "data-bs-target": "#ModalAnalysisResult",
            },
            children: [
              {
                text: "计算机科学 - Computer Science",
                icon: "fa fa-chevron-right text-light",
                state: {
                  selected: true,
                },
                a_attr: {
                  "data-bs-toggle": "modal",
                  "data-bs-target": "#ModalAnalysisResult",
                },
              },
            ],
          },
        ],
      },
    ],
  },
});
// -----end basic tree-------- //
