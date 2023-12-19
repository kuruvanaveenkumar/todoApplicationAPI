const express = require("express");
const app = express();
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());

let dataBase = null;
const initializeDbAndServer = async () => {
  try {
    dataBase = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const statusScenario1 = (status) => status !== undefined;
const priorityScenario2 = (priority) => priority !== undefined;
const priorityAndStatusScenario3 = (priority, status) =>
  priority !== undefined && status !== undefined;
const search_qScenario4 = (search_q) => search_q !== undefined;
const categoryAndStatusScenario5 = (category, status) =>
  category !== undefined && status !== undefined;
const categoryScenario6 = (category) => category !== undefined;
const categoryAndPriorityScenario7 = (category, priority) =>
  category !== undefined && priority !== undefined;

const convertObject = (each) => {
  return {
    id: each.id,
    todo: each.todo,
    priority: each.priority,
    status: each.status,
    category: each.category,
    dueDate: each.due_date,
  };
};

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q, category } = request.query;
  let data;
  let statusCode;
  let text;
  switch (true) {
    case statusScenario1(status):
      const statusQuery = `SELECT * FROM todo WHERE status LIKE '${status}';`;
      const getStatus = await dataBase.all(statusQuery);
      if (getStatus.length !== 0) {
        data = getStatus.map((each) => convertObject(each));
      } else {
        statusCode = 400;
        text = "Invalid Todo Status";
      }
      break;

    case priorityScenario2(priority):
      const priorityQuery = `SELECT * FROM todo WHERE priority LIKE '${priority}';`;
      const getPriority = await dataBase.all(priorityQuery);
      if (getPriority.length !== 0) {
        data = getPriority.map((each) => convertObject(each));
      } else {
        statusCode = 400;
        text = "Invalid Todo Priority";
      }
      break;

    case priorityAndStatusScenario3(priority, status):
      const priAndStaQuery = `SELECT * FROM todo WHERE priority LIKE '${priority}' AND status LIKE '${status}';`;
      const getPriAndSta = await dataBase.all(priAndStaQuery);
      data = getPriAndSta;
      break;

    case search_qScenario4(search_q):
      const search_qQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
      data = await dataBase.all(search_qQuery);
      data = data.map((each) => convertObject(each));
      break;

    case categoryAndStatusScenario5(category, status):
      const categoryAndStatus = `SELECT * FROM todo WHERE category LIKE '${category}' AND '${status}';`;
      data = await dataBase.all(categoryAndStatus);
      data = data.map((each) => convertObject(each));
      break;

    case categoryScenario6(category):
      const categoryQuery = `SELECT * FROM todo WHERE category LIKE '${category}';`;
      const getCat = await dataBase.all(categoryQuery);
      if (getCat.length !== 0) {
        data = getCat.map((each) => convertObject(each));
      } else {
        statusCode = 400;
        text = "Invalid Todo Category";
      }
      break;

    case categoryAndPriorityScenario7(category, priority):
      const catAndPriQuery = `SELECT * FROM todo WHERE category LIKE '${category}' AND priority LIKE '${priority}';`;
      data = await dataBase.all(catAndPriQuery);
      data = data.map((each) => convertObject(each));
      break;
  }

  if (data !== undefined) {
    response.send(data);
  } else {
    response.status(statusCode);
    response.send(text);
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `SELECT * FROM todo WHERE id = '${todoId}';`;
  const getData = await dataBase.get(getQuery);
  response.send(convertObject(getData));
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const getQuery = `SELECT * FROM todo WHERE due_date LIKE '${date}';`;
  const getData = await dataBase.all(getQuery);
  response.send(getData);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const addQuery = `INSERT INTO todo (id, todo, priority, status, category, due_date)
                        VALUES('${id}', '${todo}', '${priority}', '${status}', '${category}', '${dueDate}');`;
  await dataBase.run(addQuery);
  response.send("Todo Successfully Added");
});

const status1 = (status) => status !== undefined;
const priority2 = (pri) => pri !== undefined;
const todo3 = (todo) => todo !== undefined;
const category4 = (cat) => cat !== undefined;
const dueDate5 = (date) => date !== undefined;

app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo, category, dueDate } = request.body;

  let res;
  switch (true) {
    case status1(status):
      const updateStatus = `UPDATE todo SET status = '${status}' WHERE id = '${todoId}';`;
      await dataBase.run(updateStatus);
      res = "Status Updated";
      break;
    case priority2(priority):
      const updatePriority = `UPDATE todo SET priority = '${priority}' WHERE id = '${todoId}';`;
      await dataBase.run(updatePriority);
      res = "Priority Updated";
      break;
    case todo3(todo):
      const updateTodo = `UPDATE todo SET todo = '${todo}' WHERE id = '${todoId}';`;
      dataBase.run(updateTodo);
      res = "Todo Updated";
      break;
    case category4(category):
      const updateCategory = `UPDATE todo SET category = '${category}' WHERE id = '${todoId}';`;
      await dataBase.run(updateCategory);
      res = "Category Updated";
      break;
    case dueDate5(dueDate):
      const updateDueDate = `UPDATE todo SET  due_date = '${dueDate}' WHERE id = '${todoId}';`;
      await dataBase.run(updateDueDate);
      res = "Due Date Updated";
      break;
  }

  response.send(res);
});

app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo WHERE id = '${todoId}';`;
  await dataBase.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
