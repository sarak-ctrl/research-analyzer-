// ============================================================
//  ResearchLab — app.js
//  100% local. Pure math + Chart.js figures. No AI. No server.
// ============================================================

var paperSections = { quantitative: '', qualitative: '' };
var questionCount = 0;
var likertCount   = 0;
var demoCount     = 0;
var responseCount = 0;
var chartInstances = [];
var qlChartInstances = [];
var figureCounter = 0;

// ── Beautiful color palettes ──
var PALETTES = {
  blackwhite: ['#000000','#444444','#777777','#aaaaaa','#cccccc','#e8e8e8','#111111','#555555','#999999','#dddddd'],
  classic:    ['#003f88','#0077b6','#00b4d8','#90e0ef','#caf0f8','#023e8a','#48cae4','#ade8f4','#0096c7','#0077b6'],
  warm:       ['#c1121f','#e85d04','#f48c06','#faa307','#ffba08','#dc2f02','#e85d04','#f48c06','#faa307','#ffba08'],
  cool:       ['#1b4332','#2d6a4f','#40916c','#52b788','#74c69d','#95d5b2','#b7e4c7','#d8f3dc','#1b4332','#2d6a4f'],
  pastel:     ['#ffadad','#ffd6a5','#fdffb6','#caffbf','#9bf6ff','#a0c4ff','#bdb2ff','#ffc6ff','#ffadad','#ffd6a5'],
  bold:       ['#e63946','#2a9d8f','#e9c46a','#264653','#f4a261','#023047','#8ecae6','#219ebc','#fb8500','#ffb703']
};
var PALETTE_MAIN   = PALETTES.blackwhite;
var PALETTE_LIKERT = PALETTES.blackwhite.slice(0, 5);
var PALETTE_DEMO   = PALETTES.blackwhite.slice(0, 6);
var customColors   = ['#000000','#444444','#777777','#aaaaaa','#cccccc','#333333'];
var customColorCount = 6;

// ============================================================
//  TAB SWITCHING
// ============================================================
function switchTab(name) {
  document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
  var btn = document.querySelector('.tab[onclick="switchTab(\'' + name + '\')"]');
  if (btn) btn.classList.add('active');
  var panel = document.getElementById('panel-' + name);
  if (panel) panel.classList.add('active');
}

function toggleLikertCard() {
  var v = document.getElementById('q-scale').value;
  document.getElementById('likert-card').style.display =
    (v === 'likert' || v === 'frequency') ? 'block' : 'none';
}

// ============================================================
//  DYNAMIC BUILDERS
// ============================================================
function addDemographic() {
  demoCount++;
  var id = demoCount;
  var div = document.createElement('div');
  div.className = 'demo-item';
  div.id = 'demo-' + id;
  div.innerHTML =
    '<div class="item-header">' +
      '<span class="item-label">DEMOGRAPHIC ' + id + '</span>' +
      '<button class="remove-btn" onclick="removeEl(\'demo-' + id + '\')">✕</button>' +
    '</div>' +
    '<div class="chart-type-row">' +
      '<label>Chart Type:</label>' +
      '<select id="d' + id + '-charttype">' +
        '<option value="pie">Pie Chart</option>' +
        '<option value="doughnut">Doughnut Chart</option>' +
        '<option value="bar">Bar Chart</option>' +
      '</select>' +
    '</div>' +
    '<label>Category Name (e.g., Sex, Age Group, Year Level)</label>' +
    '<input type="text" id="d' + id + '-cat" placeholder="e.g., Sex" />' +
    '<label>Groups &amp; Counts</label>' +
    '<div id="d' + id + '-opts">' +
      makeOptRow() + makeOptRow() +
    '</div>' +
    '<button class="add-option-btn" onclick="addOptRow(\'d' + id + '-opts\')">+ Add Group</button>';
  document.getElementById('demo-container').appendChild(div);
}

function addQuestion() {
  questionCount++;
  var id = questionCount;
  var div = document.createElement('div');
  div.className = 'question-item';
  div.id = 'question-' + id;
  div.innerHTML =
    '<div class="item-header">' +
      '<span class="item-label">QUESTION ' + id + '</span>' +
      '<button class="remove-btn" onclick="removeEl(\'question-' + id + '\')">✕</button>' +
    '</div>' +
    '<div class="chart-type-row">' +
      '<label>Chart Type:</label>' +
      '<select id="q' + id + '-charttype">' +
        '<option value="bar">Bar Chart</option>' +
        '<option value="pie">Pie Chart</option>' +
        '<option value="doughnut">Doughnut Chart</option>' +
        '<option value="horizontalBar">Horizontal Bar</option>' +
      '</select>' +
    '</div>' +
    '<label>Question Text</label>' +
    '<input type="text" id="q' + id + '-text" placeholder="e.g., Are you aware of mental health services in your school?" />' +
    '<label>Answer Options &amp; Response Counts</label>' +
    '<div id="q' + id + '-opts">' +
      makeOptRow() + makeOptRow() +
    '</div>' +
    '<button class="add-option-btn" onclick="addOptRow(\'q' + id + '-opts\')">+ Add Option</button>';
  document.getElementById('q-questions-container').appendChild(div);
}

function addLikertItem() {
  likertCount++;
  var id    = likertCount;
  var scale = document.getElementById('q-scale').value;
  var ratings = scale === 'frequency'
    ? ['Always','Often','Sometimes','Never']
    : ['Strongly Agree','Agree','Neutral','Disagree','Strongly Disagree'];

  var rowsHTML = '';
  for (var i = 0; i < ratings.length; i++) {
    rowsHTML +=
      '<div class="option-row">' +
        '<input type="text" value="' + ratings[i] + '" />' +
        '<input type="number" placeholder="Count" min="0" />' +
        '<button class="remove-btn" onclick="this.parentElement.remove()">✕</button>' +
      '</div>';
  }
  var div = document.createElement('div');
  div.className = 'likert-item';
  div.id = 'likert-' + id;
  div.innerHTML =
    '<div class="item-header">' +
      '<span class="item-label">STATEMENT ' + id + '</span>' +
      '<button class="remove-btn" onclick="removeEl(\'likert-' + id + '\')">✕</button>' +
    '</div>' +
    '<label>Statement Text</label>' +
    '<input type="text" id="l' + id + '-text" placeholder="e.g., I feel supported by my teachers." />' +
    '<label>Ratings &amp; Response Counts</label>' +
    '<div id="l' + id + '-opts">' + rowsHTML + '</div>' +
    '<button class="add-option-btn" onclick="addOptRow(\'l' + id + '-opts\')">+ Add Rating</button>';
  document.getElementById('likert-container').appendChild(div);
}

function addResponse() {
  responseCount++;
  var id = responseCount;
  var div = document.createElement('div');
  div.className = 'response-item';
  div.id = 'response-' + id;
  div.innerHTML =
    '<div class="item-header">' +
      '<span class="item-label">PARTICIPANT ' + id + '</span>' +
      '<button class="remove-btn" onclick="removeEl(\'response-' + id + '\')">✕</button>' +
    '</div>' +
    '<div class="row">' +
      '<div><label>Label (e.g., P' + id + ' or pseudonym)</label>' +
        '<input type="text" id="r' + id + '-label" value="P' + id + '" /></div>' +
      '<div><label>Topic / Question (optional)</label>' +
        '<input type="text" id="r' + id + '-topic" placeholder="e.g., Challenges faced" /></div>' +
    '</div>' +
    '<label>Participant\'s Response / Statement</label>' +
    '<textarea id="r' + id + '-text" placeholder="Paste or type the participant\'s response here..."></textarea>';
  document.getElementById('ql-responses-container').appendChild(div);
}

function makeOptRow() {
  return '<div class="option-row">' +
    '<input type="text" placeholder="Option (e.g., Yes)" />' +
    '<input type="number" placeholder="Count" min="0" />' +
    '<button class="remove-btn" onclick="this.parentElement.remove()">✕</button>' +
  '</div>';
}

function addOptRow(containerId) {
  var c = document.getElementById(containerId);
  var d = document.createElement('div');
  d.className = 'option-row';
  d.innerHTML =
    '<input type="text" placeholder="Option" />' +
    '<input type="number" placeholder="Count" min="0" />' +
    '<button class="remove-btn" onclick="this.parentElement.remove()">✕</button>';
  c.appendChild(d);
}

function removeEl(id) {
  var el = typeof id === 'string' ? document.getElementById(id) : id;
  if (el) el.remove();
}

// ============================================================
//  DATA COLLECTION HELPERS
// ============================================================
function collectOpts(containerEl) {
  var opts = [];
  containerEl.querySelectorAll('.option-row').forEach(function(row) {
    var inputs = row.querySelectorAll('input');
    var lbl = '', cnt = 0;
    inputs.forEach(function(inp) {
      if (inp.type === 'text')   lbl = inp.value.trim();
      if (inp.type === 'number') cnt = parseInt(inp.value) || 0;
    });
    if (lbl) opts.push({ label: lbl, count: cnt });
  });
  return opts;
}

function pct(count, total) {
  if (!total) return '0.00';
  return ((count / total) * 100).toFixed(2);
}

function getVal(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function rep(ch, n) {
  var s = ''; for (var i = 0; i < n; i++) s += ch; return s;
}

// ============================================================
//  CHART CREATION ENGINE
// ============================================================
function destroyCharts(arr) {
  arr.forEach(function(c) { try { c.destroy(); } catch(e){} });
  arr.length = 0;
}

function makeChartCard(figNum, title, caption) {
  var canvasId = 'chart-canvas-' + figNum;
  var card = document.createElement('div');
  card.className = 'chart-card';
  card.innerHTML =
    '<div class="chart-card-header">' +
      '<span class="chart-figure-label">Figure ' + figNum + '</span>' +
      '<button class="download-chart-btn" onclick="downloadChart(\'' + canvasId + '\', \'Figure_' + figNum + '\')">⬇ Save PNG</button>' +
    '</div>' +
    '<div class="chart-title">' + title + '</div>' +
    '<div class="chart-canvas-wrap"><canvas id="' + canvasId + '"></canvas></div>' +
    '<div class="chart-caption">Figure ' + figNum + '. ' + caption + '</div>';
  return { card: card, canvasId: canvasId };
}

function buildChart(canvasId, type, labels, data, colors, instanceArr, extraOptions) {
  var ctx = document.getElementById(canvasId).getContext('2d');
  var isBar = (type === 'bar' || type === 'horizontalBar');
  var indexAxis = (type === 'horizontalBar') ? 'y' : 'x';
  var chartType = (type === 'horizontalBar') ? 'bar' : type;

  var defaults = {
    responsive: true,
    animation: { duration: 800, easing: 'easeInOutQuart' },
    plugins: {
      legend: {
        display: true,
        position: (isBar ? 'top' : 'right'),
        labels: {
          font: { family: "'Source Serif 4', serif", size: 12 },
          color: '#1a1a2e',
          padding: 14,
          usePointStyle: true,
          pointStyleWidth: 10
        }
      },
      tooltip: {
        backgroundColor: '#1a1a2e',
        titleFont: { family: "'Playfair Display', serif", size: 13 },
        bodyFont: { family: "'Source Serif 4', serif", size: 12 },
        padding: 10,
        callbacks: {
          label: function(context) {
            var val = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
            if (typeof val === 'object') val = context.parsed.x || context.parsed.y;
            var total = data.reduce(function(a, b) { return a + b; }, 0);
            var p = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
            return ' ' + val + ' respondents (' + p + '%)';
          }
        }
      }
    }
  };

  if (isBar) {
    defaults.indexAxis = indexAxis;
    defaults.scales = {
      x: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { font: { family: "'Source Serif 4', serif", size: 11 }, color: '#6b6560' }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { font: { family: "'Source Serif 4', serif", size: 11 }, color: '#6b6560' }
      }
    };
  }

  var opts = Object.assign({}, defaults, extraOptions || {});

  var inst = new Chart(ctx, {
    type: chartType,
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.map(function(c) { return c + 'dd'; }),
        borderColor: colors,
        borderWidth: isBar ? 0 : 2,
        hoverOffset: isBar ? 0 : 8,
        borderRadius: isBar ? 5 : 0
      }]
    },
    options: opts
  });
  instanceArr.push(inst);
  return inst;
}

function buildLikertChart(canvasId, labels, datasets, instanceArr) {
  var ctx = document.getElementById(canvasId).getContext('2d');
  var inst = new Chart(ctx, {
    type: 'bar',
    data: { labels: labels, datasets: datasets },
    options: {
      indexAxis: 'y',
      responsive: true,
      animation: { duration: 900, easing: 'easeInOutQuart' },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { family: "'Source Serif 4', serif", size: 11 },
            color: '#1a1a2e',
            padding: 12,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: '#1a1a2e',
          titleFont: { family: "'Playfair Display', serif", size: 12 },
          bodyFont: { family: "'Source Serif 4', serif", size: 11 },
          padding: 9,
          callbacks: {
            label: function(ctx) {
              return ' ' + ctx.dataset.label + ': ' + ctx.raw + ' respondents';
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: { font: { family: "'Source Serif 4', serif", size: 10 }, color: '#6b6560' }
        },
        y: {
          stacked: true,
          grid: { display: false },
          ticks: { font: { family: "'Source Serif 4', serif", size: 10 }, color: '#1a1a2e' }
        }
      }
    }
  });
  instanceArr.push(inst);
  return inst;
}

function downloadChart(canvasId, name) {
  var canvas = document.getElementById(canvasId);
  var link = document.createElement('a');
  link.download = name + '.png';
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

function downloadAllCharts() {
  var canvases = document.querySelectorAll('#q-charts-grid canvas');
  canvases.forEach(function(canvas, i) {
    setTimeout(function() {
      var link = document.createElement('a');
      link.download = 'Figure_' + (i + 1) + '.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    }, i * 300);
  });
  showToast('Downloading all figures...');
}

function downloadAllQlCharts() {
  var canvases = document.querySelectorAll('#ql-charts-grid canvas');
  canvases.forEach(function(canvas, i) {
    setTimeout(function() {
      var link = document.createElement('a');
      link.download = 'Figure_QL_' + (i + 1) + '.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    }, i * 300);
  });
  showToast('Downloading all figures...');
}

// ============================================================
//  GENERATE QUANTITATIVE
// ============================================================
function generateQuantitative() {
  var title   = getVal('q-title');
  var totalS  = getVal('q-total');
  var method  = document.getElementById('q-method');
  var methodTxt = method.options[method.selectedIndex].text;

  if (!totalS) { alert('Please enter the total number of respondents (N).'); return; }
  var N = parseInt(totalS);
  if (isNaN(N) || N < 1) { alert('Please enter a valid number for total respondents.'); return; }

  // Reset charts
  destroyCharts(chartInstances);
  figureCounter = 0;
  var grid = document.getElementById('q-charts-grid');
  grid.innerHTML = '';

  var out = '';
  out += 'RESULTS AND DISCUSSION\n' + rep('─', 60) + '\n\n';
  out += 'This section presents the findings of the study';
  if (title) out += ' entitled "' + title + '"';
  out += '. Data were gathered through a ' + methodTxt.toLowerCase() + ' administered to a total of ' + N + ' respondents.\n\n';

  // ── DEMOGRAPHICS ──
  var demoItems = document.querySelectorAll('.demo-item');
  if (demoItems.length > 0) {
    out += 'Demographic Profile of Respondents\n\n';
    demoItems.forEach(function(item) {
      var catEl = item.querySelector('input[type="text"]');
      if (!catEl || !catEl.value.trim()) return;
      var category = catEl.value.trim();
      var optsC    = item.querySelector('[id$="-opts"]');
      if (!optsC) return;
      var opts = collectOpts(optsC);
      if (!opts.length) return;
      var dominant = opts.reduce(function(a, b) { return b.count > a.count ? b : a; }, opts[0]);

      out += 'In terms of ' + category.toLowerCase() + ', ';
      opts.forEach(function(o, i) {
        var p = pct(o.count, N);
        if (i === 0)               out += o.count + ' or ' + p + '% of the respondents were ' + o.label;
        else if (i === opts.length - 1) out += ', and ' + o.count + ' or ' + p + '% were ' + o.label;
        else                       out += ', ' + o.count + ' or ' + p + '% were ' + o.label;
      });
      out += '. The majority of the respondents were ' + dominant.label + ', comprising ' + pct(dominant.count, N) + '% of the total sample.\n\n';

      // Chart
      figureCounter++;
      var chartTypeEl = item.querySelector('[id$="-charttype"]');
      var chartType   = chartTypeEl ? chartTypeEl.value : 'pie';
      var caption     = 'Distribution of respondents by ' + category.toLowerCase() + ' (N = ' + N + ').';
      var cc = makeChartCard(figureCounter, 'Figure ' + figureCounter + ': Respondent Distribution by ' + category, caption);
      grid.appendChild(cc.card);
      buildChart(
        cc.canvasId, chartType,
        opts.map(function(o) { return o.label; }),
        opts.map(function(o) { return o.count; }),
        PALETTE_DEMO.slice(0, opts.length),
        chartInstances
      );
    });
  }

  // ── SURVEY QUESTIONS ──
  var qItems = document.querySelectorAll('.question-item');
  if (qItems.length > 0) {
    out += 'Survey Results\n\n';
    var qNum = 1;
    qItems.forEach(function(item) {
      var idAttr = item.id.replace('question-', '');
      var qText  = getVal('q' + idAttr + '-text');
      if (!qText) return;
      var optsC  = document.getElementById('q' + idAttr + '-opts');
      if (!optsC) return;
      var opts   = collectOpts(optsC);
      if (!opts.length) return;
      var dominant   = opts.reduce(function(a, b) { return b.count > a.count ? b : a; }, opts[0]);
      var domPct     = pct(dominant.count, N);

      out += 'Question ' + qNum + ': "' + qText + '"\n\n';
      out += 'Table ' + qNum + ' shows the distribution of responses to the question, "' + qText + '." Out of the ' + N + ' total respondents, ';
      opts.forEach(function(o, i) {
        var p = pct(o.count, N);
        if (i === 0)               out += o.count + ' (' + p + '%) answered "' + o.label + '"';
        else if (i === opts.length - 1) out += ', and ' + o.count + ' (' + p + '%) answered "' + o.label + '"';
        else                       out += ', ' + o.count + ' (' + p + '%) answered "' + o.label + '"';
      });
      out += '.\n\n';
      out += 'The data show that the majority of the respondents, specifically ' + dominant.count + ' or ' + domPct + '% of the total sample, responded "' + dominant.label + '." ';

      if (opts.length === 2) {
        var minority = opts.find(function(o) { return o.label !== dominant.label; });
        if (minority) {
          out += 'In contrast, ' + minority.count + ' or ' + pct(minority.count, N) + '% of the respondents chose "' + minority.label + '." ';
          out += 'This finding suggests that a considerable portion of the respondents lean toward "' + dominant.label + '" regarding this item, which may reflect a prevailing attitude or level of awareness among the study participants.\n\n';
        }
      } else {
        out += 'The distribution of responses indicates varying positions among the participants. The prevalence of the "' + dominant.label + '" response suggests this was the most commonly reported view within the sample.\n\n';
      }

      // Chart
      figureCounter++;
      var chartTypeEl = item.querySelector('[id$="-charttype"]');
      var chartType   = chartTypeEl ? chartTypeEl.value : 'bar';
      var shortQ = qText.length > 60 ? qText.slice(0, 57) + '...' : qText;
      var caption = 'Response distribution for Question ' + qNum + ': "' + shortQ + '" (N = ' + N + ').';
      var cc = makeChartCard(figureCounter, 'Figure ' + figureCounter + ': Q' + qNum + ' — ' + shortQ, caption);
      grid.appendChild(cc.card);
      buildChart(
        cc.canvasId, chartType,
        opts.map(function(o) { return o.label + ' (' + pct(o.count, N) + '%)'; }),
        opts.map(function(o) { return o.count; }),
        PALETTE_MAIN.slice(0, opts.length),
        chartInstances
      );

      qNum++;
    });
  }

  // ── LIKERT ──
  var lItems = document.querySelectorAll('.likert-item');
  if (lItems.length > 0) {
    out += 'Likert Scale Results\n\n';

    // Collect all statements for one stacked chart
    var likertLabels   = [];
    var likertRatings  = [];
    var ratingCounts   = {};

    var lNum = 1;
    lItems.forEach(function(item) {
      var idAttr   = item.id.replace('likert-', '');
      var stmtText = getVal('l' + idAttr + '-text');
      if (!stmtText) return;

      var optsC = document.getElementById('l' + idAttr + '-opts');
      if (!optsC) return;
      var opts = [];
      optsC.querySelectorAll('.option-row').forEach(function(row) {
        var inputs = row.querySelectorAll('input');
        var lbl = '', cnt = 0;
        inputs.forEach(function(inp) {
          if (inp.type === 'text')   lbl = inp.value.trim();
          if (inp.type === 'number') cnt = parseInt(inp.value) || 0;
        });
        if (lbl) opts.push({ label: lbl, count: cnt });
      });
      if (!opts.length) return;

      var totalR  = opts.reduce(function(s, o) { return s + o.count; }, 0);
      var numR    = opts.length;
      var wSum    = 0;
      opts.forEach(function(o, i) { wSum += o.count * (numR - i); });
      var wm      = totalR > 0 ? (wSum / totalR).toFixed(2) : '0.00';
      var dominant = opts.reduce(function(a, b) { return b.count > a.count ? b : a; }, opts[0]);

      out += 'Statement ' + lNum + ': "' + stmtText + '"\n\n';
      out += 'Regarding the statement "' + stmtText + '," ';
      opts.forEach(function(o, i) {
        var p = pct(o.count, N);
        if (i === 0)               out += o.count + ' or ' + p + '% of the respondents indicated "' + o.label + '"';
        else if (i === opts.length - 1) out += ', and ' + o.count + ' or ' + p + '% indicated "' + o.label + '"';
        else                       out += ', ' + o.count + ' or ' + p + '% indicated "' + o.label + '"';
      });
      out += '. The weighted mean for this item is ' + wm + ' out of ' + numR + '.00, indicating that the most frequent response was "' + dominant.label + '." ';
      out += 'These results suggest that the majority of the respondents tend to ' + dominant.label.toLowerCase() + ' with the given statement.\n\n';

      // Collect for stacked chart
      var shortStmt = stmtText.length > 40 ? stmtText.slice(0, 37) + '...' : stmtText;
      likertLabels.push(shortStmt);
      opts.forEach(function(o) {
        if (!ratingCounts[o.label]) ratingCounts[o.label] = [];
        ratingCounts[o.label].push(o.count);
        if (likertRatings.indexOf(o.label) === -1) likertRatings.push(o.label);
      });

      lNum++;
    });

    // Build stacked Likert chart
    if (likertLabels.length > 0) {
      figureCounter++;
      var datasets = likertRatings.map(function(rating, ri) {
        return {
          label: rating,
          data: ratingCounts[rating] || [],
          backgroundColor: (PALETTE_LIKERT[ri] || PALETTE_MAIN[ri]) + 'cc',
          borderColor:     PALETTE_LIKERT[ri] || PALETTE_MAIN[ri],
          borderWidth: 1,
          borderRadius: 3
        };
      });
      var caption = 'Stacked response distribution across all Likert scale statements (N = ' + N + ').';
      var cc = makeChartCard(figureCounter, 'Figure ' + figureCounter + ': Likert Scale Response Summary', caption);
      grid.appendChild(cc.card);
      buildLikertChart(cc.canvasId, likertLabels, datasets, chartInstances);
    }
  }

  // Summary
  out += 'Summary\n\n';
  out += 'The quantitative findings of this study provide a comprehensive picture of the distribution of responses among the ' + N + ' participants. ';
  if (qItems.length > 0) out += 'The survey results across ' + qItems.length + ' item' + (qItems.length > 1 ? 's' : '') + ' reveal notable patterns in participant responses. ';
  if (lItems.length > 0) out += 'The Likert scale results further substantiate the general tendencies observed. ';
  out += 'The accompanying figures (see above) provide a visual representation of the data distribution, supporting the narrative findings presented in this section.\n';

  // Show
  document.getElementById('q-output').style.display = 'block';
  document.getElementById('q-output-text').textContent = out;
  document.getElementById('q-charts').style.display = 'block';
  paperSections.quantitative = out;
  document.getElementById('q-output').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================================
//  GENERATE QUALITATIVE
// ============================================================
function generateQualitative() {
  var topic       = getVal('ql-topic');
  var partS       = getVal('ql-participants');
  var methodEl    = document.getElementById('ql-method');
  var methodTxt   = methodEl.options[methodEl.selectedIndex].text;
  var approachEl  = document.getElementById('ql-approach');
  var approachTxt = approachEl.options[approachEl.selectedIndex].text;

  var responses = [];
  document.querySelectorAll('.response-item').forEach(function(item) {
    var id    = item.id.replace('response-', '');
    var label = getVal('r' + id + '-label') || ('P' + id);
    var text  = getVal('r' + id + '-text');
    var rtopic= getVal('r' + id + '-topic');
    if (text) responses.push({ label: label, text: text, topic: rtopic });
  });

  if (!responses.length) { alert('Please add at least one participant response.'); return; }

  var pCount = parseInt(partS) || responses.length;
  var themes = extractThemes(responses);

  // Reset charts
  destroyCharts(qlChartInstances);
  var grid = document.getElementById('ql-charts-grid');
  grid.innerHTML = '';

  var out = '';
  out += 'RESULTS AND DISCUSSION — QUALITATIVE FINDINGS\n' + rep('─', 60) + '\n\n';
  out += 'This section presents the qualitative findings drawn from the ' + methodTxt.toLowerCase() + ' conducted with ' + pCount + ' participant' + (pCount > 1 ? 's' : '') + '. ';
  if (topic) {
    out += 'Using ' + approachTxt + ', the responses were analyzed to identify recurring patterns and themes relevant to the research topic: "' + topic + '."\n\n';
  } else {
    out += 'Using ' + approachTxt + ', the responses were analyzed to identify emergent patterns and recurring themes.\n\n';
  }

  if (themes.length > 0) {
    out += 'Emergent Themes\n\n';
    out += 'The ' + approachTxt.toLowerCase() + ' of participant responses yielded ' + themes.length + ' major theme' + (themes.length > 1 ? 's' : '') + ':\n\n';

    themes.forEach(function(theme, i) {
      out += 'Theme ' + (i + 1) + ': ' + theme.name + '\n\n';
      out += theme.description + ' This theme was evident in the responses of ' + theme.responses.length + ' participant' + (theme.responses.length > 1 ? 's' : '') + ', reflecting a shared pattern of experience or perspective.\n\n';
      theme.responses.slice(0, 3).forEach(function(r) {
        var excerpt = r.text.length > 280 ? r.text.slice(0, 277) + '...' : r.text;
        out += r.label + ' shared: "' + excerpt + '"\n\n';
      });
      if (theme.responses.length > 1) {
        out += 'These accounts underscore the significance of ' + theme.name.toLowerCase() + ' as a recurring element in the participants\' lived experiences.\n\n';
      }
    });

    // Build theme frequency bar chart
    figureCounter++;
    var qlfig = figureCounter;
    var themeNames  = themes.map(function(t) { return t.name; });
    var themeCounts = themes.map(function(t) { return t.responses.length; });
    var caption = 'Frequency of emergent themes identified through ' + approachTxt.toLowerCase() + ' (n = ' + pCount + ').';
    var cc = makeChartCard(qlfig, 'Figure ' + qlfig + ': Theme Frequency Distribution', caption);
    grid.appendChild(cc.card);
    buildChart(
      cc.canvasId, 'horizontalBar',
      themeNames,
      themeCounts,
      PALETTE_MAIN.slice(0, themeNames.length),
      qlChartInstances,
      {
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(ctx) { return ' ' + ctx.raw + ' participant' + (ctx.raw > 1 ? 's' : ''); }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { family: "'Source Serif 4', serif", size: 11 } }
          },
          y: {
            ticks: { font: { family: "'Source Serif 4', serif", size: 10 } }
          }
        }
      }
    );

    // Pie chart of theme distribution
    figureCounter++;
    var qlfig2 = figureCounter;
    var caption2 = 'Proportional distribution of emergent themes among participant responses.';
    var cc2 = makeChartCard(qlfig2, 'Figure ' + qlfig2 + ': Proportional Theme Distribution', caption2);
    grid.appendChild(cc2.card);
    buildChart(
      cc2.canvasId, 'doughnut',
      themeNames,
      themeCounts,
      PALETTE_MAIN.slice(0, themeNames.length),
      qlChartInstances
    );
  } else {
    out += 'Participant Responses and Findings\n\n';
    responses.forEach(function(r) {
      out += r.label + ' stated: "' + r.text + '"\n\n';
      out += 'This response contributes a specific perspective relevant to the research topic.\n\n';
    });
  }

  if (responses.length >= 3) {
    out += 'Cross-Cutting Observations\n\n';
    out += 'Across the ' + pCount + ' participant' + (pCount > 1 ? 's' : '') + ', both commonalities and differences were observed in how the topic was experienced and understood. ';
    out += 'While individual accounts varied in detail, the recurring patterns identified in the data suggest shared meaning across the participant group. ';
    out += 'The accompanying figures provide a visual summary of the thematic landscape identified in this study.\n\n';
  }

  out += 'Summary\n\n';
  out += 'The qualitative data gathered from the ' + pCount + ' participant' + (pCount > 1 ? 's' : '') + ' through ' + methodTxt.toLowerCase() + ' ';
  if (themes.length > 0) {
    out += 'yielded ' + themes.length + ' major theme' + (themes.length > 1 ? 's' : '') + ': ';
    out += themes.map(function(t, i) { return '(' + (i + 1) + ') ' + t.name; }).join(', ') + '. ';
  }
  out += 'These findings offer a rich and contextualized understanding of the research topic, complementing the quantitative data and enriching the overall results of the study.\n';

  document.getElementById('ql-output').style.display = 'block';
  document.getElementById('ql-output-text').textContent = out;
  document.getElementById('ql-charts').style.display = themes.length > 0 ? 'block' : 'none';
  paperSections.qualitative = out;
  document.getElementById('ql-output').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================================
//  THEME EXTRACTION
// ============================================================
var THEME_DEFS = [
  { name: 'Challenges and Difficulties',
    keywords: ['challenge','difficult','hard','struggle','problem','issue','barrier','obstacle','lack','stress','pressure','unable','burden','tough','complicated','negative','fail','bad','concern'],
    desc: 'Several participants expressed encountering various forms of difficulty or obstacles in relation to the topic under study.' },
  { name: 'Positive Experiences and Benefits',
    keywords: ['benefit','good','great','positive','helpful','enjoy','satisfied','happy','improve','better','effective','excellent','appreciate','grateful','advantage','success','glad','pleased','nice','wonderful'],
    desc: 'A number of participants articulated favorable outcomes, beneficial effects, or generally positive experiences in relation to the subject matter.' },
  { name: 'Support and Assistance',
    keywords: ['support','help','assist','guide','teacher','family','friend','mentor','peer','community','resource','counselor','service','provided','aid','encourage','facilitate','backed'],
    desc: 'Participants frequently referenced the role of external support systems in shaping their experiences.' },
  { name: 'Awareness and Knowledge',
    keywords: ['aware','know','understand','learn','knowledge','information','educate','familiar','realize','recognize','discover','insight','literacy','trained','informed','conscious'],
    desc: 'Responses in this theme centered on the participants\' level of familiarity, understanding, and access to information.' },
  { name: 'Coping and Adaptation',
    keywords: ['cope','adapt','adjust','manage','deal','overcome','handle','strategy','approach','method','solution','resilient','survive','navigate','mitigate','work around'],
    desc: 'Participants described personal strategies and behavioral adjustments they employed to navigate their circumstances.' },
  { name: 'Needs and Recommendations',
    keywords: ['need','require','want','recommend','suggest','improve','change','develop','implement','policy','program','training','more','insufficient','address','reform','increase'],
    desc: 'Several participants identified gaps and proposed improvements or actions that could address the concerns raised.' },
  { name: 'Motivation and Aspiration',
    keywords: ['motivate','inspire','goal','aspire','dream','ambition','hope','achieve','future','pursue','driven','passionate','committed','determined','strive','aim','vision','purpose'],
    desc: 'Participants shared their personal drives, long-term objectives, and aspirational perspectives.' },
  { name: 'Communication and Relationships',
    keywords: ['communicate','relation','interact','connect','engage','rapport','trust','bond','collaboration','team','partner','network','social','talk','discuss','share','coordinate'],
    desc: 'This theme captures the interpersonal dimensions expressed by participants in their interactions with others.' }
];

function extractThemes(responses) {
  var results = [];
  THEME_DEFS.forEach(function(def) {
    var matched = [];
    responses.forEach(function(r) {
      var lower = r.text.toLowerCase();
      var hit = def.keywords.some(function(kw) { return lower.indexOf(kw) !== -1; });
      if (hit) matched.push(r);
    });
    if (matched.length >= 1) results.push({ name: def.name, description: def.desc, responses: matched });
  });
  results.sort(function(a, b) { return b.responses.length - a.responses.length; });
  return results.slice(0, 6);
}

// ============================================================
//  PAPER
// ============================================================
function sendToPaper(type) {
  var content = type === 'quantitative'
    ? document.getElementById('q-output-text').textContent
    : document.getElementById('ql-output-text').textContent;
  if (!content) { alert('Please generate results first.'); return; }
  paperSections[type] = content;
  refreshPaperPreview();
  switchTab('paper');
  showToast('Results sent to Paper tab ✓');
}

function refreshPaperPreview() {
  var parts = [];
  if (paperSections.quantitative) parts.push(paperSections.quantitative);
  if (paperSections.qualitative)  parts.push(paperSections.qualitative);
  var el = document.getElementById('paper-content');
  if (parts.length > 0) {
    el.textContent = parts.join('\n\n' + rep('─', 60) + '\n\n');
  } else {
    el.innerHTML = '<p class="hint-center">Generate results from the Quantitative and/or Qualitative tabs, then click "Send to Paper" to see them here.</p>';
  }
}

function compilePaper() {
  var quant = paperSections.quantitative;
  var qual  = paperSections.qualitative;
  if (!quant && !qual) { alert('No results to compile. Generate results first.'); return; }

  var t  = getVal('paper-title');
  var a  = getVal('paper-author');
  var i  = getVal('paper-institution');
  var d  = getVal('paper-date');

  var final = '';
  if (t) final += t.toUpperCase() + '\n\n';
  if (a) final += a + '\n';
  if (i) final += i + '\n';
  if (d) final += d + '\n';
  if (t || a) final += '\n' + rep('═', 60) + '\n\n';
  if (quant) final += quant;
  if (qual)  { if (quant) final += '\n' + rep('─', 60) + '\n\n'; final += qual; }

  document.getElementById('paper-output').style.display = 'block';
  document.getElementById('paper-final-text').textContent = final;
  document.getElementById('paper-output').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function copyPaper() {
  var text = document.getElementById('paper-final-text').textContent;
  if (!text) { alert('Please click "Compile Full Results Section" first.'); return; }
  navigator.clipboard.writeText(text).then(function() { showToast('Copied to clipboard ✓'); });
}

function clearPaper() {
  paperSections = { quantitative: '', qualitative: '' };
  refreshPaperPreview();
  document.getElementById('paper-output').style.display = 'none';
  document.getElementById('paper-final-text').textContent = '';
}

// ── CLEAR ──
function clearQuantitative() {
  document.getElementById('q-title').value = '';
  document.getElementById('q-total').value = '';
  document.getElementById('demo-container').innerHTML = '';
  document.getElementById('q-questions-container').innerHTML = '';
  document.getElementById('likert-container').innerHTML = '';
  document.getElementById('likert-card').style.display = 'none';
  document.getElementById('q-output').style.display = 'none';
  document.getElementById('q-output-text').textContent = '';
  document.getElementById('q-charts').style.display = 'none';
  document.getElementById('q-charts-grid').innerHTML = '';
  destroyCharts(chartInstances);
  questionCount = 0; likertCount = 0; demoCount = 0; figureCounter = 0;
}

function clearQualitative() {
  document.getElementById('ql-topic').value = '';
  document.getElementById('ql-participants').value = '';
  document.getElementById('ql-responses-container').innerHTML = '';
  document.getElementById('ql-output').style.display = 'none';
  document.getElementById('ql-output-text').textContent = '';
  document.getElementById('ql-charts').style.display = 'none';
  document.getElementById('ql-charts-grid').innerHTML = '';
  destroyCharts(qlChartInstances);
  responseCount = 0;
}

// ── UTILS ──
function copyOutput(id) {
  var text = document.getElementById(id).textContent;
  if (!text) { alert('Nothing to copy yet.'); return; }
  navigator.clipboard.writeText(text).then(function() { showToast('Copied to clipboard ✓'); });
}

function showToast(msg) {
  var toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 2600);
}

function updatePalettePreview() {
  var val     = document.getElementById('chart-palette').value;
  var preview = document.getElementById('palette-preview');
  var customC = document.getElementById('custom-colors-container');

  if (val === 'custom') {
    customC.style.display = 'block';
    renderCustomPickers();
    applyCustomPalette();
  } else {
    customC.style.display = 'none';
    var colors = PALETTES[val];
    PALETTE_MAIN   = colors;
    PALETTE_LIKERT = colors.slice(0, 5);
    PALETTE_DEMO   = colors.slice(0, 6);
    preview.innerHTML = colors.map(function(c) {
      return '<span class="palette-swatch" style="background:' + c + ';"></span>';
    }).join('');
  }
}

function applyCustomPalette() {
  var colors = customColors.slice();
  PALETTE_MAIN   = colors;
  PALETTE_LIKERT = colors.slice(0, 5);
  PALETTE_DEMO   = colors.slice(0, 6);
  var preview = document.getElementById('palette-preview');
  preview.innerHTML = colors.map(function(c) {
    return '<span class="palette-swatch" style="background:' + c + ';"></span>';
  }).join('');
}

function renderCustomPickers() {
  var container = document.getElementById('custom-color-pickers');
  container.innerHTML = '';
  customColors.forEach(function(color, i) {
    var wrap = document.createElement('div');
    wrap.className = 'custom-color-wrap';
    wrap.innerHTML =
      '<input type="color" value="' + color + '" onchange="updateCustomColor(' + i + ', this.value)" />' +
      '<button onclick="removeCustomColor(' + i + ')">✕</button>';
    container.appendChild(wrap);
  });
}

function addCustomColor() {
  if (customColors.length >= 10) { showToast('Maximum 10 colors allowed.'); return; }
  customColors.push('#000000');
  renderCustomPickers();
  applyCustomPalette();
}

function updateCustomColor(index, value) {
  customColors[index] = value;
  applyCustomPalette();
}

function removeCustomColor(index) {
  if (customColors.length <= 2) { showToast('Minimum 2 colors required.'); return; }
  customColors.splice(index, 1);
  renderCustomPickers();
  applyCustomPalette();
}
