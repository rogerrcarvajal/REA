# CEIA / SWGA Tech Stack & Architectural Guidelines

## 1. Core Technical Stack

| Layer | Technology | Guidelines |
|---|---|---|
| **Backend** | PHP 8.1+ | Object-Oriented Programming (POO), strict type hints, MVC pattern |
| **Web Server** | Apache (XAMPP local) | Mod_rewrite enabled, configured DocumentRoot in `httpd.conf` |
| **Database** | PostgreSQL 14+ | Relational schema, PDO connection, foreign key constraints, column indexing |
| **Frontend** | Pure HTML5 & CSS3 | Vanilla JavaScript, zero heavy framework dependencies unless requested |
| **Tooling** | VS Code / Antigravity | PHP Intelephense, Prettier, GitLens, Live Server |

---

## 2. Backend Standard (PHP 8+ POO & MVC)

### Controller Standard

```php
<?php

namespace App\Controllers;

use App\Models\EstudianteModel;
use App\Services\ResponseService;

class EstudianteController
{
    private EstudianteModel $estudianteModel;

    public function __construct(EstudianteModel $estudianteModel)
    {
        $this->estudianteModel = $estudianteModel;
    }

    public function index(): void
    {
        $estudiantes = $this->estudianteModel->getAllActive();
        ResponseService::json(['status' => 'success', 'data' => $estudiantes]);
    }
}
```

---

## 3. Database Layer (PostgreSQL 14+ & PDO)

### Security & Prepared Statements

```php
<?php

namespace App\Models;

use PDO;

class EstudianteModel
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("
            SELECT id, cedula, nombres, apellidos, email, fecha_registro
            FROM estudiantes
            WHERE id = :id AND activo = true
            LIMIT 1
        ");
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result ?: null;
    }
}
```

### Performance & Indexing Standard

- Always create explicit indexes on foreign key columns and columns frequently used in `WHERE`, `JOIN`, or `ORDER BY` clauses:
```sql
CREATE INDEX idx_estudiantes_cedula ON estudiantes(cedula);
CREATE INDEX idx_estudiantes_activo ON estudiantes(activo);
```

---

## 4. Environment Variables & Environment Configuration

- Never hardcode credentials, passwords, or API keys in PHP files.
- Store connection configurations in `.env`:
```env
DB_DRIVER=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=ceia_swga_db
DB_USER=postgres
DB_PASSWORD=secret
```

---

## 5. Security & Input Sanitization Checklist

1. **SQL Injection**: Strictly prohibit direct string interpolation in SQL queries. Always use PDO prepared statements with bound parameters.
2. **XSS Protection**: Sanitize and escape all output rendered in HTML using `htmlspecialchars($data, ENT_QUOTES, 'UTF-8')`.
3. **Validation**: Validate input types and format on backend before processing business logic.
