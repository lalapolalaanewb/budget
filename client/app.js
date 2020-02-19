// Budget Controller - handles all calculation
let budgetController = (() => {

    // declare data user inputted - function Constructor
    // Expense data
    let Expense = function(id, description, value) {
        this.id = id
        this.description = description
        this.value = value
        this.percentage = -1
    }

    // method to calculate expenses percentages
    Expense.prototype.calcExpensesPercentages = function(totalInc) {

        if(totalInc > 0) {
            this.percentage = Math.round((this.value / totalInc) * 100)
        } else {
            this.percentage = -1
        }
    }
    // return calculated expenses percentages
    Expense.prototype.getExpensesPercentages = function() {
        
        return this.percentage
    }

    // Income data
    let Income = function (id, description, value) {
        this.id = id
        this.description = description
        this.value = value
    }

    // calculate total income & expenses
    let calculateTotal = itemType => {

        // set initial sum to 0
        let sum = 0

        // add sum to the latest value input by user
        // either from 'inc' or 'exp'
        data.allItems[itemType].forEach(current => sum = sum + current.value)

        // insert the new updated total of 'inc' or 'exp' to data-totals object
        data.totals[itemType] = sum
    }

    // store all data here
    let data = {
        allItems: {
            // store all expenses here
            exp: [],
            // store all incomes here
            inc: []
        },
        // store total incomes & expenses
        totals: {
            // init value of expenses
            exp: 0,
            // init value of incomes
            inc: 0
        },
        // store total budget
        budget: 0,
        // store percentage of total budget
        // -1 means 'something is not in existance yet'
        percentage: -1
    }

    // public functions declaration starts here
    return {

        // add new item to storage or data
        addNewItem: (itemType, itemDesc, itemValue) => {

            let newItem, id

            // create new id of every new item
            if(data.allItems[itemType].length > 0) {
                id = data.allItems[itemType][data.allItems[itemType].length -1].id + 1
            } else {
                id = 0
            }

            // create new item based on 'inc' or 'exp' type
            if(itemType === 'exp'){
                newItem = new Expense(id, itemDesc, itemValue)
            } else if(itemType === 'inc') {
                newItem = new Income(id, itemDesc, itemValue)
            }

            // insert new data inserted by the user into 'data' object
            data.allItems[itemType].push(newItem)
            
            // return the new element
            return newItem
        },

        // delete existing item
        deleteExistingItem:  (itemType, id) => {
            console.log('in delete: ' + itemType)
            let ids, index

            // get new array of available id
            // using .map
            ids = data.allItems[itemType].map(current => current.id)

            // get only the index of the elemnet in the copied array
            index = ids.indexOf(id)

            // delete when index is not = -1 OR index same/available
            if(index !== -1) {

                // using 'splice' with 2 arguments (whattodelete, noofelementwantstodelete)
                data.allItems[itemType].splice(index, 1)
            }
        },

        // calculate budget
        calculateBudget: () => {

            // calculate the total income & expenses
            calculateTotal('exp')
            calculateTotal('inc')

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp

            // calculate percentage of 'spent' income when 'have income'
            if(data.totals.inc > 0) {
                 
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            } else {
                 
                // set to non existance yet value
                data.percentage = -1
            }
        },

        // calculate expenses percentages
        calculateExpensesPercentages: () => {

            // call the calcExpensesPercentages()
            // using forEach
            data.allItems.exp.forEach(current => current.calcExpensesPercentages(data.totals.inc))
        },

        // fetch or get the expenses percentages
        fetchExpensesPercentages: () => {

            let allExpPercentages = data.allItems.exp.map(current => current.getExpensesPercentages())
            
            return allExpPercentages
        },

        // return budget calculated to 'controller' to pass to 'UI controller'
        getBudget: () => {

            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        // testing public function
        testing: () => {

            // display data
            console.log(data)
        }
    }

})();

// UI Controller - handles all UI stuff
let UIController = (() => {

    // store DOM strings of inputs
    let DOMstrings = {
        addItemType: '.add_item-type',
        addItemDesc: '.add_item-description',
        addItemValue: '.add_item-value',
        addItemBtn: '.add_item-btn',
        incomeList: '.income_list',
        expensesList: '.expenses_list',
        divBGColorChange: '.add_item-form',
        budgetTotalValue: '.budget_value',
        budgetIncomeValue: '.budget_income-value',
        budgetExpensesValue: '.budget_expenses-value',
        budgetExpensesPercentage: '.budget_expenses-percentage',
        expensesPercentageLabel: '.item_percentage',
        expensesPercentageMobileLabel: '.item_percentage-mobile',
        itemListContainer: '.item_list',
        budgetTitleMonthLabel: '.budget_title-month'
    }

    // number formatting function
    let formatNumber = (itemValueInput, itemType) => {

        let numSplit, int, dec

        // giving absolute number ignoring the '+' or '-' sign
        itemValueInput = Math.abs(itemValueInput)

        // add 2 decimal points
        itemValueInput = itemValueInput.toFixed(2)

        // put commas on thousand
        numSplit = itemValueInput.split('.')
        
        // choose the array index 0 = integer before .2 decimal points
        // and assign it to 'int' var
        int = numSplit[0]

        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length -3, 3) // input 12345, output = 12,345
        }

        // assign number after .2 decimal points to 'dec' var
        dec = numSplit[1]

        // return combination of the right number/value formatting
        return (itemType === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec
    }

    // let nodeListForEach = (list, callback) => {

    //     for(let i = 0; i < list.length; i++) {

    //         callback(list[i], i)
    //     }
    // }

    // object of return
    // containing public methods
    return {

        // get user input data
        getUserInput: () => {

            return {

                // get item type 'inc' or 'exp'
                itemType: document.querySelector(DOMstrings.addItemType).value,
                // get item description
                itemDesc: document.querySelector(DOMstrings.addItemDesc).value,
                // get item value - in decimal or float
                itemValue: parseFloat(document.querySelector(DOMstrings.addItemValue).value)
            }
        },

        // update and add new item to the UI
        addListItems: (newItem, itemType) => {

            let html, element

            // create HTML strings
            if(itemType === 'inc') {

                element = DOMstrings.incomeList

                html = `
                    <!-- new item: income -->
                    <div class="item" id="inc-${newItem.id}">
                        
                        <!-- income description -->
                        <div class="item_description">${newItem.description}</div>
                    
                        <!-- right hand-side info -->
                        <div class="right_side">
                            <!-- income value -->
                            <div class="item_value">${formatNumber(newItem.value, itemType)}</div>
                            <!-- income delete -->
                            <div class="item_delete">
                                <!-- income delete button -->
                                <button class="item_delete-btn"><i class="ion-ios-close-outline"></i></button>
                            </div>
                        </div>

                        <!-- right hand-side info (for mobile only) -->
                        <div class="right_side-mobile">
                            <!-- show up when hover or tap -->
                            <div class="mobile_tap">
                                <!-- income value -->
                                <div class="item_value">${formatNumber(newItem.value, itemType)}</div>
                                <!-- income delete -->
                                <div class="item_delete">
                                    <!-- income delete button -->
                                    <button class="item_delete-btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>

                    </div>
                `
            } else if(itemType === 'exp') {

                element = DOMstrings.expensesList

                html = `
                    <!-- new item: expenses -->
                    <div class="item" id="exp-${newItem.id}">

                        <!-- expenses description -->
                        <div class="item_description">${newItem.description}</div>

                        <!-- right hand-side info -->
                        <div class="right_side">
                            <!-- expenses value -->
                            <div class="item_value">${formatNumber(newItem.value, itemType)}</div>
                            <!-- expenses percentage -->
                            <div class="item_percentage">18%</div>
                            <!-- expenses delete -->
                            <div class="item_delete">
                                <!-- expenses delete button -->
                                <button class="item_delete-btn"><i class="ion-ios-close-outline"></i></button>
                            </div>
                        </div>

                        <!-- right hand-side info (for mobile only) -->
                        <div class="right_side-mobile">
                            <!-- expenses percentage -->
                            <div class="item_percentage-mobile">18%</div>
                            <!-- show up when hover or tap -->
                            <div class="mobile_tap">
                                <!-- expenses value -->
                                <div class="item_value">${formatNumber(newItem.value, itemType)}</div>
                                <!-- expenses delete -->
                                <div class="item_delete">
                                    <!-- expenses delete button -->
                                    <button class="item_delete-btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>

                    </div>
                `
            }

            // use insertAdjacentHTML to append above html
            document.querySelector(element).insertAdjacentHTML('beforeend', html)
        },

        // delete existing list items from UI
        deleteExistingListItem: (idSelected) => {

            // delete html element with id = 'inc-id' or 'exp-id' and all it's children
            // so we need to pinpoint the parent element of id ('inc-id' or 'exp-id')
            // which is html element with class of 'income__list' or 'expense__list' using 'parentNode'
            // then use removeChild to remove all elements under that 'parentNode' chosen
            // can refer here - blog.garstasio.com/you-dont-need-jquery/dom-manipulation
            let element2Delete = document.getElementById(idSelected)
            element2Delete.parentNode.removeChild(element2Delete)
        },

        // clear user input fields after user hit 'enter' or 'button'
        clearInputFields: () => {

            let fields, fieldsArray

            // return a list of fields
            fields = document.querySelectorAll(DOMstrings.addItemDesc + ', ' + DOMstrings.addItemValue)
            console.log(fields)
            // convert to array - using slice (return copy of array)
            fieldsArray = Array.prototype.slice.call(fields)
            console.log(fieldsArray)
            // set the input fields to empty back
            fieldsArray.forEach(current => current.value = '')

            // set the focus back to descrption input field
            fieldsArray[0].focus()
        },

        // display budget on the UI
        displayBudget: (budgetPassed) => {

            let itemType

            budgetPassed.budget > 0 ? itemType = 'inc' : itemType = 'exp'

            // update total budget on UI
            document.querySelector(DOMstrings.budgetTotalValue).textContent = formatNumber(budgetPassed.budget, itemType)
            // update total income value on UI
            document.querySelector(DOMstrings.budgetIncomeValue).textContent = formatNumber(budgetPassed.totalInc, 'inc')
            // update total expenses value on UI
            document.querySelector(DOMstrings.budgetExpensesValue).textContent = formatNumber(budgetPassed.totalExp, 'exp')

            // if there's percentage, then diaplay '%' sign
            // if not or percentage in storage = -1, then display something else
            if(budgetPassed.percentage > 0) {

                // update percentage of expenses on UI
                document.querySelector(DOMstrings.budgetExpensesPercentage).textContent = budgetPassed.percentage + '%'
            } else {

                // update percentage of expenses on UI
                document.querySelector(DOMstrings.budgetExpensesPercentage).textContent = '---'
            }
        },

        // display expenses percentages
        displayExpensesPercentages: expPercentages => {
            console.log('in display: ' + expPercentages)
            // get all elements in the element class 'item_percentage' 
            let fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel)
            console.log(fields)
            // get all elements in the element class 'item_percentage-mobile' 
            let fieldsMobile = document.querySelectorAll(DOMstrings.expensesPercentageMobileLabel)
            console.log(fieldsMobile)

            let nodeListForEach = (list, callback) => {

                for(let i = 0; i < list.length; i++) {
        
                    callback(list[i], i)
                }
            }

            nodeListForEach(fields, (current, index) => {

                if(expPercentages[index] > 0) {
                    current.textContent = expPercentages[index] + '%'
                } else {
                    console.log('FAILED!')
                    current.textContent = '---'
                }
            })

            let nodeListForEach2 = (list, callback) => {

                for(let i = 0; i < list.length; i++) {
        
                    callback(list[i], i)
                }
            }

            nodeListForEach2(fieldsMobile, (current, index) => {

                if(expPercentages[index] > 0) {
                    current.textContent = expPercentages[index] + '%'
                } else {
                    console.log('FAILED!')
                    current.textContent = '---'
                }
            })
        },

        // display date month
        displayDate: () => {

            let now, month, months, year

            now = new Date()

            // array of months
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

            month = now.getMonth()
            year = now.getFullYear()

            document.querySelector(DOMstrings.budgetTitleMonthLabel).textContent = months[month] + ' ' + year
        },

        // update add new item bg color when user toggle between '+' or '-'
        changeDivBGColor: () => {

            document.querySelector(DOMstrings.divBGColorChange).classList.toggle('pink')

        },

        // return private DOMstrings to other controller
        getDOMstrings: () => {

            return DOMstrings
        }
    }

})();

// Controller - handles all interactions between Budget Controller & UI Controller
let controller = ((budgetCtrl, UICtrl) => {

    // setup addEventListener functions
    let setupEventListeners = () => {

        // get the passed DOMstrings
        let DOM = UICtrl.getDOMstrings()

        // addEventListener to add new item 'button'
        // pass function as argument (callback function)
        // call function to add item when the 'button' was pressed
        document.querySelector(DOM.addItemBtn).addEventListener('click', ctrlAddNewItem)

        // addEventListener to react when user hit 'enter' key instead of the 'button'
        document.addEventListener('keypress', event => {

            if(event.keyCode === 13 || event.which === 13) {

                // call function to add item
                ctrlAddNewItem()
            }
        })

        // using event delegation
        document.querySelector(DOM.itemListContainer).addEventListener('click', ctrlDeleteExistingItem)

        // add onChange() event when user select '+' or '-'
        document.querySelector(DOM.addItemType).addEventListener('change', UICtrl.changeDivBGColor)
    }

    // update budget calculation
    let updateBudget = () => {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget()

        // 2. Get return budget to pass to UI controller
        let budget = budgetCtrl.getBudget()

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget)
    }

    // update sole percentage of expenses
    updateExpensesPercentage = () => {
         
        // 1. Calculate the percentage
        budgetCtrl.calculateExpensesPercentages()

        // 2. Read percentages from the budget controller
        let expPercentages = budgetCtrl.fetchExpensesPercentages()

        // 3. Update the percentages on UI
        UICtrl.displayExpensesPercentages(expPercentages)
    }

    // add new item function 
    let ctrlAddNewItem = () => {

        let input, newItem

        // 1. Get user input data
        input = UICtrl.getUserInput()

        // check if 'have data', then proceed
        if(input.itemDesc !== '' && !isNaN(input.itemValue) && input.itemValue > 0) {

            // 2. Add new item to the storage/database
            newItem = budgetCtrl.addNewItem(input.itemType, input.itemDesc, input.itemValue)

            // 3. Update new item to the UI
            UICtrl.addListItems(newItem, input.itemType)

            // 4. Clear inputs placeholder once user hit 'enter' or 'button'
            UICtrl.clearInputFields()

            // 5. Calculate & update budget
            updateBudget()

            // 6. Calculate & update expenses percentages
            updateExpensesPercentage()
        }

    }

    // delete existing item function
    let ctrlDeleteExistingItem = event => {

        let itemID, itemIDDesktop, itemIDMobile, splitID, itemType, ID

        itemIDDesktop = event.target.parentNode.parentNode.parentNode.parentNode.id
        // console.log(itemIDDesktop)        
        itemIDMobile = event.target.parentNode.parentNode.parentNode.parentNode.parentNode.id
        // console.log(itemIDMobile)

        // itemID = itemIDDesktop = itemIDMobile

        if(itemIDDesktop) {
            console.log(itemIDDesktop)
            //  inc-id or exp-id, we want type = 'inc' or 'exp' & id = 'id'
            // we need to separate this string
            splitID = itemIDDesktop.split('-')

            // set the type (inc/exp) of the array splitID
            itemType = splitID[0]
            // set the id of the array splitID
            ID = parseInt(splitID[1])
            // console.log(type, ID)

            // 1. Delete the item from the data structure
            budgetCtrl.deleteExistingItem(itemType, ID)

            // 2. Delete the item from the UI
            UICtrl.deleteExistingListItem(itemIDDesktop)

            // 3. Update and show the new budget
            updateBudget()

            // 4. Calculate & update expenses percentages
            updateExpensesPercentage()
        } else if(itemIDMobile) {
            console.log(itemIDMobile)
            //  inc-id or exp-id, we want type = 'inc' or 'exp' & id = 'id'
            // we need to separate this string
            splitID = itemIDMobile.split('-')

            // set the type (inc/exp) of the array splitID
            itemType = splitID[0]
            // set the id of the array splitID
            ID = parseInt(splitID[1])
            // console.log(type, ID)

            // 1. Delete the item from the data structure
            budgetCtrl.deleteExistingItem(itemType, ID)

            // 2. Delete the item from the UI
            UICtrl.deleteExistingListItem(itemIDMobile)

            // 3. Update and show the new budget
            updateBudget()

            // 4. Calculate & update expenses percentages
            updateExpensesPercentage()
        } else { console.log('False')}
    }

    return {

        // create init fucntion to initialize data
        init: () => {

            console.log('Application has started!')

            // display date
            UICtrl.displayDate()

            // set all to init value of zero
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })

            // call private setupEventListeners function
            setupEventListeners()

        }
    }

})(budgetController, UIController);

// call init() function
controller.init()