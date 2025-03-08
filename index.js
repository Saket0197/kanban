// const icons = require('/iconPath.js');
import {icons,priorityDetails,weekDays, months} from '/helperInfo.js';

const modals = [...document.querySelectorAll('dialog')];

const addBoard = document.querySelector('.add-board');
const boardModal = document.querySelector('.add-board-modal');

const addUnplanned = document.querySelector('.add-unplanned');
const unplannedTaskModal = document.querySelector('.add-unplanned-task-modal');

const viewUnplanned = document.querySelector('.view-unplanned');
const viewUnplannedModal = document.querySelector('.view-unplanned-modal');

const addTaskButtons = document.querySelectorAll('.add-task');
const editTaskButtons = document.querySelectorAll('.edit-task');
const addStoryButtons = document.querySelectorAll('.add-story');
const allDeleteButtons = document.querySelectorAll('.delete-task');

const accordionIcons = document.querySelectorAll('.accordion-icon');
const upValue = document.getElementById('upValue');
const ul = document.querySelector('.view-unplanned-modal ul');

const allTasks = document.querySelectorAll('.accordion');
const allBoards = document.querySelectorAll('.board');
const existingStories = document.querySelectorAll('.story');
const existingStoryContainers = document.querySelectorAll('.stories');

const bulkDeleteBtns = document.querySelectorAll('.bulk-delete');

// BULK DELETE

function bulkDelete(btn) {
    const currentBoard = btn.closest('.board');
    btn.addEventListener('click',(e) => {
        const checkedBtns = [...currentBoard.querySelectorAll('.bulk-check')].filter(checkbox => checkbox.checked == true);
        if(!checkedBtns.length) {
            alert('No tasks selected for Deletion');
            return;
        }
        checkedBtns.forEach(checkedBtn => {
            currentBoard.removeChild(checkedBtn.closest('.accordion'));
        })
    });
}

bulkDeleteBtns.forEach(btn => {
    bulkDelete(btn);
})

// DRAG & DROP

function getBelowElement(container,cursorY,draggable,dragging) {
    const hoveredContainerElements = [...container.querySelectorAll(`${draggable}:not(${dragging})`)];

    return hoveredContainerElements.reduce((belowElement,element) => {
        const elementBoundaries = element.getBoundingClientRect();
        let distance = cursorY - (elementBoundaries.top + elementBoundaries.height/2);
        if(distance < 0 && distance > belowElement.yDis) {
            return {yDis: distance,element: element};
        }
        else {
            return belowElement;
        }
    },{yDis:Number.NEGATIVE_INFINITY,element:null}).element;
}

function dragDropTasks(task) {
    task.addEventListener('dragstart',(e) => {
        if(e.target != task) return;
        task.classList.add('dragging');
    });

    task.addEventListener('dragend',(e) => {
        if(e.target != task) return;
        task.classList.remove('dragging');
    });
}

function dragDropStories(story) {
    story.addEventListener('dragstart',(e) => {
        e.stopPropagation();
        story.classList.add('dragging-story');
    });

    story.addEventListener('dragend',(e) => {
        e.stopPropagation();
        story.classList.remove('dragging-story');
    });
}

function hoverBoards(board) {
    board.addEventListener('dragover',(e) => {
        e.preventDefault();
        if(e.target != board) return;
        const ghostTask = document.querySelector('.dragging');
        const belowTask = getBelowElement(board,e.clientY,'.accordion','.dragging');
        if(belowTask == null) board.appendChild(ghostTask);
        else {
            board.insertBefore(ghostTask,belowTask);
        }
    });
}

function hoverStories(storyContainer) {
    storyContainer.addEventListener('dragover',(e) => {
        e.preventDefault();
        const ghostTask = document.querySelector('.dragging-story');
        const belowTask = getBelowElement(storyContainer,e.clientY,'.story','.dragging-story');
        if(belowTask == null) storyContainer.appendChild(ghostTask);
        else {
            storyContainer.insertBefore(ghostTask,belowTask);
        }
    });
}

allTasks.forEach(task => {
    dragDropTasks(task);
});

allBoards.forEach(board => {
    hoverBoards(board);
});

existingStories.forEach(story => {
   dragDropStories(story);
});

existingStoryContainers.forEach(storyContainer => {
   hoverStories(storyContainer);
});

// ADD BOARD BUTTON

addBoard.addEventListener('click',() => {
    boardModal.showModal();
});

const boardSubmitBtn = boardModal.querySelector('button');
const modalFieldTitle = boardModal.querySelector('#field-board-heading');
const modalFieldColor = boardModal.querySelector('#field-board-color');
    
boardSubmitBtn.addEventListener('click',(e) => {
    e.preventDefault();
    const formData = {
        boardTitle: modalFieldTitle.value.trim(),
        boardColor: modalFieldColor.value,
    }
    boardModal.close(JSON.stringify(formData));
    modalFieldTitle.value = "";
    modalFieldColor.value = "#fab701";
});
    
boardModal.addEventListener('close',() => {
    try{
        const {boardTitle:fieldTitle,boardColor} = JSON.parse(boardModal.returnValue);
        if(fieldTitle.length == 0) {
            alert('Field Should NoT be empty');
            return;
        }
        
        const boardsContainer = boardModal.closest('.container').querySelector('.boards');
        const boardTemplate  = document.querySelector('.board-template');
        const boardNode = boardTemplate.content.cloneNode(true);
        const boardTitle = boardNode.querySelector('.board-title');
        const circle = boardNode.querySelector('.circle');
        boardTitle.innerText = fieldTitle;
        boardTitle.style.color = boardColor;
        circle.style.borderColor = boardColor;
        boardsContainer.appendChild(boardNode);
        
        // ADD Task, ADD Task Modal, Bulk-Delete, Priority Filter, onHover
        const newlyAddedBoard = boardsContainer.lastElementChild;
        const thisBoardAddTask = newlyAddedBoard.querySelector('.add-task');
        const thisBoardBulkDelete = newlyAddedBoard.querySelector('.bulk-delete');
        const thisBoardAddTaskModal = newlyAddedBoard.querySelector('.add-task-modal');
        addNewTask(thisBoardAddTask);
        bulkDelete(thisBoardBulkDelete);
        hoverBoards(newlyAddedBoard);
        closeOverlay(thisBoardAddTaskModal);
    }
    catch(e) {
        console.log('Changes not saved');
    }
});

// ADD UNPLANNED-TASK BUTTON

addUnplanned.addEventListener('click',(e) => {
    unplannedTaskModal.showModal();
});

unplannedTaskModal.querySelector('button').addEventListener('click',(e) => {
    e.preventDefault();
    const fieldElement = document.querySelector('#field-uptask-desc');
    const ipValue = fieldElement.value.trim();
    const submitValue = ipValue.length > 0 ? ipValue : "";
    unplannedTaskModal.close(submitValue);
    fieldElement.value="";
});

unplannedTaskModal.addEventListener('close',() => {
     const val = unplannedTaskModal.returnValue;
     if(val.length == 0) return;
     else if([...document.querySelectorAll('.view-unplanned-modal li')]?.length == 10) {
         alert('No more than 10 Unplanned Tasks allowed');
         return;
     }
     const li = document.createElement('li');
     li.innerText = val;
     ul.appendChild(li);
     updateUpTasks();
 });

// VIEW UNPLANNED-TASKS-DB BUTTON

function updateUpTasks(){
    upValue.textContent = `${[...document.querySelectorAll('.view-unplanned-modal li')]?.length} <<`;
}

function init() {
    updateUpTasks();
}

viewUnplanned.addEventListener('click',(e) => {
    viewUnplannedModal.showModal();
});

// ADD TASK BUTTON(S)

function twelveHourFormat(hour,minutes) {
    let ampm = hour < 12 ? 'am' : 'pm';
    hour = hour % 12;
    hour = hour ? hour : 12;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    // seconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${hour}:${minutes}: ${ampm}`;
}

function getTaskDate() {
    let date = new Date();
    let dayOfMonth = date.getDate();
    let month = months[date.getMonth()];
    let year = date.getFullYear();
    let hour = date.getHours();
    let minutes = date.getMinutes();
    // let seconds = date.getSeconds();
    let timeFormat = twelveHourFormat(hour,minutes);
    let weekDay = weekDays[date.getDay()];

    let taskDate = `${dayOfMonth}th ${month} ${year} @ ${timeFormat} - ${weekDay}`;
    return taskDate;

}

function addNewTask(addBtn) {
    const addTaskModal = addBtn.closest('.board').querySelector('.add-task-modal');
    const {submitBtn,modalTitleField,modalDescField,modalPriorityFields} = getModalForm(addTaskModal);

    addBtn.addEventListener('click',(e) => {
        addTaskModal.showModal();
    });
    
    submitBtn.addEventListener('click',(e) => {
        e.preventDefault();
        const submitObj = getFormData(modalTitleField, modalDescField, modalPriorityFields);
        addTaskModal.close(JSON.stringify(submitObj));
        modalTitleField.value = "";
        modalDescField.value = "";
        modalPriorityFields.forEach(p => {
            if(p.value == 1) p.checked = true;
        });
        // PENDING -> EMPTY THE FORM UPON SUBMIT
    });

    addTaskModal.addEventListener('close',() => {
        try{
            // VALIDATE FORM DATA
            const {taskTitle,taskDesc,taskPriority} = JSON.parse(addTaskModal.returnValue);
            if(taskTitle.length == 0 || taskDesc.length == 0) {
                alert("Fields should not be empty");
                return;
            }

            // CLONE TEMPLATE NODE AND APPEND TO REAL DOM FROM THIS FRAGMENTT
            const taskBoard = addTaskModal.closest('.board');
            const taskTemplate = taskBoard.querySelector('.task-template');
            const newTask = taskTemplate.content.cloneNode(true);
            newTask.querySelector('.task-title').innerText = taskTitle;
            const taskPr = newTask.querySelector('.task-priority');
            taskPr.innerText = taskPriority.priority;
            taskPr.style.color = taskPriority.color;
            newTask.querySelector('.task-description').innerText = taskDesc;
            const taskDateTime = getTaskDate();
            newTask.querySelector('.time-of-task').innerText = taskDateTime;
            taskBoard.appendChild(newTask);

            // ATTACH LISTENERS POST MODAL CLOSURE
            const newlyAddedTask = taskBoard.lastElementChild;
            const thisTaskEditBtn = newlyAddedTask.querySelector('.edit-task');
            const thisTaskAddStoryBtn = newlyAddedTask.querySelector('.add-story');
            const thisTaskAccIcon = newlyAddedTask.querySelector('.accordion-icon');
            const thisTaskDeleteBtn = newlyAddedTask.querySelector('.delete-task');
            const thisTaskStoryContainer = newlyAddedTask.querySelector('.stories');
            const thisTaskModals = [newlyAddedTask.querySelector('.add-story-modal'),newlyAddedTask.querySelector('.edit-task-modal')];

            expandcollapse(thisTaskAccIcon);
            editTask(thisTaskEditBtn);
            addTaskStory(thisTaskAddStoryBtn);
            deleteTask(thisTaskDeleteBtn);
            hoverStories(thisTaskStoryContainer);
            dragDropTasks(newlyAddedTask);


            thisTaskModals.forEach(modal => {
                closeOverlay(modal);
            });
        }
        catch(e) {
            console.log('Changes Not Saved');
        }
    });
}

addTaskButtons.forEach(addBtn => {
    addNewTask(addBtn);
});

// EDIT-TASK BUTTON(S)

function getModalForm(modal) {
    const modalForm = {
        submitBtn: modal.querySelector('button'),
        modalTitleField: modal.querySelector('.field-task-heading'),
        modalDescField: modal.querySelector('.field-task-desc'),
        modalPriorityFields: modal.querySelectorAll('.field-task-priority')
    }
    return modalForm;
}

function getPriorityObj(modalPriorityFields) {
    let pValue = [...modalPriorityFields].reduce((priority,field) => (field.checked == true) ? Number(field.value): priority,0);
    let pObj = priorityDetails.filter(p => p.value == pValue)[0];
    return pObj;
}

function getFormData(modalTitleField, modalDescField, modalPriorityFields) {
    const finalObj = {
        taskTitle: modalTitleField.value.trim(),
        taskDesc: modalDescField.value.trim(),
        taskPriority: getPriorityObj(modalPriorityFields),
    }
    return finalObj;
}

function editTask(editBtn) {
    const taskUI = editBtn.closest('.task-text-info');
    const uiTitle = taskUI.querySelector('.task-title');
    const uiDesc = taskUI.querySelector('.task-description');
    const uiPriority = taskUI.querySelector('.task-priority');

    const currentEditModal = editBtn.closest('.task').querySelector('.edit-task-modal');
    const {submitBtn:saveBtn, modalTitleField, modalDescField, modalPriorityFields} = getModalForm(currentEditModal);

    editBtn.addEventListener('click',(e) => {
        modalTitleField.value = uiTitle.innerText;
        modalDescField.value = uiDesc.innerText;
        const myMap = priorityDetails.reduce((acc,p)=>{
            acc[p.priority]= p.value;
            return acc;
        },{});
        
        modalPriorityFields.forEach(p => {
            if(p.value == myMap[uiPriority.innerText]) 
                p.checked = true;
        });
        currentEditModal.showModal();
    });

    saveBtn.addEventListener('click',(e) => {
        e.preventDefault();
        const saveObj = getFormData(modalTitleField, modalDescField, modalPriorityFields);
        currentEditModal.close(JSON.stringify(saveObj));
    });

    currentEditModal.addEventListener('close',() => {
        try{
            const {taskTitle,taskDesc,taskPriority} = JSON.parse(currentEditModal.returnValue);
            if(taskTitle.length == 0 || taskDesc.length == 0) {
                alert("Fields should not be empty");
                return;
            }
            uiTitle.innerText = taskTitle;
            uiDesc.innerText = taskDesc;
            uiPriority.innerText = taskPriority.priority;
            uiPriority.style.color = taskPriority.color;
        }
        catch(e) {
            console.log('Changes Not Saved');
        }
    });
}

editTaskButtons.forEach(editBtn => {
    editTask(editBtn);
});

// ADD-STORY BUTTON(S)

function handleAddStoryModal(modal,fieldValue,fieldElement) {
    const ipValue = fieldValue.trim();
    const submitValue = ipValue.length > 0 ? ipValue : "";
    modal.close(submitValue);
    fieldElement.value="";
}

function addTaskStory(addBtn) {
    const currentAddStoryModal = addBtn.closest('.task').querySelector('.add-story-modal');
    const submitBtn = currentAddStoryModal.querySelector('button');

    addBtn.addEventListener('click',(e) => {
        currentAddStoryModal.showModal();
    });

    submitBtn.addEventListener('click',(e) => {
        e.preventDefault();
        const fieldElement = currentAddStoryModal.querySelector('.field-story-desc');
        handleAddStoryModal(currentAddStoryModal,fieldElement.value,fieldElement);
    });

    currentAddStoryModal.addEventListener('close',() => {
        const val = currentAddStoryModal.returnValue;
        if(val.length == 0) return;

        const template = currentAddStoryModal.closest('.accordion').querySelector('.story-template');
        const story = template.content.cloneNode(true);
        const storyDesc = story.querySelector('.story-desc');
        const stories = currentAddStoryModal.closest('.accordion').querySelector('.stories');
        
        storyDesc.innerText = val;
        stories.appendChild(story);

        const newlyAddedStory = stories.lastElementChild;
        const deleteIcon = newlyAddedStory.querySelector('.delete-story');
        deleteIcon.addEventListener('click',(e) => {
            const currentStoryContainer = deleteIcon.closest('.stories');
            const currentStory = deleteIcon.closest('.story');
            currentStoryContainer.removeChild(currentStory);
        });

        dragDropStories(newlyAddedStory);
    });
}

addStoryButtons.forEach(addBtn => {
    addTaskStory(addBtn);
});

// EXPAND-COLLAPSE BUTTON(S)

function collapseBoardTask(icon) {
    icon.closest('.board').querySelectorAll('.accordion-icon').forEach(icon => {
        if(icon.classList.contains('collapse-task')) {
            icon.classList.remove('collapse-task');
            icon.classList.add('expand-task');
            icon.setAttribute('src',icons.expandIcon);
            icon.closest('.accordion').querySelector('.stories').classList.add('hide');
        }
    });
}

function expandcollapse(icon) {
    icon.addEventListener('click',(e) => {
        if(icon.classList.contains('collapse-task')) {
            icon.classList.remove('collapse-task');
            icon.classList.add('expand-task');
            icon.setAttribute('src',icons.expandIcon);
            icon.closest('.accordion').querySelector('.stories').classList.add('hide');
        }
        else if(icon.classList.contains('expand-task')) {
            collapseBoardTask(icon);
            icon.classList.remove('expand-task');
            icon.classList.add('collapse-task');
            icon.setAttribute('src',icons.collapseIcon);
            icon.closest('.accordion').querySelector('.stories').classList.remove('hide')
        }
    });
}

accordionIcons.forEach(icon => {
    expandcollapse(icon);
});

// DELETE TASKS

function deleteTask(deleteBtn) {
    deleteBtn.addEventListener('click',(e) => {
        const parentBoard = deleteBtn.closest('.board');
        const deleteTask = deleteBtn.closest('.accordion');
        parentBoard.removeChild(deleteTask);
    });
}

allDeleteButtons.forEach(deleteBtn => {
    deleteTask(deleteBtn);
});

// COMMON WAY TO CLOSE MODALS WHEN CLICKING OUT OF THE MODAL AREA

function closeOverlay(modal) {
    modal.addEventListener('click',(e) => {
        const modalBoundaries = modal.getBoundingClientRect();
        if(e.clientX < modalBoundaries.left || e.clientX > modalBoundaries.right || e.clientY < modalBoundaries.top || e.clientY > modalBoundaries.bottom) modal.close("");
    });
}

modals.forEach(modal => {
    closeOverlay(modal);
});

init();