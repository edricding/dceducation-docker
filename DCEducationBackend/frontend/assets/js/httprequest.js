function validateAddUser() {
  // 错误容器
  const usernameError = $("#add_usernameError");
  const emailError = $("#add_emailError");
  const passwordError = $("#add_passwordError");
  const confirmPasswordError = $("#add_confirm_passwordError");
  const roleError = $("#add_roleError");

  // 清空所有错误
  usernameError.text("");
  emailError.text("");
  passwordError.text("");
  confirmPasswordError.text("");
  roleError.text("");

  // 取值
  const username = ($("#add_username").val() || "").trim();
  const email = ($("#add_email").val() || "").trim();
  const password = $("#add_password").val() || "";
  const confirmPassword = $("#add_confirm_password").val() || "";
  const role = (($("#add_role").val() || "user") + "").trim() || "user";

  // 正则（按需调整）
  const usernameRegex = /^[A-Za-z0-9_]{3,50}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const passwordLengthRegex = /^.{8,72}$/;
  const passwordHasLetter = /[A-Za-z]/;
  const passwordHasNumber = /[0-9]/;

  let hasError = false;

  // username
  if (!usernameRegex.test(username)) {
    usernameError.text("用户名需 3-50 位，只能包含字母/数字/下划线。");
    hasError = true;
  }

  // email
  if (!emailRegex.test(email)) {
    emailError.text("邮箱格式不正确。");
    hasError = true;
  }

  // password
  if (!passwordLengthRegex.test(password)) {
    passwordError.text("密码长度需 8-72 位。");
    hasError = true;
  } else {
    // 可选：强度要求（至少字母+数字）
    if (!passwordHasLetter.test(password) || !passwordHasNumber.test(password)) {
      passwordError.text("密码需至少包含 1 个字母和 1 个数字。");
      hasError = true;
    }
  }

  // confirm password
  if (confirmPassword !== password) {
    confirmPasswordError.text("两次输入的密码不一致。");
    hasError = true;
  }

  // role
  if (!["user", "admin", "superadmin"].includes(role)) {
    roleError.text("权限选择不合法。");
    hasError = true;
  }

  if (hasError) return { ok: false };

  return {
    ok: true,
    values: { username, email, password, role },
  };
}

// 统一解析后端错误信息（兼容 message / error / msg 等）
function extractApiError(data, resp) {
  if (!data) return resp?.status ? `请求失败（HTTP ${resp.status}）` : "请求失败";
  return (
    data.message ||
    data.error ||
    data.msg ||
    data.detail ||
    (resp?.status ? `请求失败（HTTP ${resp.status}）` : "请求失败")
  );
}

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


// ====== 提交逻辑 ======
async function submitAddUser() {
  const result = validateAddUser();
  if (!result.ok) return; // ❌ 校验不通过：直接停止

  const { username, email, password, role } = result.values;

  // ✅ 按你后端接口 /api/v1/users 的 Request Body 组装
  // permission_level：你说默认 1，这里如果不传就会用默认；
  // 如果你仍想跟 role 联动，就保留这段映射（否则删掉 permission_level 字段即可）
  const permission_level =
    role === "superadmin" ? 100 : role === "admin" ? 50 : 1;

  const payload = {
    username,
    email,
    password, // 明文，后端 bcrypt -> password_hash
    role,
    permission_level,
  };

  // ✅ 本地存储（可选）
  try {
    localStorage.setItem("add_user_payload", JSON.stringify(payload));
  } catch (e) {
    console.warn("localStorage 保存失败：", e);
  }

  const $btn = $("#add_submit");
  const oldText = $btn.text();
  $btn.prop("disabled", true).text("Submitting...");

  try {
    // ✅ 改成你的新接口
    const resp = await fetch("/api/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await resp.json().catch(() => null);

    if (!resp.ok) {
      const msg = extractApiError(data, resp);

      // 你后端常见：message="username or email already exists"
      // 这里做一个友好提示：尽量把错误落到对应字段上
      if (String(msg).toLowerCase().includes("already exists")) {
        $("#add_usernameError").text("用户名或邮箱已存在。");
        $("#add_emailError").text("用户名或邮箱已存在。");
      } else {
        // 兜底：直接弹出或打印
        console.log(msg);
      }
      showCenterToast("Failed to create user", "error");
      return;
    }

    // ✅ 成功：你说统一格式 + data(CreateUserResponse)
    // 兼容：后端可能是 {data:{...}} 或直接 {...}
    const u = data?.data || data;

    showCenterToast("User created successfully", "success");

    // clear all inputs after success
    $("#add_username").val("");
    $("#add_email").val("");
    $("#add_password").val("");
    $("#add_confirm_password").val("");
    $("#add_role").prop("selectedIndex", 0);
    $("#add_permission").prop("selectedIndex", 0);
    $("#add_usernameError, #add_emailError, #add_passwordError, #add_confirm_passwordError, #add_roleError").text("");


    console.log("创建成功：", {
      id: u?.id,
      username: u?.username,
      email: u?.email,
      role: u?.role,
      permission_level: u?.permission_level,
      status: u?.status,
      created_at: u?.created_at,
    });

    // 可选：清空密码框
    $("#add_password").val("");
    $("#add_confirm_password").val("");
  } catch (err) {
    console.error(err);
    showCenterToast("Network error. Please try again.", "error");
    console.log("网络错误或服务器不可达");
  } finally {
    $btn.prop("disabled", false).text(oldText);
  }
}

// ====== 绑定事件（只绑定一次） ======
$(function () {
  $("#add_submit")
    .off("click.addUser")
    .on("click.addUser", function (event) {
      event.preventDefault();
      submitAddUser();
    });
});
