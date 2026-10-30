# SteamLite

SteamLite es una plataforma web inspirada en Steam, donde los usuarios pueden explorar diferentes videojuegos, consultar sus detalles, agregarlos al carrito, simular una compra y acceder a su biblioteca personal para disfrutar de mini-juegos desarrollados en JavaScript.

## Tecnologías utilizadas

- Vite y React
- React Router DOM
- Formik y Yup
- JavaScript y Canvas
- localStorage

## Cómo ejecutar el proyecto

Primero, instala las dependencias:

```bash
npm install
```

Luego, inicia el proyecto:

```bash
npm run dev
```

Abre en el navegador la dirección que aparece en la terminal, normalmente `http://localhost:5173`.

La aplicación funciona localmente, sin necesidad de un servidor externo ni de APIs externas.

## Funcionalidades principales

- **Tienda:** permite explorar el catálogo de videojuegos mediante un carrusel de destacados, una barra de búsqueda y filtros por género.
- **Detalle del videojuego:** muestra información, capturas de pantalla y reseñas organizadas en pestañas.
- **Carrito de compras:** permite agregar o quitar videojuegos y calcular automáticamente el subtotal y el total.
- **Formulario de pago:** permite completar una compra simulada mediante un formulario validado con Formik y Yup.
- **Biblioteca:** reúne los videojuegos comprados y conserva la información utilizando localStorage.
- **Pantalla de juego:** permite acceder y jugar los videojuegos disponibles en la biblioteca.
- **Estados de compra:** los botones cambian según la situación del videojuego: Comprar, En tu biblioteca o Jugar.

## Mini-juegos desarrollados

| Videojuego | Controles |
|---|---|
| Neon Snake | Flechas o WASD |
| Pong Rivals | Flechas, W/S o mouse y dedo |
| Brick Breaker | Flechas, A/D o mouse y dedo |
| Memory Match | Clic o toque |
| Tres en Raya | Clic o toque |
| Sky Flap | Espacio, flecha arriba o toque |

Cada mini-juego guarda el récord del jugador en localStorage. En los juegos de acción, la tecla Espacio permite pausar.

## Cómo probar la compra

1. Ingresa a la tienda y selecciona los videojuegos que deseas comprar.
2. Agrégalos al carrito y continúa al formulario de pago.
3. Completa los datos con una tarjeta de prueba: `4111 1111 1111 1111`, una fecha de vencimiento futura y cualquier CVV.
4. Finaliza la compra y comprueba que los videojuegos aparezcan en tu biblioteca.
5. Selecciona un videojuego y presiona Jugar para acceder al mini-juego.

Para reiniciar los datos guardados, abre las herramientas del navegador con F12, ingresa a Application → Local Storage y elimina las claves que comiencen con `steamlite_`.

## Estructura del proyecto

```text
src/
  components/   Componentes de la interfaz
  pages/        Páginas de la aplicación
  context/      Gestión global del carrito y biblioteca
  hooks/        Carga de información del catálogo
  games/        Mini-juegos desarrollados en JavaScript

public/
  data/         Catálogo de videojuegos (games.json)
  images/       Imágenes y portadas de los videojuegos
```

## Organización del trabajo con Git y GitHub

Se utilizó Git y GitHub para organizar el desarrollo del proyecto. Se trabajó con ramas `feature/*` para implementar las funcionalidades y posteriormente integrarlas en `main` mediante Pull Requests.

Además, se organizaron las tareas en GitHub Projects, utilizando las columnas To Do, In Progress, In Review y Done para llevar un seguimiento del avance.
