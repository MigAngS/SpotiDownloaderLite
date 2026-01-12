# 🎧 SpotiDownloader

**SpotiDownloader** es una aplicación web moderna que permite convertir listas de reproducción de Spotify en archivos MP3 descargables, utilizando YouTube como fuente de audio. Cuenta con una interfaz intuitiva, seguimiento de progreso en tiempo real y sistemas avanzados para evitar bloqueos de bots.

## ✨ Características Principales

- 🔍 **Extracción de canciones** de playlists de Spotify mediante URL
- 🎵 **Búsqueda inteligente** de versiones optimizadas en YouTube
- ⬇️ **Descarga de audio** en formato MP3 con metadatos completos
- �️ **Sistema Anti-Bot** con 3 niveles de reintento para máxima fiabilidad
- 📊 **Progreso en tiempo real** mediante polling HTTP eficiente
- 🎨 **Interfaz moderna** con diseño responsivo y animaciones suaves
- � **Manejo seguro** de credenciales y variables de entorno
- ⚡ **FFmpeg integrado** - configuración automática sin instalaciones
- 🚀 **Despliegue listo** para Render (backend) y Netlify (frontend)

## 🛠️ Tecnologías Utilizadas

### Backend
- **Python 3.11+** - Lenguaje de programación principal
- **FastAPI** - Framework web moderno y rápido para construir APIs
- **HTTP Polling** - Comunicación en tiempo real para progreso de descargas
- **yt-dlp (v2025.12.8+)** - Herramienta avanzada para descargar audio de YouTube
- **Sistema de Reintentos** - Manejador inteligente con 3 estrategias anti-bot
- **Spotipy** - Cliente para la API de Spotify
- **FFmpeg** - Para la conversión de formatos de audio (incluido automáticamente)
- **Python-dotenv** - Manejo de variables de entorno
- **Uvicorn** - Servidor ASGI para ejecutar la aplicación

### Frontend
- **React** - Biblioteca de JavaScript para interfaces de usuario
- **Vite** - Herramienta de construcción y desarrollo
- **CSS Moderno** - Diseño personalizado con glassmorphism y animaciones
- **HTTP Polling** - Para recibir actualizaciones en tiempo real del servidor

## 🚀 Instalación Rápida

### Requisitos Previos

- Python 3.11 o superior
- Node.js 16+ y npm
- Cuenta de desarrollador de Spotify

### Configuración en 3 Pasos

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/tuusuario/SpotiDownloader.git
   cd SpotiDownloader
   ```

2. **Configura las credenciales de Spotify:**
   - Obtén tus credenciales desde el [Dashboard de Desarrolladores de Spotify](https://developer.spotify.com/dashboard/)
   - Crea un archivo `.env` en la raíz del proyecto:
     ```
     SPOTIFY_CLIENT_ID=tu_client_id
     SPOTIFY_CLIENT_SECRET=tu_client_secret
     ```

3. **Inicia la aplicación:**
   ```bash
   python start.py
   ```

   El script automáticamente:
   - ✅ Crea el entorno virtual de Python
   - ✅ Instala todas las dependencias
   - ✅ Descarga y configura FFmpeg
   - ✅ Construye el frontend
   - ✅ Inicia el servidor
   - ✅ Abre tu navegador en http://localhost:8000

## 📖 Uso

1. **Ingresa la URL** de una playlist de Spotify
2. **Espera** a que se cargue la lista de canciones
3. **Selecciona** las canciones que deseas descargar (todas por defecto)
4. **Haz clic** en "Descargar"
5. **Observa el progreso** en tiempo real de cada canción
6. **Descarga** el archivo ZIP cuando esté listo

## 🎨 Características de la Interfaz

- **Diseño Moderno**: Glassmorphism, gradientes vibrantes y animaciones suaves
- **Progreso en Tiempo Real**: Visualiza el estado de cada descarga
- **Notificaciones Toast**: Feedback instantáneo para todas las acciones
- **Diseño Responsivo**: Funciona perfectamente en desktop, tablet y móvil
- **Validación de URL**: Verifica automáticamente URLs de Spotify
- **Selección Múltiple**: Selecciona/deselecciona todas las canciones fácilmente

## 🏗️ Estructura del Proyecto

```
SpotiDownloader/
├── backend/                      # Código del servidor
│   ├── main.py                  # Punto de entrada de la aplicación
│   ├── config.py                # Configuración anti-bot y estrategias
│   ├── api/
│   │   └── routes.py           # Rutas de la API con progreso async
│   ├── services/
│   │   ├── spotify_client.py   # Cliente para la API de Spotify
│   │   ├── youtube_client.py   # Búsqueda en YouTube con anti-bot
│   │   └── downloader.py       # Lógica con sistema de reintentos
│   ├── utils/
│   │   ├── zipper.py           # Utilidad para crear archivos ZIP
│   │   ├── ffmpeg_setup.py     # Setup automático de FFmpeg
│   │   ├── progress_manager.py # Gestor de progreso en memoria
│   │   └── retry_handler.py    # Manejador de reintentos inteligente
│   ├── models/
│   │   └── song.py             # Modelos de datos
│   └── requirements.txt         # Dependencias de Python
│
├── frontend/                    # Aplicación React (Vite)
│   ├── src/
│   │   ├── components/          # Componentes modulares
│   │   │   ├── SongList.jsx     # Lista de canciones con selección
│   │   │   ├── SongItem.jsx     # Card de canción con progreso individual
│   │   │   ├── ProgressTracker.jsx # Resumen de progreso de la sesión
│   │   │   ├── ThemeSwitcher.jsx # Selector de temas (Claro/Oscuro)
│   │   │   ├── Toast.jsx        # Notificaciones flotantes
│   │   │   └── Loader.jsx       # Animación de carga
│   │   ├── pages/
│   │   │   └── Home.jsx         # Página principal y lógica de polling
│   │   ├── api/
│   │   │   └── api.js           # Servicios de comunicación con el backend
│   │   ├── themes.js            # Definición de paletas de colores
│   │   ├── index.css            # Estilos globales y diseño base
│   │   ├── App.jsx              # Enrutador y estructura base
│   │   └── main.jsx             # Punto de entrada de React
│   └── package.json
│
├── downloads/                   # Directorio para archivos descargados
├── render.yaml                 # Configuración para despliegue en Render
├── netlify.toml                # Configuración para despliegue en Netlify
├── .env                        # Variables de entorno
├── start.py                    # Script de inicio automático
└── README.md                   # Este archivo
```

## 🔧 Desarrollo Manual

Si prefieres configurar manualmente:

### Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python utils/ffmpeg_setup.py
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Desarrollo
npm run build  # Producción
```

## 🔍 Cómo Funciona

1. **Extracción**: La aplicación utiliza la API de Spotify para obtener la lista de canciones
2. **Búsqueda**: Para cada canción, busca en YouTube usando un algoritmo de puntuación que considera metadatos de artista y título.
3. **Descarga**: Descarga el audio de YouTube y lo convierte a MP3 usando FFmpeg
4. **Resiliencia**: Si ocurre un error de bloqueo (HTTP 403), el sistema intenta automáticamente con estrategias alternativas (Android, iOS, Web).
5. **Progreso**: Almacena el progreso en memoria y lo expone mediante endpoints HTTP que el frontend consulta periódicamente.

## 🌐 Despliegue en Producción

El proyecto está configurado para un despliegue sencillo y escalable:

### 🔙 Backend (Render)
1. Conecta tu repositorio a [Render](https://render.com/).
2. Render detectará automáticamente el archivo `render.yaml`.
3. Configura las variables de entorno `SPOTIFY_CLIENT_ID` y `SPOTIFY_CLIENT_SECRET`.
4. El backend se desplegará automáticamente.

### 🔝 Frontend (Netlify)
1. Conecta tu repositorio a [Netlify](https://www.netlify.com/).
2. Netlify usará el archivo `netlify.toml` para configurar el build.
3. Asegúrate de que las peticiones API apunten a tu URL de Render.

## 🔍 Cómo Funciona el Sistema Anti-Bot

Debido a las restricciones recientes de YouTube, hemos implementado un sistema de **resiliencia en 3 niveles**:

1. **Estrategia Android**: Simula un dispositivo Android para evitar detecciones básicas.
2. **Estrategia iOS**: Si la anterior falla, simula un cliente iOS.
3. **Estrategia Web Moderno**: Como último recurso, utiliza un User-Agent de navegador actualizado.

Si todas las estrategias son bloqueadas por YouTube, la aplicación marcará la canción específica con un error pero **continuará con el resto de la lista**, asegurando que el proceso no se detenga.

## 📊 Seguimiento del Progreso

La aplicación utiliza polling HTTP (cada 500ms) para proporcionar:
- ✅ Estado de cada canción (iniciando, descargando, convirtiendo, completado, error)
- ✅ Porcentaje de progreso individual y global
- ✅ Intentos de reintento automáticos visibles en los logs del servidor
- ✅ Manejo de errores específicos para bloqueos de YouTube

## ⚠️ Notas Importantes

- Este proyecto es solo para fines educativos
- Asegúrate de tener los derechos necesarios para descargar el contenido
- El uso de este software es bajo tu propia responsabilidad

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más información.

## 🙌 Créditos

Proyecto creado por **Miguel Angel Sairitupa Paucar** como parte de su desarrollo personal.

## 🆕 Novedades v2.1

- 🛡️ **Sistema Anti-Bot**: Implementación de `RetryHandler` con 3 niveles de evasión.
- 🚀 **Deploy Ready**: Archivos de configuración para Render y Netlify incluidos.
- 🔄 **HTTP Polling**: Reemplazo completo de WebSockets para mayor estabilidad en la nube.
- ⚡ **yt-dlp v2025**: Actualización a la última versión para combatir el error 403.
- 🎨 **UI Refined**: Mejoras en los componentes de progreso y notificaciones.
- 🎯 **Resiliencia**: Manejo de errores que permite continuar descargas parciales.