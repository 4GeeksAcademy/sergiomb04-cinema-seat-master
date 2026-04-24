if (typeof document !== "undefined") {
  import("./style.css").then(() => {
    const app = document.querySelector<HTMLElement>("#app");
    if (!app) return;
    const appRoot = app;

    const numeroFilas = 8;
    const numeroColumnas = 10;
    const svgNs = "http://www.w3.org/2000/svg";

    let asientos: number[][] = [];
    let mensaje = "Pulsa sobre un asiento libre para reservarlo.";

    function createEmptyMatrix(): number[][] {
      return Array.from({ length: numeroFilas }, () => Array.from({ length: numeroColumnas }, () => 0));
    }

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

    function initAsientos(useExample = false) {
      asientos = useExample ? createExampleMatrix() : createEmptyMatrix();
    }

    function reservarAsiento(fila: number, columna: number): string {
      const isOutOfRange =
        fila < 0 || fila >= numeroFilas || columna < 0 || columna >= numeroColumnas;

      if (isOutOfRange) return "Error: asiento fuera de rango.";

      const isReserved = asientos[fila][columna] === 1;
      if (isReserved) return "Error: el asiento ya esta ocupado.";

      asientos[fila][columna] = 1;
      return `Reservado: fila ${String.fromCharCode(65 + fila)}, asiento ${columna + 1}.`;
    }

    function getCurrentStatus() {
      const occupied = asientos.flat().filter(valor => valor === 1).length;
      const total = numeroFilas * numeroColumnas;
      const free = total - occupied;

      return { occupied, free, total };
    }

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

    function isSuggestedSeat(suggestion: [number, number][] | null, fila: number, columna: number): boolean {
      if (!suggestion) return false;

      return suggestion.some(([row, col]) => row === fila && col === columna);
    }

    function render() {
      const { occupied, free, total } = getCurrentStatus();
      const suggestion = findTwoContiguousSeats();
      const occupancy = ((occupied / total) * 100).toFixed(1);

      appRoot.innerHTML = `
        <section class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5 text-white">
            <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Mapa de Asientos del Cine</h1>
            <p class="mt-1 text-sm text-slate-300">Visualiza disponibilidad, reserva y restablece la sala.</p>
          </div>

          <div class="grid gap-6 p-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside class="space-y-4">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-700">Estado general</h2>
                <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div class="rounded-xl bg-emerald-100 p-3">
                    <p class="text-emerald-700">Libres</p>
                    <p class="text-xl font-bold text-emerald-900">${free}</p>
                  </div>
                  <div class="rounded-xl bg-rose-100 p-3">
                    <p class="text-rose-700">Ocupados</p>
                    <p class="text-xl font-bold text-rose-900">${occupied}</p>
                  </div>
                  <div class="col-span-2 rounded-xl bg-slate-200 p-3">
                    <p class="text-slate-700">Ocupacion</p>
                    <p class="text-xl font-bold text-slate-900">${occupancy}% (${occupied}/${total})</p>
                  </div>
                </div>
              </div>

              <div class="rounded-2xl border border-slate-200 p-4">
                <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-700">Leyenda</h2>
                <ul class="mt-3 space-y-2 text-sm text-slate-700">
                  <li class="flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-emerald-500"></span>Libre</li>
                  <li class="flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-rose-500"></span>Ocupado</li>
                  <li class="flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-amber-400"></span>Pareja sugerida</li>
                </ul>
              </div>

              <div class="flex flex-wrap gap-2">
                <button id="reset-btn" class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
                  Restablecer sala
                </button>
                <button id="example-btn" class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                  Cargar ejemplo
                </button>
              </div>

              <p id="message" class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">${mensaje}</p>
            </aside>

            <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <svg id="seat-map" class="mx-auto h-auto min-w-[560px] max-w-full" role="img" aria-label="Mapa de asientos"></svg>
            </div>
          </div>
        </section>
      `;

      const resetBtn = appRoot.querySelector<HTMLButtonElement>("#reset-btn");
      const exampleBtn = appRoot.querySelector<HTMLButtonElement>("#example-btn");
      const seatMap = appRoot.querySelector<SVGSVGElement>("#seat-map");

      if (!seatMap) return;

      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          initAsientos(false);
          mensaje = "Sala restablecida: todos los asientos estan libres.";
          render();
        });
      }

      if (exampleBtn) {
        exampleBtn.addEventListener("click", () => {
          initAsientos(true);
          mensaje = "Se cargo la distribucion de ejemplo.";
          render();
        });
      }

      drawSeatMap(seatMap, suggestion);
    }

    function drawSeatMap(svg: SVGSVGElement, suggestion: [number, number][] | null) {
      const seatWidth = 34;
      const seatHeight = 42;
      const seatGap = 10;
      const marginX = 40;
      const marginY = 76;

      const svgWidth = marginX * 2 + numeroColumnas * (seatWidth + seatGap) - seatGap;
      const svgHeight = marginY + numeroFilas * (seatHeight + seatGap) + 42;

      svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
      svg.setAttribute("width", `${svgWidth}`);
      svg.setAttribute("height", `${svgHeight}`);
      svg.innerHTML = "";

      const screen = document.createElementNS(svgNs, "rect");
      screen.setAttribute("x", "80");
      screen.setAttribute("y", "18");
      screen.setAttribute("rx", "10");
      screen.setAttribute("width", `${svgWidth - 160}`);
      screen.setAttribute("height", "14");
      screen.setAttribute("fill", "#1e293b");
      screen.setAttribute("opacity", "0.9");
      svg.appendChild(screen);

      const screenLabel = document.createElementNS(svgNs, "text");
      screenLabel.setAttribute("x", `${svgWidth / 2}`);
      screenLabel.setAttribute("y", "52");
      screenLabel.setAttribute("text-anchor", "middle");
      screenLabel.setAttribute("font-size", "12");
      screenLabel.setAttribute("font-weight", "700");
      screenLabel.setAttribute("fill", "#334155");
      screenLabel.textContent = "PANTALLA";
      svg.appendChild(screenLabel);

      for (let i = 0; i < numeroFilas; i++) {
        const rowLabel = document.createElementNS(svgNs, "text");
        rowLabel.setAttribute("x", "14");
        rowLabel.setAttribute("y", `${marginY + i * (seatHeight + seatGap) + seatHeight * 0.72}`);
        rowLabel.setAttribute("font-size", "12");
        rowLabel.setAttribute("font-weight", "700");
        rowLabel.setAttribute("fill", "#475569");
        rowLabel.textContent = String.fromCharCode(65 + i);
        svg.appendChild(rowLabel);

        for (let j = 0; j < numeroColumnas; j++) {
          const x = marginX + j * (seatWidth + seatGap);
          const y = marginY + i * (seatHeight + seatGap);
          const seatCode = `${String.fromCharCode(65 + i)}${j + 1}`;

          const group = document.createElementNS(svgNs, "g");

          const ocupado = asientos[i][j] === 1;
          const suggested = !ocupado && isSuggestedSeat(suggestion, i, j);

          const fill = ocupado ? "#f43f5e" : suggested ? "#facc15" : "#10b981";
          const stroke = ocupado ? "#be123c" : suggested ? "#ca8a04" : "#047857";

          const seat = document.createElementNS(svgNs, "rect");
          seat.setAttribute("x", `${x}`);
          seat.setAttribute("y", `${y}`);
          seat.setAttribute("rx", "7");
          seat.setAttribute("width", `${seatWidth}`);
          seat.setAttribute("height", `${seatHeight}`);
          seat.setAttribute("fill", fill);
          seat.setAttribute("stroke", stroke);
          seat.setAttribute("stroke-width", "1.5");

          if (!ocupado) {
            group.style.cursor = "pointer";
            group.addEventListener("click", () => {
              mensaje = reservarAsiento(i, j);
              render();
            });
          }

          const iconHead = document.createElementNS(svgNs, "circle");
          iconHead.setAttribute("cx", `${x + seatWidth / 2}`);
          iconHead.setAttribute("cy", `${y + 11}`);
          iconHead.setAttribute("r", "4.2");
          iconHead.setAttribute("fill", ocupado ? "#fff1f2" : "#ecfdf5");

          const iconBody = document.createElementNS(svgNs, "rect");
          iconBody.setAttribute("x", `${x + seatWidth / 2 - 6}`);
          iconBody.setAttribute("y", `${y + 16.5}`);
          iconBody.setAttribute("width", "12");
          iconBody.setAttribute("height", "9");
          iconBody.setAttribute("rx", "3");
          iconBody.setAttribute("fill", ocupado ? "#fff1f2" : "#ecfdf5");

          const seatLabel = document.createElementNS(svgNs, "text");
          seatLabel.setAttribute("x", `${x + seatWidth / 2}`);
          seatLabel.setAttribute("y", `${y + seatHeight - 7}`);
          seatLabel.setAttribute("text-anchor", "middle");
          seatLabel.setAttribute("font-size", "10.5");
          seatLabel.setAttribute("font-weight", "800");
          seatLabel.setAttribute("fill", ocupado ? "#fff1f2" : "#062e27");
          seatLabel.textContent = seatCode;

          const tooltip = document.createElementNS(svgNs, "title");
          const estado = ocupado ? "Ocupado" : suggested ? "Libre (sugerido)" : "Libre";
          tooltip.textContent = `Asiento ${seatCode}: ${estado}`;

          group.appendChild(tooltip);
          group.appendChild(seat);
          group.appendChild(iconHead);
          group.appendChild(iconBody);
          group.appendChild(seatLabel);
          svg.appendChild(group);
        }
      }
    }

    initAsientos(true);
    render();
  });
}

export { };
