# Fundación Daya Yacucho - Sistema de Gestión

## Descripción
Aplicación web desarrollada con React para la gestión de becarios y seguimiento de actividades en la Fundación Daya Yacucho. La plataforma incluye funcionalidades de autenticación, dashboard administrativo, visualización de datos en mapas, generación de reportes y gestión de usuarios.

## Características Principales
- Autenticación y autorización de usuarios
- Dashboard administrativo con métricas
- Visualización geográfica de datos (nacional e internacional)
- Generación de reportes en PDF y Excel
- Gestión de becarios y sus actividades
- Interfaz responsiva y accesible

## Estructura del Proyecto

```
src/
├── components/       # Componentes reutilizables
│   ├── BecarioDetailsModal.jsx
│   ├── BecarioMarker.jsx
│   └── ...
├── context/         # Contextos de React
│   └── AuthContext.jsx
├── pages/           # Páginas de la aplicación
│   ├── dashboard/   # Vistas del panel de control
│   ├── About.jsx
│   ├── Admin.jsx
│   └── ...
├── services/        # Servicios y APIs
├── styles/          # Estilos globales
└── routes.jsx       # Configuración de rutas
```

## Tecnologías Utilizadas
- **Frontend**: React 19, Vite
- **UI**: Material-UI (MUI), Bootstrap 5
- **Mapas**: Leaflet, React-Leaflet
- **Gráficos**: Chart.js
- **Formularios**: React Hook Form
- **Rutas**: React Router DOM
- **Peticiones HTTP**: Axios
- **Generación de PDFs**: jsPDF, jsPDF-AutoTable
- **Generación de Excel**: xlsx
- **Autenticación**: JWT (JSON Web Tokens)

## Requisitos Previos
- Node.js (versión 16+)
- npm o yarn

## Instalación

1. Clona el repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd fundayacucho
   ```

2. Instala las dependencias:
   ```bash
   npm install
   # o
   yarn install
   ```

3. Configura las variables de entorno:
   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```
   VITE_API_URL=tu_url_de_api
   # Otras variables de entorno necesarias
   ```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la versión de producción
- `npm run lint` - Ejecuta el linter
- `npm run deploy` - Despliega la aplicación (configuración para GitHub Pages)

## Estructura de Rutas

- `/` - Página de bienvenida
- `/home` - Dashboard principal (protegido)
- `/about` - Acerca de la fundación
- `/login` - Inicio de sesión
- `/registro` - Registro de nuevos usuarios
- `/admin` - Panel de administración

## Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'Añade nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia
Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto
Para más información, por favor contacta a [tu información de contacto].