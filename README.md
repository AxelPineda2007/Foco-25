# FOCO 25 - Hábitos de Estudio

> **Problema:** Se estudia con el celular en la mano y al final no se avanza.  
> **Usuario:** Estudiante que necesita concentrarse y vencer las interrupciones.

---

## 🎯 Las Tres Funciones Mínimas (P0 + M1)

1. **Temporizador 25/5 (Pomodoro Estricto):**
   - 25 minutos de trabajo profundo enfocado en una materia seleccionada.
   - 5 minutos de descanso activo (estiramiento, hidratación, ojos lejos de pantallas).
   - "Escudo Anti-Celular": compromiso activo con el celular boca abajo o fuera de alcance.
   - Sonidos sintetizados mediante Web Audio API (inicio, descanso y campanadas de logro).
   - Modo prueba rápida (10s) para evaluaciones inmediatas.

2. **Registro de Sesiones por Materia:**
   - Asignación por materia con códigos de color personalizables (Matemáticas, Programación, Historia, Física, Idiomas y materias personalizadas).
   - Registro con fecha, hora, duración, materia y estado.
   - Selector manual de sesiones para registrar estudios realizados fuera de la pantalla.

3. **Gráfico Semanal de Rendimiento:**
   - Visualización interactiva de Lunes a Domingo.
   - Desglose diario de sesiones **completadas** vs **abandonadas**.
   - Tiempo neto enfocado por día e inspector interactivo de sesiones al tocar cualquier día.

---

## 📊 Dato Clave que Maneja (M2)

- **Sesiones Completadas vs Abandonadas:** Monitoreo en tiempo real de la tasa de retención, porcentaje de éxito, y registro específico del distractor principal (e.g., redes sociales, Instagram, TikTok, WhatsApp, llamadas, fatiga).
- Métrica de constancia y racha de días consecutivos de estudio.

---

## 🧠 Sello de IA (M5)

- **Análisis de Patrón Semanal con Gemini (`gemini-3.8-flash`):**
  - **Franja Horaria de Oro (Máximo Rendimiento):** Identifica el bloque horario exacto (ej. *08:30 - 11:30 AM*) donde el estudiante registra su mayor tasa de completitud y concentración.
  - **Franja Crítica de Alto Riesgo:** Detecta las horas vulnerables (ej. *16:00 - 18:30 PM*) donde más del 60% de las sesiones colapsan por el celular.
  - **Diagnóstico de Cronotipo:** Reconoce el perfil biológico del estudiante (Alondra Matutina, Búho Nocturno, etc.).
  - **Plan de Choque Anti-Celular:** 3 recomendaciones accionables personalizadas basadas en el comportamiento real registrado.
  - **Índice de Salud de Hábito:** Calificación de 0 a 100 con diagnóstico cualitativo.

---

## 💾 Persistencia y Almacenamiento

- Datos guardados de forma local y persistente (`localStorage`).
- Pre-cargado con historial de ejemplo de la semana para probar de inmediato gráficos y el análisis de IA.
- Opción de exportación de historial en formato JSON y restauración de datos demo.

---

## 🚀 Cómo Subir a tu Repositorio GitHub

Este proyecto ya cuenta con el repositorio Git local inicializado y el primer commit realizado. Para subirlo a tu cuenta de GitHub:

1. **Crea un nuevo repositorio en GitHub:**  
   Ve a [github.com/new](https://github.com/new) con el nombre `foco-25` (deja vacías las opciones de inicializar con README).

2. **Vincula tu repositorio remoto y haz push:**
   ```bash
   git remote add origin https://github.com/TU-USUARIO/foco-25.git
   git branch -M main
   git push -u origin main
   ```

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons
- **IA:** Google GenAI SDK (`@google/genai`) con modelo `gemini-3.8-flash`
- **Audio:** Web Audio API (efectos de sonido nativos sin dependencias externas)
- **Servidor:** Vite + Express con proxy backend para invocación segura de IA
