// ============================================================
//  ResearchLab — app.js
//  100% local computation. No AI. No server. Pure math + logic.
// ============================================================

var paperSections = { quantitative: '', qualitative: '' };
var questionCount = 0;
var likertCount   = 0;
var demoCount     = 0;
var responseCount = 0;

// ============================================================
//  TAB SWITCHING
// ============================================================
function switchTab(name) {
  document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
  var tabBtn = document.querySelector('.tab[onclick="switchTab(\'' + name + '\')"]');
  if (tabBtn) tabBtn.classList.add('active');
  var panel = document.getElementById('panel-' + name);
  if (panel) panel.classList.add('active');
}

// ============================================================
//  TOGGLE LIKERT CARD
// ============================================================
function toggleLikertCard() {
  var scale = document.getElementById('q-scale').value;
  var card  = document.getElementById('likert-card');
  if (scale === 'likert' || scale === 'frequency') {
    card.style.display = 'block';
  } else {
    card.style.display = 'none';
  }
}

// ============================================================
//  ADD DEMOGRAPHIC
// ============================================================
function addDemographic() {
  demoCount++;
  var id = demoCount;
  var container = document.getElementById('demo-container');
  var div = document.createElement('div');
  div.className = 'demo-item';
  div.id = 'demo-' + id;
  div.innerHTML =
    '<div class="item-header">' +
      '<span class="item-label">DEMOGRAPHIC ' + id + '</span>' +
      '<button class="remove-btn" onclick="removeEl(\'demo-' + id + '\')">✕</button>' +
    '</div>' +
    '<label>Category Name (e.g., Sex, Age Group, Year Level)</label>' +
    '<input type="text" id="d' + id + '-cat" placeholder="e.g., Sex" />' +
    '<label>Groups &amp; Counts</label>' +
    '<div id="d' + id + '-opts">' +
      makeOptionRow('d' + id + '-opt1') +
      makeOptionRow('d' + id + '-opt2') +
    '</div>' +
    '<button class="add-option-btn" onclick="addOptRow(\'d' + id + '-opts\')">+ Add Group</button>';
  container.appendChild(div);
}

// ============================================================
//  ADD QUESTION
// ============================================================
function addQuestion() {
  questionCount++;
  var id = questionCount;
  var container = document.getElementById('q-questions-container');
  var div = document.createElement('div');
  div.className = 'question-item';
  div.id = 'question-' + id;
  div.innerHTML =
    '<div class="item-header">' +
      '<span class="item-label">QUESTION ' + id + '</span>' +
      '<button class="remove-btn" onclick="removeEl(\'question-' + id + '\')">✕</button>' +
    '</div>' +
    '<label>Question Text</label>' +
    '<input type="text" id="q' + id + '-text" placeholder="e.g., Are you aware of mental health services in your school?" />' +
    '<label>Answer Options &amp; Response Counts</label>' +
    '<div id="q' + id + '-opts">' +
      makeOptionRow('q' + id + '-opt1') +
      makeOptionRow('q' + id + '-opt2') +
    '</div>' +
    '<button class="add-option-btn" onclick="addOptRow(\'q' + id + '-opts\')">+ Add Option</button>';
  container.appendChild(div);
}

// ============================================================
//  ADD LIKERT ITEM
// ============================================================
function addLikertItem() {
  likertCount++;
  var id   = likertCount;
  var scale = document.getElementById('q-scale').value;
  var container = document.getElementById('likert-container');
  var div = document.createElement('div');
  div.className = 'likert-item';
  div.id = 'likert-' + id;

  var ratings = scale === 'frequency'
    ? ['Always', 'Often', 'Sometimes', 'Never']
    : ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'];

  var rowsHTML = '';
  for (var i = 0; i < ratings.length; i++) {
    rowsHTML +=
      '<div class="option-row">' +
        '<input type="text" value="' + ratings[i] + '" />' +
        '<input type="number" placeholder="Count" min="0" />' +
        '<button class="remove-btn" onclick="removeEl(this.parentElement)">✕</button>' +
      '</div>';
  }

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
  container.appendChild(div);
}

// ============================================================
//  ADD QUALITATIVE RESPONSE
// ============================================================
function addResponse() {
  responseCount++;
  var id = responseCount;
  var container = document.getElementById('ql-responses-container');
  var div = document.createElement('div');
  div.className = 'response-item';
  div.id = 'response-' + id;
  div.innerHTML =
    '<div class="item-header">' +
      '<span class="item-label">PARTICIPANT ' + id + '</span>' +
      '<button class="remove-btn" onclick="removeEl(\'response-' + id + '\')">✕</button>' +
    '</div>' +
    '<div class="row">' +
      '<div>' +
        '<label>Label (e.g., P' + id + ' or pseudonym)</label>' +
        '<input type="text" id="r' + id + '-label" value="P' + id + '" />' +
      '</div>' +
      '<div>' +
        '<label>Topic / Question (optional)</label>' +
        '<input type="text" id="r' + id + '-topic" placeholder="e.g., Challenges faced" />' +
      '</div>' +
    '</div>' +
    '<label>Participant\'s Response / Statement</label>' +
    '<textarea id="r' + id + '-text" placeholder="Paste or type the participant\'s response here..."></textarea>';
  container.appendChild(div);
}

// ============================================================
//  HELPER: make a label + count option row
// ============================================================
function makeOptionRow(prefix) {
  return (
    '<div class="option-row">' +
      '<input type="text" id="' + prefix + '-lbl" placeholder="Option (e.g., Yes)" />' +
      '<input type="number" id="' + prefix + '-cnt" placeholder="Count" min="0" />' +
      '<button class="remove-btn" onclick="removeEl(this.parentElement)">✕</button>' +
    '</div>'
  );
}

function addOptRow(containerId) {
  var container = document.getElementById(containerId);
  var div = document.createElement('div');
  div.className = 'option-row';
  div.innerHTML =
    '<input type="text" placeholder="Option" />' +
    '<input type="number" placeholder="Count" min="0" />' +
    '<button class="remove-btn" onclick="removeEl(this.parentElement)">✕</button>';
  container.appendChild(div);
}

function removeEl(target) {
  if (typeof target === 'string') {
    var el = document.getElementById(target);
    if (el) el.remove();
  } else if (target && target.remove) {
    target.remove();
  }
}

// ============================================================
//  COLLECT OPTIONS from an option-container element
// ============================================================
function collectOpts(containerEl) {
  var opts = [];
  var rows = containerEl.querySelectorAll('.option-row');
  rows.forEach(function(row) {
    var inputs = row.querySelectorAll('input');
    var labelVal = '', countVal = 0;
    inputs.forEach(function(inp) {
      if (inp.type === 'text')   labelVal = inp.value.trim();
      if (inp.type === 'number') countVal = parseInt(inp.value) || 0;
    });
    if (labelVal) opts.push({ label: labelVal, count: countVal });
  });
  return opts;
}

// ============================================================
//  MATH HELPERS
// ============================================================
function pct(count, total) {
  if (!total) return '0.00';
  return ((count / total) * 100).toFixed(2);
}

function getVal(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

// ============================================================
//  GENERATE QUANTITATIVE RESULTS
// ============================================================
function generateQuantitative() {
  var title  = getVal('q-title');
  var totalS = getVal('q-total');
  var method = document.getElementById('q-method');
  var methodTxt = method.options[method.selectedIndex].text;

  if (!totalS) { alert('Please enter the total number of respondents (N).'); return; }
  var N = parseInt(totalS);
  if (isNaN(N) || N < 1) { alert('Please enter a valid number for total respondents.'); return; }

  var out = '';

  // Title block
  out += 'RESULTS AND DISCUSSION\n';
  out += repeat('─', 60) + '\n\n';
  if (title) {
    out += 'This section presents the findings of the study entitled "' + title + '." ';
  } else {
    out += 'This section presents the findings of the study. ';
  }
  out += 'Data were gathered through a ' + methodTxt.toLowerCase() + ' administered to a total of ' + N + ' respondents.\n\n';

  // Demographics
  var demoItems = document.querySelectorAll('.demo-item');
  if (demoItems.length > 0) {
    out += 'Demographic Profile of Respondents\n\n';
    demoItems.forEach(function(item) {
      var catInput = item.querySelector('input[type="text"]');
      if (!catInput || !catInput.value.trim()) return;
      var category = catInput.value.trim();
      var optsContainer = item.querySelector('[id$="-opts"]');
      if (!optsContainer) return;
      var opts = collectOpts(optsContainer);
      if (opts.length === 0) return;

      var dominant = opts.reduce(function(a, b) { return b.count > a.count ? b : a; }, opts[0]);

      out += 'In terms of ' + category.toLowerCase() + ', ';
      opts.forEach(function(opt, i) {
        var p = pct(opt.count, N);
        if (i === 0) {
          out += opt.count + ' or ' + p + '% of the respondents were ' + opt.label;
        } else if (i === opts.length - 1) {
          out += ', and ' + opt.count + ' or ' + p + '% were ' + opt.label;
        } else {
          out += ', ' + opt.count + ' or ' + p + '% were ' + opt.label;
        }
      });
      out += '. This shows that the majority of the respondents were ';
      out += dominant.label + ', accounting for ' + pct(dominant.count, N) + '% of the total sample.\n\n';
    });
  }

  // Survey Questions
  var qItems = document.querySelectorAll('.question-item');
  if (qItems.length > 0) {
    out += 'Survey Results\n\n';
    var qNum = 1;
    qItems.forEach(function(item) {
      var idAttr  = item.id.replace('question-', '');
      var qText   = getVal('q' + idAttr + '-text');
      if (!qText) return;

      var optsContainer = document.getElementById('q' + idAttr + '-opts');
      if (!optsContainer) return;
      var opts = collectOpts(optsContainer);
      if (opts.length === 0) return;

      var dominant = opts.reduce(function(a, b) { return b.count > a.count ? b : a; }, opts[0]);
      var dominantPct = pct(dominant.count, N);

      out += 'Question ' + qNum + ': "' + qText + '"\n\n';
      out += 'Table ' + qNum + ' shows the distribution of responses to the question, "' + qText + '." ';
      out += 'Out of the ' + N + ' total respondents, ';

      opts.forEach(function(opt, i) {
        var p = pct(opt.count, N);
        if (i === 0) {
          out += opt.count + ' (' + p + '%) answered "' + opt.label + '"';
        } else if (i === opts.length - 1) {
          out += ', and ' + opt.count + ' (' + p + '%) answered "' + opt.label + '"';
        } else {
          out += ', ' + opt.count + ' (' + p + '%) answered "' + opt.label + '"';
        }
      });
      out += '.\n\n';

      out += 'The data show that the majority of the respondents, specifically ' + dominant.count + ' or ' + dominantPct + '% of the total sample, responded "' + dominant.label + '." ';

      if (opts.length === 2) {
        var minority = opts.find(function(o) { return o.label !== dominant.label; });
        if (minority) {
          out += 'In contrast, ' + minority.count + ' or ' + pct(minority.count, N) + '% of the respondents chose "' + minority.label + '." ';
          out += 'This finding suggests that a considerable portion of the respondents tend toward "' + dominant.label + '" with regard to this particular item, ';
          out += 'which may reflect a prevailing attitude, awareness, or experience among the participants of the study.\n\n';
        }
      } else {
        out += 'The distribution of responses across the answer choices indicates varying levels of agreement or experience among the participants. ';
        out += 'The predominance of the "' + dominant.label + '" response suggests that this was the most commonly reported position within the sample population.\n\n';
      }

      qNum++;
    });
  }

  // Likert
  var lItems = document.querySelectorAll('.likert-item');
  if (lItems.length > 0) {
    out += 'Likert Scale Results\n\n';
    var lNum = 1;
    lItems.forEach(function(item) {
      var idAttr = item.id.replace('likert-', '');
      var stmtText = getVal('l' + idAttr + '-text');
      if (!stmtText) return;

      var optsContainer = document.getElementById('l' + idAttr + '-opts');
      if (!optsContainer) return;

      var opts = [];
      var rows = optsContainer.querySelectorAll('.option-row');
      rows.forEach(function(row) {
        var inputs = row.querySelectorAll('input');
        var lbl = '', cnt = 0;
        inputs.forEach(function(inp) {
          if (inp.type === 'text')   lbl = inp.value.trim();
          if (inp.type === 'number') cnt = parseInt(inp.value) || 0;
        });
        if (lbl) opts.push({ label: lbl, count: cnt });
      });
      if (opts.length === 0) return;

      var totalResp = opts.reduce(function(s, o) { return s + o.count; }, 0);
      var numRatings = opts.length;
      var weightedSum = 0;
      opts.forEach(function(o, i) {
        weightedSum += o.count * (numRatings - i);
      });
      var wm = totalResp > 0 ? (weightedSum / totalResp).toFixed(2) : '0.00';
      var dominant = opts.reduce(function(a, b) { return b.count > a.count ? b : a; }, opts[0]);

      out += 'Statement ' + lNum + ': "' + stmtText + '"\n\n';
      out += 'Regarding the statement "' + stmtText + '," ';
      opts.forEach(function(opt, i) {
        var p = pct(opt.count, N);
        if (i === 0) {
          out += opt.count + ' or ' + p + '% of the respondents indicated "' + opt.label + '"';
        } else if (i === opts.length - 1) {
          out += ', and ' + opt.count + ' or ' + p + '% indicated "' + opt.label + '"';
        } else {
          out += ', ' + opt.count + ' or ' + p + '% indicated "' + opt.label + '"';
        }
      });
      out += '. The weighted mean for this item is ' + wm + ' out of ' + numRatings + '.00, ';
      out += 'indicating that the most frequent response was "' + dominant.label + '." ';
      out += 'These results suggest that the majority of the respondents tend to ' + dominant.label.toLowerCase() + ' with the given statement.\n\n';

      lNum++;
    });
  }

  // Summary
  out += 'Summary\n\n';
  out += 'In sum, the quantitative findings of this study provide a comprehensive picture of the distribution of responses among the ' + N + ' participants. ';
  if (qItems.length > 0) {
    out += 'The results of the survey across ' + qItems.length + ' item' + (qItems.length > 1 ? 's' : '') + ' reveal notable patterns in the responses of the participants. ';
  }
  if (lItems.length > 0) {
    out += 'The Likert scale results further substantiate the general tendencies observed, pointing to consistent response patterns across the measured indicators. ';
  }
  out += 'These findings serve as the basis for the interpretation and discussion presented in the succeeding sections of this paper.\n';

  showOutput('q-output', 'q-output-text', out);
  paperSections.quantitative = out;
}

// ============================================================
//  GENERATE QUALITATIVE RESULTS
// ============================================================
function generateQualitative() {
  var topic        = getVal('ql-topic');
  var participantsS = getVal('ql-participants');
  var methodEl     = document.getElementById('ql-method');
  var methodTxt    = methodEl.options[methodEl.selectedIndex].text;
  var approachEl   = document.getElementById('ql-approach');
  var approachTxt  = approachEl.options[approachEl.selectedIndex].text;

  var responses = [];
  document.querySelectorAll('.response-item').forEach(function(item) {
    var idAttr = item.id.replace('response-', '');
    var label  = getVal('r' + idAttr + '-label') || ('P' + idAttr);
    var text   = getVal('r' + idAttr + '-text');
    var rtopic = getVal('r' + idAttr + '-topic');
    if (text) responses.push({ label: label, text: text, topic: rtopic });
  });

  if (responses.length === 0) {
    alert('Please add at least one participant response.');
    return;
  }

  var pCount = parseInt(participantsS) || responses.length;
  var themes = extractThemes(responses);

  var out = '';
  out += 'RESULTS AND DISCUSSION — QUALITATIVE FINDINGS\n';
  out += repeat('─', 60) + '\n\n';

  out += 'This section presents the qualitative findings drawn from the ' + methodTxt.toLowerCase() + ' conducted with ';
  out += pCount + ' participant' + (pCount > 1 ? 's' : '') + '. ';
  if (topic) {
    out += 'Using ' + approachTxt + ', the responses were analyzed to identify recurring patterns and themes relevant to the research topic: "' + topic + '."\n\n';
  } else {
    out += 'Using ' + approachTxt + ', the responses were analyzed to identify emergent patterns and recurring themes.\n\n';
  }

  if (themes.length > 0) {
    out += 'Emergent Themes\n\n';
    out += 'The ' + approachTxt.toLowerCase() + ' of the participants\' responses yielded the following major theme' + (themes.length > 1 ? 's' : '') + ':\n\n';

    themes.forEach(function(theme, i) {
      out += 'Theme ' + (i + 1) + ': ' + theme.name + '\n\n';
      out += theme.description + ' ';
      out += 'This theme was evident in the responses of ' + theme.responses.length + ' participant' + (theme.responses.length > 1 ? 's' : '') + ', reflecting a shared pattern of experience or perspective among the participants.\n\n';

      var quotesToShow = theme.responses.slice(0, 3);
      quotesToShow.forEach(function(r) {
        var excerpt = r.text.length > 280 ? r.text.slice(0, 280) + '...' : r.text;
        out += r.label + ' shared: "' + excerpt + '"\n\n';
      });

      if (theme.responses.length > 1) {
        out += 'The responses presented above illustrate that multiple participants held views aligned with this theme. ';
        out += 'These accounts underscore the significance of ' + theme.name.toLowerCase() + ' as a recurring element in the lived experiences and perspectives of the study participants.\n\n';
      }
    });
  } else {
    out += 'Participant Responses and Findings\n\n';
    responses.forEach(function(r) {
      out += r.label + ' stated: "' + r.text + '"\n\n';
      out += 'This response contributes a specific perspective that is relevant to the research topic under investigation.\n\n';
    });
  }

  if (responses.length >= 3) {
    out += 'Cross-Cutting Observations\n\n';
    out += 'Across the ' + pCount + ' participant' + (pCount > 1 ? 's' : '') + ', both commonalities and differences were observed in how the topic was experienced and understood. ';
    out += 'While individual accounts naturally varied in detail and emphasis, the recurring patterns identified in the data suggest that the phenomenon under study carries shared meaning across the participant group. ';
    out += 'The diversity of responses also highlights the multifaceted nature of the topic, reinforcing the value of a qualitative approach in capturing the nuanced dimensions of the participants\' realities.\n\n';
  }

  out += 'Summary\n\n';
  out += 'The qualitative data gathered from the ' + pCount + ' participant' + (pCount > 1 ? 's' : '') + ' through ';
  out += methodTxt.toLowerCase() + ' ';
  if (themes.length > 0) {
    out += 'yielded ' + themes.length + ' major theme' + (themes.length > 1 ? 's' : '') + ': ';
    out += themes.map(function(t, i) { return '(' + (i + 1) + ') ' + t.name; }).join(', ') + '. ';
  }
  out += 'These findings offer a rich and contextualized understanding of the research topic, complementing the quantitative data and enriching the overall results of the study.\n';

  showOutput('ql-output', 'ql-output-text', out);
  paperSections.qualitative = out;
}

// ============================================================
//  THEME EXTRACTION — keyword-based, no AI
// ============================================================
var THEME_DEFS = [
  {
    name: 'Challenges and Difficulties',
    keywords: ['challenge','difficult','hard','struggle','problem','issue','barrier','obstacle','lack','limited','stress','pressure','unable','burden','tough','complicated','negative','fail','worst','bad'],
    desc: 'Several participants expressed encountering various forms of difficulty or obstacles in relation to the topic under study.'
  },
  {
    name: 'Positive Experiences and Benefits',
    keywords: ['benefit','good','great','positive','helpful','enjoy','satisfied','happy','improve','better','effective','excellent','appreciate','grateful','advantage','success','well','glad','pleased','nice'],
    desc: 'A number of participants articulated favorable outcomes, beneficial effects, or generally positive experiences in relation to the subject matter.'
  },
  {
    name: 'Support and Assistance',
    keywords: ['support','help','assist','guide','teacher','family','friend','mentor','peer','community','resource','counselor','service','available','provided','aid','backed','encourage','facilitate'],
    desc: 'Participants frequently referenced the role of external support systems — including individuals, institutions, and available resources — in shaping their experiences.'
  },
  {
    name: 'Awareness and Knowledge',
    keywords: ['aware','know','understand','learn','knowledge','information','educate','familiar','realize','recognize','discover','insight','literacy','trained','informed','conscious'],
    desc: 'Responses in this theme centered on the participants\' level of familiarity, understanding, and access to information pertaining to the subject.'
  },
  {
    name: 'Coping and Adaptation',
    keywords: ['cope','adapt','adjust','manage','deal','overcome','handle','strategy','approach','method','technique','solution','resilient','survive','navigate','work around','mitigate'],
    desc: 'Participants described the personal strategies, behavioral adjustments, and mechanisms they employed to navigate the circumstances described in their responses.'
  },
  {
    name: 'Needs and Recommendations',
    keywords: ['need','require','want','recommend','suggest','improve','change','develop','implement','policy','program','training','more','lack','insufficient','address','reform','increase'],
    desc: 'Several participants identified existing gaps and proposed improvements or specific actions that could address the concerns raised in the study.'
  },
  {
    name: 'Motivation and Aspiration',
    keywords: ['motivate','inspire','goal','aspire','dream','ambition','hope','achieve','future','pursue','driven','passionate','committed','determined','strive','aim','vision','purpose'],
    desc: 'Participants shared their personal drives, long-term objectives, and aspirational perspectives as these relate to the topic of the study.'
  },
  {
    name: 'Communication and Relationships',
    keywords: ['communicate','relation','interact','connect','engage','rapport','trust','bond','collaboration','team','partner','network','social','talk','discuss','share','coordinate'],
    desc: 'This theme captures the interpersonal dimensions expressed by participants, including the quality and nature of their interactions with others.'
  }
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
    if (matched.length >= 1) {
      results.push({ name: def.name, description: def.desc, responses: matched });
    }
  });
  results.sort(function(a, b) { return b.responses.length - a.responses.length; });
  return results.slice(0, 5);
}

// ============================================================
//  PAPER FUNCTIONS
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
  var paperContent = document.getElementById('paper-content');
  if (parts.length > 0) {
    paperContent.textContent = parts.join('\n\n' + repeat('─', 60) + '\n\n');
  } else {
    paperContent.innerHTML = '<p class="hint-center">Generate results from the Quantitative and/or Qualitative tabs, then click "Send to Paper Tab" to see them compiled here.</p>';
  }
}

function compilePaper() {
  var quant = paperSections.quantitative;
  var qual  = paperSections.qualitative;
  if (!quant && !qual) {
    alert('No results to compile yet. Please generate results in the Quantitative or Qualitative tabs first.');
    return;
  }

  var paperTitle  = getVal('paper-title');
  var author      = getVal('paper-author');
  var institution = getVal('paper-institution');
  var date        = getVal('paper-date');

  var final = '';
  if (paperTitle)  final += paperTitle.toUpperCase() + '\n\n';
  if (author)      final += author + '\n';
  if (institution) final += institution + '\n';
  if (date)        final += date + '\n';
  if (paperTitle || author) final += '\n' + repeat('═', 60) + '\n\n';

  if (quant) final += quant;
  if (qual)  { if (quant) final += '\n' + repeat('─', 60) + '\n\n'; final += qual; }

  showOutput('paper-output', 'paper-final-text', final);
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

// ============================================================
//  CLEAR FUNCTIONS
// ============================================================
function clearQuantitative() {
  document.getElementById('q-title').value = '';
  document.getElementById('q-total').value = '';
  document.getElementById('demo-container').innerHTML = '';
  document.getElementById('q-questions-container').innerHTML = '';
  document.getElementById('likert-container').innerHTML = '';
  document.getElementById('likert-card').style.display = 'none';
  document.getElementById('q-output').style.display = 'none';
  document.getElementById('q-output-text').textContent = '';
  questionCount = 0; likertCount = 0; demoCount = 0;
}

function clearQualitative() {
  document.getElementById('ql-topic').value = '';
  document.getElementById('ql-participants').value = '';
  document.getElementById('ql-responses-container').innerHTML = '';
  document.getElementById('ql-output').style.display = 'none';
  document.getElementById('ql-output-text').textContent = '';
  responseCount = 0;
}

// ============================================================
//  UI HELPERS
// ============================================================
function showOutput(areaId, textId, content) {
  var area = document.getElementById(areaId);
  var text = document.getElementById(textId);
  area.style.display = 'block';
  text.textContent   = content;
  area.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

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

function repeat(char, n) {
  var s = '';
  for (var i = 0; i < n; i++) s += char;
  return s;
}
