import type { Challenge, SampleDatabase } from '$lib/types';

export const databaseSeeds: Record<SampleDatabase, string> = {
	employees: `
DROP TABLE IF EXISTS salaries;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS departments;

CREATE TABLE departments(
  id INTEGER PRIMARY KEY,
  name TEXT,
  location TEXT
);

CREATE TABLE employees(
  id INTEGER PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  title TEXT,
  department_id INTEGER REFERENCES departments(id),
  hire_date DATE,
  salary INTEGER,
  manager_id INTEGER REFERENCES employees(id)
);

CREATE TABLE salaries(
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id),
  amount INTEGER,
  effective_date DATE
);

INSERT INTO departments (id, name, location) VALUES
 (1,'Engineering','New York'),
 (2,'Data','Boston'),
 (3,'HR','Remote'),
 (4,'Sales','Remote'),
 (5,'Product','New York');

INSERT INTO employees (id, first_name, last_name, title, department_id, hire_date, salary, manager_id) VALUES
 (1,'Ava','Lopez','CTO',1,'2015-03-01',180000,NULL),
 (2,'Ben','Ortiz','Engineering Manager',1,'2017-06-15',150000,1),
 (3,'Chloe','Zhang','Data Lead',2,'2018-01-20',145000,1),
 (4,'Daniel','Smith','Senior Engineer',1,'2020-08-01',125000,2),
 (5,'Emily','Patel','Product Manager',5,'2021-02-14',118000,1),
 (6,'Frank','Kim','HR Lead',3,'2019-05-01',98000,1),
 (7,'Grace','Lee','Sales Manager',4,'2016-11-01',110000,1),
 (8,'Hugo','Silva','Data Analyst',2,'2022-09-12',90000,3),
 (9,'Isla','Garcia','Engineer',1,'2023-04-10',95000,2),
 (10,'Jon','Reed','Sales Associate',4,'2022-06-18',72000,7);

INSERT INTO salaries (employee_id, amount, effective_date) VALUES
 (2,130000,'2020-01-01'),
 (2,150000,'2023-01-01'),
 (4,110000,'2021-01-01'),
 (4,125000,'2024-01-01'),
 (8,82000,'2022-09-12'),
 (8,90000,'2024-01-01'),
 (9,90000,'2023-04-10'),
 (9,95000,'2024-06-01'),
 (5,105000,'2021-02-14'),
 (5,118000,'2023-07-01');
`,
	ecommerce: `
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers(
  id INTEGER PRIMARY KEY,
  name TEXT,
  country TEXT,
  signup_date DATE,
  vip BOOLEAN
);

CREATE TABLE products(
  id INTEGER PRIMARY KEY,
  name TEXT,
  category TEXT,
  price NUMERIC(10,2)
);

CREATE TABLE orders(
  id INTEGER PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  order_date DATE,
  status TEXT
);

CREATE TABLE order_items(
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER,
  unit_price NUMERIC(10,2)
);

INSERT INTO customers (id, name, country, signup_date, vip) VALUES
 (1,'Lena Rivers','US','2023-02-10',true),
 (2,'Marco Chen','CA','2022-11-05',false),
 (3,'Priya Desai','US','2024-01-22',true),
 (4,'Samir Ali','UK','2023-07-09',false),
 (5,'Taylor Brooks','US','2021-09-15',false),
 (6,'Noah Fischer','DE','2023-12-01',false),
 (7,'Mia Rossi','IT','2022-04-30',true),
 (8,'Omar Haddad','AE','2024-03-18',false);

INSERT INTO products (id, name, category, price) VALUES
 (1,'Noise Cancelling Headphones','Electronics',199.00),
 (2,'Mechanical Keyboard','Electronics',129.00),
 (3,'Standing Desk','Office',499.00),
 (4,'Ergonomic Chair','Office',389.00),
 (5,'Cold Brew Maker','Home',79.00),
 (6,'Running Shoes','Sports',120.00),
 (7,'Smartwatch','Electronics',249.00),
 (8,'LED Desk Lamp','Home',59.00),
 (9,'Wireless Mouse','Electronics',49.00);

INSERT INTO orders (id, customer_id, order_date, status) VALUES
 (1,1,'2024-01-05','delivered'),
 (2,2,'2023-12-18','delivered'),
 (3,1,'2024-02-20','processing'),
 (4,3,'2024-03-10','delivered'),
 (5,4,'2023-10-02','cancelled'),
 (6,5,'2023-08-15','delivered'),
 (7,6,'2024-01-22','processing'),
 (8,7,'2023-11-07','delivered'),
 (9,8,'2024-04-01','pending'),
 (10,2,'2023-05-19','delivered'),
 (11,3,'2024-05-05','delivered'),
 (12,7,'2024-02-11','delivered');

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
 (1,1,1,199.00),(1,9,2,49.00),
 (2,3,1,499.00),
 (3,2,1,129.00),(3,5,1,79.00),
 (4,6,1,120.00),(4,7,1,249.00),
 (5,4,1,389.00),
 (6,5,2,79.00),(6,9,1,49.00),
 (7,2,1,129.00),
 (8,1,1,199.00),(8,8,1,59.00),
 (9,3,1,499.00),
 (10,6,1,120.00),(10,2,1,129.00),
 (11,7,1,249.00),(11,5,1,79.00),
 (12,4,1,389.00),(12,6,1,120.00);
`,
	movies: `
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS movie_directors;
DROP TABLE IF EXISTS directors;
DROP TABLE IF EXISTS actors;
DROP TABLE IF EXISTS movies;

CREATE TABLE movies(
  id INTEGER PRIMARY KEY,
  title TEXT,
  released_year INTEGER,
  genre TEXT,
  rating NUMERIC(3,1),
  box_office NUMERIC(10,1)
);

CREATE TABLE actors(
  id INTEGER PRIMARY KEY,
  name TEXT,
  country TEXT
);

CREATE TABLE directors(
  id INTEGER PRIMARY KEY,
  name TEXT
);

CREATE TABLE movie_directors(
  movie_id INTEGER REFERENCES movies(id),
  director_id INTEGER REFERENCES directors(id)
);

CREATE TABLE roles(
  movie_id INTEGER REFERENCES movies(id),
  actor_id INTEGER REFERENCES actors(id),
  role TEXT
);

INSERT INTO movies (id, title, released_year, genre, rating, box_office) VALUES
 (1,'Inception',2010,'Sci-Fi',8.8,829.0),
 (2,'The Luminary',2021,'Drama',8.2,145.0),
 (3,'Neon Skies',2019,'Sci-Fi',7.5,210.0),
 (4,'Hidden Figures',2016,'Drama',7.8,236.0),
 (5,'Ocean Whispers',2023,'Adventure',8.4,320.0),
 (6,'Midnight Code',2022,'Thriller',8.1,98.0),
 (7,'Atlas Rising',2018,'Action',7.9,410.0),
 (8,'Parallel Lines',2015,'Mystery',7.3,75.0),
 (9,'Signal Lost',2024,'Sci-Fi',7.7,132.0);

INSERT INTO actors (id, name, country) VALUES
 (1,'Mara Steele','US'),
 (2,'Victor Han','KR'),
 (3,'Lina Moretti','IT'),
 (4,'Daniel Cho','US'),
 (5,'Priya Raman','IN'),
 (6,'Ethan Wilde','US'),
 (7,'Sofia Marques','BR'),
 (8,'Noah Asher','UK'),
 (9,'Carla Diaz','ES'),
 (10,'Felix Stone','CA');

INSERT INTO directors (id, name) VALUES
 (1,'Christopher Nolan'),
 (2,'Aria Bennett'),
 (3,'Kenji Sato'),
 (4,'Lila Gomez'),
 (5,'Omar Nadir'),
 (6,'Casey Wu');

INSERT INTO movie_directors (movie_id, director_id) VALUES
 (1,1),
 (2,2),
 (3,3),
 (4,4),
 (5,2),
 (6,5),
 (7,6),
 (8,6),
 (9,3);

INSERT INTO roles (movie_id, actor_id, role) VALUES
 (1,1,'Architect'),(1,2,'Extractor'),(1,3,'Chemist'),
 (2,4,'Reporter'),(2,5,'Scientist'),(2,1,'Mentor'),
 (3,2,'Pilot'),(3,6,'Navigator'),(3,7,'Mechanic'),
 (4,5,'Analyst'),(4,8,'Director'),
 (5,3,'Explorer'),(5,7,'Diver'),(5,9,'Cartographer'),
 (6,6,'Hacker'),(6,1,'Handler'),(6,10,'Analyst'),
 (7,4,'Commander'),(7,2,'Strategist'),(7,9,'Engineer'),
 (8,5,'Detective'),(8,8,'Professor'),
 (9,6,'Engineer'),(9,3,'Captain'),(9,1,'AI Voice');
`
};

export const schemaCatalog: Record<
	SampleDatabase,
	{ table: string; columns: string[]; description?: string }[]
> = {
	employees: [
		{
			table: 'departments',
			columns: ['id PK', 'name', 'location'],
			description: 'Business groups across hubs'
		},
		{
			table: 'employees',
			columns: [
				'id PK',
				'first_name',
				'last_name',
				'title',
				'department_id FK',
				'hire_date',
				'salary',
				'manager_id FK'
			],
			description: 'Org chart with salaries and managers'
		},
		{
			table: 'salaries',
			columns: ['id PK', 'employee_id FK', 'amount', 'effective_date'],
			description: 'Historical salary changes'
		}
	],
	ecommerce: [
		{
			table: 'customers',
			columns: ['id PK', 'name', 'country', 'signup_date', 'vip'],
			description: 'Shopper profiles and lifecycle'
		},
		{
			table: 'products',
			columns: ['id PK', 'name', 'category', 'price'],
			description: 'Catalog with categories'
		},
		{
			table: 'orders',
			columns: ['id PK', 'customer_id FK', 'order_date', 'status'],
			description: 'Order headers with status'
		},
		{
			table: 'order_items',
			columns: ['id PK', 'order_id FK', 'product_id FK', 'quantity', 'unit_price'],
			description: 'Line items per order'
		}
	],
	movies: [
		{
			table: 'movies',
			columns: ['id PK', 'title', 'released_year', 'genre', 'rating', 'box_office'],
			description: 'Film catalog with ratings and revenue'
		},
		{ table: 'actors', columns: ['id PK', 'name', 'country'], description: 'Cast roster' },
		{ table: 'directors', columns: ['id PK', 'name'], description: 'Directors' },
		{
			table: 'movie_directors',
			columns: ['movie_id FK', 'director_id FK'],
			description: 'Many-to-many between movies and directors'
		},
		{
			table: 'roles',
			columns: ['movie_id FK', 'actor_id FK', 'role'],
			description: 'Character names per actor/movie'
		}
	]
};

export const challenges: Challenge[] = [
	{
		id: 'emp-basic-list',
		title: 'Employee roster',
		prompt: 'List employee full names with their titles, sorted alphabetically by last name.',
		difficulty: 'beginner',
		points: 50,
		database: 'employees',
		starterSQL: 'SELECT first_name, last_name, title FROM employees ORDER BY last_name;',
		solutionSQL:
			"SELECT first_name || ' ' || last_name AS employee, title FROM employees ORDER BY last_name;",
		concepts: ['SELECT', 'ORDER BY']
	},
	{
		id: 'emp-count-dept',
		title: 'Headcount by department',
		prompt: 'Show how many employees sit in each department, highest first.',
		difficulty: 'beginner',
		points: 55,
		database: 'employees',
		starterSQL:
			'SELECT d.name AS department, COUNT(*) AS employee_count FROM departments d JOIN employees e ON e.department_id = d.id GROUP BY d.name;',
		solutionSQL:
			'SELECT d.name AS department, COUNT(*) AS employee_count FROM departments d JOIN employees e ON e.department_id = d.id GROUP BY d.name ORDER BY employee_count DESC;',
		concepts: ['GROUP BY', 'COUNT', 'JOIN']
	},
	{
		id: 'emp-hired-after-2020',
		title: 'Recent hires',
		prompt: 'Return employees hired from 2020 onward with their hire dates, oldest to newest.',
		difficulty: 'beginner',
		points: 55,
		database: 'employees',
		starterSQL:
			"SELECT first_name, last_name, hire_date FROM employees WHERE hire_date >= '2020-01-01';",
		solutionSQL:
			"SELECT first_name, last_name, hire_date FROM employees WHERE hire_date >= '2020-01-01' ORDER BY hire_date;",
		concepts: ['WHERE', 'DATE']
	},
	{
		id: 'emp-salary-threshold',
		title: 'High earners',
		prompt: 'Find employees making $120k or more, ordered by salary descending.',
		difficulty: 'beginner',
		points: 60,
		database: 'employees',
		starterSQL:
			'SELECT first_name, last_name, title, salary FROM employees WHERE salary >= 120000 ORDER BY salary DESC;',
		solutionSQL:
			'SELECT first_name, last_name, title, salary FROM employees WHERE salary >= 120000 ORDER BY salary DESC;',
		concepts: ['WHERE', 'ORDER BY']
	},
	{
		id: 'emp-manager-names',
		title: 'Managers & reports',
		prompt: 'Show each employee with their manager name (or "(exec)" when none).',
		difficulty: 'intermediate',
		points: 70,
		database: 'employees',
		starterSQL:
			"SELECT e.first_name || ' ' || e.last_name AS employee, '(manager)' AS manager FROM employees e;",
		solutionSQL:
			"SELECT e.first_name || ' ' || e.last_name AS employee, COALESCE(m.first_name || ' ' || m.last_name,'(exec)') AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id ORDER BY employee;",
		concepts: ['SELF JOIN', 'COALESCE']
	},
	{
		id: 'emp-avg-salary-dept',
		title: 'Above-average departments',
		prompt: 'Return departments whose average salary is over $100k, sorted by average salary.',
		difficulty: 'intermediate',
		points: 75,
		database: 'employees',
		starterSQL:
			'SELECT d.name AS department, AVG(e.salary) AS avg_salary FROM departments d JOIN employees e ON e.department_id = d.id GROUP BY d.name;',
		solutionSQL:
			'SELECT d.name AS department, ROUND(AVG(e.salary)) AS avg_salary FROM departments d JOIN employees e ON e.department_id = d.id GROUP BY d.name HAVING AVG(e.salary) > 100000 ORDER BY avg_salary DESC;',
		concepts: ['AVG', 'HAVING', 'GROUP BY']
	},
	{
		id: 'emp-salary-growth',
		title: 'Who got the biggest raises',
		prompt:
			'Using salary history, show employees whose latest salary is at least $10k above their first recorded salary.',
		difficulty: 'intermediate',
		points: 80,
		database: 'employees',
		starterSQL:
			'SELECT e.first_name, e.last_name, MAX(s.amount) - MIN(s.amount) AS growth FROM salaries s JOIN employees e ON e.id = s.employee_id GROUP BY e.id, e.first_name, e.last_name;',
		solutionSQL:
			'SELECT e.first_name, e.last_name, MAX(s.amount) - MIN(s.amount) AS growth FROM salaries s JOIN employees e ON e.id = s.employee_id GROUP BY e.id, e.first_name, e.last_name HAVING MAX(s.amount) - MIN(s.amount) >= 10000 ORDER BY growth DESC;',
		concepts: ['HAVING', 'AGGREGATES']
	},
	{
		id: 'emp-window-rank',
		title: 'Top earners per department',
		prompt:
			'Use a window function to rank salaries within each department and keep the top two per department.',
		difficulty: 'advanced',
		points: 90,
		database: 'employees',
		starterSQL:
			'SELECT d.name AS department, e.first_name, e.salary FROM employees e JOIN departments d ON d.id = e.department_id;',
		solutionSQL:
			"SELECT department, employee, salary, salary_rank FROM (SELECT d.name AS department, e.first_name || ' ' || e.last_name AS employee, e.salary, DENSE_RANK() OVER (PARTITION BY d.id ORDER BY e.salary DESC) AS salary_rank FROM employees e JOIN departments d ON d.id = e.department_id WHERE salary IS NOT NULL) ranked WHERE salary_rank <= 2 ORDER BY department, salary_rank;",
		concepts: ['WINDOW', 'DENSE_RANK', 'PARTITION BY']
	},
	{
		id: 'emp-tenure-buckets',
		title: 'Tenure buckets',
		prompt:
			'Compute years at the company (using 2024-12-31 as today) and bucket employees into career stages.',
		difficulty: 'advanced',
		points: 85,
		database: 'employees',
		starterSQL:
			"SELECT first_name, last_name, AGE('2024-12-31', hire_date) AS tenure FROM employees ORDER BY hire_date;",
		solutionSQL:
			"SELECT first_name || ' ' || last_name AS employee, EXTRACT(YEAR FROM AGE('2024-12-31', hire_date)) AS years_at_company, CASE WHEN AGE('2024-12-31', hire_date) >= INTERVAL '8 years' THEN 'veteran' WHEN AGE('2024-12-31', hire_date) >= INTERVAL '4 years' THEN 'established' WHEN AGE('2024-12-31', hire_date) >= INTERVAL '2 years' THEN 'mid-level' ELSE 'new hire' END AS tenure_bucket FROM employees ORDER BY years_at_company DESC;",
		concepts: ['AGE', 'CASE', 'DATE MATH']
	},
	{
		id: 'emp-above-company-avg',
		title: 'Beating the company average',
		prompt: 'Find departments whose average salary is above the overall company average.',
		difficulty: 'advanced',
		points: 85,
		database: 'employees',
		starterSQL:
			'SELECT d.name AS department, AVG(e.salary) AS avg_salary FROM employees e JOIN departments d ON e.department_id = d.id GROUP BY d.name;',
		solutionSQL:
			'WITH company AS (SELECT AVG(salary) AS avg_salary FROM employees) SELECT d.name AS department, ROUND(AVG(e.salary)) AS avg_salary FROM employees e JOIN departments d ON e.department_id = d.id GROUP BY d.name HAVING AVG(e.salary) > (SELECT avg_salary FROM company) ORDER BY avg_salary DESC;',
		concepts: ['CTE', 'AVG', 'HAVING']
	},
	{
		id: 'eco-latest-orders',
		title: 'Latest orders',
		prompt: 'List the five most recent orders with customer names and status.',
		difficulty: 'beginner',
		points: 50,
		database: 'ecommerce',
		starterSQL:
			'SELECT o.id, c.name, o.status, o.order_date FROM orders o JOIN customers c ON c.id = o.customer_id ORDER BY o.order_date DESC LIMIT 5;',
		solutionSQL:
			'SELECT o.id, c.name AS customer, o.status, o.order_date FROM orders o JOIN customers c ON c.id = o.customer_id ORDER BY o.order_date DESC LIMIT 5;',
		concepts: ['JOIN', 'ORDER BY', 'LIMIT']
	},
	{
		id: 'eco-status-count',
		title: 'Orders by status',
		prompt: 'Count how many orders are in each status.',
		difficulty: 'beginner',
		points: 50,
		database: 'ecommerce',
		starterSQL: 'SELECT status, COUNT(*) AS total FROM orders GROUP BY status;',
		solutionSQL:
			'SELECT status, COUNT(*) AS total FROM orders GROUP BY status ORDER BY total DESC;',
		concepts: ['GROUP BY', 'COUNT']
	},
	{
		id: 'eco-expensive-products',
		title: 'Premium products',
		prompt: 'Show products priced above $50, highest price first.',
		difficulty: 'beginner',
		points: 55,
		database: 'ecommerce',
		starterSQL: 'SELECT name, category, price FROM products WHERE price > 50 ORDER BY price DESC;',
		solutionSQL: 'SELECT name, category, price FROM products WHERE price > 50 ORDER BY price DESC;',
		concepts: ['WHERE', 'ORDER BY']
	},
	{
		id: 'eco-new-customers',
		title: 'Recent signups',
		prompt: 'Return customers who joined in 2023 or later with their country.',
		difficulty: 'beginner',
		points: 55,
		database: 'ecommerce',
		starterSQL:
			"SELECT name, country, signup_date FROM customers WHERE signup_date >= '2023-01-01';",
		solutionSQL:
			"SELECT name, country, signup_date FROM customers WHERE signup_date >= '2023-01-01' ORDER BY signup_date;",
		concepts: ['DATE', 'FILTERS']
	},
	{
		id: 'eco-revenue-per-customer',
		title: 'Revenue per customer',
		prompt: 'Calculate total revenue per customer using order items.',
		difficulty: 'intermediate',
		points: 75,
		database: 'ecommerce',
		starterSQL:
			'SELECT c.name, SUM(oi.quantity * oi.unit_price) AS revenue FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items oi ON oi.order_id = o.id GROUP BY c.name;',
		solutionSQL:
			'SELECT c.name AS customer, ROUND(SUM(oi.quantity * oi.unit_price)::numeric,2) AS revenue FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items oi ON oi.order_id = o.id GROUP BY c.name ORDER BY revenue DESC;',
		concepts: ['SUM', 'JOIN', 'GROUP BY']
	},
	{
		id: 'eco-monthly-orders',
		title: 'Monthly order volume',
		prompt: 'Count orders per month (YYYY-MM).',
		difficulty: 'intermediate',
		points: 70,
		database: 'ecommerce',
		starterSQL:
			"SELECT date_trunc('month', order_date) AS month, COUNT(*) FROM orders GROUP BY month;",
		solutionSQL:
			"SELECT TO_CHAR(date_trunc('month', order_date), 'YYYY-MM') AS month, COUNT(*) AS orders FROM orders GROUP BY 1 ORDER BY 1;",
		concepts: ['DATE_TRUNC', 'GROUP BY', 'FORMAT']
	},
	{
		id: 'eco-top-categories',
		title: 'Top categories by items sold',
		prompt: 'Sum quantities sold per product category and order by volume.',
		difficulty: 'intermediate',
		points: 75,
		database: 'ecommerce',
		starterSQL:
			'SELECT p.category, SUM(oi.quantity) AS items_sold FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.category;',
		solutionSQL:
			'SELECT p.category, SUM(oi.quantity) AS items_sold FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.category ORDER BY items_sold DESC;',
		concepts: ['SUM', 'GROUP BY', 'JOIN']
	},
	{
		id: 'eco-repeat-customers',
		title: 'Repeat customers',
		prompt: 'Find customers with at least two distinct orders.',
		difficulty: 'advanced',
		points: 85,
		database: 'ecommerce',
		starterSQL:
			'SELECT c.name, COUNT(DISTINCT o.id) AS orders FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.name;',
		solutionSQL:
			'SELECT c.name, COUNT(DISTINCT o.id) AS orders FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.name HAVING COUNT(DISTINCT o.id) >= 2 ORDER BY orders DESC;',
		concepts: ['HAVING', 'COUNT DISTINCT']
	},
	{
		id: 'eco-high-value-orders',
		title: 'Above-average order totals',
		prompt: 'Compute order totals and return those above the average order total.',
		difficulty: 'advanced',
		points: 90,
		database: 'ecommerce',
		starterSQL:
			'SELECT o.id, SUM(oi.quantity * oi.unit_price) AS total FROM orders o JOIN order_items oi ON oi.order_id = o.id GROUP BY o.id;',
		solutionSQL:
			'WITH totals AS (SELECT o.id, SUM(oi.quantity * oi.unit_price) AS total FROM orders o JOIN order_items oi ON oi.order_id = o.id GROUP BY o.id) SELECT o.id, c.name AS customer, total FROM totals t JOIN orders o ON o.id = t.id JOIN customers c ON c.id = o.customer_id WHERE total > (SELECT AVG(total) FROM totals) ORDER BY total DESC;',
		concepts: ['CTE', 'AVG', 'JOIN']
	},
	{
		id: 'eco-top-products-revenue',
		title: 'Top products by revenue',
		prompt: 'Use a window function to rank products by revenue and keep the top 3.',
		difficulty: 'advanced',
		points: 85,
		database: 'ecommerce',
		starterSQL:
			'SELECT p.name, SUM(oi.quantity * oi.unit_price) AS revenue FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.name;',
		solutionSQL:
			'WITH revenue AS (SELECT p.name, SUM(oi.quantity * oi.unit_price) AS revenue FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.name), ranked AS (SELECT name, revenue, DENSE_RANK() OVER (ORDER BY revenue DESC) AS revenue_rank FROM revenue) SELECT name, revenue, revenue_rank FROM ranked WHERE revenue_rank <= 3 ORDER BY revenue_rank;',
		concepts: ['WINDOW', 'DENSE_RANK', 'SUM']
	},
	{
		id: 'mov-top-rated',
		title: 'Top-rated films',
		prompt: 'List movies rated 8.0 or higher, sorted by rating.',
		difficulty: 'beginner',
		points: 50,
		database: 'movies',
		starterSQL: 'SELECT title, rating FROM movies WHERE rating >= 8 ORDER BY rating DESC;',
		solutionSQL: 'SELECT title, rating FROM movies WHERE rating >= 8 ORDER BY rating DESC;',
		concepts: ['FILTER', 'ORDER BY']
	},
	{
		id: 'mov-genre-count',
		title: 'Films per genre',
		prompt: 'Count how many movies exist for each genre.',
		difficulty: 'beginner',
		points: 50,
		database: 'movies',
		starterSQL: 'SELECT genre, COUNT(*) AS movie_count FROM movies GROUP BY genre;',
		solutionSQL:
			'SELECT genre, COUNT(*) AS movie_count FROM movies GROUP BY genre ORDER BY movie_count DESC;',
		concepts: ['GROUP BY', 'COUNT']
	},
	{
		id: 'mov-inception-cast',
		title: 'Inception cast list',
		prompt: "Show actors and roles for the movie 'Inception' ordered by actor name.",
		difficulty: 'beginner',
		points: 55,
		database: 'movies',
		starterSQL:
			"SELECT a.name, r.role FROM roles r JOIN actors a ON a.id = r.actor_id JOIN movies m ON m.id = r.movie_id WHERE m.title = 'Inception';",
		solutionSQL:
			"SELECT a.name, r.role FROM roles r JOIN actors a ON a.id = r.actor_id JOIN movies m ON m.id = r.movie_id WHERE m.title = 'Inception' ORDER BY a.name;",
		concepts: ['JOIN', 'WHERE']
	},
	{
		id: 'mov-recent-films',
		title: 'Recent releases',
		prompt: 'Return movies released in or after 2018 sorted by year descending.',
		difficulty: 'beginner',
		points: 55,
		database: 'movies',
		starterSQL:
			'SELECT title, released_year FROM movies WHERE released_year >= 2018 ORDER BY released_year DESC;',
		solutionSQL:
			'SELECT title, released_year FROM movies WHERE released_year >= 2018 ORDER BY released_year DESC;',
		concepts: ['FILTER', 'ORDER BY']
	},
	{
		id: 'mov-director-filmography',
		title: 'Directors with multiple films',
		prompt: 'List directors who have at least two films in the catalog.',
		difficulty: 'intermediate',
		points: 70,
		database: 'movies',
		starterSQL:
			'SELECT d.name, COUNT(md.movie_id) AS films FROM directors d JOIN movie_directors md ON md.director_id = d.id GROUP BY d.name;',
		solutionSQL:
			'SELECT d.name, COUNT(md.movie_id) AS films FROM directors d JOIN movie_directors md ON md.director_id = d.id GROUP BY d.name HAVING COUNT(md.movie_id) >= 2 ORDER BY films DESC;',
		concepts: ['HAVING', 'JOIN', 'COUNT']
	},
	{
		id: 'mov-actors-multi',
		title: 'Frequent actors',
		prompt: 'Find actors who appear in more than one movie.',
		difficulty: 'intermediate',
		points: 70,
		database: 'movies',
		starterSQL:
			'SELECT a.name, COUNT(DISTINCT r.movie_id) AS appearances FROM actors a JOIN roles r ON r.actor_id = a.id GROUP BY a.name;',
		solutionSQL:
			'SELECT a.name, COUNT(DISTINCT r.movie_id) AS appearances FROM actors a JOIN roles r ON r.actor_id = a.id GROUP BY a.name HAVING COUNT(DISTINCT r.movie_id) > 1 ORDER BY appearances DESC, a.name;',
		concepts: ['COUNT DISTINCT', 'HAVING']
	},
	{
		id: 'mov-director-top-rated',
		title: 'Top film per director',
		prompt: 'Use a window function to return each director’s highest-rated movie.',
		difficulty: 'intermediate',
		points: 80,
		database: 'movies',
		starterSQL:
			'SELECT d.name, m.title, m.rating FROM directors d JOIN movie_directors md ON md.director_id = d.id JOIN movies m ON m.id = md.movie_id;',
		solutionSQL:
			'WITH ranked AS (SELECT d.name, m.title, m.rating, DENSE_RANK() OVER (PARTITION BY d.id ORDER BY m.rating DESC) AS rnk FROM directors d JOIN movie_directors md ON md.director_id = d.id JOIN movies m ON m.id = md.movie_id) SELECT name, title, rating FROM ranked WHERE rnk = 1 ORDER BY rating DESC;',
		concepts: ['WINDOW', 'DENSE_RANK', 'PARTITION BY']
	},
	{
		id: 'mov-co-actors',
		title: 'Co-actors with Mara Steele',
		prompt: 'List distinct co-actors who have appeared with Mara Steele.',
		difficulty: 'advanced',
		points: 85,
		database: 'movies',
		starterSQL:
			"SELECT DISTINCT a2.name FROM roles r1 JOIN roles r2 ON r1.movie_id = r2.movie_id JOIN actors a1 ON a1.id = r1.actor_id JOIN actors a2 ON a2.id = r2.actor_id WHERE a1.name = 'Mara Steele';",
		solutionSQL:
			"SELECT DISTINCT a2.name AS co_actor FROM roles r1 JOIN roles r2 ON r1.movie_id = r2.movie_id AND r1.actor_id <> r2.actor_id JOIN actors a1 ON a1.id = r1.actor_id JOIN actors a2 ON a2.id = r2.actor_id WHERE a1.name = 'Mara Steele' ORDER BY co_actor;",
		concepts: ['SELF JOIN', 'DISTINCT']
	},
	{
		id: 'mov-genre-delta',
		title: 'Genre rating delta',
		prompt: 'Compare each genre’s average rating to the overall average rating.',
		difficulty: 'advanced',
		points: 90,
		database: 'movies',
		starterSQL: 'SELECT genre, AVG(rating) AS avg_rating FROM movies GROUP BY genre;',
		solutionSQL:
			'WITH genre_avg AS (SELECT genre, AVG(rating) AS avg_rating FROM movies GROUP BY genre), overall AS (SELECT AVG(rating) AS avg_rating FROM movies) SELECT g.genre, ROUND(g.avg_rating,2) AS genre_rating, ROUND(g.avg_rating - o.avg_rating,2) AS delta FROM genre_avg g, overall o ORDER BY delta DESC;',
		concepts: ['CTE', 'AVG', 'CROSS JOIN']
	},
	{
		id: 'mov-boxoffice-rank',
		title: 'Box office ranking',
		prompt: 'Rank movies by box office revenue using a window function.',
		difficulty: 'advanced',
		points: 85,
		database: 'movies',
		starterSQL: 'SELECT title, box_office FROM movies;',
		solutionSQL:
			'SELECT title, box_office, RANK() OVER (ORDER BY box_office DESC) AS revenue_rank FROM movies ORDER BY revenue_rank;',
		concepts: ['RANK', 'WINDOW']
	}
];
