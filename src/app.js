(() => {
  'use strict';
  const M = globalThis.PurchaseMath;
  const $ = s => document.querySelector(s);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const fmt = (v, digits = 2) => new Intl.NumberFormat('ru-RU', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Math.abs(v) < 1e-10 ? 0 : v).replace('-', '−');
  const integer = v => fmt(v, 0);
  const dayWord = v => v % 10 === 1 && v % 100 !== 11 ? 'день' : v % 10 >= 2 && v % 10 <= 4 && (v % 100 < 12 || v % 100 > 14) ? 'дня' : 'дней';
  const signed = v => (v > 0 ? '+' : '') + fmt(v);
  const tone = v => v < 0 ? 'negative' : 'positive';
  const show = (condition, html) => condition ? `<div class="reveal">${html}</div>` : '';
  const equation = (label, html, extra = '') => `<div class="equation-band ${extra}"><div class="label">${label}</div><div class="formula">${html}</div></div>`;
  const choose = (action, value, label, selected) => `<button class="choice ${selected ? 'selected' : ''}" data-action="${action}" data-value="${value}" data-focus="${action}-${value}" aria-pressed="${selected}">${label}</button>`;
  const steps = [
  {
    "nav": "Условие задачи",
    "title": "Сколько товара закупать?",
    "section": "Задача",
    "intro": "Маленький магазин, скоропортящийся продукт и спрос, который заранее неизвестен.",
    "steps": [
      "Цены и порядок дня",
      "Прибыль и потеря на единице",
      "Критерий выбора"
    ]
  },
  {
    "nav": "Вероятности спроса",
    "title": "От наблюдений к вероятностям",
    "section": "Данные",
    "intro": "Спрос принимал значения 1, 2, 3 и 4. Частоты превращаем в вероятности.",
    "steps": [
      "Частоты спроса",
      "Общее число наблюдений",
      "Деление на 100",
      "Проверка суммы"
    ]
  },
  {
    "nav": "Прибыль за день",
    "title": "Как получается дневная прибыль",
    "section": "Модель",
    "intro": "Выберите закупку q и спрос D. Проследим путь каждой единицы товара и каждого рубля.",
    "steps": [
      "Купили 2, спрос равен 1",
      "Выручка днём",
      "Выручка вечером",
      "Затраты на закупку",
      "Прибыль"
    ]
  },
  {
    "nav": "Матрица прибыли",
    "title": "Все сочетания закупки и спроса",
    "section": "Модель",
    "intro": "Строки показывают закупку, столбцы показывают спрос. Нажмите на ячейку, чтобы разобрать её.",
    "steps": [
      "Один расчёт",
      "Все 16 сочетаний",
      "Строка закупки двух единиц"
    ]
  },
  {
    "nav": "Байес—Лаплас · перебор",
    "title": "Критерий Байеса—Лапласа: прямой перебор",
    "section": "Основное решение",
    "intro": "Критерий задаёт цель — максимум ожидаемой прибыли. Прямой перебор вычисляет её для каждой закупки.",
    "steps": [
      "Берём прибыль и вероятность",
      "Умножение",
      "Что означает средняя прибыль",
      "Выбираем лучшую закупку",
      "Сложность и сравнение с перебором"
    ]
  },
  {
    "nav": "Ожидаемые потери",
    "title": "Минимизация ожидаемых потерь",
    "section": "Эквивалентная проверка",
    "intro": "Оцениваем упущенную выгоду для каждого спроса и выбираем закупку с минимальными средними потерями.",
    "steps": [
      "Один пример без новых букв",
      "Что означают b и r",
      "Усредняем потери",
      "Почему выбор совпадает",
      "Сложность и сравнение с перебором"
    ]
  },
  {
    "nav": "Динамическое программирование",
    "title": "Динамическое программирование",
    "section": "Связь между днями",
    "intro": "В многоэтапной модели учитывают запас и будущую прибыль. Посмотрим, что остаётся от неё здесь.",
    "steps": [
      "Почему дни начинаются одинаково",
      "Что означают V и индексы",
      "Подставляем дневной максимум",
      "Считаем за несколько дней",
      "Сложность и сравнение с перебором"
    ]
  },
  {
    "nav": "Ходж—Леман · доверие",
    "title": "Критерий Ходжа—Лемана",
    "section": "Дополнительный анализ",
    "intro": "Что изменится, если доверие к оценённым вероятностям неполное? Отдельно исследуем более осторожный критерий.",
    "steps": [
      "Зачем добавлять осторожность",
      "Объясняем вес ν и оценку H",
      "Подставляем числа",
      "Когда меняется выбор",
      "Сложность и сравнение с перебором"
    ]
  },
  {
    "nav": "Сравнение и книги",
    "title": "Критерии выбора и способы расчёта",
    "section": "Сравнение",
    "intro": "Разделяем основную задачу с вероятностями, вычислительные способы и дополнительный анализ доверия.",
    "steps": [
      "Четыре подхода из книг",
      "Общий вывод и источники"
    ]
  },
  {
    "nav": "Ответ и его смысл",
    "title": "Оптимальная закупка — две единицы",
    "section": "Результат",
    "intro": "Ответ по максимуму ожидаемой прибыли при сохранении оценённого распределения спроса.",
    "steps": [
      "Оптимальная закупка",
      "Что произойдёт в отдельный день",
      "Проверка среднего"
    ]
  }
];
  const state = { stage:0, step:0, q:2, d:1, matrixQ:2, matrixD:1, probD:2, expectedQ:2, lossQ:2, lossD:1, days:7, confidence:1, completed:new Set() };

  function task(s) {
    return `<div class="content-block"><section class="task-statement" aria-labelledby="taskStatementTitle"><h2 id="taskStatementTitle">Условие задачи</h2><p>Владелец небольшого магазина в начале каждого дня закупает для реализации некий скоропортящийся продукт по цене 50 рублей за единицу. Цена реализации этого продукта — 60 рублей за единицу.</p><p>Из наблюдений известно, что спрос на этот продукт за день может быть равен 1, 2, 3 или 4 единицам. Пусть известно, что на практике спрос 1 наблюдался 15 раз, спрос 2 наблюдался 30 раз, спрос 3 наблюдался 30 раз, спрос 4 наблюдался 25 раз.</p><p>Если продукт в течение дня не распродан, то в конце дня его всегда покупают по цене 30 рублей за единицу.</p><p class="task-question"><strong>Сколько единиц этого продукта должен закупать владелец магазина каждый день?</strong></p></section><div class="prices"><div class="price"><div class="price-title">Закупка утром</div><span class="big-number">50<span class="unit">руб./ед.</span></span></div><div class="price"><div class="price-title">Продажа днём</div><span class="big-number">60<span class="unit">руб./ед.</span></span></div><div class="price"><div class="price-title">Продажа остатка</div><span class="big-number">30<span class="unit">руб./ед.</span></span></div></div><div class="day-flow"><div class="day-step"><strong>Утро</strong>Выбираем, сколько купить — q</div><div class="day-step"><strong>День</strong>Спрос, обозначенный D: 1, 2, 3 или 4</div><div class="day-step"><strong>Вечер</strong>Весь остаток покупают</div></div>${show(s >= 1, `<div class="economics"><div class="economics-item"><span>Если единицу продали днём</span><div class="formula positive">60 − 50 = <b>+10 руб.</b></div></div><div class="economics-item"><span>Если единица осталась до вечера</span><div class="formula negative">30 − 50 = <b>−20 руб.</b></div></div></div>`)}${show(s >= 2, `<div class="criterion">Выбираем закупку с <strong>максимальной ожидаемой прибылью</strong></div><p class="note">q = 0 даёт 0 руб. Каждая единица сверх 4 всегда остаётся и уменьшает прибыль на 20 руб. Поэтому сравним q = 1, 2, 3, 4 с нулевой закупкой.</p>`)}</div>`;
  }

  function probabilities(s) {
    const i = state.probD - 1;
    return `<div class="table-wrap"><table class="prob-table"><thead><tr><th>Спрос D</th><th>Наблюдений</th><th aria-label="Частота"></th><th>Вероятность</th></tr></thead><tbody>${M.demand.map((d,i) => `<tr class="${state.probD === d ? 'selected' : ''}"><td><button class="row-select" data-action="prob" data-value="${d}" data-focus="prob-${d}" aria-label="Выбрать спрос ${d}">${d}</button></td><td>${M.counts[i]}</td><td><div class="bar-track"><div class="bar-fill" style="width:${M.counts[i] / 30 * 100}%"></div></div></td><td>${s >= 2 ? `<span class="reveal-cell">${M.counts[i]} / 100 = <b>${fmt(M.probabilities[i])}</b></span>` : '<span class="cell-blank">пока не рассчитана</span>'}</td></tr>`).join('')}</tbody></table></div>${show(s >= 1, `<div class="total-line"><span>Всего наблюдений</span><strong>15 + 30 + 30 + 25 = 100</strong></div>`)}${show(s >= 2, equation(`Спрос ${state.probD} · выбранная строка`, `Вероятность спроса ${state.probD}: P(D = ${state.probD}) = ${M.counts[i]} / 100 = <b class="formula-result">${fmt(M.probabilities[i])}</b>`))}${show(s >= 3, `<div class="inline-note">Проверка: 0,15 + 0,30 + 0,30 + 0,25 = <strong>1</strong><br>Сумма вероятностей равна единице. Все четыре исхода учтены.</div>`)}`;
  }

  function daily(s) {
    const q=state.q,d=state.d,sold=Math.min(q,d),left=Math.max(q-d,0),lost=Math.max(d-q,0),cash=60*sold,salvage=30*left,cost=50*q,profit=M.profit(q,d);
    const units=[...Array(q)].map((_,i)=>`<div class="product ${i<sold?'sold':'leftover'}"><span class="product-num">${i+1}</span><span class="product-label">${i<sold?'днём за 60 ₽':'вечером за 30 ₽'}</span></div>`).join('');
    const slot=(visible,html)=>visible?html:'<span class="placeholder-value">ещё не считаем</span>';
    return `${symbolCards([['q','Сколько единиц купили утром.'],['D','Сколько единиц захотели купить днём.']])}<div class="selector-row"><div class="selector"><span class="selector-label">Купили q</span>${[0,1,2,3,4,5].map(v=>choose('q',v,v,q===v)).join('')}</div><div class="selector"><span class="selector-label">Спрос D</span>${M.demand.map(v=>choose('d',v,v,d===v)).join('')}</div></div><div class="example-heading">Купили ${q}, спрос ${d}: днём продали ${sold}, до вечера осталось ${left}.</div><div class="inventory">${units||'<p>Не закупали товар — нечего продавать.</p>'}</div>${lost?`<p class="note">Не хватило ${lost} ед. По условию отдельного штрафа за это нет.</p>`:''}<div class="cashflow"><div class="cashflow-item"><small>1. Выручка днём</small>${slot(s>=1,`<div class="formula">60 × ${sold} = ${cash}</div>`)}</div><div class="cashflow-item"><small>2. Выручка вечером</small>${slot(s>=2,`<div class="formula">30 × ${left} = ${salvage}</div>`)}</div><div class="cashflow-item"><small>3. Потратили на закупку</small>${slot(s>=3,`<div class="formula">50 × ${q} = ${cost}</div>`)}</div></div>${show(s>=4,`${symbolCards([['П(q,D)','Прибыль при выбранных закупке q и спросе D.']])}${equation('Прибыль = обе выручки − затраты',`П(${q},${d}) = ${cash} + ${salvage} − ${cost} = <b class="${tone(profit)}">${integer(profit)} руб.</b>`)}<p>Если купили 2 единицы и спрос был не меньше 2, обе продадутся днём: <strong>120 − 100 = 20 руб.</strong></p>${detailBox('Та же логика в общей формуле',`<p>Днём продаётся меньшее из q и D — это min(q,D). Остаток равен q − D, если он положителен: max(q − D,0).</p><div class="formula">П(q,D) = 60 · min(q,D) + 30 · max(q − D,0) − 50q</div>`)}`)}`;
  }

  function matrix(s) {
    const q=state.matrixQ, d=state.matrixD;
    return `<p>Каждая ячейка считается так же, как в предыдущем разделе: обе выручки минус закупка. Выбираем строку по закупке q и столбец по спросу D.</p><div class="table-wrap"><table class="matrix"><thead><tr><th>Закупка q</th>${M.demand.map(d=>`<th>D = ${d}</th>`).join('')}</tr></thead><tbody>${M.demand.map(q=>`<tr class="${s>=2&&q===2?'optimal':''}"><td class="q-head">${q}</td>${M.demand.map(d=>`<td><button class="matrix-cell ${state.matrixQ===q&&state.matrixD===d?'chosen':''}" data-action="matrix" data-q="${q}" data-d="${d}" data-focus="matrix-${q}-${d}" aria-label="Закупка ${q}, спрос ${d}, прибыль ${M.profit(q,d)} рублей">${s>=1||state.matrixQ===q&&state.matrixD===d?integer(M.profit(q,d)):'·'}</button></td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="matrix-explainer">Значения в рублях. ${s===0?'Пока раскрыта выбранная ячейка.':'Любая ячейка раскрывает свой расчёт.'}</p><div class="calculation-detail"><div class="section-label">Закупка ${q}, спрос ${d}</div><div class="formula">П(${q}, ${d}) = 60 × ${Math.min(q,d)} + 30 × ${Math.max(q-d,0)} − 50 × ${q}<br>= ${60*Math.min(q,d)} + ${30*Math.max(q-d,0)} − ${50*q} = <b class="${tone(M.profit(q,d))}">${integer(M.profit(q,d))} руб.</b></div></div>${show(s>=2,`<div class="inline-note">При q = 2 есть только два результата: <strong>−10 руб.</strong> при D = 1 и <strong>+20 руб.</strong> при D = 2, 3, 4. Чтобы выбрать закупку, теперь учтём вероятности.</div>`)}`;
  }

  function expectationChart() {
    return `<div class="compare-chart"><div class="section-label">Ожидаемая прибыль, руб./день</div><div class="expect-chart" role="group" aria-label="Сравнение ожидаемой прибыли для закупки от одной до четырёх единиц">${M.demand.map(q=>{const e=M.expected(q), h=Math.abs(e)*6;return `<button class="bar-column ${q===2?'winner':''} ${e<0?'negative':''} ${q===state.expectedQ?'active':''}" style="--bar-height:${e<0?0:h}px" data-action="eq" data-value="${q}" data-focus="bar-${q}" aria-label="Закупка ${q}, ожидаемая прибыль ${fmt(e)} рубля"><span class="bar" style="height:${h}px"></span><span class="bar-value">${fmt(e)}</span><span class="bar-label">q = ${q}</span></button>`;}).join('')}</div><p class="best-summary"><strong>Максимум при q = 2</strong><br>На 5,50 руб. больше, чем при q = 1.<br>На 3,50 руб. больше, чем при q = 3.</p></div>`;
  }

  function expected(s) {
    const q=state.expectedQ,weighted=M.demand.map((d,i)=>M.profit(q,d)*M.probabilities[i]);
    return `<div class="selector-row"><div class="selector"><span class="selector-label">Проверяем закупку q</span>${M.demand.map(v=>choose('eq',v,`${v} ед.`,q===v)).join('')}</div></div><p>Берём <strong>строку q = ${q} из матрицы прибыли</strong>. Рядом ставим <strong>вероятности из наблюдений</strong>.</p><div class="table-wrap"><table class="mini-table"><thead><tr><th>Спрос D</th><th>Прибыль из матрицы</th><th>Вероятность p</th><th>Вклад в среднее</th></tr></thead><tbody>${M.demand.map((d,i)=>`<tr><td>${d}</td><td>${integer(M.profit(q,d))} руб.</td><td>${fmt(M.probabilities[i])}</td><td>${s>=1?`${integer(M.profit(q,d))} × ${fmt(M.probabilities[i])} = <b>${fmt(weighted[i])}</b>`:'прибыль × вероятность'}</td></tr>`).join('')}</tbody></table></div>${show(s>=1,'<p class="note">Более вероятный исход сильнее влияет на средний результат. Поэтому прибыли нельзя просто сложить и поделить на четыре.</p>')}${show(s>=2,`${symbolCards([['E(q)','Средняя, или ожидаемая, прибыль при закупке q.']])}${equation('Складываем четыре вклада',`E(${q}) = ${signedSum(weighted)} = <b class="formula-result">${fmt(M.expected(q))} руб./день</b>`)}<p>Это средний результат с учётом вероятностей. При q = 2 в отдельный день будет −10 или +20 руб.; число 15,50 получается при усреднении.</p>`)}${show(s>=3,`${expectationChart()}<div class="decision-result"><span>Основной ответ найден</span><strong>Покупать 2 единицы</strong><p>max(0; 10; 15,50; 12; −0,50) = <b>15,50 руб./день</b>.</p><p>Дальше проверим этот выбор другими способами.</p></div>${detailBox('Все подстановки для четырёх закупок',expectedCalculations())}`)}`;
  }

  function dynamic(s) {
    return `<p class="example-heading">Каждое утро начинаем с нулевого запаса.</p><div class="timeline">${[1,2,3].map(d=>`<div class="timeline-day"><small>День ${d}</small><strong>Закупка → продажи</strong><span>Вечером продаём весь остаток</span><br><span>К следующему утру запас = 0</span></div>`).join('')}</div><p>Сегодняшняя закупка не меняет завтрашний запас. При одинаковых ценах и вероятностях дневная задача повторяется.</p>${show(s>=1,`<h2 class="subheading">Сначала смысл, затем обозначения</h2><div class="plain-formula">Лучший результат за оставшиеся дни<br>= прибыль сегодня + лучший результат последующих дней.</div>${symbolCards([['t','Номер текущего дня; t + 1 — следующий.'],['0','Запас перед закупкой равен нулю.'],['Vₜ(0)','Лучшая ожидаемая сумма прибыли от дня t до конца периода.'],['Vₜ₊₁(0)','Лучшая ожидаемая прибыль следующих дней.']])}<p>q и D уже знакомы. E означает среднее по вероятностям, max по q — выбор лучшей закупки.</p>${equation('Формула для описанного выбора','Vₜ(0) = max по q E[П(q,D) + Vₜ₊₁(0)]')}`)}${show(s>=2,`<p>Будущая задача не зависит от сегодняшней закупки. Поэтому к лучшему дневному результату прибавляем будущую прибыль.</p>${equation('Дневной максимум из раздела Байеса—Лапласа','max(0; 10; 15,50; 12; −0,50) = <strong>15,50 при q = 2</strong>')}${equation('Подставляем его в формулу','Vₜ(0) = 15,50 + Vₜ₊₁(0)')}<div class="derivation-chain"><div>После последнего дня будущая прибыль = 0.</div><div>Один день: 15,50 + 0 = <strong>15,50</strong>.</div><div>Два дня: 15,50 + 15,50 = <strong>31,00</strong>.</div></div>`)}${show(s>=3,`<div class="days-control"><label for="days">Период: <strong id="daysCount">${state.days} ${dayWord(state.days)}</strong></label><input id="days" data-focus="days" type="range" min="1" max="30" value="${state.days}" aria-label="Количество независимых дней"></div><div class="days-total"><span id="daysFactor">${state.days}</span> × 15,50 = <span class="positive" id="daysIncome">${fmt(state.days*15.5)} руб.</span></div><p id="daysSummary">Ожидаемая суммарная прибыль за ${state.days} ${dayWord(state.days)} при закупке двух единиц ежедневно.</p><p class="note">Здесь многоэтапная схема свелась к повторению дневного выбора. Её преимущество появляется, когда дни связаны переносом запасов или общими ограничениями.</p>`)}`;
  }

  function comparison(s) { return comparisonExpanded(s); }

  function answer(s) {
    return `<div class="final-hero"><div class="final-q">2<small>единицы каждый день</small></div><div class="final-profit"><div class="big-number">15,50 <small>₽</small></div><p>ожидаемая прибыль в день</p></div></div>${show(s>=1,`<div class="outcome-split" aria-hidden="true"><div class="loss"></div><div class="gain"></div></div><div class="outcomes"><div>15% дней по модели<strong class="negative">−10 руб.</strong>Если спрос = 1</div><div>85% дней по модели<strong class="positive">+20 руб.</strong>Если спрос = 2, 3 или 4</div></div>`)}${show(s>=2,equation('Проверка среднего',`(−10) × 0,15 + 20 × 0,85 = <b class="formula-result">15,50 руб.</b>`))}${show(s>=2,`<p class="note">15,50 руб. — средний результат по модели, а не доход каждого дня. Оптимум относится к максимуму ожидаемой прибыли при сохранении распределения спроса.</p><div class="restart-row"><button class="button secondary" data-action="goto" data-value="4">Вернуться к перебору</button><button class="text-button" data-action="restart">Пройти с начала</button></div>`)}`;
  }

  const bookRef = text => `<span class="book-citation">${text}</span>`;
  const methodProfiles = {
  "4": {
    "essence": "По критерию Байеса—Лапласа выбираем максимальный средний выигрыш. Вычисляем его прямым перебором всех допустимых закупок.",
    "date": "Без единственной даты",
    "history": "Родзин называет правило максимального среднего выигрыша критерием Байеса—Лапласа (с. 145–146). Прямой перебор — общий вычислительный способ без единственного автора и года создания; его нельзя отождествлять с самим критерием.",
    "sources": "<span class=\"book-citation\">Родзин, 2010, с. 145–146</span><span class=\"book-citation\">Черноморов, 2002, с. 251</span>",
    "complexity": "O(mn)",
    "effort": "m закупок × n значений спроса. Здесь 4 × 4 = 16 сочетаний, плюс отдельная проверка q = 0. Для нашей таблицы это небольшой объём работы.",
    "versus": "Критерий задаёт правило выбора, а перебор — способ вычисления. Даёт точную ожидаемую прибыль каждой закупки. «Точная» здесь означает точный расчёт при принятом распределении, а не отсутствие ошибки его оценки.",
    "origin": "Предоставленные учебники"
  },
  "5": {
    "essence": "Для каждого спроса сравниваем нашу прибыль с лучшей возможной. Усредняем упущенную выгоду и выбираем минимальное значение.",
    "date": "Черноморов · 2002; Родзин · 2010",
    "history": "Черноморов (с. 251) определяет матрицу рисков через недополученный выигрыш и показывает эквивалентность максимального среднего выигрыша и минимального среднего риска. У Родзина есть такой расчёт на с. 139; у Грешилова средний риск определяется через функцию потерь (с. 316–317).",
    "sources": "<span class=\"book-citation\">Черноморов, с. 251</span><span class=\"book-citation\">Родзин, с. 139, 167</span><span class=\"book-citation\">Грешилов, с. 316–317</span>",
    "complexity": "O(mn)",
    "effort": "Сначала находим лучшие прибыли по n столбцам, затем строим m × n потерь и их взвешенные суммы. Здесь 16 сочетаний; отказ от закупки проверяется отдельно.",
    "versus": "Точная эквивалентная запись основного выбора: R(q) = 26,50 − E[П(q,D)]. Минимум потерь достигается там же, где максимум ожидаемой прибыли: q = 2. Дополнительно наглядно показывает упущенную выгоду и ценность точного знания спроса.",
    "origin": "Предоставленные учебники"
  },
  "6": {
    "essence": "Разбиваем период на дни. На каждом этапе выбираем решение с учётом сегодняшней прибыли и лучшего результата оставшихся дней.",
    "date": "Принцип оптимальности Беллмана",
    "history": "Грешилов рассматривает поэтапное решение, состояние системы и принцип оптимальности в §4.1 (с. 185–189). Вычислительные аспекты описаны в §4.5 (с. 204). В нашей задаче к следующему утру запас всегда нулевой, поэтому связь решений между днями исчезает.",
    "sources": "<span class=\"book-citation\">Грешилов, 2014, §4.1, с. 185–189; §4.5, с. 204</span>",
    "complexity": "Здесь O(mn + T)",
    "effort": "Если повторять полный расчёт каждый день, получится O(Tmn). Здесь дневная задача одинакова: один расчёт O(mn) и T сложений. Если нужен только общий итог, после дневного расчёта достаточно умножения на T. Это упрощение нашей модели, а не оценка всех задач динамического программирования.",
    "versus": "Использует тот же дневной максимум, что и перебор. Здесь преимущества в выборе закупки нет: остаток не переносится. Метод полезен, когда дни связаны запасами, бюджетом или другими ограничениями.",
    "origin": "Предоставленные учебники"
  },
  "7": {
    "essence": "Смешиваем среднюю прибыль и худший возможный результат. Вес доверия показывает, насколько владелец полагается на принятое распределение спроса.",
    "date": "Родзин · учебная форма, 2010",
    "history": "В пособии Родзина (с. 146) критерий Ходжа—Лемана объединяет средний выигрыш по Байесу—Лапласу и худший выигрыш по максимину. Параметр ν задаёт степень доверия к принятому распределению вероятностей.",
    "sources": "<span class=\"book-citation\">Родзин, 2010, с. 146</span>",
    "complexity": "O(mn)",
    "effort": "Для каждой закупки находим среднее и минимум по n исходам, затем сравниваем m оценок. После подготовки этих двух характеристик новый вес ν можно проверить за O(m).",
    "versus": "Это другой критерий, а не ускоренный перебор того же ожидания. При ν = 1 совпадает с Байесом—Лапласом и даёт q = 2. При ν < 40/51 выбирает q = 1; при равенстве обе закупки оптимальны по H. Неполное доверие — дополнительное условие анализа, не часть исходной задачи.",
    "origin": "Предоставленные учебники"
  }
};

  function decisionFoundations() {
    return `<section class="theory-note"><h2>Как эта задача описывается в ТПР</h2><dl class="symbol-key"><dt>ЛПР</dt><dd>Владелец магазина.</dd><dt>Альтернативы</dt><dd>Закупки q = 0, 1, 2, 3, 4; объёмы больше 4 заведомо хуже.</dd><dt>Состояния природы</dt><dd>Спрос D = 1, 2, 3, 4. Природа не является противником, который выбирает спрос против продавца.</dd><dt>Последствия</dt><dd>Денежная прибыль П(q, D).</dd><dt>Правило выбора</dt><dd>Максимум ожидаемой денежной прибыли при принятом распределении спроса.</dd></dl><p>Вероятности оцениваются по наблюдениям и далее используются как заданные. Поэтому решаем задачу <strong>в условиях риска</strong>. У Родзина такая ситуация с априорной информацией отнесена к частичной неопределённости; у Peterson risk противопоставлен ignorance — случаю без известных вероятностей.</p><p>Прибыль в рублях используем как целевой показатель. Это эквивалентно линейной полезности денег; для нелинейной функции полезности выбор мог бы измениться. Условие не задаёт такую функцию, поэтому мы её не придумываем.</p><div class="method-sources">${bookRef('Родзин, с. 138–139, 145–146')}${bookRef('Peterson, §1.3, с. 5–7; §4.1, с. 65–66')}</div></section>`;
  }

  function hodgesLehmann(s) {
    const nu=state.confidence,result=M.hodgesLehmann(nu);
    return `<p>Из предыдущих разделов уже известны средняя прибыль и наименьшая прибыль каждой закупки:</p><div class="table-wrap"><table><thead><tr><th>Купили</th><th>Средняя прибыль</th><th>Худшая прибыль из строки матрицы</th></tr></thead><tbody>${M.demand.map(q=>`<tr><td>${q} ед.</td><td>${fmt(M.expected(q))}</td><td>${integer(M.worst(q))}</td></tr>`).join('')}</tbody></table></div>${show(s>=1,`${symbolCards([['ν','Вес доверия к среднему: от 0 до 1. Задаётся владельцем, не получается автоматически из 100 наблюдений.'],['w(q)','Худшая прибыль для закупки q.'],['H(q,ν)','Оценка, которая складывает среднюю и осторожную части.']])}<p>При ν = 1 учитываем только среднюю прибыль E(q). При ν = 0 — только худшую прибыль w(q), то есть максимин Вальда.</p>${equation('Складываем две части с выбранными весами','H(q,ν) = ν · E(q) + (1 − ν) · w(q)')}<div class="confidence-control"><label for="confidence">Вес доверия: ν = <strong id="confidenceValue">${fmt(nu,4)}</strong></label><input id="confidence" data-focus="confidence" type="range" min="0" max="100" step="any" value="${nu*100}" aria-label="Вес доверия к распределению"><div class="confidence-presets">${[[0,'ν = 0'],[.75,'ν = 0,75'],[40/51,'ν = 40/51'],[1,'ν = 1']].map(([value,label])=>`<button class="choice" data-action="confidence" data-value="${value}" data-focus="confidence-${value}">${label}</button>`).join('')}</div></div><p class="note">ν не является вероятностью спроса или статистическим уровнем доверия. Это дополнительная настройка осторожности.</p>`)}${show(s>=2,`<h2 class="subheading">Подставляем числа при выбранном ν</h2><div class="table-wrap"><table class="confidence-table"><thead><tr><th>q</th><th>Средняя часть + осторожная часть</th><th>Оценка H</th></tr></thead><tbody>${M.demand.map((q,i)=>`<tr><td>${q}</td><td id="hlCalc-${q}">${fmt(nu,4)} × ${fmt(M.expected(q))} + (1 − ${fmt(nu,4)}) × (${integer(M.worst(q))})</td><td id="hlValue-${q}">${fmt(result.scores[i],4)}</td></tr>`).join('')}</tbody></table></div><div class="confidence-result"><span>Выбор по новому критерию</span><strong id="hlBest">${result.best.map(q=>'q = '+q).join(' и ')}</strong><p>Максимальная оценка H: <b id="hlBestScore">${fmt(result.maximum,4)}</b></p><p id="hlCompared">${hlComparison(result)}</p></div><p>Например, при ν = 0,75 для двух единиц: 0,75 × 15,50 + 0,25 × (−10) = 11,625 − 2,50 = <strong>9,125</strong>. Для одной единицы всегда H = 10, поэтому осторожный критерий выбрал бы одну.</p><p class="note">H — оценка по новому правилу, а не ожидаемая прибыль. Сама E(2) остаётся 15,50 руб.</p>`)}${show(s>=3,`<section class="hl-exclusion"><h2 class="subheading">Почему закупки 3 и 4 не становятся лучшими?</h2><p>Критерий H смешивает два уже известных показателя: среднюю прибыль E(q) и худшую прибыль w(q). Сначала сравним их по отдельности.</p><div class="table-wrap"><table><thead><tr><th>Купили</th><th>Средняя прибыль E(q), руб.</th><th>Худшая прибыль w(q), руб.</th></tr></thead><tbody><tr class="selected"><td><strong>2 единицы</strong></td><td><strong>15,50</strong></td><td><strong>−10</strong></td></tr><tr><td>3 единицы</td><td>12</td><td>−30</td></tr><tr><td>4 единицы</td><td>−0,50</td><td>−50</td></tr></tbody></table></div><p><strong>Две единицы лучше трёх по обоим показателям:</strong> средняя прибыль выше на 15,50 − 12 = 3,50 руб., а худший результат выше на −10 − (−30) = 20 руб. Убыток 10 руб. выгоднее убытка 30 руб.</p><p><strong>Две лучше четырёх по той же причине:</strong> средняя прибыль выше на 16 руб., худший результат — на 40 руб.</p><div class="inline-note">Вес ν задаёт, сколько внимания уделяем среднему, а вес 1 − ν — худшему исходу. Оба веса неотрицательны. Поскольку закупка двух единиц лучше в каждой части, <strong>любая их смесь тоже будет лучше</strong>. Ни три, ни четыре единицы не смогут обойти две.</div><p>Поэтому остаётся сравнить <strong>одну и две единицы</strong>: у одной лучше худший исход (+10 вместо −10), зато у двух выше средняя прибыль (15,50 вместо 10). Здесь выбор уже зависит от веса ν.</p></section><h2 class="subheading">Когда меняется выбор между одной и двумя единицами?</h2><div class="derivation-chain"><div>Для одной единицы: H₁ = 10.</div><div>Для двух: H₂ = 15,50ν − 10(1 − ν) = 25,50ν − 10.</div><div>На границе: 25,50ν − 10 = 10.</div><div>ν = 20/25,50 = <strong>40/51 ≈ 0,7843</strong>.</div></div><div class="inline-note">Ниже 40/51 → <strong>1 единица</strong>.<br>Выше 40/51 → <strong>2 единицы</strong>.<br>Ровно 40/51 → <strong>оба варианта равноценны по H</strong>.</div><p>Это порог настройки осторожности. Для исходной задачи с ν = 1 ответ остаётся прежним: две единицы.</p>`)}`;
  }

  function hlComparison(result) {
    if (result.best.length === 2) return 'Граница: одна и две единицы дают одинаковую оценку H. По исходному ожиданию лучше две.';
    return result.best[0] === 2 ? 'Совпадает с исходным решением по Байесу—Лапласу: две единицы, средняя прибыль = 15,50 руб./день.' : 'Более осторожный критерий выбрал одну единицу с гарантированной прибылью 10 руб. Максимум исходного ожидания остаётся у двух: 15,50 руб.';
  }

  function updateConfidence() {
    const result = M.hodgesLehmann(state.confidence), nu = state.confidence;
    const setText = (selector, text) => { const element = $(selector); if (element) element.textContent = text; };
    setText('#confidenceValue', fmt(nu,4));
    M.demand.forEach((q, i) => {
      setText(`#hlCalc-${q}`, `${fmt(nu,4)} × ${fmt(M.expected(q))} + (1 − ${fmt(nu,4)}) × (${integer(M.worst(q))})`);
      setText(`#hlValue-${q}`, fmt(result.scores[i],4));
    });
    setText('#hlBest', result.best.map(q => 'q = ' + q).join(' и '));
    setText('#hlBestScore', fmt(result.maximum,4));
    setText('#hlCompared', hlComparison(result));
  }

  function losses(s) {
    const q=state.lossQ,d=state.lossD,actual=M.profit(q,d),best=M.profit(d,d),gap=M.regret(q,d);
    return `<div class="selector-row"><div class="selector"><span class="selector-label">Купили q</span>${M.demand.map(v=>choose('loss',v,v,q===v)).join('')}</div><div class="selector"><span class="selector-label">Спрос D</span>${M.demand.map(v=>choose('lossD',v,v,d===v)).join('')}</div></div><h2 class="subheading">Сравним два решения при одном спросе: D = ${d}</h2><div class="profit-comparison"><div><span>Наша закупка: ${q} ед.</span><strong class="${tone(actual)}">${integer(actual)} руб.</strong><p>Днём: 60 × ${Math.min(q,d)}. Вечером: 30 × ${Math.max(q-d,0)}. Закупка: 50 × ${q}.</p></div><div><span>Если бы спрос знали заранее</span><strong>${integer(best)} руб.</strong><p>Купили бы ровно ${d} ед. и всё продали днём: 60 × ${d} − 50 × ${d}.</p></div></div>${equation('Недополученная прибыль = лучший результат − наш результат',`${integer(best)} − (${integer(actual)}) = <b class="formula-result">${integer(gap)} руб.</b>`)}${q===2&&d===1?'<p class="key-distinction"><strong>Фактический убыток — 10 руб.</strong> А разница с лучшим результатом +10 руб. составляет <strong>20 руб. упущенной выгоды</strong>.</p>':''}${show(s>=1,`${symbolCards([['b(D)','Лучшая прибыль, если спрос D был известен до закупки.'],['r(q,D)','Упущенная выгода: сколько недополучили относительно b(D).']])}<p>Теперь введём короткие обозначения для уже посчитанных величин. Лучший вариант — купить ровно D единиц: <strong>b(D) = (60 − 50)D = 10D</strong>.</p><p>Общее правило: <strong>r(q,D) = b(D) − П(q,D)</strong>.</p>${equation('Обозначения для разобранного примера',`r(${q},${d}) = ${integer(best)} − (${integer(actual)}) = <strong>${integer(gap)} руб.</strong>`)}<h2 class="subheading">Так же считаем остальные ячейки</h2><p class="note">Нажмите на любую ячейку: сравним для неё нашу закупку и решение с известным спросом.</p><div class="table-wrap"><table class="matrix loss-matrix"><thead><tr><th>Купили q</th>${M.demand.map(v=>`<th>D = ${v}</th>`).join('')}${s>=2?'<th>Средние потери</th>':''}</tr></thead><tbody>${M.demand.map(row=>`<tr><td>${row}</td>${M.demand.map(col=>`<td><button class="matrix-cell ${row===q&&col===d?'chosen':''}" data-action="lossCell" data-q="${row}" data-d="${col}" data-focus="lossCell-${row}-${col}" aria-label="Потери при закупке ${row} и спросе ${col}: ${M.regret(row,col)} рублей">${integer(M.regret(row,col))}</button></td>`).join('')}${s>=2?`<td>${fmt(M.expectedRegret(row))}</td>`:''}</tr>`).join('')}</tbody></table></div><div class="selected-loss-calculation"><span>Выбранная ячейка: q = ${q}, D = ${d}</span><p>b(${d}) = 10 × ${d} = ${integer(best)}; П(${q},${d}) = ${integer(actual)}.</p><strong>r(${q},${d}) = ${integer(best)} − (${integer(actual)}) = ${integer(gap)} руб.</strong></div>`)}${show(s>=2,`${symbolCards([['R(q)','Средние потери: усредняем r(q,D) по тем же вероятностям спроса.']])}<p>Используем тот же приём, что для средней прибыли: <strong>каждую потерю умножаем на вероятность и складываем</strong>.</p>${equation('Пример для закупки двух единиц','R(2) = 20 × 0,15 + 0 × 0,30 + 10 × 0,30 + 20 × 0,25<br>= 3 + 0 + 3 + 5 = <b class="formula-result">11 руб.</b>')}${equation('Сравниваем средние потери','min(16,50; 11,00; 14,50; 27,00) = <strong class="formula-result">11 руб. при q = 2</strong>')}${detailBox('Расчёт средних потерь для всех закупок',`<div class="calculation-list">${M.demand.map(row=>`<div class="worked-row"><span>q = ${row}</span><div>R${row} = ${M.demand.map((col,i)=>`${integer(M.regret(row,col))} × ${fmt(M.probabilities[i])}`).join(' + ')} = <strong>${fmt(M.expectedRegret(row))} руб.</strong></div></div>`).join('')}</div>`)}`)}${show(s>=3,`<h2 class="subheading">Почему ответ совпал?</h2><p>Лучшие прибыли при спросе 1, 2, 3, 4 равны 10, 20, 30, 40 руб. Их среднее:</p>${equation('Если бы каждый день знали спрос заранее','10 × 0,15 + 20 × 0,30 + 30 × 0,30 + 40 × 0,25<br>= 1,50 + 6 + 9 + 10 = <strong>26,50 руб./день</strong>')}<p>Средние потери — это 26,50 минус наша средняя прибыль. Поэтому уменьшать потери и увеличивать прибыль — один и тот же выбор.</p>${equation('Связь с найденным ответом','R(q) = 26,50 − E(q)<br>При q = 2: 26,50 − 15,50 = <strong>11 руб.</strong>')}<p>Точное знание спроса до закупки добавило бы в среднем <strong>11 руб./день</strong>. Это ценность совершенной информации; обычный прогноз может быть менее полезен.</p>`)}`;
  }

  function bookBibliography() {
    return `<section class="book-bibliography"><h2>Учебная основа разбора</h2><p>Номера ниже — страницы издания. Для Peterson дополнительно указан номер страницы PDF: перед основным текстом есть вводные страницы.</p><ol><li><strong>Черноморов Г. А. Теория принятия решений.</strong> Новочеркасск, 2002.<br>С. 168–169 — вероятностные модели и критерий математического ожидания; с. 251 — матрица рисков и эквивалентность среднего выигрыша и средних потерь; с. 253 — критерии при неизвестных вероятностях.</li><li><strong>Родзин С. И. Теория принятия решений: лекции и практикум.</strong> Таганрог, 2010.<br>С. 138–139 — информация о состояниях природы; с. 145–146 — Байес—Лаплас; с. 146 — Ходж—Леман; с. 167 — цена информации. Предоставленные PDF и DOCX — два формата одного пособия.</li><li><strong>Грешилов А. А. Математические методы принятия решений.</strong> 2-е изд., 2014.<br>§4.1, с. 185–189 — этапы, состояние, принцип оптимальности; §4.5, с. 204 — вычислительные аспекты; §6.1, с. 316–317 — полезность, функция потерь, средний риск.</li><li><strong>Peterson M. An Introduction to Decision Theory.</strong> Cambridge University Press, 2009.<br>§1.3, с. 5–7 (PDF 16–18) — risk и ignorance; §4.1, с. 65–66 (PDF 76–77) — различие ожидаемой денежной ценности и ожидаемой полезности.</li></ol><p class="note">Книги задают определения и критерии. Все числовые примеры с магазином и порог 40/51 рассчитаны по нашему условию. Оценки сложности относятся к описанным алгоритмам и не выдаются за цитаты из учебников. Для всех четырёх подходов указаны страницы предоставленных книг. Годы изданий не являются датами создания методов.</p></section>`;
  }

  function methodOverview(stage) {
    const p=methodProfiles[stage];
    if(!p)return '';
    return `<section class="method-overview compact-overview" aria-label="Суть метода"><div class="method-origin">${p.origin}</div><div class="section-label">Краткая суть метода</div><p class="method-essence">${p.essence}</p></section>`;
  }

  function methodEvaluation(stage) {
    const p = methodProfiles[stage];
    return `<section class="method-evaluation" aria-label="Сложность и сравнение с перебором"><div class="complexity-heading"><h2>Вычислительная сложность</h2><span class="complexity-value">${p.complexity}</span></div><p class="notation-key">m — число вариантов закупки; n — число значений спроса; T — дни планирования. Здесь m = n = 4.</p><p>Запись O(...) показывает, как растёт объём вычислений при увеличении размера задачи. Это порядок роста, а не точное число операций или время в секундах.</p><p>${p.effort}</p><h2>${stage === 4 ? 'Роль прямого перебора' : 'Сравнение с прямым перебором'}</h2><p>${p.versus}</p></section>`;
  }

  function signedSum(values, digits = 2) {
    return values.map((v, i) => i === 0 ? fmt(v, digits) : `${v < 0 ? ' − ' : ' + '}${fmt(Math.abs(v), digits)}`).join('');
  }

  function expectedCalculations() {
    return `<section class="worked-calculations"><h2>Расчёт для каждой закупки</h2><p>Каждый исход умножаем на его вероятность. Сравниваем суммы, а не отдельные удачные дни.</p><div class="calculation-list">${M.demand.map(q => {
      const profits = M.demand.map(d => M.profit(q, d));
      const terms = profits.map((v, i) => `${i ? (v < 0 ? ' − ' : ' + ') : v < 0 ? '−' : ''}${integer(Math.abs(v))} × ${fmt(M.probabilities[i])}`).join('');
      return `<div class="worked-row ${q === 2 ? 'worked-winner' : ''}"><span class="worked-label">q = ${q}</span><div><div>E${q} = ${terms}</div><div>= ${signedSum(profits.map((v, i) => v * M.probabilities[i]))} = <strong>${fmt(M.expected(q))} руб.</strong></div></div></div>`;
    }).join('')}</div>${equation('Выбор максимума, включая отказ от закупки', 'max(0; 10; 15,50; 12; −0,50) = <b class="formula-result">15,50 руб. при q = 2</b>')}</section>`;
  }

  function comparisonExpanded(s) {
    const statuses={4:'Основной критерий и способ вычисления',5:'Эквивалентная проверка',6:'Многоэтапная схема',7:'Дополнительный критерий доверия'};
    return `<p>Сравниваем четыре подхода, изложенные в предоставленных книгах. Основное решение получено перебором средних прибылей; остальные подходы поясняют его или рассматривают дополнительное условие.</p><section class="worked-calculations"><h2>Четыре подхода из учебников</h2><p class="notation-key">m — варианты закупки; n — исходы спроса; T — дни планирования. Здесь m = n = 4; отказ от закупки проверяется отдельно.</p><div class="table-wrap"><table class="comparison complexity-comparison"><thead><tr><th>Подход и источник</th><th>Сложность</th><th>Результат</th><th>Сравнение с перебором</th></tr></thead><tbody>${Object.entries(methodProfiles).map(([stage,p])=>`<tr class="${+stage===4?'selected':''}"><td>${steps[stage].nav}<br><small>${statuses[stage]}</small><div class="method-sources">${p.sources}</div></td><td>${p.complexity}</td><td>${+stage===7?'По H: '+M.hodgesLehmann(state.confidence).best.map(q=>'q = '+q).join(' или ')+'<br>при ν = '+fmt(state.confidence,4):'q = 2'}</td><td>${p.versus}</td></tr>`).join('')}</tbody></table></div>${show(s>=1,`<div class="inline-note"><strong>Как связаны результаты?</strong><br>Байес—Лаплас максимизирует среднюю прибыль. Средние потери равны 26,50 минус эта прибыль, поэтому их минимум даёт тот же ответ. Динамическая схема повторяет лучший дневной выбор. Ходж—Леман при ν &lt; 1 вводит осторожность и может предпочесть одну единицу.</div><p>Для исходного условия: <strong>покупать две единицы, ожидаемая прибыль 15,50 руб./день</strong>. Прямой перебор показывает все 16 сочетаний и позволяет проверить каждую сумму.</p>`)}</section>${detailBox('Книги и страницы, на которых основан разбор',bookBibliography())}`;
  }

  function detailBox(label,html) {
    return `<details class="lesson-details"><summary>${label}</summary><div class="detail-body">${html}</div></details>`;
  }

  function symbolCards(items) {
    return `<dl class="symbol-strip">${items.map(([term,meaning])=>`<div><dt>${term}</dt><dd>${meaning}</dd></div>`).join('')}</dl>`;
  }

  function teachingContext(stage) {
    const messages=[
  "Сначала разберём условие, затем найдём лучшую закупку. После этого проверим ответ другими способами.",
  "Из условия известны частоты спроса. Превратим их в вероятности, которые понадобятся при усреднении прибыли.",
  "Вероятности уже найдены. Пока отложим их и разберём один конкретный день: купили 2 единицы, спрос оказался равен 1.",
  "Мы научились считать прибыль одного дня. Теперь тем же действием заполним таблицу для всех закупок и значений спроса.",
  "У нас есть два набора данных: прибыли из матрицы и вероятности спроса. Объединим их и выберем лучшую закупку.",
  "Основной ответ уже найден: 2 единицы, средняя прибыль 15,50 руб. Проверим его через недополученную прибыль.",
  "Лучший дневной выбор известен. Посмотрим, меняется ли он, если планировать работу сразу на несколько дней.",
  "До этого мы использовали вероятности как заданные. Теперь отдельно посмотрим, что меняет неполное доверие к этим оценкам.",
  "Все четыре подхода рассмотрены. Сравним основной расчёт, его проверку и дополнительное условие осторожности.",
  "Возвращаемся к вопросу владельца магазина: сколько покупать и какой результат ожидать."
];
    return `<div class="lesson-context"><span>Связь с предыдущим шагом</span><p>${messages[stage]}</p></div>`;
  }

  function methodBackground(stage) {
    const p=methodProfiles[stage];
    if(!p)return '';
    return detailBox('История и источники',`<p class="history-date">${p.date}</p><p>${p.history}</p><div class="method-sources">${p.sources||''}</div>`);
  }

  const baseRenders=[task,probabilities,daily,matrix,expected,losses,dynamic,hodgesLehmann,comparison,answer];
  const renders=baseRenders.map((renderStage,stage)=>s=>{
    let extra='';
    if(stage===0&&s>=2)extra='<div class="learning-route">Данные → Прибыль дня → Средняя прибыль → Выбор → Проверка</div>'+detailBox('Почему выбираем по средней прибыли',decisionFoundations());
    if(stage===1&&s>=3)extra='<p class="note">Частоты дают оценки вероятностей. Для основного решения используем неизменное распределение.</p>';
    return teachingContext(stage)+methodOverview(stage)+renderStage(s)+extra+(methodProfiles[stage]&&s===4?methodEvaluation(stage):'')+methodBackground(stage);
  });

  function renderContent() {
    const root=$('#stageContent');
    const focusKey=root.contains(document.activeElement)?document.activeElement?.dataset?.focus:null;
    const scrolls=Array.from(root.querySelectorAll('.table-wrap'),table=>({left:table.scrollLeft,top:table.scrollTop}));
    root.innerHTML=renders[state.stage](state.step);
    root.querySelectorAll('.table-wrap').forEach((table,i)=>{if(scrolls[i]){table.scrollLeft=scrolls[i].left;table.scrollTop=scrolls[i].top;}});
    if(focusKey)root.querySelector(`[data-focus="${focusKey}"]`)?.focus({preventScroll:true});
  }

  function render(options={}) {
    const scrollPosition={left:window.scrollX,top:window.scrollY};
    const meta=steps[state.stage], last=state.step===meta.steps.length-1;
    if(last)state.completed.add(state.stage);
    $('#stageNav').innerHTML=steps.map((item,i)=>`<button class="nav-item ${i===state.stage?'active':''} ${state.completed.has(i)?'done':''}" data-action="goto" data-value="${i}" ${i===state.stage?'aria-current="step"':''}><span class="nav-num">${state.completed.has(i)&&i!==state.stage?'✓':String(i+1).padStart(2,'0')}</span><span>${item.nav}</span></button>`).join('');
    $('#sectionLabel').textContent=meta.section;
    $('#stageCounter').textContent=String(state.stage+1).padStart(2,'0')+' / '+steps.length;
    $('#overallProgress').style.width=((state.stage+(state.step+1)/meta.steps.length)/steps.length*100)+'%';
    $('#stageTitle').textContent=meta.title;
    $('#stageIntro').textContent=meta.intro;
    $('#stepDots').innerHTML=`<div class="step-dots">${meta.steps.map((label,i)=>`<button class="step-dot ${i===state.step?'active':i<state.step?'past':''}" data-action="step" data-value="${i}" aria-label="Шаг ${i+1}: ${label}" title="${label}" ${i===state.step?'aria-current="step"':''}></button>`).join('')}</div>`;
    renderContent();
    $('#revealAll').textContent=last?'Свернуть до начала':'Показать весь этап';
    $('#stepHint').textContent=meta.steps[state.step];
    $('#stepCaption').textContent=`Шаг ${state.step+1} из ${meta.steps.length}`;
    $('#prev').disabled=state.stage===0&&state.step===0;
    $('#next').innerHTML=(last?state.stage===steps.length-1?'Сначала':'Следующий этап':'Следующий шаг')+' <span aria-hidden="true">→</span>';
    $('#next').setAttribute('aria-label',last?state.stage===steps.length-1?'Вернуться к началу':`Следующий этап: ${steps[state.stage+1]?.nav}`:`Следующий шаг: ${meta.steps[state.step+1]}`);
    const hash=`#stage=${state.stage+1}&step=${state.step+1}`;
    if(location.hash!==hash)history[options.history==='push'?'pushState':'replaceState'](null,'',hash);
    if(options.announce)$('#announcer').textContent=`${meta.title}. Шаг ${state.step+1}: ${meta.steps[state.step]}`;
    if(options.navigation){window.scrollTo({top:0,left:0,behavior:'auto'});$('#main').focus({preventScroll:true});}
    else window.scrollTo({...scrollPosition,behavior:'auto'});
  }

  function index(value,max){return Math.max(0,Math.min(max,Number.isFinite(Number(value))?Math.trunc(Number(value)):0));}
  function go(stage,step=0,options={}) {
    const targetStage=index(stage,steps.length-1), targetStep=index(step,steps[targetStage].steps.length-1);
    const changed=state.stage!==targetStage, navigation=changed;
    state.stage=targetStage;
    state.step=targetStep;
    render({newStage:changed,navigation,announce:true,history:options.history??'push'});
  }

  function next(){if(state.step<steps[state.stage].steps.length-1)go(state.stage,state.step+1);else if(state.stage<steps.length-1)go(state.stage+1);else go(0);}
  function prev(){if(state.step>0)go(state.stage,state.step-1);else if(state.stage>0)go(state.stage-1,steps[state.stage-1].steps.length-1);}
  function closeMenu(){$('#sidebar').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false');}

  document.addEventListener('click',event=>{
    const b=event.target.closest('[data-action]');if(!b||b.disabled)return;
    const action=b.dataset.action,v=Number(b.dataset.value);
    if(action==='goto'){if(event.detail>1)return;go(v);closeMenu();return;}
    if(action==='step'){if(event.detail>1)return;go(state.stage,v);return;}
    if(action==='restart'){if(event.detail>1)return;go(0);return;}
    if(action==='confidence'){state.confidence=Number.isFinite(v)?Math.max(0,Math.min(1,v)):1;renderContent();return;}
    if(action==='q')state.q=v;
    else if(action==='d')state.d=v;
    else if(action==='prob')state.probD=v;
    else if(action==='matrix'){state.matrixQ=Number(b.dataset.q);state.matrixD=Number(b.dataset.d);}
    else if(action==='eq')state.expectedQ=v;
    else if(action==='loss')state.lossQ=v;
    else if(action==='lossD')state.lossD=v;
    else if(action==='lossCell'){state.lossQ=Number(b.dataset.q);state.lossD=Number(b.dataset.d);}
    renderContent();
  });
  document.addEventListener('input',event=>{if(event.target.id==='days'){
    state.days=index(Number(event.target.value)-1,29)+1;
    $('#daysCount').textContent=`${state.days} ${dayWord(state.days)}`;
    $('#daysFactor').textContent=String(state.days);
    $('#daysIncome').textContent=`${fmt(state.days*15.5)} руб.`;
    $('#daysSummary').textContent=`Ожидаемая суммарная прибыль за ${state.days} ${dayWord(state.days)} при закупке двух единиц ежедневно. Для этой задачи многоэтапная схема сводится к повторению однодневного решения.`;
  }});
  document.addEventListener('input',event=>{if(event.target.id==='confidence'){const value=Number(event.target.value);if(Number.isFinite(value)){state.confidence=Math.max(0,Math.min(1,value/100));updateConfidence();}}});
  $('#next').addEventListener('click',event=>{if(event.detail>1)return;next();});
  $('#prev').addEventListener('click',event=>{if(event.detail>1)return;prev();});
  $('.skip').addEventListener('click',event=>{event.preventDefault();$('#main').focus();});
  $('#revealAll').addEventListener('click',event=>{if(event.detail>1)return;go(state.stage,state.step===steps[state.stage].steps.length-1?0:steps[state.stage].steps.length-1);});
  $('#menuToggle').addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('open');$('#menuToggle').setAttribute('aria-expanded',String(open));});
  $('#present').addEventListener('click',async()=>{
    try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}
    catch{$('#announcer').textContent='Браузер не разрешил полноэкранный режим. Можно продолжать в обычном окне.';}
  });
  document.addEventListener('fullscreenchange',()=>{$('#present').innerHTML=(document.fullscreenElement?'В обычное окно':'На весь экран')+' <span aria-hidden="true">⛶</span>';});
  document.addEventListener('keydown',event=>{
    if(event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||event.isComposing)return;
    if(event.key==='Escape'){closeMenu();return;}
    const control=event.target.closest('button,a,input,select,textarea,summary,[contenteditable="true"],[role="slider"],[role="combobox"],[role="listbox"]');
    if(control&&!control.matches('#next,#prev'))return;
    if(event.repeat){if(['ArrowRight','ArrowLeft',' '].includes(event.key))event.preventDefault();return;}
    if(event.key==='ArrowRight'){event.preventDefault();next();}
    else if(event.key==='ArrowLeft'){event.preventDefault();prev();}
    else if(event.code==='Space'&&!event.target.closest('button,a,summary')){event.preventDefault();next();}
  });
  function readHash(){
    const params=new URLSearchParams(location.hash.slice(1));
    const stage=Number(params.get('stage')??1)-1,step=Number(params.get('step')??1)-1;
    const canonical=`#stage=${state.stage+1}&step=${state.step+1}`;
    if(location.hash===canonical&&$('#stageTitle').textContent)return;
    go(stage,step,{history:'replace'});
  }
  window.addEventListener('popstate',readHash);
  window.addEventListener('hashchange',readHash);
  readHash();
})();
