const itemsRouter = require('./routes/items');
const transactionsRouter = require('./routes/transactions');
const usersRouter = require('./routes/users');

app.use('/api/items', itemsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/users', usersRouter); 