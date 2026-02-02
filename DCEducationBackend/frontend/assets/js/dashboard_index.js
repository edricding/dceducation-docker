(function () {
  const balanceEndpoint = '/api/v1/ai/deepseek/balance';
  const statsEndpoint = '/api/v1/stats/overview';
  const usersEndpoint = '/api/v1/users';

  function initRecentOrdersTable() {
    if (!window.jQuery || !jQuery.fn || !jQuery.fn.DataTable) {
      return;
    }
    const table = jQuery('#recentOrders');
    if (!table.length || jQuery.fn.DataTable.isDataTable('#recentOrders')) {
      return;
    }
    table.DataTable({
      paging: true,
      searching: false,
      info: false,
      ordering: false,
      pageLength: 5,
      lengthChange: false,
      language: {
        emptyTable: 'No data available',
        paginate: {
          previous: 'Prev',
          next: 'Next',
        },
      },
    });
  }

  function initUsersTable() {
    if (!window.jQuery || !jQuery.fn || !jQuery.fn.DataTable) {
      return;
    }
    const table = jQuery('#data_index_get_user');
    if (!table.length || jQuery.fn.DataTable.isDataTable('#data_index_get_user')) {
      return;
    }
    table.DataTable({
      paging: true,
      searching: false,
      info: false,
      ordering: false,
      pageLength: 5,
      lengthChange: false,
      language: {
        emptyTable: 'No data available',
        paginate: {
          previous: 'Prev',
          next: 'Next',
        },
      },
    });
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function statusBadge(status) {
    const normalized = String(status ?? '').toLowerCase();
    const isActive = normalized === 'active';
    const badgeClass = isActive ? 'text-light-success' : 'text-light-danger';
    const label = normalized || '-';
    return `<span class="badge ${badgeClass} text-upper">${escapeHtml(label)}</span>`;
  }

  function roleBadge(role) {
    const normalized = String(role ?? '').toLowerCase();
    let badgeClass = 'text-light-primary';
    if (normalized === 'superadmin') {
      badgeClass = 'text-light-danger';
    } else if (normalized === 'admin') {
      badgeClass = 'text-light-warning';
    }
    const label = normalized || '-';
    return `<span class="badge ${badgeClass} text-upper">${escapeHtml(label)}</span>`;
  }

  function renderUsers(items) {
    const tbody = document.querySelector('#data_index_get_user tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!Array.isArray(items) || items.length === 0) {
      return;
    }
    const rows = items.map((item, index) => {
      const rowClass = index % 2 === 0 ? 'odd' : 'even';
      const username = escapeHtml(item?.username ?? '-');
      const email = escapeHtml(item?.email ?? '-');
      const role = roleBadge(item?.role);
      const status = statusBadge(item?.status);
      const createdAt = escapeHtml(item?.created_at ? String(item.created_at) : '-');
      return `
        <tr class="${rowClass}">
          <td>${username}</td>
          <td>${email}</td>
          <td>${role}</td>
          <td>${status}</td>
          <td>${createdAt}</td>
        </tr>
      `;
    });
    tbody.innerHTML = rows.join('');
  }

  function renderBalance(data) {
    if (!data) {
      setText('deepseek_balance_total', 'Unavailable');
      setText('deepseek_balance_status', 'Unavailable');
      setText('deepseek_balance_currency', '-');
      return;
    }
    const status = data.is_available ? 'Available' : 'Unavailable';
    const firstInfo = Array.isArray(data.balance_infos) && data.balance_infos.length > 0 ? data.balance_infos[0] : null;
    setText('deepseek_balance_total', String(firstInfo?.total_balance ?? '-'));
    setText('deepseek_balance_status', status);
    setText('deepseek_balance_currency', String(firstInfo?.currency ?? '-'));
  }

  function renderStats(data) {
    if (!data) return;
    setText('data_universities_uk', String(data.universities_uk ?? '-'));
    setText('data_universities_au', String(data.universities_au ?? '-'));
    setText('data_universities_hk', String(data.universities_hk ?? '-'));
    setText('data_universities_sg', String(data.universities_sg ?? '-'));
    setText('data_programs_total', String(data.programs_total ?? '-'));
  }

  fetch(balanceEndpoint)
    .then((res) => res.json())
    .then((payload) => {
      if (!payload || !payload.ok) {
        renderBalance(null);
        return;
      }
      renderBalance(payload.data);
    })
    .catch(() => {
      renderBalance(null);
    });

  fetch(statsEndpoint)
    .then((res) => res.json())
    .then((payload) => {
      if (!payload || !payload.ok) {
        renderStats(null);
        return;
      }
      renderStats(payload.data);
    })
    .catch(() => {
      renderStats(null);
    });

  fetch(usersEndpoint)
    .then((res) => res.json())
    .then((payload) => {
      if (!payload || payload.code !== 0) {
        renderUsers([]);
        return;
      }
      renderUsers(payload.data);
      initUsersTable();
    })
    .catch(() => {
      renderUsers([]);
    });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initRecentOrdersTable();
      initUsersTable();
    });
  } else {
    initRecentOrdersTable();
    initUsersTable();
  }
})();
