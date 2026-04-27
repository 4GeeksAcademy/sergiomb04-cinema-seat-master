import { renderCinemaApp } from "./renderCinemaApp";

type SeatMatrix = number[][];
type Sala = {
  id: string;
  nombre: string;
  asientos: SeatMatrix;
};

type CinemaState = {
  salas: Sala[];
  activeSalaId: string;
};

const TEST_FILAS = 8;
const TEST_COLUMNAS = 10;
const STORAGE_KEY = "cinema-seat-state-v1";

// Imprime una matriz de asientos 8x10 con cabeceras de filas (A-H) y columnas (1-10).
function printCinemaSeatingMatrix(matrix: SeatMatrix): void {
  if (matrix.length !== TEST_FILAS) {
    throw new Error(`La matriz debe tener ${TEST_FILAS} filas.`);
  }

  for (let i = 0; i < TEST_FILAS; i++) {
    if (matrix[i].length !== TEST_COLUMNAS) {
      throw new Error(`La fila ${i + 1} debe tener ${TEST_COLUMNAS} columnas.`);
    }
  }

  const columnHeader = ["   ", ...Array.from({ length: TEST_COLUMNAS }, (_, i) => String(i + 1).padStart(2, " "))].join(" ");
  console.log(columnHeader);

  for (let i = 0; i < TEST_FILAS; i++) {
    const rowLabel = String.fromCharCode(65 + i);
    const rowSeats = matrix[i].map(valor => (valor === 1 ? " X" : " L")).join(" ");
    console.log(`${rowLabel} |${rowSeats}`);
  }
}

// Ejecuta ejemplos de consola para sala vacia, parcial y completa.
function runConsoleMatrixExamples(): void {
  const emptyMatrix: SeatMatrix = Array.from({ length: TEST_FILAS }, () =>
    Array.from({ length: TEST_COLUMNAS }, () => 0),
  );

  const partialMatrix: SeatMatrix = [
    [0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
    [0, 0, 0, 1, 1, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
  ];

  const fullMatrix: SeatMatrix = Array.from({ length: TEST_FILAS }, () =>
    Array.from({ length: TEST_COLUMNAS }, () => 1),
  );

  console.log("\n=== TEST: SALA VACIA ===");
  printCinemaSeatingMatrix(emptyMatrix);

  console.log("\n=== TEST: SALA PARCIAL ===");
  printCinemaSeatingMatrix(partialMatrix);

  console.log("\n=== TEST: SALA LLENA ===");
  printCinemaSeatingMatrix(fullMatrix);
}

if (typeof document === "undefined") {
  runConsoleMatrixExamples();
}

if (typeof document !== "undefined") {
  import("./style.css").then(() => {
    const app = document.querySelector<HTMLElement>("#app");
    if (!app) return;
    const appRoot = app;

    const numeroFilas = 8;
    const numeroColumnas = 10;

    let salas: Sala[] = [];
    let activeSalaId = "";
    let toastTimeout: ReturnType<typeof window.setTimeout> | null = null;

    // Crea una sala vacia con todos los asientos en estado libre (0).
    function createEmptyMatrix(): number[][] {
      return Array.from({ length: numeroFilas }, () => Array.from({ length: numeroColumnas }, () => 0));
    }

    // Devuelve una distribucion de ejemplo con asientos libres y ocupados.
    function createExampleMatrix(): number[][] {
      return [
        [0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
        [0, 0, 0, 1, 1, 0, 0, 1, 0, 0],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        [0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
        [1, 0, 0, 0, 0, 1, 0, 0, 1, 0],
        [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
      ];
    }

    // Valida una matriz de asientos 8x10 usando valores 0 y 1.
    function isValidSeatMatrix(matrix: unknown): matrix is SeatMatrix {
      if (!Array.isArray(matrix) || matrix.length !== numeroFilas) return false;

      return matrix.every(
        row => Array.isArray(row)
          && row.length === numeroColumnas
          && row.every(value => value === 0 || value === 1),
      );
    }

    function createSala(nombre: string, useExample = false): Sala {
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        nombre,
        asientos: useExample ? createExampleMatrix() : createEmptyMatrix(),
      };
    }

    function getActiveSala(): Sala {
      const sala = salas.find(item => item.id === activeSalaId);
      if (sala) return sala;

      activeSalaId = salas[0].id;
      return salas[0];
    }

    function saveState() {
      const state: CinemaState = {
        salas,
        activeSalaId,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function showToast(text: string) {
      const toast = appRoot.querySelector<HTMLElement>("#toast");
      if (!toast) return;

      toast.textContent = text;

      toast.classList.remove("toast-show");
      void toast.offsetWidth;
      toast.classList.add("toast-show");

      if (toastTimeout) {
        window.clearTimeout(toastTimeout);
      }

      toastTimeout = window.setTimeout(() => {
        toast.classList.remove("toast-show");
      }, 2600);
    }

    function loadState() {
      const rawState = localStorage.getItem(STORAGE_KEY);

      if (!rawState) {
        const salaInicial = createSala("Sala 1", false);
        salas = [salaInicial];
        activeSalaId = salaInicial.id;
        saveState();
        return;
      }

      try {
        const parsed = JSON.parse(rawState) as Partial<CinemaState>;

        const parsedSalas = Array.isArray(parsed.salas)
          ? parsed.salas
            .filter(sala => typeof sala?.id === "string" && typeof sala?.nombre === "string" && isValidSeatMatrix(sala?.asientos))
            .map(sala => ({
              id: sala.id,
              nombre: sala.nombre,
              asientos: sala.asientos,
            }))
          : [];

        if (parsedSalas.length === 0) {
          const salaInicial = createSala("Sala 1", false);
          salas = [salaInicial];
          activeSalaId = salaInicial.id;
          saveState();
          return;
        }

        salas = parsedSalas;

        const parsedActiveSalaId = typeof parsed.activeSalaId === "string" ? parsed.activeSalaId : "";
        const hasActiveSala = parsedSalas.some(sala => sala.id === parsedActiveSalaId);

        activeSalaId = hasActiveSala ? parsedActiveSalaId : parsedSalas[0].id;
      } catch {
        const salaInicial = createSala("Sala 1", false);
        salas = [salaInicial];
        activeSalaId = salaInicial.id;
        saveState();
      }
    }

    // Reserva un asiento si esta libre y devuelve el mensaje de resultado.
    function reservarAsiento(fila: number, columna: number): string {
      const isOutOfRange =
        fila < 0 || fila >= numeroFilas || columna < 0 || columna >= numeroColumnas;

      if (isOutOfRange) return "Error: asiento fuera de rango.";

      const salaActiva = getActiveSala();
      const isReserved = salaActiva.asientos[fila][columna] === 1;
      if (isReserved) return "Error: el asiento ya esta ocupado.";

      salaActiva.asientos[fila][columna] = 1;
      saveState();
      return `Reservado: fila ${String.fromCharCode(65 + fila)}, asiento ${columna + 1}.`;
    }

    // Libera un asiento reservado y devuelve el mensaje de resultado.
    function liberarAsiento(fila: number, columna: number): string {
      const isOutOfRange =
        fila < 0 || fila >= numeroFilas || columna < 0 || columna >= numeroColumnas;

      if (isOutOfRange) return "Error: asiento fuera de rango.";

      const salaActiva = getActiveSala();
      const isReserved = salaActiva.asientos[fila][columna] === 1;
      if (!isReserved) return "Error: el asiento ya esta libre.";

      salaActiva.asientos[fila][columna] = 0;
      saveState();
      return `Liberado: fila ${String.fromCharCode(65 + fila)}, asiento ${columna + 1}.`;
    }

    // Calcula el resumen de ocupacion actual de la sala.
    function getCurrentStatus(): [number, number, number] {
      const salaActiva = getActiveSala();
      const occupied = salaActiva.asientos.flat().filter(valor => valor === 1).length;
      const total = numeroFilas * numeroColumnas;
      const free = total - occupied;

      return [occupied, free, total];
    }

    // Busca la primera pareja de asientos contiguos libres en horizontal.
    function findTwoContiguousSeats(): [number, number][] | null {
      const salaActiva = getActiveSala();

      for (let i = 0; i < numeroFilas; i++) {
        for (let j = 0; j < numeroColumnas - 1; j++) {
          if (salaActiva.asientos[i][j] === 0 && salaActiva.asientos[i][j + 1] === 0) {
            return [
              [i, j],
              [i, j + 1],
            ];
          }
        }
      }

      return null;
    }

    // Recalcula estado y delega el pintado de toda la UI al modulo de render.
    function render() {
      const [ occupied, free, total ] = getCurrentStatus();
      const salaActiva = getActiveSala();

      renderCinemaApp({
        appRoot,
        numeroFilas,
        numeroColumnas,
        asientos: salaActiva.asientos,
        salas: salas.map(sala => ({ id: sala.id, nombre: sala.nombre })),
        activeSalaId,
        occupied,
        free,
        total,
        suggestion: findTwoContiguousSeats(),
        onSelectSala: (salaId: string) => {
          const exists = salas.some(sala => sala.id === salaId);
          if (!exists) {
            showToast("Error: la sala seleccionada no existe.");
            return;
          }

          activeSalaId = salaId;
          const selectedSala = getActiveSala();
          saveState();
          render();
          showToast(`Sala activa: ${selectedSala.nombre}.`);
        },
        onCreateSala: (nombre: string) => {
          const roomName = nombre.trim();

          if (!roomName) {
            showToast("Escribe un nombre para crear la sala.");
            return;
          }

          const newSala = createSala(roomName, false);
          salas.push(newSala);
          activeSalaId = newSala.id;
          saveState();
          render();
          showToast(`Sala creada: ${newSala.nombre}.`);
        },
        onDeleteSala: (salaId: string) => {
          const sala = salas.find(item => item.id === salaId);
          if (!sala) {
            showToast("Error: la sala no existe.");
            return;
          }

          if (salas.length === 1) {
            showToast("No puedes eliminar la unica sala disponible.");
            return;
          }

          const shouldDelete = window.confirm(`Quieres eliminar la sala \"${sala.nombre}\"?`);
          if (!shouldDelete) {
            showToast("Eliminacion cancelada.");
            return;
          }

          const wasActiveSalaDeleted = activeSalaId === salaId;
          salas = salas.filter(item => item.id !== salaId);

          if (wasActiveSalaDeleted) {
            activeSalaId = salas[0].id;
          }

          saveState();
          render();
          if (wasActiveSalaDeleted) {
            showToast(`Sala eliminada. Activa: ${salas[0].nombre}.`);
          } else {
            showToast(`Sala eliminada: ${sala.nombre}.`);
          }
        },
        onReset: () => {
          const salaSeleccionada = getActiveSala();
          salaSeleccionada.asientos = createEmptyMatrix();
          saveState();
          render();
          showToast(`Sala ${salaSeleccionada.nombre} restablecida: todos los asientos estan libres.`);
        },
        onSeatClick: (fila: number, columna: number) => {
          const salaSeleccionada = getActiveSala();
          const isReserved = salaSeleccionada.asientos[fila][columna] === 1;

          if (isReserved) {
            const seatCode = `${String.fromCharCode(65 + fila)}${columna + 1}`;
            const shouldRelease = window.confirm(`El asiento ${seatCode} esta ocupado. Quieres liberarlo?`);

            if (shouldRelease) {
              const releaseMessage = liberarAsiento(fila, columna);
              render();
              showToast(releaseMessage);
            } else {
              showToast("Operacion cancelada: el asiento se mantiene reservado.");
            }
            return;
          }

          const reserveMessage = reservarAsiento(fila, columna);
          render();
          showToast(reserveMessage);
        },
      });
    }

    loadState();
    render();
  });
}

export { };
