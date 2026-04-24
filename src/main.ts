import { renderCinemaApp } from "./renderCinemaApp";

type SeatMatrix = number[][];

const TEST_FILAS = 8;
const TEST_COLUMNAS = 10;

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

    let asientos: number[][] = [];
    let mensaje = "Pulsa sobre un asiento libre para reservarlo.";

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

    // Inicializa la matriz de asientos, vacia o con datos de ejemplo.
    function initAsientos(useExample = false) {
      asientos = useExample ? createExampleMatrix() : createEmptyMatrix();
    }

    // Reserva un asiento si esta libre y devuelve el mensaje de resultado.
    function reservarAsiento(fila: number, columna: number): string {
      const isOutOfRange =
        fila < 0 || fila >= numeroFilas || columna < 0 || columna >= numeroColumnas;

      if (isOutOfRange) return "Error: asiento fuera de rango.";

      const isReserved = asientos[fila][columna] === 1;
      if (isReserved) return "Error: el asiento ya esta ocupado.";

      asientos[fila][columna] = 1;
      return `Reservado: fila ${String.fromCharCode(65 + fila)}, asiento ${columna + 1}.`;
    }

    // Libera un asiento reservado y devuelve el mensaje de resultado.
    function liberarAsiento(fila: number, columna: number): string {
      const isOutOfRange =
        fila < 0 || fila >= numeroFilas || columna < 0 || columna >= numeroColumnas;

      if (isOutOfRange) return "Error: asiento fuera de rango.";

      const isReserved = asientos[fila][columna] === 1;
      if (!isReserved) return "Error: el asiento ya esta libre.";

      asientos[fila][columna] = 0;
      return `Liberado: fila ${String.fromCharCode(65 + fila)}, asiento ${columna + 1}.`;
    }

    // Calcula el resumen de ocupacion actual de la sala.
    function getCurrentStatus() {
      const occupied = asientos.flat().filter(valor => valor === 1).length;
      const total = numeroFilas * numeroColumnas;
      const free = total - occupied;

      return { occupied, free, total };
    }

    // Busca la primera pareja de asientos contiguos libres en horizontal.
    function findTwoContiguousSeats(): [number, number][] | null {
      for (let i = 0; i < numeroFilas; i++) {
        for (let j = 0; j < numeroColumnas - 1; j++) {
          if (asientos[i][j] === 0 && asientos[i][j + 1] === 0) {
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
      const { occupied, free, total } = getCurrentStatus();

      renderCinemaApp({
        appRoot,
        numeroFilas,
        numeroColumnas,
        asientos,
        mensaje,
        occupied,
        free,
        total,
        suggestion: findTwoContiguousSeats(),
        onReset: () => {
          initAsientos(false);
          mensaje = "Sala restablecida: todos los asientos estan libres.";
          render();
        },
        onLoadExample: () => {
          initAsientos(true);
          mensaje = "Se cargo la distribucion de ejemplo.";
          render();
        },
        onSeatClick: (fila: number, columna: number) => {
          const isReserved = asientos[fila][columna] === 1;

          if (isReserved) {
            const seatCode = `${String.fromCharCode(65 + fila)}${columna + 1}`;
            const shouldRelease = window.confirm(`El asiento ${seatCode} esta ocupado. Quieres liberarlo?`);

            mensaje = shouldRelease
              ? liberarAsiento(fila, columna)
              : "Operacion cancelada: el asiento se mantiene reservado.";
            render();
            return;
          }

          mensaje = reservarAsiento(fila, columna);
          render();
        },
      });
    }

    initAsientos(true);
    render();
  });
}

export { };
