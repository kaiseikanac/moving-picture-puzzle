const puzzle = document.querySelector('#puzzle');
const message = document.querySelector('#message');
const movesLabel = document.querySelector('#moves');
const shuffleButton = document.querySelector('#shuffle');
const replayButton = document.querySelector('#replay');
const movieWrap = document.querySelector('#movieWrap');
const movie = document.querySelector('#movie');
const fallback = document.querySelector('#movieFallback');

let order = [], selected = null, moves = 0, completed = false;
const solved = [0, 1, 2, 3, 4, 5, 6, 7, 8];
// 現在のPNGには、絵の周囲に白いマット（左右約10%、上下10%）が含まれている。
// その枠を除いた、実際の16:9イラストの領域だけをパズルに使用する。
const artwork = { left: 0.1, top: 0.1, width: 0.8, height: 0.8 };

function shuffled() {
  const next = [...solved];
  do { for (let i = next.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [next[i], next[j]] = [next[j], next[i]]; } } while (next.every((piece, index) => piece === index));
  return next;
}
function draw() {
  puzzle.replaceChildren(...order.map((pieceNumber, position) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'piece'; button.dataset.position = position;
    button.setAttribute('aria-label', `${position + 1}番目のピース`);
    const image = document.createElement('img');
    const column = pieceNumber % 3;
    const row = Math.floor(pieceNumber / 3);
    image.className = 'piece-image';
    image.src = 'assets/sunset-crossing.png';
    image.alt = '';
    image.draggable = false;
    // 1枚の画像を、白枠を除いた実画像領域がちょうど3×3マスを覆う大きさにする。
    // 例: 左中ピースなら、画像を1マス分だけ左へ送って中央上の1/9を表示する。
    image.style.width = `${300 / artwork.width}%`;
    image.style.height = `${300 / artwork.height}%`;
    image.style.left = `${-(column * 100 + (300 * artwork.left) / artwork.width)}%`;
    image.style.top = `${-(row * 100 + (300 * artwork.top) / artwork.height)}%`;
    image.addEventListener('error', () => { image.src = 'assets/placeholder-sunset.svg'; }, { once: true });
    button.append(image);
    if (position === selected) button.classList.add('selected');
    button.addEventListener('click', () => choose(position));
    return button;
  }));
}
function choose(position) {
  if (completed) return;
  if (selected === null) { selected = position; message.textContent = 'もう1枚選ぶと入れ替わります'; draw(); return; }
  if (selected === position) { selected = null; message.textContent = 'ピースを2枚選んで入れ替えよう'; draw(); return; }
  [order[selected], order[position]] = [order[position], order[selected]];
  selected = null; moves++; movesLabel.textContent = `${moves} 回`; draw();
  if (order.every((piece, index) => piece === index)) complete();
  else message.textContent = 'いい調子！ ピースを2枚選んで入れ替えよう';
}
function complete() {
  completed = true;
  message.textContent = '完成！';
  // 最後の交換結果をまずブラウザに描画させてから、完成絵を1秒間見せる。
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(playMovie, 1000);
    });
  });
}
function playMovie() {
  movieWrap.hidden = false;
  movie.currentTime = 0;
  requestAnimationFrame(() => {
    movieWrap.classList.add('is-visible');
    puzzle.classList.add('is-fading');
    movie.play().then(() => { fallback.hidden = true; }).catch(showFallback);
    setTimeout(() => { puzzle.hidden = true; }, 450);
  });
}
function showFallback() { movie.style.display = 'none'; fallback.hidden = false; setTimeout(finishMovie, 5000); }
function finishMovie() { replayButton.hidden = false; message.textContent = '動画を楽しんでくれてありがとう'; }
function start() {
  movie.pause(); movie.style.display = ''; fallback.hidden = true; movieWrap.hidden = true; movieWrap.classList.remove('is-visible'); puzzle.hidden = false; puzzle.classList.remove('is-fading');
  order = shuffled(); selected = null; moves = 0; completed = false; movesLabel.textContent = '0 回'; message.textContent = 'ピースを2枚選んで入れ替えよう'; replayButton.hidden = true; draw();
}
movie.addEventListener('ended', finishMovie);
shuffleButton.addEventListener('click', start);
replayButton.addEventListener('click', start);
start();
