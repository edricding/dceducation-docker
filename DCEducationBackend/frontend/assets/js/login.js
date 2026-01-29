// assets/js/login.js

// ====== 可按需修改：token 存储 key ======
const TOKEN_KEY = "dc_token";
const USER_KEY = "dc_user";
const REMEMBER_KEY = "dc_remember_identifier";

// ====== 统一解析后端错误信息（沿用你 httprequest.js 的风格）=====
function extractApiError(data, resp) {
  if (!data) {
    return resp?.status
      ? `请求失败（HTTP ${resp.status}）`
      : "请求失败";
  }
  return (
    data.message ||
    data.error ||
    data.msg ||
    data.detail ||
    (resp?.status ? `请求失败（HTTP ${resp.status}）` : "请求失败")
  );
}

// ====== 简单校验 ======
function validateLogin() {
  const $idErr = $("#login_identifierError");
  const $pwErr = $("#login_passwordError");
  const $err = $("#loginError");

  $idErr.text("");
  $pwErr.text("");
  $err.text("");

  const identifier = ($("#login_identifier").val() || "").trim();
  const password = $("#login_password").val() || "";

  let hasError = false;
  if (!identifier) {
    $idErr.text("请输入邮箱/用户名。");
    hasError = true;
  }
  if (!password) {
    $pwErr.text("请输入密码。");
    hasError = true;
  }

  if (hasError) return { ok: false };
  return { ok: true, values: { identifier, password } };
}

// ====== 提交登录 ======
async function submitLogin() {
  const result = validateLogin();
  if (!result.ok) return;

  const { identifier, password } = result.values;

  const $btn = $("#login_submit");
  const oldText = $btn.text();
  $btn.prop("disabled", true).text("Logging in...");

  try {
    // 这里假设你的后端登录接口是 /api/v1/auth/login
    // 如果你实际是 /api/auth/login 或别的，改这里即可
    const resp = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await resp.json().catch(() => null);

    if (!resp.ok) {
      if (resp.status === 401) {
        $("#loginError").text("用户名或密码错误，请重试。");
      } else if (resp.status === 403) {
        $("#loginError").text("账号已被禁用，请联系管理员。");
      } else if (resp.status === 423) {
        $("#loginError").text("账号已被锁定，请稍后再试。");
      } else {
        $("#loginError").text(extractApiError(data, resp));
      }
      return;
    }

    // 兼容：后端可能是 {data:{token}} 或直接 {token}
    const payload = data?.data || data;
    const token = payload?.token;

    if (!token) {
      $("#loginError").text("登录成功但未返回 token");
      return;
    }

    // 存 token
    localStorage.setItem(TOKEN_KEY, token);
    if (payload?.user) {
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
      } catch (e) {
        // ignore storage errors
      }
    }

    // 记住账号
    if ($("#rememberMe").is(":checked")) {
      localStorage.setItem(REMEMBER_KEY, identifier);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    // 跳转首页（按你实际页面改）
    window.location.href = "./dashboard_index.html";
  } catch (e) {
    $("#loginError").text("网络错误或服务器不可达。");
  } finally {
    $btn.prop("disabled", false).text(oldText);
  }
}

// ====== 页面初始化：回填记住的账号 + 绑定提交 ======
$(function () {
  const saved = localStorage.getItem(REMEMBER_KEY);
  if (saved) {
    $("#login_identifier").val(saved);
    $("#rememberMe").prop("checked", true);
  }

  $("#loginForm")
    .off("submit.login")
    .on("submit.login", function (e) {
      e.preventDefault();
      submitLogin();
    });
});
