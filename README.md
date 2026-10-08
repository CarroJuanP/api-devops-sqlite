# API REST DevOps - Node.js + SQLite

[![CI/CD Pipeline](https://github.com/CarroJuanP/API-DevOps-SQLite/actions/workflows/deploy.yml/badge.svg)](https://github.com/CarroJuanP/API-DevOps-SQLite/actions)

## 📌 Descripción del Proyecto

Este proyecto consiste en una **API RESTful profesional** desarrollada en Node.js y Express con persistencia en SQLite, diseñada bajo principios **DevOps** e Integración/Despliegue Continuo (CI/CD). 

El sistema expone 60 endpoints dinámicos (operaciones CRUD completas sobre 12 entidades del dominio) y cuenta con una arquitectura automatizada que ejecuta pruebas unitarias, empaqueta la aplicación en contenedores Docker y la despliega en tiempo real sobre una instancia de **AWS EC2**.

---

## 🛠️ Arquitectura y Tecnologías

* **Backend:** Node.js, Express.js
* **Base de Datos:** SQLite (persistente en contenedor)
* **Pruebas y Cobertura:** Jest, Supertest ($\ge$ 70% Code Coverage)
* **Contenedorización:** Docker, Docker Hub
* **CI/CD Orchestration:** GitHub Actions
* **Infraestructura Cloud:** AWS EC2 (Ubuntu Server)

---

## 🚀 Pipeline Integrado de CI/CD

El flujo de trabajo automatizado (`.github/workflows/deploy.yml`) consta de tres trabajos principales conectados en serie:

1. **`test`**: Ejecuta las 60 pruebas unitarias en un entorno aislado de Node.js y verifica los umbrales de cobertura.
2. **`build-and-push`**: Compila la imagen de Docker y la publica en Docker Hub utilizando los secretos del repositorio.
3. **`deploy-ec2`**: Se conecta vía SSH a la instancia EC2 de AWS, descarga la imagen `:latest` de Docker Hub, detiene el contenedor anterior y despliega la nueva versión en el puerto 80.

---

## 📊 Cobertura de Endpoints (60 Endpoints)

La API cubre 12 entidades clave (`productos`, `categorias`, `usuarios`, `clientes`, `proveedores`, `pedidos`, `ventas`, `inventario`, `marcas`, `ofertas`, `sucursales`, `empleados`), exponiendo para cada una los 5 métodos estándar:

| Método HTTP | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/<entidad>` | Obtener todos los registros |
| `GET` | `/api/<entidad>/:id` | Obtener registro específico por ID |
| `POST` | `/api/<entidad>` | Crear un nuevo registro |
| `PUT` | `/api/<entidad>/:id` | Actualizar registro completo |
| `DELETE` | `/api/<entidad>/:id` | Eliminar registro por ID |

*Rutas auxiliares:* `GET /api/status`, `GET /api/db/backup`.

---

## 💻 Ejecución Local

### Prerrequisitos
* Node.js v18+
* Docker Desktop

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone [https://github.com/CarroJuanP/API-DevOps-SQLite.git](https://github.com/CarroJuanP/API-DevOps-SQLite.git)
cd API-DevOps-SQLite
npm install