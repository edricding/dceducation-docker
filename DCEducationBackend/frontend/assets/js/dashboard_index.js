(function () {
  const balanceEndpoint = '/api/v1/ai/deepseek/balance';

  function setText(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
  }

  function renderBalance(data) {
    if (!data) return;
    const infos = Array.isArray(data.balance_infos) ? data.balance_infos : [];
    if (!infos.length) {
      setText('deepseek_balance_status', 'No balance data');
      return;
    }
    const info = infos[0];
    setText('deepseek_balance_currency', info.currency || '-');
    setText('deepseek_balance_total', info.total_balance || '-');
    setText('deepseek_balance_granted', info.granted_balance || '-');
    setText('deepseek_balance_topped', info.topped_up_balance || '-');
    setText('deepseek_balance_status', data.is_available ? 'Available' : 'Unavailable');
  }

  fetch(balanceEndpoint)
    .then((res) => res.json())
    .then((payload) => {
      if (!payload || !payload.ok) {
        setText('deepseek_balance_status', 'Load failed');
        return;
      }
      renderBalance(payload.data);
    })
    .catch(() => {
      setText('deepseek_balance_status', 'Load failed');
    });
})();
