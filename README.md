# 🚍 R-UAM - Backend

Este es el backend del proyecto **R-UAM**, una plataforma para gestionar en tiempo real la llegada del transporte universitario a la Universidad Autónoma Metropolitana. Aquí se integran servicios de Firebase, envío de notificaciones, gestión de usuarios y control de flujos de transporte.

---

## 📦 Tecnologías utilizadas

- **Node.js + Express**
- **Firebase Admin SDK (Auth, Firestore, Messaging)**
- **Render (para despliegue en producción)**
- **dotenv (manejo de variables de entorno)**
- **Handlebars (para vistas HTML simples)**

---

## 🚀 Endpoints disponibles

| Método | Ruta                         | Descripción                              |
|--------|------------------------------|------------------------------------------|
| GET    | `/`                          | Vista principal del backend              |
| GET    | `/ping`                      | Endpoint de prueba (responde "pong")     |
| POST   | `/api/auth/register`         | Registro de nuevo usuario                |
| POST   | `/api/auth/login`            | Login de usuario                         |
| GET    | `/usuarios` (ejemplo)        | Obtener usuarios (si está implementado)  |

> ⚠️ Revisa `routes/` para ver todos los endpoints disponibles y su lógica.

---

## 🛠️ Cómo correr en local

### 1. Clonar el repositorio
```bash
git clone https://github.com/MaxTheHuman21/Backend-Firebase.git
cd Backend-Firebase
