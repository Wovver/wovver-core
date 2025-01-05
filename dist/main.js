"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/main.ts
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("./config/database"));
const auth_1 = __importDefault(require("./routes/auth"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Use authentication routes
app.use('/auth', auth_1.default);
// Sync the database and start the server
database_1.default.sync()
    .then(() => {
    console.log('Database synced');
    app.listen(8080, () => {
        console.log('Server running on http://localhost:3000');
    });
})
    .catch((err) => {
    console.error('Error syncing database:', err);
});
