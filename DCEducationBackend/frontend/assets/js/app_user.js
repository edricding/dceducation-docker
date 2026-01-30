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

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}${mm}${dd} - ${hh}:${mi}`;
}

function roleBadge(role) {
  const r = String(role || "").toLowerCase();
  if (r === "superadmin") return '<span class="badge text-light-danger text-upper">superadmin</span>';
  if (r === "admin") return '<span class="badge text-light-warning text-upper">admin</span>';
  return '<span class="badge text-light-primary text-upper">user</span>';
}

function statusBadge(status) {
  const s = String(status || "").toLowerCase();
  if (s === "active") return '<span class="badge text-light-success text-upper">active</span>';
  if (s === "disabled") return '<span class="badge text-light-danger text-upper">disabled</span>';
  return `<span class="badge text-light-secondary text-upper">${s || "unknown"}</span>`;
}

function renderUsers(items) {
  const $tbody = $("#user_list tbody");
  $tbody.empty();

  items.forEach((u) => {
    const statusLower = String(u.status || "").toLowerCase();
    const row = `
      <tr>
        <td>${u.username || "-"}</td>
        <td>${u.email || "-"}</td>
        <td>${roleBadge(u.role)}</td>
        <td>${statusBadge(u.status)}</td>
        <td>-</td>
        <td>-</td>
        <td>${formatDateTime(u.created_at)}</td>
        <td class="actions-col">
          <button type="button" class="btn btn-light-primary icon-btn b-r-4 toggle-status-btn" data-user-id="${u.id}" data-user-status="${statusLower}">
            <i class="ph-bold ${statusLower === "active" ? "ph-pause" : "ph-play"}"></i>
          </button>
          <button type="button" class="btn btn-light-warning icon-btn b-r-4">
            <i class="ph-bold ph-key"></i>
          </button>
          <button type="button" class="btn btn-light-danger icon-btn b-r-4 delete-btn">
            <i class="ti ti-trash"></i>
          </button>
        </td>
      </tr>
    `;
    $tbody.append(row);
  });
}

async function loadUsers() {
  const table = $("#user_list").DataTable();
  table.clear().destroy();

  try {
    const resp = await fetch("/api/v1/users");
    const data = await resp.json().catch(() => null);
    const items = data?.data || [];
    renderUsers(Array.isArray(items) ? items : []);
  } catch (e) {
    console.error(e);
    renderUsers([]);
  }

  $("#user_list").DataTable();
}

$(function () {
  loadUsers();

  // Toggle status
  $("#user_list").on("click", ".toggle-status-btn", async function () {
    var $btn = $(this);
    var id = $btn.data("user-id");
    var current = String($btn.data("user-status") || "").toLowerCase();
    var next = current === "active" ? "disabled" : "active";
    try {
      var resp = await fetch(`/api/v1/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      var data = await resp.json().catch(function () { return null; });
      if (!resp.ok) {
        showCenterToast("Update failed", "error");
        return;
      }
      $btn.data("user-status", next);
      var $icon = $btn.find('i');
      $icon.removeClass('ph-play-pause ph-play').addClass(next === "active" ? "ph-pause" : "ph-play");
      var $statusCell = $btn.closest('tr').find('td').eq(3);
      $statusCell.html(statusBadge(next));
      showCenterToast("Status updated", "success");
    } catch (e) {
      console.error(e);
      showCenterToast("Network error", "error");
    }
  });

  // Delete button (UI only)
  $("#user_list").on("click", ".delete-btn", function () {
    $(this).closest("tr").remove();
  });
});
