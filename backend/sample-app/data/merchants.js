// In-memory demo merchants and mapping to shops
// Passwords stored as bcrypt hashes below (for demo only)

export const merchants = [
  {
    id: "m1",
    email: "admin@hemmerle.example",
    // password: "password123" (bcrypt hash)
    passwordHash:
      "$2b$10$r.0EjxnFZQkA6wQxh6VFqu4NRMK1IwlxByCCZC7GtZVxb6cDjcsSa",
    name: "Stadtbäckerei Hemmerle (Admin)",
    shops: ["hemmerle"] // shop ids
  }
];
