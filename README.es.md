[English](README.md) | [Русский](README.ru.md) | **Español** | [Português](README.pt.md)

<div align="center">

<img src="assets/logo.png" width="120" alt="Logo de GitHub Wrapped 2026">

# GitHub Wrapped 2026

**Tu año en codigo como una historia bonita para compartir. Sin registro: solo tu usuario.**

[![Probar](https://img.shields.io/badge/Probar-hilsetapp.github.io%2FWrapped--2026-22d3ee?style=for-the-badge)](https://hilsetapp.github.io/Wrapped-2026/)
[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-e879f9?style=for-the-badge)](LICENSE)

![Banner de GitHub Wrapped 2026](assets/og-banner.png)

</div>

---

## ✨ Que es esto?

El Spotify Wrapped de GitHub. Escribes cualquier usuario y obtienes una **historia animada**
(slides que se pasan con un toque, como en Instagram) sobre su 2026:

- 📊 **las cifras grandes**: contribuciones, pull requests, repos nuevos, estrellas ganadas
- 🎨 **tus lenguajes principales** con barras animadas
- 🟩 **tu cuadricula de contribuciones**, pintada: racha mas larga, dia mas intenso
- 🦉 **tu ritmo de codigo**: nocturno o de dia? guerrero de fin de semana?
- 🃏 **tu arquetipo**: *Nocturno, AI Native, Guerrero de Fin de Semana, Polyglot…*
- 📦 **los repos que marcaron tu año** y tu huella en la era de la IA
- 🌍 **interfaz en ingles, ruso, español y portugues**: cambio en un toque, funciona incluso a mitad de la historia

Y al final, un **poster PNG 1080×1350 para compartir** (el año, tu cuadricula, lenguajes,
ritmo, arquetipo y un QR que lleva de vuelta al sitio) que puedes descargar y publicar donde quieras.

## 🚀 Probar en 10 segundos

> **https://hilsetapp.github.io/Wrapped-2026/**

1. Abre el enlace.
2. Escribe cualquier usuario de GitHub: el tuyo, el de un amigo, `torvalds`…
3. Pasa las slides, descarga el poster, comparte.

Sin cuenta, sin OAuth, sin "Iniciar sesion con GitHub". Nada que instalar: no hay ni servidor.

## 🔒 La privacidad es la funcion principal

Todo corre **100% en tu navegador**. La pagina hace unas pocas llamadas `fetch`
desde tu dispositivo a APIs publicas y gratuitas, y ya esta:

- **no hay backend**, ni base de datos, ni analitica, ni cookies;
- tu resultado se guarda en **tu propio** `localStorage` durante 15 minutos;
- el poster lo dibuja el `<canvas>` de tu navegador y no se sube a ningun sitio.

Puedes comprobarlo: abre DevTools -> Network y solo veras llamadas a
`api.github.com` y a la API de contribuciones, todas hechas por *tu* navegador.

## 🛠 Como funciona

Los datos vienen de endpoints publicos abiertos y sin autenticacion (60 peticiones
por hora por IP en la API de GitHub; la app maneja el limite con elegancia):

| Que | De donde |
|---|---|
| Perfil y avatar | `api.github.com/users/{u}` |
| Repos, lenguajes, estrellas, huella de IA | `api.github.com/users/{u}/repos` |
| Grafico de contribuciones del año y rachas | `github-contributions-api.jogruber.de` |
| PRs / issues de 2026 | `api.github.com/search/issues` |
| Ritmo (porcentaje nocturno) | `api.github.com/users/{u}/events/public` |

Si una fuente no responde, se salta esa slide, no todo el resultado.

### Stack (a proposito, aburrido)

**HTML + CSS + JavaScript puros. Cero dependencias. Sin compilacion.**
Puedes clonar el repo y abrir `index.html` con doble clic: funciona.

```
Wrapped-2026/
├── index.html          # landing y visor de la historia
├── styles.css          # tema "zine" brutalista: papel, tinta, sombras duras
├── js/
│   ├── i18n.js         # textos de la interfaz
│   ├── github.js       # capa de datos (fetch + cache en localStorage)
│   ├── stats.js        # convierte los datos en rachas, lenguajes, arquetipos
│   ├── poster.js       # dibuja el PNG 1080×1350 en canvas
│   ├── vendor/         # qrcode-generator (MIT) para el QR del poster
│   └── app.js          # motor de la historia: slides, autoplay, zonas tactiles
└── assets/             # logo y banner
```

### Ejecutar en local

```bash
git clone https://github.com/hilsetapp/Wrapped-2026.git
cd Wrapped-2026
# opcion 1: abre index.html en el navegador
# opcion 2: sirve la carpeta (mejor para probar en el movil):
python3 -m http.server 8000
```

## 🎁 Por que compartir el poster?

La marca de agua de cada poster es el bucle viral: tus amigos ven tu resultado,
escriben su usuario y publican su propio poster. Esa es toda la magia de Wrapped,
ahora para desarrolladores.

## 🤝 Contribuir

Ideas para nuevos arquetipos, diseños de slides o traducciones son bienvenidas:
mira [CONTRIBUTING.md](CONTRIBUTING.md). Los errores y las ideas van a
[Issues](https://github.com/hilsetapp/Wrapped-2026/issues).

## ⭐ Dale una estrella

Si la historia te hizo sonreir, una estrella ayuda a que otros la encuentren
y hace que el Wrapped del autor quede mucho mas bonito.

## Licencia

MIT - haz lo que quieras, solo conserva el aviso. Ver [LICENSE](LICENSE).
