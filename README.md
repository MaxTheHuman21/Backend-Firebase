# 🚌 R-UAM - Backend API

Este es el backend para el proyecto **R-UAM**, una plataforma para gestionar el acceso de transportes (camiones, combis, RTP) a la Universidad Autónoma Metropolitana.

Desarrollado con:
- Node.js + Express
- Firebase (Auth, Firestore, Messaging)
- Desplegado en Render

---

## 🌐 URL de producción

> https://ruam-backend.onrender.com

---

## 🛠 Tecnologías utilizadas

- `Node.js` con `Express`
- `Firebase Admin SDK`
- `Axios` (para login y recuperación de contraseña con la REST API)
- `Firestore` como base de datos
- `Firebase Authentication`
- `Firebase Messaging (FCM)` para notificaciones push
- Despliegue en `Render`

---

## 📦 Servicios disponibles

### 🔐 Autenticación

#### ✅ Registro de usuario
`POST /api/auth/register`

```json
{
  "email": "usuario@uam.mx",
  "password": "clave123",
  "name": "Nombre Apellido",
  "role": "estudiante"
}
```

#### ✅ Login
`POST /api/auth/login`

```json
{
  "email": "usuario@uam.mx",
  "password": "clave123"
}
```

#### 🔁 Restablecer contraseña
`POST /api/auth/reset-password`

```json
{
  "email": "usuario@uam.mx"
}
```

#### 👤 Obtener perfil (requiere token)
`GET /api/auth/profile`

Headers:
```
Authorization: Bearer <ID_TOKEN>
```

---

### 🔔 Notificaciones

#### ✅ Guardar token de notificación FCM
`POST /api/notifications/token`

```json
{
  "uid": "usuarioUID",
  "fcmToken": "token-generado-por-Firebase"
}
```

---

### 🚍 Estado de los transportes

#### 🔎 Obtener todos los transportes
`GET /api/transportes/status`

Respuesta:
```json
[
  {
    "tipo": "combi",
    "placa": "UAM-1234",
    "estatus": "en espera",
    "horaLlegada": "...",
    "tiempoEnEscuela": "10 min"
  }
]
```

#### 🔄 Actualizar estatus de transporte
`POST /api/transportes/update-status`

```json
{
  "id": "idDelTransporte",
  "nuevoEstatus": "salió"
}
```

---

## 💻 Uso desde React (app web)

```js
axios.post('https://ruam-backend.onrender.com/api/auth/register', {
  email: "usuario@uam.mx",
  password: "clave123",
  name: "Max Dev",
  role: "admin"
})
.then(res => console.log(res.data))
.catch(err => console.error(err));
```

> ⚠️ Asegúrate de agregar `Authorization: Bearer <token>` para rutas protegidas

---

## 📱 Uso desde Android (Kotlin + Retrofit)

```kotlin
data class RegisterRequest(
    val email: String,
    val password: String,
    val name: String,
    val role: String
)

interface ApiService {
    @POST("api/auth/register")
    fun register(@Body req: RegisterRequest): Call<ResponseBody>
}
```

Base URL para Retrofit:
```kotlin
https://ruam-backend.onrender.com/
```

---

## 📌 Variables de entorno (.env)

Asegúrate de definir:

```env
PORT=10000
FIREBASE_API_KEY=TU_API_KEY_DE_FIREBASE
```

---

## 🚀 Despliegue

Este proyecto se despliega automáticamente en [Render](https://render.com) cada vez que se hace un push a `main`.

---

## 🧠 Próximas tareas

- ✅ Middleware de protección con `idToken`
- ✅ CRUD completo para transportes
- ✅ Envío de notificaciones push
- 🔄 Panel admin (web)
- 🔄 Escaneo de QR / acceso seguro

---

## ✨ Desarrollado por

**MaxTheHuman21** y equipo R-UAM
🔗 GitHub: [github.com/MaxTheHuman21](https://github.com/MaxTheHuman21)
