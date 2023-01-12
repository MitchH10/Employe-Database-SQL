const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
const cTable = require('console.table');
require('dotenv').config()
let currentChoice;
const db = mysql.createConnection(
    {
        host: 'localhost',
    // MySQL username,
    user: process.env.DB_USER,
    // TODO: Add MySQL password
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
    }
);

function init() {
    
    console.log(`------------------------------------------------------------
                Welcome to the employee Database
------------------------------------------------------------`);
    mainPrompt();
    console.log(currentChoice);
}
function mainPrompt() {
    inquirer
    .prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', "Update an employee's role", 'Quit'],
            default: 'View all employees',
            name: 'menu'
        }
    ])
    .then((response) => {
        if (response.menu == 'Quit') {
            console.log("Exiting");
            process.exit();
        } else {
            menuHandler(response.menu);
        }
    })
}


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
        case "Update an employee's role":
            updateEmployeeRole();
            break;
    }
} 

function viewDepartments() {
    db.query('SELECT * FROM department;', function (err, results) {
        console.log('\n\n');
        console.table("Department", results);
        console.log('\n\n');
        if (err) {
            console.log(err);
        }
    })
    setTimeout(() => {
        mainPrompt();
    }, 500);
}

function viewRoles() {
    db.query('SELECT role.id, role.title, department.name AS department, role.salary FROM role JOIN department ON role.department_id = department.id ORDER BY id;', function (err, results) {
        console.log('\n\n');
        console.table("Roles", results);
        console.log('\n\n');
        if (err) {
            console.log(err);
        }
    })
    setTimeout(() => {
        mainPrompt();
    }, 500);
}

function viewEmployees(){
    db.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, employee.manager_id FROM employee JOIN role ON role.id = employee.role_id JOIN department ON role.department_id = department.id ORDER BY id;', function (err, results) {
        console.log('\n\n');
        console.table("Employees", results);
        console.log('\n\n');
        if (err) {
            console.log(err);
        }
    })
    setTimeout(() => {
        mainPrompt();
    }, 500);
}

function addDepartment() {
    inquirer
    .prompt([
        {
            type: 'input',
            message: 'Enter the name of the new department: ',
            name: 'department'
        }
    ])
    .then((response) => {
        db.query('INSERT INTO department (name) VALUES (?)', response.department, (err, result) => {
            if (err) {
                console.log(err);
            }
            console.log(`Successfully added ${response.department} to the departments table`);
        })
        setTimeout(() => {
            mainPrompt();
        }, 500);
    })
}

function addRole() {
    let departments = [];
    db.query('SELECT name FROM department', function (err, results) {
        departments = results;
    });
    setTimeout(() => {
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
    .then( (response) => {
        let departmentID;
        let departmentInt;
        setTimeout(() => {
        db.query('SELECT id FROM department WHERE name = ?', response.department, (err, result) => {
            if (err) {
                console.log(err);
            }
            departmentID = result;
            console.log('hello', result);
            departmentID.forEach(element => {
                departmentInt = parseInt(element.id);
            })
        })}, 1000)
        console.log(departmentID);
        setTimeout(() => {
        db.query('INSERT INTO role (title, salary, department_id) VALUES (?,?,?)', [response.title, response.salary, departmentInt], (err, result) => {
            if (err) {
                console.log(err);
            }
            console.log(`Successfully added ${response.title} to the ${response.department} department`);
        })}, 500);
        setTimeout(() => {
            mainPrompt();
        }, 500);
    })}, 500);
}

function addEmployee() {

}

function updateEmployeeRole() {

}

init();