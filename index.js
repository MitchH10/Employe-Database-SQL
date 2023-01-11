const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

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

function mainPrompt() {
    inquirer
    .prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee\'s role'],
            default: 'View all employees'
        }
    ])
    .then((response) => {
        return response
    })
}

function menuDirector(option){
    switch (option) {
        case 'View all departments':
            viewDepartments();
            break;
        case 'View all roles':
            viewRoles();
            break;
        case 'View all employees':
            viewEmployees();
            break;
        case ''
    }
}

function viewDepartments() {

}

function viewRoles() {

}

function viewEmployees(){

}

function addRole() {

}

function addEmployee() {

}

function updateEmployeeRole() {

}