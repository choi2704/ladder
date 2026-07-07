(() => {
  'use strict';

  const T = window.LADDER_TABLE;
  const $ = id => document.getElementById(id);

  const state = {
    type: '일자형',
    material: 'SUS201'
  };

  const e = {
    typeOptions: $('typeOptions'),
    materialOptions: $('materialOptions'),
    length: $('length'),
    qty: $('qty'),
    minus: $('minus'),
    plus: $('plus'),
    lockOption: $('lockOption'),
    landingOption: $('landingOption'),
    meterText: $('meterText'),
    total: $('total'),
    typeText: $('typeText'),
    materialText: $('materialText'),
    lengthText: $('lengthText'),
    meterRateText: $('meterRateText'),
    ladderTotalText: $('ladderTotalText'),
    lockText: $('lockText'),
    landingText: $('landingText'),
    qtyText: $('qtyText'),
    guideText: $('guideText'),
    copy: $('copy'),
    toggleTable: $('toggleTable'),
    tables: $('tables')
  };

  function comma(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function won(n) { return n == null ? '별도문의' : comma(n) + '원'; }
  function selectedType() { return T.types.find(t => t.name === state.type) || T.types[0]; }
  function meterRate() { return T.baseRates[state.material] + selectedType().addPerM; }

  function makeBtn(container, value, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'optBtn';
    btn.dataset.value = value;
    btn.textContent = value;
    btn.onclick = onClick;
    container.appendChild(btn);
  }

  function renderOptions() {
    e.typeOptions.innerHTML = '';
    e.materialOptions.innerHTML = '';

    T.types.forEach(t => makeBtn(e.typeOptions, t.name, () => { state.type = t.name; active(); calculate(); }));
    T.materials.forEach(m => makeBtn(e.materialOptions, m, () => { state.material = m; active(); calculate(); }));

    active();
  }

  function active() {
    [...e.typeOptions.children].forEach(b => b.classList.toggle('isActive', b.dataset.value === state.type));
    [...e.materialOptions.children].forEach(b => b.classList.toggle('isActive', b.dataset.value === state.material));
  }

  function reset(qty) {
    e.total.textContent = e.landingOption.checked ? '별도문의' : '0원';
    e.meterText.textContent = '0.00m';
    e.typeText.textContent = state.type;
    e.materialText.textContent = state.material;
    e.lengthText.textContent = '길이를 입력해주세요';
    e.meterRateText.textContent = won(meterRate());
    e.ladderTotalText.textContent = '0원';
    e.lockText.textContent = e.lockOption.checked ? '선택 / +80,000원' : '미선택';
    e.landingText.textContent = e.landingOption.checked ? '선택 / 별도문의' : '미선택';
    e.qtyText.textContent = qty + 'EA';
    e.guideText.textContent = e.landingOption.checked ? '계단참 선택 시 별도문의 대상입니다.' : '길이를 입력하면 예상 견적이 자동 계산됩니다. 정확한 견적을 위해 설치 위치 사진을 네이버 톡톡으로 보내주세요.';
  }

  function calculate() {
    const raw = String(e.length.value).trim();
    const qty = Math.max(1, Number(e.qty.value || 1));

    if (!raw) {
      reset(qty);
      return { lengthMm: 0, meter: 0, qty, rate: meterRate(), ladderTotal: 0, lockPrice: e.lockOption.checked ? T.lockPrice : 0, total: e.landingOption.checked ? null : 0 };
    }

    const lengthMm = Math.max(0, Number(raw));
    const meter = lengthMm / 1000;
    const rate = meterRate();
    const ladderTotal = meter * rate * qty;
    const lockPrice = e.lockOption.checked ? T.lockPrice : 0;
    const total = e.landingOption.checked ? null : ladderTotal + lockPrice;

    e.total.textContent = total === null ? '별도문의' : won(total);
    e.meterText.textContent = meter.toFixed(2) + 'm';
    e.typeText.textContent = state.type;
    e.materialText.textContent = state.material;
    e.lengthText.textContent = `${lengthMm}mm / ${meter.toFixed(2)}m`;
    e.meterRateText.textContent = won(rate);
    e.ladderTotalText.textContent = won(ladderTotal);
    e.lockText.textContent = e.lockOption.checked ? '선택 / +80,000원' : '미선택';
    e.landingText.textContent = e.landingOption.checked ? '선택 / 별도문의' : '미선택';
    e.qtyText.textContent = qty + 'EA';
    e.guideText.textContent = e.landingOption.checked ? '계단참 선택 시 별도문의 대상입니다. 설치 위치 사진과 치수를 톡톡으로 보내주세요.' : `${state.type} ${state.material} 기준으로 계산된 예상 견적입니다. 설치 위치 사진을 톡톡으로 보내주시면 더 정확합니다.`;

    return { lengthMm, meter, qty, rate, ladderTotal, lockPrice, total };
  }

  function makeEstimateText() {
    const r = calculate();
    return `강동자바라 안전망사다리 견적 문의\n\n제품형: ${state.type}\n재질: ${state.material}\n길이: ${r.lengthMm}mm / ${r.meter.toFixed(2)}m\n수량: ${r.qty}EA\n1m 단가: ${won(r.rate)}\n사다리 금액: ${won(r.ladderTotal)}\n시건장치: ${e.lockOption.checked ? '선택 / +80,000원' : '미선택'}\n계단참: ${e.landingOption.checked ? '선택 / 별도문의' : '미선택'}\n예상금액: ${won(r.total)}\n\n※ 운임·시공비 별도\n※ 정확한 견적을 위해 설치 위치 사진을 보내주세요.\n문의: 010-7595-0484\n네이버 톡톡: https://talk.naver.com/ct/w4a85f?frm=psf`;
  }

  async function copyEstimate() {
    const text = makeEstimateText();
    try {
      await navigator.clipboard.writeText(text);
      alert('견적내용이 복사되었습니다.');
    } catch (err) {
      prompt('아래 내용을 복사해주세요.', text);
    }
  }

  async function orderGo(ev) {
    ev.preventDefault();
    const text = makeEstimateText();
    try { await navigator.clipboard.writeText(text); } catch (err) {}
    window.open('https://kdjavara.kr/', '_blank');
  }

  function bind() {
    e.length.addEventListener('input', calculate);
    e.qty.addEventListener('input', calculate);
    e.lockOption.addEventListener('change', calculate);
    e.landingOption.addEventListener('change', calculate);
    e.minus.onclick = () => { e.qty.value = Math.max(1, Number(e.qty.value || 1) - 1); calculate(); };
    e.plus.onclick = () => { e.qty.value = Number(e.qty.value || 1) + 1; calculate(); };
    e.copy.onclick = copyEstimate;
    e.toggleTable.onclick = () => e.tables.classList.toggle('open');
    const order = document.querySelector('.order');
    if (order) order.addEventListener('click', orderGo);
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderOptions();
    bind();
    calculate();
  });
})();
