const BOOKS = [],
      STORAGE_KEY = 'BOOKS',
      SAVED_EVENT = 'SAVED_BOOK',
      RENDER_EVENT = 'RENDER-BOOK';

const isStorageExist = () => {
  if (typeof(Storage) === 'undefined') {
    alert('Browser Anda tidak mendukung Web Storage.');
    return false;
  }

  return true;
};

document.addEventListener(SAVED_EVENT, () => {
  const TOAST = document.querySelector('.toast');
  TOAST.classList.add('show');
  setTimeout(() => TOAST.classList.remove('show'), 5000);
  
  document.getElementById('editBookModal')
  .classList.remove('show');
  
  document.body
  .removeChild(document.querySelector('.modal-backdrop'));
});

const saveData = () => {
  if (isStorageExist()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(BOOKS));
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
};

const findBook = bookId => {
  for (const BOOK of BOOKS)
    if (BOOK.id === bookId)
      return BOOK;

  return null;
};

const addBookToCompleted = bookId => {
  const TARGET = findBook(bookId);
  if (TARGET === null) return;
  TARGET.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const undoBookFromCompleted = bookId => {
  const TARGET = findBook(bookId);
  if (TARGET === null) return;
  TARGET.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const editBook = bookId => {
  const TARGET = findBook(bookId);
  if (TARGET === null) return;
  
  const title = document.getElementById('edit-title'),
        author = document.getElementById('edit-author'),
        year = document.getElementById('edit-year'),
        isCompleted = document.getElementById('edit-readed');
  
  title.value = TARGET.title;
  author.value = TARGET.author;
  year.value = TARGET.year;
  isCompleted.checked = TARGET.isCompleted; 

  document.getElementById('edit-form')
  .addEventListener('submit', e => {
    e.preventDefault();
    TARGET.title = title.value;
    TARGET.author = author.value;
    TARGET.year = year.value;
    TARGET.isCompleted = isCompleted.checked;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  });
};

const findBookIndex = bookId => {
  for (const INDEX in BOOKS)
    if (BOOKS[INDEX].id === bookId)
      return INDEX;

  return -1;
};

const removeBook = bookId => {
  const TARGET = findBookIndex(bookId);
  if (TARGET === -1) return;

  const DELETE_CONFIRM = 
  confirm('Are you sure want to delete this record?');

  if (DELETE_CONFIRM)
    BOOKS.splice(TARGET, 1);
  else
    return;
  
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

const setAttributes = (el, attrs) => {
  for (const key in attrs)
    el.setAttribute(key, attrs[key]);
};

const makeBook = bookObject => {
  const TITLE = document.createElement('h6');
  TITLE.innerText = bookObject.title;

  const AUTHOR = document.createElement('p');
  AUTHOR.innerText = bookObject.author;

  const YEAR = document.createElement('p');
  YEAR.innerText = bookObject.year;
  YEAR.classList.add('year');

  const TXT_CONTAINER = document.createElement('div');
  TXT_CONTAINER.classList.add('text');
  TXT_CONTAINER.append(TITLE, AUTHOR, YEAR);

  const EDIT_BTN = document.createElement('button');
  EDIT_BTN.classList.add('btn');
  setAttributes(EDIT_BTN, {
    'type': 'button',
    'data-bs-toggle': 'modal',
    'data-bs-target': `#editBookModal`
  });
  EDIT_BTN.setAttribute('id', 'edit-btn');
  EDIT_BTN.innerHTML = `<i class="bi bi-pencil-square fs-5"></i>`;
  EDIT_BTN.addEventListener('click', () => editBook(bookObject.id));

  const REMOVE_BTN = document.createElement('button');
  REMOVE_BTN.classList.add('btn');
  REMOVE_BTN.innerHTML = `<i class="bi bi-x-circle fs-5"></i>`;
  REMOVE_BTN.addEventListener('click', () => removeBook(bookObject.id));

  const BTN_CONTAINER = document.createElement('div');
  BTN_CONTAINER.classList.add('button-item');

  if (bookObject.isCompleted) {
    const UNDO_BTN = document.createElement('button');
    UNDO_BTN.classList.add('btn');
    UNDO_BTN.innerHTML = `<i class="bi bi-arrow-counterclockwise fs-5"></i>`;
    UNDO_BTN.addEventListener('click', () => undoBookFromCompleted(bookObject.id));

    BTN_CONTAINER.append(UNDO_BTN, EDIT_BTN, REMOVE_BTN);
  } else {
    const CHECK_BTN = document.createElement('button');
    CHECK_BTN.classList.add('btn');
    CHECK_BTN.innerHTML = `<i class="bi bi-check-lg fs-5"></i>`;
    CHECK_BTN.addEventListener('click', () => addBookToCompleted(bookObject.id));

    BTN_CONTAINER.append(CHECK_BTN, EDIT_BTN, REMOVE_BTN);
  }

  const COLUMN = document.createElement('div');
  COLUMN.classList.add('col-md-12', 'd-flex', 'align-items-center', 'justify-content-between');
  COLUMN.append(TXT_CONTAINER, BTN_CONTAINER);

  const ROW = document.createElement('div');
  ROW.classList.add('row', 'mt-5');
  ROW.setAttribute('id', bookObject.id);
  ROW.append(COLUMN);

  return ROW;
};

document.addEventListener(RENDER_EVENT, () => {
  const UNCOMPLETED_READ = document.getElementById('uncompleted-read'),
        COMPLETED_READ = document.getElementById('completed-read');

  UNCOMPLETED_READ.innerHTML = '';
  COMPLETED_READ.innerHTML = '';

  for (const BOOK of BOOKS) {
    const BOOK_ELEMENT = makeBook(BOOK);
    if (BOOK.isCompleted)
      COMPLETED_READ.append(BOOK_ELEMENT);
    else
      UNCOMPLETED_READ.append(BOOK_ELEMENT);
  }

  if (UNCOMPLETED_READ.innerHTML === '')
    UNCOMPLETED_READ.innerHTML = 
    `<p class="mt-5 text-secondary"><i>There are no books on this shelf yet</i></p>`;

  if (COMPLETED_READ.innerHTML === '')
    COMPLETED_READ.innerHTML = 
    `<p class="mt-5 text-secondary"><i>There are no books on this shelf yet</i></p>`;
});

const addBook = () => {
  const title = document.getElementById('title').value,
        author = document.getElementById('author').value,
        year = document.getElementById('year').value,
        isCompleted = document.getElementById('readed').checked,
        BOOK_OBJECT = {id: +new Date(), title, author, year, isCompleted};

  BOOKS.push(BOOK_OBJECT);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const loadDataFromStorage = () => {
  const DATA_FROM_STORAGE = 
  JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (DATA_FROM_STORAGE !== null) 
    for (const BOOK of DATA_FROM_STORAGE)
      BOOKS.push(BOOK);

  document.dispatchEvent(new Event(RENDER_EVENT)); 
};

document.addEventListener('DOMContentLoaded', () => {
  BOOKS.push({
    id: +new Date(),
    title: 'The Prodigy A Biography of William James Sidis',
    author: 'Amy Wallace',
    year: 1986
  });

  BOOKS.push({
    id: +new Date(),
    title: 'Introduction to Python',
    author: 'Guido Van Rossum',
    year: 1990,
    isCompleted: true,
  });

  const SUBMIT = document.getElementById('add-form');
  SUBMIT.addEventListener('submit', e => {
    addBook();
    e.preventDefault();
  });

  if (isStorageExist())
    loadDataFromStorage();
});

const RESULTS = document.getElementById('searched-container');
let search_term = '';

const searchedBook = () => {
  const SEARCH = document.getElementById('search').value;
  RESULTS.innerHTML = '';
  BOOKS.filter(item => {
    return (
      item.title.toLowerCase().includes(search_term)
      ||
      item.author.toLowerCase().includes(search_term)
      ||
      item.year.toLowerCase().includes(search_term)
    );
  }).forEach(el => {
    RESULTS.append(makeBook(el));
    RESULTS.style.display = 'block';
    RESULTS.style.marginTop = '-7em';

    document.getElementById('uncompleted-read')
    .style.display = 'none';
    document.getElementById('completed-read')
    .style.display = 'none';
    document.querySelector('.completed-title')
    .style.display = 'none';
    document.querySelector('.uncompleted-title')
    .style.display = 'none';

    if (SEARCH == '') {
      document.getElementById('uncompleted-read')
      .style.display = 'block';
      document.getElementById('completed-read')
      .style.display = 'block';
      document.querySelector('.completed-title')
      .style.display = 'block';
      document.querySelector('.uncompleted-title')
      .style.display = 'block';

      RESULTS.style.display = 'none';
    }
  });
};

document.getElementById('search')
.addEventListener('input', e => {
  search_term = e.target.value.toLowerCase();
  searchedBook();
});