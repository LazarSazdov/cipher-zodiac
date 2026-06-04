"use strict";

// Approximate frequency of each English letter as a percentage.
const LETTER_FREQ = {
  a: 8.17, b: 1.49, c: 2.78, d: 4.25, e: 12.70, f: 2.23,
  g: 2.02, h: 6.09, i: 6.97, j: 0.15, k: 0.77, l: 4.03,
  m: 2.41, n: 6.75, o: 7.51, p: 1.93, q: 0.10, r: 5.99,
  s: 6.33, t: 9.06, u: 2.76, v: 0.98, w: 2.36, x: 0.15,
  y: 1.97, z: 0.07
};

const LETTERS = Object.keys(LETTER_FREQ);

function unique(list) {
  return Array.from(new Set(list));
}

function chars(text) {
  return Array.from(text);
}

const ZODIAC_SYMBOLS = unique([
  "♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓",
  "☉","☽","☾","☿","♀","♁","♂","♃","♄","♅","♆","♇","⛢",
  "★","☆","✦","✧","✩","✪","✫","✬","✭","✮","✯","✰",
  "☄","☀","☼","⚝","⚛","⚜","⚙","⚚","⚕","☂",
  "❂","❉","❈","❇","❅","❆","❄","❃","❀","✿",
  "✺","✹","✸","✷","✶","✵","✴","✳","✲","✱",
  "⚹","⚺","⚻","⚼","☊","☋","☌","☍","⚸","⚷",
  "◆","◇","◈","◉","◊","○","●","◐","◑","◒","◓","◔","◕"
]);

const EMOJI_SYMBOLS = unique([
  "😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊","😋","😎","😍","😘","🥰",
  "😗","😙","😚","🙂","🤗","🤩","🤔","🤨","😐","😑","😶","🙄","😏","😣","😥",
  "😮","🤐","😯","😪","😫","😴","😌","😛","😜","😝","🤤","😒","😓","😔","😕",
  "🙃","🤑","😲","🙁","😖","😞","😟","😤","😢","😭","😦","😧","😨","😩","🤯",
  "😬","😰","😱","😳","🤪","😵","😡","😠","🤬","😷","🤒","🤕","🤢","🤮","🤧",
  "😇","🤠","🥳","🥴","🥺","🤥","🤫","🤭","🧐","🤓","😈","👹","👺","💀","👻",
  "👽","🤖","💩","😺","😸","😹","😻","😼","😽","🙀","😿","😾"
]);

const CHINESE_SYMBOLS = unique(chars(
  "的一是不了人我在有他这中大来上国个到说们为子和你地出道也时年得就那要" +
  "下以生会自着去之过家学对可她里后小么心多天而能好都然没日于起还发成事" +
  "只作当想看文无开手十用主行方又如前所本见经头面公同三已老从动两长知民" +
  "样现分将外但身些与高意进把法此实回二理美点命色门向位情反义建系军"
));

const MIXED_SYMBOLS = unique(
  ZODIAC_SYMBOLS.slice(0, 34)
    .concat(EMOJI_SYMBOLS.slice(0, 33))
    .concat(CHINESE_SYMBOLS.slice(0, 33))
);

const SYMBOL_SETS = {
  zodiac: ZODIAC_SYMBOLS,
  emoji: EMOJI_SYMBOLS,
  chinese: CHINESE_SYMBOLS,
  mixed: MIXED_SYMBOLS
};

function randomInt(bound) {
  const max = Math.floor(0x100000000 / bound) * bound;
  const buffer = new Uint32Array(1);
  let value;
  do {
    window.crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= max);
  return value % bound;
}

function shuffle(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

// Decide how many symbols each letter receives, proportional to its
// frequency, with at least one symbol per letter and never more symbols
// than the pool can supply.
function allocateCounts(poolSize) {
  const counts = {};
  let total = 0;
  for (const letter of LETTERS) {
    const share = Math.round((LETTER_FREQ[letter] / 100) * poolSize);
    counts[letter] = Math.max(1, share);
    total += counts[letter];
  }
  // Trim from the largest buckets until the allocation fits the pool.
  const byLargest = LETTERS.slice().sort((a, b) => counts[b] - counts[a]);
  let index = 0;
  while (total > poolSize) {
    const letter = byLargest[index % byLargest.length];
    if (counts[letter] > 1) {
      counts[letter] -= 1;
      total -= 1;
    }
    index += 1;
  }
  return counts;
}

function buildHomophoneMap(symbols) {
  const pool = shuffle(symbols);
  const counts = allocateCounts(pool.length);
  const map = {};
  let cursor = 0;
  for (const letter of LETTERS) {
    map[letter] = pool.slice(cursor, cursor + counts[letter]);
    cursor += counts[letter];
  }
  return map;
}

function buildMonoMap(symbols) {
  const pool = shuffle(symbols);
  const map = {};
  LETTERS.forEach((letter, i) => {
    map[letter] = pool[i % pool.length];
  });
  return map;
}

function cleanLetters(text) {
  const result = [];
  for (const ch of text.toLowerCase()) {
    if (ch >= "a" && ch <= "z") {
      result.push(ch);
    }
  }
  return result;
}

function encodeMono(letters, map) {
  return letters.map(function (ch) {
    return map[ch];
  });
}

function encodeHomophonic(letters, map) {
  return letters.map(function (ch) {
    const options = map[ch];
    return options[randomInt(options.length)];
  });
}

function countFrequencies(tokens) {
  const counts = new Map();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }
  return Array.from(counts.entries()).sort(function (a, b) {
    return b[1] - a[1];
  });
}

function renderText(elementId, tokens) {
  document.getElementById(elementId).textContent = tokens.join("");
}

function renderChart(elementId, entries) {
  const container = document.getElementById(elementId);
  container.innerHTML = "";
  if (entries.length === 0) {
    return;
  }
  const max = entries[0][1];
  for (const [token, count] of entries) {
    const row = document.createElement("div");
    row.className = "bar-row";

    const label = document.createElement("span");
    label.className = "bar-label";
    label.textContent = token;

    const track = document.createElement("span");
    track.className = "bar-track";

    const fill = document.createElement("span");
    fill.className = "bar-fill";
    fill.style.width = (count / max) * 100 + "%";

    const value = document.createElement("span");
    value.className = "bar-value";
    value.textContent = count;

    track.appendChild(fill);
    row.appendChild(label);
    row.appendChild(track);
    row.appendChild(value);
    container.appendChild(row);
  }
}

let monoMap = {};
let homophoneMap = {};
let activeSet = "";

function rebuildMaps() {
  const symbols = SYMBOL_SETS[document.getElementById("symbol-set").value];
  monoMap = buildMonoMap(symbols);
  homophoneMap = buildHomophoneMap(symbols);
}

function render() {
  const text = document.getElementById("input-text").value;
  const selectedSet = document.getElementById("symbol-set").value;

  if (selectedSet !== activeSet) {
    activeSet = selectedSet;
    rebuildMaps();
  }

  const letters = cleanLetters(text);
  const monoTokens = encodeMono(letters, monoMap);
  const homophoneTokens = encodeHomophonic(letters, homophoneMap);

  renderText("plain-output", letters);
  renderText("mono-output", monoTokens);
  renderText("homophone-output", homophoneTokens);

  renderChart("plain-chart", countFrequencies(letters));
  renderChart("mono-chart", countFrequencies(monoTokens));
  renderChart("homophone-chart", countFrequencies(homophoneTokens));
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("input-text").addEventListener("input", render);
  document.getElementById("symbol-set").addEventListener("change", render);
  document.getElementById("shuffle").addEventListener("click", function () {
    rebuildMaps();
    render();
  });

  activeSet = document.getElementById("symbol-set").value;
  rebuildMaps();
  render();
});
