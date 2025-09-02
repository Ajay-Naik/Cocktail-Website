// --- State ---
let COCKTAILS = [];
const $grid = document.getElementById('grid');
const $empty = document.getElementById('empty');
const $search = document.getElementById('search');
const $filters = document.getElementById('filters');
const $toggleFavs = document.getElementById('toggleFavs');

let activeBase = 'All';
let showFavsOnly = false;
const BASES = ['All','Cocktail','Ordinary Drink','Shot','Punch / Party Drink','Beer','Soft Drink'];

const favStoreKey = 'favCocktails';
const getFavs = () => JSON.parse(localStorage.getItem(favStoreKey) || '[]');
const setFavs = (arr) => localStorage.setItem(favStoreKey, JSON.stringify(arr));

// --- Helper for safe images ---
function safeImg(url) {
  return url || "https://via.placeholder.com/300x200?text=Cocktail";
}

// --- Optimized fetch cocktails from TheCocktailDB API ---
async function loadCocktails() {
  try {
    const letters = "abcdefghijklmnopqrstuvwxyz".split("");
    let results = [];

    // Step 1: Load first few letters quickly
    const initialLetters = ["m", "g", "s"];
    for (const letter of initialLetters) {
      const drinks = await fetchByLetter(letter);
      results = results.concat(drinks);
    }

    COCKTAILS = results;
    render(); // Show initial data

    // Step 2: Lazy load remaining letters in background
    const remainingLetters = letters.filter(l => !initialLetters.includes(l));
    remainingLetters.forEach(async (letter) => {
      const drinks = await fetchByLetter(letter);
      if (drinks.length > 0) {
        COCKTAILS = COCKTAILS.concat(drinks);
        render(); // Update grid as more cocktails arrive
      }
    });

  } catch (err) {
    console.error("Error fetching cocktails:", err);
  }
}

// helper function
async function fetchByLetter(letter) {
  try {
    const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letter}`);
    const data = await res.json();
    if (!data.drinks) return [];
    return data.drinks.map(drink => ({
      id: drink.idDrink,
      name: drink.strDrink,
      base: drink.strCategory || "Cocktail",
      strength: "Varies",
      img: safeImg(drink.strDrinkThumb),
      desc: drink.strInstructions ? drink.strInstructions.slice(0, 100) + "..." : "",
      ingredients: getIngredients(drink),
      method: [drink.strInstructions],
      tags: (drink.strTags ? drink.strTags.split(",") : []),
      glass: drink.strGlass,
      garnish: "—"
    }));
  } catch (err) {
    console.error(`Error fetching letter ${letter}:`, err);
    return [];
  }
}

// Helper to extract ingredients + measures
function getIngredients(drink) {
  let items = [];
  for (let i = 1; i <= 15; i++) {
    const ing = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];
    if (ing) items.push(`${measure ? measure : ""} ${ing}`.trim());
  }
  return items;
}

// --- UI Builders ---
function buildFilters(){
  $filters.innerHTML = '';
  BASES.forEach(base=>{
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = base;
    btn.dataset.base = base;
    if(base===activeBase) btn.setAttribute('data-active','true');
    btn.addEventListener('click', ()=>{
      activeBase = base;
      document.querySelectorAll('.filters .btn').forEach(b=>b.removeAttribute('data-active'));
      btn.setAttribute('data-active','true');
      render();
    });
    $filters.appendChild(btn);
  });
}

function cardTemplate(item){
  const favs = getFavs();
  const node = document.getElementById('cardTmpl').content.firstElementChild.cloneNode(true);
  const img = node.querySelector('img');
  const name = node.querySelector('.name');
  const desc = node.querySelector('.desc');
  const badge = node.querySelector('.badge');
  const tags = node.querySelector('.tags');
  const fav = node.querySelector('.fav');

  img.src = safeImg(item.img);
  img.alt = `${item.name} cocktail`;
  name.textContent = item.name;
  desc.textContent = item.desc;
  badge.textContent = item.base;
  fav.dataset.on = String(favs.includes(item.id));

  item.tags.concat([item.strength]).forEach(t=>{
    const el = document.createElement('span');
    el.className = 'tag';
    el.textContent = t;
    tags.appendChild(el);
  });

  node.querySelector('.btn-open').addEventListener('click', ()=>openModal(item.id));
  node.querySelector('.btn-copy').addEventListener('click', ()=>copyRecipe(item.id));
  fav.addEventListener('click', ()=>{
    toggleFavorite(item.id);
    fav.dataset.on = String(getFavs().includes(item.id));
    if (showFavsOnly) render();
  });

  return node;
}

function render(){
  const q = $search.value.trim().toLowerCase();
  const favs = getFavs();

  const list = COCKTAILS.filter(c=>{
    const matchesBase = activeBase==='All' ? true : c.base===activeBase;
    const matchesFav = showFavsOnly ? favs.includes(c.id) : true;
    const hay = [c.name, c.base, c.desc, c.tags.join(' '), ...c.ingredients].join(' ').toLowerCase();
    const matchesQuery = q ? hay.includes(q) : true;
    return matchesBase && matchesFav && matchesQuery;
  });

  $grid.innerHTML = '';
  if(list.length===0){
    $empty.hidden = false;
    return;
  }
  $empty.hidden = true;
  list.forEach(item=>$grid.appendChild(cardTemplate(item)));
}

function toggleFavorite(id){
  const favs = new Set(getFavs());
  favs.has(id) ? favs.delete(id) : favs.add(id);
  setFavs([...favs]);
}

// --- Modal logic ---
const $modal = document.getElementById('modal');
const $modalImg = document.getElementById('modalImg');
const $modalMeta = document.getElementById('modalMeta');
const $modalIngredients = document.getElementById('modalIngredients');
const $modalMethod = document.getElementById('modalMethod');
const $modalTitle = document.getElementById('modalTitle');
const $closeModal = document.getElementById('closeModal');
const $favBtn = document.getElementById('favBtn');
const $copyBtn = document.getElementById('copyBtn');

function openModal(id){
  const item = COCKTAILS.find(x=>x.id===id);
  if(!item) return;

  $modalTitle.textContent = item.name;
  $modalImg.src = safeImg(item.img);
  $modalImg.alt = `${item.name} cocktail photo`;

  $modalMeta.innerHTML = '';
  [item.base, item.glass, item.garnish, item.strength].filter(Boolean).forEach(t=>{
    const el = document.createElement('span');
    el.className='tag';
    el.textContent = t;
    $modalMeta.appendChild(el);
  });

  $modalIngredients.innerHTML = '';
  item.ingredients.forEach(i=>{
    const li = document.createElement('li');
    li.textContent = i;
    $modalIngredients.appendChild(li);
  });

  $modalMethod.innerHTML = '';
  item.method.forEach(step=>{
    const li = document.createElement('li');
    li.textContent = step;
    $modalMethod.appendChild(li);
  });

  const favs = getFavs();
  $favBtn.textContent = favs.includes(id) ? '♥ Saved' : '♥ Save to favorites';
  $favBtn.onclick = ()=>{
    toggleFavorite(id);
    const nowFav = getFavs().includes(id);
    $favBtn.textContent = nowFav ? '♥ Saved' : '♥ Save to favorites';
    if (showFavsOnly) render();
  };

  $copyBtn.onclick = ()=>copyRecipe(id);

  $modal.showModal();
}
function closeModal(){ $modal.close() }
$closeModal.addEventListener('click', closeModal);
$modal.addEventListener('click', (e)=>{ if(e.target===$modal) closeModal() });
window.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && $modal.open) closeModal() });

function copyRecipe(id){
  const c = COCKTAILS.find(x=>x.id===id);
  if(!c) return;
  const block = `${c.name} (${c.base})\n\nIngredients:\n- ${c.ingredients.join('\n- ')}\n\nMethod:\n${c.method.map((m,i)=>`${i+1}. ${m}`).join('\n')}\n`;
  navigator.clipboard?.writeText(block);
  toast('Recipe copied to clipboard');
}

// --- Toast ---
function toast(msg){
  const el = document.createElement('div');
  el.textContent = msg;
  Object.assign(el.style, {
    position:'fixed', left:'50%', bottom:'24px', transform:'translateX(-50%)',
    background:'rgba(0,0,0,.7)', color:'white', padding:'10px 14px',
    borderRadius:'999px', border:'1px solid rgba(255,255,255,.2)',
    zIndex:9999, backdropFilter:'blur(6px)'
  });
  document.body.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transition='opacity .4s'; }, 1600);
  setTimeout(()=> el.remove(), 2200);
}

// --- Events ---
$search.addEventListener('input', render);
$toggleFavs.addEventListener('click', ()=>{
  showFavsOnly = !showFavsOnly;
  $toggleFavs.dataset.active = String(showFavsOnly);
  $toggleFavs.setAttribute('aria-pressed', String(showFavsOnly));
  $toggleFavs.textContent = showFavsOnly ? '♥ Showing favorites' : '♥ Favorites';
  
  render();
});

// --- Init ---
buildFilters();
loadCocktails();
