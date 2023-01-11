INSERT INTO department (name)
VALUES ("Sales"),
        ("HR"),
        ("Accounting"),
        ("Shipping");

INSERT INTO role (title, salary, department_id)
VALUES ("CEO", 1000000, 2),
        ("Salesman", 100000, 1),
        ("Accountant", 70000, 3),
        ("Truck Loader", 45000, 4),
        ("Manager", 70000, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Johnson", 1, null),
        ("Mike", "Smith", 5, null),
        ("Joe", "Shmoe", 4, 2),
        ("Sally", "Hill", 3, 2),
        ("Frank", "Fort", 2, 2);