const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
const cTable = require('console.table');
require('dotenv').config()
let currentChoice;

//init function in order to use async and await
async function init() {
    //connection to mysql
    const db = await mysql.createConnection(
    {
        host: 'localhost',
    // MySQL username,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
    }
    );

    //Starting message
    console.log(`------------------------------------------------------------
                Welcome to the Employee Database
------------------------------------------------------------`);
    mainPrompt();

//the main inquirer prompt
    function mainPrompt() {
        inquirer
        .prompt([
            {
                type: 'list',
                message: 'What would you like to do?',
                choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', "Update an employee", 'Quit'],
                default: 'View all departments',
                name: 'menu'
            }
        ])
        .then((response) => {
            if (response.menu == 'Quit') {
                console.log("Exiting");
                process.exit();
            } else {
                //send to menuHandler function
                menuHandler(response.menu);
            }
        })
    }
    
    //function for directing user after the main prompt
    function menuHandler(selection){
        switch (selection) {
            case 'View all departments':
                viewDepartments();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'View all employees':
                viewEmployees();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case "Update an employee":
                updateEmployee();
                break;
        }
    } 
    
    //view department function
    async function viewDepartments() {
        //query for the departments
        const results = await db.execute('SELECT * FROM department;');
        //output results
            console.log('\n');
            console.table("Department", results[0]);
            console.log('\n');
        //delay to let the table log correctly before sending user the main prompt
        setTimeout(() => {
            mainPrompt();
        }, 500);
    }
    
    //view roles function
    async function viewRoles() {
        //query to get the role information with a join query
        const results = await db.execute('SELECT role.id, role.title, department.name AS department, role.salary FROM role JOIN department ON role.department_id = department.id ORDER BY id;');
            console.log('\n');
            console.table("Roles", results[0]);
            console.log('\n');
        //delay to let the table log correctly before sending user the main prompt
        setTimeout(() => {
            mainPrompt();
        }, 500);
    }
    
    //view employees function
    async function viewEmployees(){
        //used to modify the returned query data
        let empList = [];
        let employees = [];
        //this block is where I query to make my first and last name array of all employees
        const empResults = await db.execute('SELECT first_name, last_name FROM employee ORDER BY id');
        employees = empResults[0];
        let firstAndLast = [];
        employees.forEach(element => {
            firstAndLast.push(`${element.first_name} ${element.last_name}`);
        });
        //this is the main query for pulling the employee information and joining all the tables, notice the last SELECT statement: employee.manager_id AS manager
        const results = await db.execute('SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, employee.manager_id AS manager FROM employee JOIN role ON role.id = employee.role_id JOIN department ON role.department_id = department.id ORDER BY id;');
            //moving my results onto an easy to work with array
            empList = results[0];
            //iterating over the array at each employee to set the manager name using the firstAndLast array
            empList.forEach(element =>{
                //using the element.manager (currently the manager_id) to find the managers name in the firstAndLast array
                element.manager = firstAndLast[element.manager-1];
            })
            //final output to the console
            console.log('\n');
            console.table("Employees", results[0]);
            console.log('\n');
        //this I used as a small delay to render the table fully then proceed back to the mainPrompt inquirer function
        setTimeout(() => {
            mainPrompt();
        }, 500);
    }
    
    //add a department function
    function addDepartment() {
        //prompt for name of new department
        inquirer
        .prompt([
            {
                type: 'input',
                message: 'Enter the name of the new department: ',
                name: 'department'
            }
        ])
        .then(async (response) => {
            //insert new department name into table
            await db.execute('INSERT INTO department (name) VALUES (?)', [response.department])
            //success feedback
            console.log(`Successfully added ${response.department} to the departments table`);
            //delay to let the table log correctly before sending user the main prompt
            setTimeout(() => {
                mainPrompt();
            }, 500);
        })
    }
    
    //add a role function
    async function addRole() {
        //get all department names for the prompt
        let departments = [];
        const results = await db.execute('SELECT name FROM department')
        departments = results[0];

        //prompt for title, salary, and which department
        inquirer
        .prompt([
            {
                type: 'input',
                message: 'Enter the title of the new role: ',
                name: 'title'
            },
            {
                type: 'input',
                message: 'Enter the salary of the new role: ',
                name: 'salary'
            },
            {
                type: 'list',
                message: 'Enter the department: ',
                choices: departments,
                name: 'department'
            }
        ])
        .then( async (response) => {
            //converting chosen department into the corresponding department id
            let departmentID;
            let departmentInt;
            //query for department id with chosen name
            let results = await db.execute('SELECT id FROM department WHERE name = ?', [response.department])
            departmentID = results[0];
            departmentID.forEach(element => {
                departmentInt = parseInt(element.id);
            })
            //fianal query to insert new role information into the role table
            await db.query('INSERT INTO role (title, salary, department_id) VALUES (?,?,?)', [response.title, response.salary, departmentInt])
            //success feedback
            console.log(`Successfully added ${response.title} to the ${response.department} department`);
            //delay to let the table log correctly before sending user the main prompt
            setTimeout(() => {
                mainPrompt();
            }, 500);
        })
    }
    
    // add an employee function
    async function addEmployee() {
        //get role names for prompt
        let roles = [];
        let preRoles = [];
        const rolResults = await db.execute('SELECT title FROM role ORDER BY id');
        preRoles = rolResults[0];
        preRoles.forEach(element=> {
            roles.push(element.title);
        });
        
        //get employee names for prompt for the employee's manager
        let employees = [];
        const empResults = await db.execute('SELECT first_name, last_name FROM employee ORDER BY id');
        employees = empResults[0];
        let firstAndLast = [];
        employees.forEach(element => {
            firstAndLast.push(`${element.first_name} ${element.last_name}`);
        });
        firstAndLast.push('None');

        //prompt for first name, last name, role, and employee's manager
        inquirer
        .prompt([
            {
                type: 'input',
                message: "Enter the employee's first name: ",
                name: 'firstName'
            },
            {
                type: 'input',
                message: "Enter the employee's last name: ",
                name: 'lastName'
            },
            {
                type: 'list',
                message: 'Enter the role: ',
                name: 'role',
                choices: roles
            },
            {
                type: 'list',
                message: "Enter the employee's manager: ",
                name: 'manager',
                choices: firstAndLast
            }
        ]).then( async (response) => {
            //turn role selected into role id
            let roleID;
            let roleInt;
            let managerID;
            let rolResults = await db.execute('SELECT id FROM role WHERE title = ?', [response.role]);
            roleID = rolResults[0];
            roleID.forEach(element => {
                roleInt = parseInt(element.id);
            })
            //turn manager selected into manager id or null
            if (response.manager == 'None') {
                managerID = null;
            } else {
                let manCount = 1;
                let found = false;
                firstAndLast.forEach(element=> {
                    if ((element == response.manager) && !found) {
                        managerID = manCount;
                        found = true;
                    } else {
                        manCount++;
                    }
            })
            }
            //final query to insert employee information into the employee table
            await db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)', [response.firstName, response.lastName, roleInt, managerID]);
            console.log(`Added ${response.firstName} ${response.lastName} with role id of: ${roleInt} and manager id of: ${managerID} to employee table.`)
            //delay to let the table log correctly before sending user the main prompt
            setTimeout(() => {
                mainPrompt();
            }, 500);
        })
    }
    
    //update employee function for updating role or manager
    async function updateEmployee() {
        //get employee names for prompt which employee to update
        let employees = [];
        const empResults = await db.execute('SELECT first_name, last_name FROM employee ORDER BY id');
        employees = empResults[0];
        let firstAndLast = [];
        employees.forEach(element => {
            firstAndLast.push(`${element.first_name} ${element.last_name}`);
        });

        //prompt which employee to update and what the user wants to update
        inquirer
        .prompt([
            {
                type: 'list',
                choices: firstAndLast,
                message: "Who would you like to update?",
                name: 'person'
            },
            {
                type: 'list',
                choices: ["Update employee's role", "Update employee's manager"],
                message: "What would you like to update?",
                name: 'answer'
            }
        ]).then(response => {
                //get the employee id number from selected name
                let empID;
                let empCount = 1;
                let found = false;
                firstAndLast.forEach(element=> {
                    if ((element == response.person) && !found) {
                        empID = empCount;
                        found = true;
                    } else {
                        empCount++;
                    }
                });
                //switch to send employee id to update functions based off user choice
                switch (response.answer) {
                    case "Update employee's role":
                        updateEmpRole(empID);
                        break;
                    case "Update employee's manager":
                        updateEmpManager(empID);
                        break;
                }
                
                
        })
    }
    
    //update employee role function
    async function updateEmpRole(empID) {
        //get all role names for prompt
        let roles = [];
        let preRoles = [];
        const rolResults = await db.execute('SELECT title FROM role ORDER BY id');
        preRoles = rolResults[0];
        preRoles.forEach(element=> {
            roles.push(element.title);
        });

        //prompt for new role
        inquirer
        .prompt([
            {
                type: 'list',
                choices: roles,
                name: 'role',
                message: 'What is the new role?'
            }
        ]).then(async response => {
            //get role id from selected role name
            let roleID;
            let roleInt;
            let rolResults = await db.execute('SELECT id FROM role WHERE title = ?', [response.role]);
            roleID = rolResults[0];
            roleID.forEach(element => {
                roleInt = parseInt(element.id);
            })

            //final query to update employee role id
            await db.execute('UPDATE employee SET role_id = ? WHERE id = ?', [roleInt, empID]);
            console.log(`Updated role_id to ${roleInt} at employee id: ${empID}`);
            //delay to let the table log correctly before sending user the main prompt
            setTimeout(() => {
                mainPrompt();
            }, 500);
        })
    }

    //update employee manager function
    async function updateEmpManager(empID) {
        //get list of employee names for prompt
        let employees = [];
        const empResults = await db.execute('SELECT first_name, last_name FROM employee ORDER BY id');
        employees = empResults[0];
        let firstAndLast = [];
        employees.forEach(element => {
            firstAndLast.push(`${element.first_name} ${element.last_name}`);
        });
        firstAndLast.push('None');

        //ask who new manager is
        inquirer
        .prompt([
            {
                type: 'list',
                choices: firstAndLast,
                message: "Who is the employees new manager?",
                name: 'person'
            }
        ]).then(async response => {
            //get manager id for selected name
            let managerID;
            if (response.person == 'None') {
                managerID = null;
            } else {
                let manCount = 1;
                let found = false;
                firstAndLast.forEach(element=> {
                    if ((element == response.person) && !found) {
                        managerID = manCount;
                        found = true;
                    } else {
                        manCount++;
                    }
            })
            }
            
            //final query where employee manager id is updated with selected
            await db.execute('UPDATE employee SET manager_id = ? WHERE id = ?', [managerID, empID]);
            console.log(`Updated manager_id to ${managerID} at employee id: ${empID}`);
            //delay before sending user the main prompt
            setTimeout(() => {
                mainPrompt();
            }, 500);
        })
    }
}

init();