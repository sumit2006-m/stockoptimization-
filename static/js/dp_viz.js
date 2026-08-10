document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('dp-viz-container');
  if (!container) return;

  // Data injected by template
  const DP = window.__DP_DATA__ || {};
  const dp = DP.dp_matrix || [];
  const budget = parseInt(DP.max_budget || 0, 10);
  const capacity = parseInt(DP.max_capacity || 0, 10);
  const products = DP.products || [];

  const rows = dp.length; // budgets
  const cols = dp[0] ? dp[0].length : 0; // storages

  // determine visible rows/cols: first N, ellipsis, last N
  const showRows = Math.min(10, rows);
  const showCols = Math.min(8, cols);
  const topRows = showRows;
  const bottomRows = showRows;
  const leftCols = showCols;
  const rightCols = showCols;

  const topRowIndices = Array.from({ length: topRows }, (_, i) => i);
  const bottomRowIndices = Array.from({ length: bottomRows }, (_, i) => rows - bottomRows + i).filter(i => i >= topRows);
  const leftColIndices = Array.from({ length: leftCols }, (_, i) => i);
  const rightColIndices = Array.from({ length: rightCols }, (_, i) => cols - rightCols + i).filter(i => i >= leftCols);

  // build header
  const legendHTML = `
    <div class="dp-legend">
      <span class="legend-item"><span class="cell cell-opt"></span> Optimal Path</span>
      <span class="legend-item"><span class="cell cell-updated"></span> Updated Cell</span>
      <span class="legend-item"><span class="cell cell-normal"></span> Normal Cell</span>
    </div>
  `;

  const tableWrap = document.createElement('div');
  tableWrap.className = 'dp-table-wrap';

  tableWrap.innerHTML = legendHTML;

  const table = document.createElement('table');
  table.className = 'dp-viz-table';

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.appendChild(document.createElement('th')).textContent = 'Budget / Storage';

  // left headers
  leftColIndices.forEach(c => {
    const th = document.createElement('th');
    th.textContent = c;
    headRow.appendChild(th);
  });

  // middle ellipsis
  if (leftColIndices.length && rightColIndices.length && rightColIndices[0] - leftColIndices[leftColIndices.length - 1] > 1) {
    const th = document.createElement('th');
    th.textContent = '...';
    headRow.appendChild(th);
  }

  // right headers
  rightColIndices.forEach(c => {
    const th = document.createElement('th');
    th.textContent = c;
    headRow.appendChild(th);
  });

  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  const visibleRowIndices = topRowIndices.concat(bottomRowIndices);

  // helper: find a product that explains dp[b][s]
  function findDecision(b, s) {
    for (const p of products) {
      const cost = Math.floor(parseFloat(p.purchase_cost || p.purchase_cost || 0));
      const stor = parseInt(p.storage || 0, 10);
      const profit = Math.floor(parseFloat(p.profit || 0));
      if (b - cost >= 0 && s - stor >= 0) {
        const prev = dp[b - cost][s - stor];
        if (typeof prev !== 'undefined' && (prev + profit) === dp[b][s]) {
          return p;
        }
      }
    }
    return null;
  }

  // compute optimal path by backtracking from (budget, capacity)
  function computeOptimalPath() {
    const path = new Set();
    let b = budget;
    let s = capacity;
    while (b > 0 && s > 0 && dp[b] && dp[b][s] && dp[b][s] > 0) {
      const p = findDecision(b, s);
      if (!p) break;
      path.add(b + '|' + s);
      b = b - Math.floor(parseFloat(p.purchase_cost || 0));
      s = s - parseInt(p.storage || 0, 10);
    }
    return path;
  }

  const optimalPath = computeOptimalPath();

  // compute updated cells: dp[b][s] != max(dp[b-1][s], dp[b][s-1])
  const updatedCells = new Set();
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cur = dp[i] && dp[i][j] ? dp[i][j] : 0;
      const a = i - 1 >= 0 && dp[i - 1] ? dp[i - 1][j] : 0;
      const bcell = j - 1 >= 0 && dp[i] ? dp[i][j - 1] : 0;
      const m = Math.max(a, bcell);
      if (cur > m) updatedCells.add(i + '|' + j);
    }
  }

  // build rows with animation reveal
  visibleRowIndices.forEach((rIdx, idx) => {
    const tr = document.createElement('tr');
    const tdLabel = document.createElement('td');
    tdLabel.textContent = rIdx;
    tr.appendChild(tdLabel);

    const addCells = (colsIndices) => {
      colsIndices.forEach(cIdx => {
        const td = document.createElement('td');
        const val = (dp[rIdx] && typeof dp[rIdx][cIdx] !== 'undefined') ? dp[rIdx][cIdx] : 0;
        td.textContent = val;
        td.dataset.budget = rIdx;
        td.dataset.storage = cIdx;
        td.dataset.value = val;
        const key = rIdx + '|' + cIdx;
        if (optimalPath.has(key)) td.classList.add('cell-opt');
        else if (updatedCells.has(key)) td.classList.add('cell-updated');
        else td.classList.add('cell-normal');

        // tooltip
        td.addEventListener('mouseenter', (e) => {
          const rect = td.getBoundingClientRect();
          let tooltip = document.getElementById('dp-tooltip');
          if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'dp-tooltip';
            tooltip.className = 'dp-tooltip';
            document.body.appendChild(tooltip);
          }
          const product = findDecision(rIdx, cIdx);
          tooltip.innerHTML = `<strong>Budget:</strong> ${rIdx}<br/><strong>Storage:</strong> ${cIdx}<br/><strong>DP Value:</strong> ${val}<br/><strong>Decision:</strong> ${optimalPath.has(key) ? 'Selected' : (updatedCells.has(key) ? 'Updated' : 'Skipped')}<br/><strong>Item:</strong> ${product ? product.product_name : '—'}`;
          tooltip.style.left = rect.right + 8 + 'px';
          tooltip.style.top = rect.top + 'px';
          tooltip.style.display = 'block';
        });
        td.addEventListener('mouseleave', () => {
          const tooltip = document.getElementById('dp-tooltip');
          if (tooltip) tooltip.style.display = 'none';
        });

        tr.appendChild(td);
      });
    };

    // left cells
    addCells(leftColIndices);

    // ellipsis cell
    if (leftColIndices.length && rightColIndices.length && rightColIndices[0] - leftColIndices[leftColIndices.length - 1] > 1) {
      const td = document.createElement('td');
      td.className = 'dp-ellipsis';
      td.textContent = '...';
      tr.appendChild(td);
    }

    // right cells
    addCells(rightColIndices);

    // hide rows initially for animation
    tr.style.opacity = '0';
    tbody.appendChild(tr);

    // reveal row with delay
    setTimeout(() => {
      tr.style.transition = 'opacity 300ms ease';
      tr.style.opacity = '1';
    }, 120 * idx);
  });

  table.appendChild(tbody);
  tableWrap.appendChild(table);

  // summary area
  const summary = document.createElement('div');
  summary.className = 'dp-summary';
  const optimalVal = dp[budget] && typeof dp[budget][capacity] !== 'undefined' ? dp[budget][capacity] : 0;
  summary.innerHTML = `<div class="current-max">Current Maximum Profit: <strong>${optimalVal}</strong></div>`;
  tableWrap.appendChild(summary);

  container.appendChild(tableWrap);
});
