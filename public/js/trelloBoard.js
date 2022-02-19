let list_items = document.querySelectorAll('.list-item'); //targets all tasks items on page load
let lists = document.querySelectorAll('.list'); //targets all column lists on page load
const trelloBoard = document.querySelectorAll('#trelloBoard')[0].children; //targets trello board container that lists are in
let addTaskButton = document.querySelectorAll('.addTaskButton') //targets all tasks buttons on page load
let deleteListButton = document.querySelectorAll('#deleteListButton');
let container = document.querySelectorAll('#trelloBoard')[0]
let listTitle = document.querySelectorAll('.listTitle')

const check = document.querySelector('.check');
const fill = document.querySelector('.fill');
const path = document.querySelector('.path');

const movableTaskText = document.querySelector('#moveableTasksH6');
const movableListText = document.querySelector('#moveableListsH6');

const textToggle = document.querySelector('#editTextToggle'); //targets toggle that will turn on and off text
const toggle = document.querySelector('#draggableToggle');  //targets toggle that will toggle between moveable lists and moveable tasks

let draggedItem = null;

let projectID = window.location.href.split('=').pop()

//This will pull the highest id number for list/task and then any new list/task will be given an id after that to ensure no list/task is given the same id
// next_list_id = Math.max(...[...lists].map(list => Number(list.getAttribute('data-list-id'))));
// next_task_id = Math.max(...[...list_items].map(item => Number(item.getAttribute('data-task-id'))));

//This will give the list the next available position number
next_position = [...lists].length - 1;

const getNextAvailableTaskId = async () => {
    let response = await fetch('/api/task/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    let data = await response.json()
    let nextTaskID = Math.max(...data.map(object => Number(object.id))) + 1
    return nextTaskID

}

const getNextAvailableListId = async () => {
    let response = await fetch('/api/list/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    let data = await response.json()
    let nextListID = Math.max(...data.map(object => Number(object.id))) + 1
    return nextListID
}

const newFunction = async () => {
    const a = await getNextAvailableListId()
    console.log(a)
}
const createTask = async (task_id, list_id) => {
    let task_content = 'Click to enter text';

    const response = await fetch(`api/task/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: task_id, list_id: list_id, task_content: task_content })
    })
    if (response.ok) {
        addCheckMarkClasses()
        console.log('task creation POST request has been sent to the server')
    } else {
        console.error(response)
    }
}

const createList = async (position, list_id) => {
    let list_content = 'Click to enter text';

    const response = await fetch(`/api/list`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: list_id, position: position, list_content: list_content, project_id: projectID })
    })
    if (response.ok) {
        addCheckMarkClasses()
        console.log('list creation POST request has been sent to the server')
    } else {
        console.error(response)
    }
}

const deleteListColumn = async (list_id) => {
    const response = await fetch(`/api/list/${list_id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if (response.ok) {
        addCheckMarkClasses()
        console.log('list deletion DELETE request has been sent to the server')
    } else {
        console.error(response)
    }
}

// THIS WORKS ON INSOMNIA BUT ISNT WORKING HERE...
const updateLists = async (list_id, list_content, list_position) => {
    const response = await fetch(`/api/list/${list_id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ list_content: list_content, position: list_position }),
    })
    if (response.ok) {
        addCheckMarkClasses()
        console.log('list update PUT request has been sent to the server')
    } else {
        console.error(response)
    }
}


const updateTasks = async (task_id, list_id, task_content) => {
    const response = await fetch(`/api/task/${task_id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ list_id: list_id, task_content: task_content }),
    })
    if (response.ok) {
        console.log('task update PUT request has been sent to the server')
        addCheckMarkClasses()
    } else {
        console.error(response)
    }
}

// =================================================================================================================================================

function addCheckMarkClasses() {
    check.classList.add('check-complete', 'success');
    fill.classList.add('fill-complete', 'success');
    path.classList.add('path-complete');
}

addCheckMarkClasses()

function removeCheckMarkClasses() {
    check.classList.remove('check-complete', 'success');
    fill.classList.remove('fill-complete', 'success');
    path.classList.remove('path-complete');
}

let typingTimer
let timeLength = 200;
listTitle.forEach(title => title.addEventListener('keyup', (e) => {
    let list = e.target.parentNode.parentNode;
    let id = list.getAttribute('data-list-id');
    let position = list.getAttribute('data-position');
    let content = e.target.innerHTML
    removeCheckMarkClasses()

    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        // console.log(id)
        // console.log(content)
        // console.log(position)
        updateLists(id, content, position)
    }, timeLength);
}));

listTitle.forEach(title => title.addEventListener('keydown', () => {
    clearTimeout(typingTimer)
}));


list_items.forEach(task => task.addEventListener('keyup', (e) => {
    let task = e.target
    let task_id = task.getAttribute('data-task-id')
    let list_id = task.getAttribute('data-list-id')
    let task_content = task.innerHTML
    removeCheckMarkClasses()

    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        console.log(task_id)
        console.log(list_id)
        console.log(task_content)
        updateTasks(task_id, list_id, task_content)
    }, timeLength);
}))

list_items.forEach(task => task.addEventListener('keydown', () => {
    clearTimeout(typingTimer)
}));

// USER CLICKS ADD NEW LIST AND A NEW LIST APPENDS TO PAGE
const addList = async () => {
    removeCheckMarkClasses()
    const nextAvailableListId = await getNextAvailableListId()
    next_position++;

    const newList = document.createElement('div');
    newList.innerHTML = `<div class="d-flex justify-content-between align-items-center moveList"><h3 class="text-white listTitle">Click to edit</h3><img src="./img/bin-white.png" id="deleteListButton"></div><div class="taskList"></div><h5 class="text-white addTaskButton"><span class="bold">+</span> Add task</h5>`
    newList.classList.add('list', 'd-flex', 'flex-column', 'gap-2');
    newList.setAttribute('data-list-id', nextAvailableListId);
    newList.setAttribute('data-position', next_position);

    if (toggle.checked == true) {
        newList.setAttribute('draggable', 'true');
    } else {
        newList.setAttribute('draggable', 'false');
    }

    if (textToggle.checked == true) {
        newList.children[0].children[0].setAttribute('contenteditable', 'false')
    } else {
        newList.children[0].children[0].setAttribute('contenteditable', 'true')
    }

    document.querySelector('#trelloBoard').appendChild(newList)

    // ADD EVENT LISTENER TO NEWLY ADDED LIST'S ADD TASK BUTTON
    newList.children[2].addEventListener('click', appendTask)
    newList.children[0].children[1].addEventListener('click', deleteList)

    let newListTitle = newList.children[0].children[0]
    newListTitle.addEventListener('keyup', (e) => {
        let id = newList.getAttribute('data-list-id');
        let position = newList.getAttribute('data-position');
        let content = e.target.innerHTML
        removeCheckMarkClasses()

        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            console.log(id)
            console.log(content)
            console.log(position)
            updateLists(id, content, position)
        }, timeLength);
    });

    newListTitle.addEventListener('keydown', () => {
        clearTimeout(typingTimer)
    });



    // IF TOGGLE FOR DRAGGING LISTS IS ENABLED THEN ADD DRAG EVENT LISTENER TO NEWLY ADDED LIST ELEMENT
    // IF TOGGLE FOR DRAGGING LISTS IS DISABLED THEN ADD DRAG EVENT LISTENER TO NEWLY ADDED LIST ELEMENT
    if (toggle.checked == false) {
        makeDraggable()
    } else if (toggle.checked == true) {
        listDrag();
    }

    createList(next_position, nextAvailableListId)
}

// RESPONSIBLE FOR DELETE LIST COLUMN
function deleteList(e) {
    removeCheckMarkClasses()
    let id = e.target.parentNode.parentNode.getAttribute('data-list-id')
    e.target.parentNode.parentNode.remove()

    deleteListColumn(id)
}


async function appendTask(e) {
    removeCheckMarkClasses()
    let nextAvailableTaskID = await getNextAvailableTaskId()
    let listID = e.target.parentNode.getAttribute('data-list-id')

    const newTask = document.createElement('div');
    newTask.innerHTML = 'Click to enter text'
    newTask.classList.add('list-item')
    newTask.setAttribute('draggable', 'true');
    newTask.setAttribute('data-list-id', listID)
    newTask.setAttribute('data-task-id', nextAvailableTaskID)

    if (textToggle.checked == true) {
        newTask.setAttribute('contenteditable', 'false');
    } else {
        newTask.setAttribute('contenteditable', 'true');
    }

    if (toggle.checked == false) {
        newTask.setAttribute('draggable', 'true');
    } else if (toggle.checked == true) {
        newTask.setAttribute('draggable', 'false');
    }

    newTask.addEventListener('keyup', (e) => {
        let task = e.target
        let task_id = task.getAttribute('data-task-id')
        let list_id = task.getAttribute('data-list-id')
        let task_content = task.innerHTML
        removeCheckMarkClasses()

        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            addCheckMarkClasses()
            console.log(task_id)
            console.log(list_id)
            console.log(task_content)
            updateTasks(task_id, list_id, task_content)
        }, timeLength);
    })

    newTask.addEventListener('keydown', () => {
        clearTimeout(typingTimer)
    });



    e.target.previousElementSibling.appendChild(newTask);

    // ENSURES THAT NEW TASK ITEM GETS THE APPROPRIATE EVEN LISTENER
    makeDraggable();
    createTask(nextAvailableTaskID, listID)
}

function makeDraggable() {
    list_items = document.querySelectorAll('.list-item');
    lists = document.querySelectorAll('.list');

    for (let i = 0; i < list_items.length; i++) {
        const item = list_items[i];

        item.addEventListener('dragstart', function (e) {
            draggedItem = item;
            lists = document.querySelectorAll('.list');

            setTimeout(function () {
                draggedItem.style.display = 'none'
            }, 0)
        });

        item.addEventListener('dragend', function () {
            setTimeout(function () {
                draggedItem.style.display = 'block';
                draggedItem = null;
            })
        }, 0)

        for (let j = 0; j < lists.length; j++) {
            const list = lists[j];

            list.addEventListener('dragover', function (e) {
                e.preventDefault();
            })

            list.addEventListener('dragenter', function (e) {
                e.preventDefault()
                // this.style.backgroundColor = '#37478586'
            })

            list.addEventListener('dragleave', function (e) {
                // this.style.backgroundColor = '#374790'
            })
            list.addEventListener('drop', function (e) {
                // console.log(draggedItem)
                removeCheckMarkClasses()
                let list_id = this.getAttribute('data-list-id')
                draggedItem.setAttribute('data-list-id', list_id)
                this.children[1].appendChild(draggedItem);
                // this.style.backgroundColor = '#374790'

                let task_id = draggedItem.getAttribute('data-task-id');
                let task_content = draggedItem.innerHTML
                updateTasks(task_id, list_id, task_content)
            })
        }
    }
}

// stopPropagation() TRY THIS !!!!!!!!!!
//NEED TO FIGURE OUT A WAY TO TOGGLE BETWEEN SO OPACITY DOESNT CHANGE WHEN TASKS ARE MOVED!
function listDrag() {
    if (toggle.checked == true) {
        let lists = document.querySelectorAll('.list');
        lists.forEach(list => {
            list.addEventListener('dragstart', () => {
                list.classList.add('dragging')
            });
            list.addEventListener('dragend', () => {
                list.classList.remove('dragging')
                console.log(list.parentNode.children)
                for (let r = 0; r < list.parentNode.children.length; r++) {
                    list.parentNode.children[r].setAttribute('data-position', `${r}`);

                    //USED FOR UPDATING DATABASE WITH NEW POSITIONS
                    let list_id = list.parentNode.children[r].getAttribute('data-list-id');
                    let list_content = list.parentNode.children[r].children[0].children[0].innerHTML;
                    let list_position = list.parentNode.children[r].getAttribute('data-position');
                    // console.log(list_id)
                    // console.log(list_content)
                    // console.log(list_position)
                    removeCheckMarkClasses()
                    updateLists(list_id, list_content, list_position)
                }
            });
        });
        return
    } else {
        return
    }
}

function dropList(e) {
    e.preventDefault()
    const afterElement = getDragAfterElement(container, e.clientX);
    // console.log(afterElement)
    const list = document.querySelector('.dragging');
    // container.appendChild(list)
    if (afterElement == null) {
        container.appendChild(list)
    } else {
        container.insertBefore(list, afterElement)
    }
}

function getDragAfterElement(container, x) {
    const draggableElements = [...container.querySelectorAll('.list:not(.dragging)')]
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = x - box.left - box.width / 2
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child }
        } else {
            return closest
        }

    }, { offset: Number.NEGATIVE_INFINITY }).element
}

const editTextOn = document.querySelector('#editTextOn');
const editTextOff = document.querySelector('#editTextOff');
// const textToggle = document.querySelector('#editTextToggle');

textToggle.addEventListener('click', () => {
    console.log(lists)
    list_items = document.querySelectorAll('.list-item');
    lists = document.querySelectorAll('.list');
    if (textToggle.checked == true) {
        list_items.forEach(item => item.setAttribute('contenteditable', 'false'))
        lists.forEach(list => list.children[0].children[0].setAttribute('contenteditable', 'false'))
        editTextOn.style.opacity = '50%';
        editTextOff.style.opacity = '100%';
    } else {
        list_items.forEach(item => item.setAttribute('contenteditable', 'true'))
        lists.forEach(list => list.children[0].children[0].setAttribute('contenteditable', 'true'))
        editTextOn.style.opacity = '100%';
        editTextOff.style.opacity = '50%';
    }

})

// EVENT LISTENER FOR TOGGLING DRAG
// IF CHECK == TRUE, THEN DISABLE MOVING TASKS AND ENABLE MOVING LISTS
// IF CHECK == FALSE, THEN ENABLE MOVING TASKS AND DISABLE MOVING LISTS
toggle.addEventListener('click', () => {
    if (toggle.checked == true) {

        movableTaskText.style.opacity = '50%';
        movableListText.style.opacity = '100%';

        lists = document.querySelectorAll('.list');
        // Columns are draggable
        lists.forEach(list => {
            list.setAttribute('draggable', 'true');
        });
        // List_items are NOT draggable
        list_items.forEach(list_item => {
            list_item.setAttribute('draggable', 'false');
        })

        container.addEventListener('dragover', dropList)
        listDrag()
    } else if (toggle.checked == false) {

        movableTaskText.style.opacity = '100%';
        movableListText.style.opacity = '50%';

        // Columns are NOT draggable
        lists.forEach(list => {
            list.setAttribute('draggable', 'false')
        })
        // List_items are draggable
        list_items.forEach(list_item => {
            list_item.setAttribute('draggable', 'true');
        })

        container.removeEventListener('dragover', dropList)
        makeDraggable()
    }
})

// EVENT LISTENER FOR TOGGLING EDIT TEXT
// IF CHECK == TRUE, THEN DISABLE TEXT EDITING
// IF CHECK == FALSE, THEN ENABLE TEXT EDITING
textToggle.addEventListener('click', () => {
    //NEED TO RE-ESTABLISH NODES (list_items and lists) JUST IN CASE ANY NEW ONES WERE ADDED
    list_items = document.querySelectorAll('.list-item');
    lists = document.querySelectorAll('.list');

    if (textToggle.checked == true) {

        editTextOn.style.opacity = '50%';
        editTextOff.style.opacity = '100%';

        list_items.forEach(item => item.setAttribute('contenteditable', 'false'))
        lists.forEach(list => list.children[0].children[0].setAttribute('contenteditable', 'false'))
    } else if (textToggle.checked == false) {

        editTextOn.style.opacity = '100%';
        editTextOff.style.opacity = '50%';

        list_items.forEach(item => item.setAttribute('contenteditable', 'true'))
        lists.forEach(list => list.children[0].children[0].setAttribute('contenteditable', 'true'))
    }
})


listDrag();
makeDraggable();
document.querySelector('#addListButton').addEventListener('click', addList)
addTaskButton.forEach(button => button.addEventListener('click', appendTask))
deleteListButton.forEach(button => button.addEventListener('click', deleteList))