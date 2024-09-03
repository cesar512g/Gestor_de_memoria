const TAMANO_MEMORIA = 16 * 1024 * 1024; // 16 Mb

const PROGRAMAS = [
    { nombre: 'Programa A', tamaño: 1 * 1024 * 1024 }, // 1 Mb
    { nombre: 'Programa B', tamaño: 2 * 1024 * 1024 }, // 2 Mb
    { nombre: 'Programa C', tamaño: 3 * 1024 * 1024 }, // 3 Mb
    { nombre: 'Programa D', tamaño: 1.5 * 1024 * 1024 }, // 1.5 Mb
    { nombre: 'Programa E', tamaño: 2.5 * 1024 * 1024 }, // 2.5 Mb
];

function obtenerNumeroParticiones() {
    const numParticionesInput = document.getElementById('num-particiones');
    const numParticiones = parseInt(numParticionesInput.value);
    return numParticiones > 0 ? numParticiones : 1;
}

function limpiarMemoria() {
    const pantallaMemoria = document.getElementById('pantalla-memoria');
    pantallaMemoria.innerHTML = '';
    const limitesMemoria = document.getElementById('limites-memoria');
    limitesMemoria.innerHTML = '';
    const mensajesError = document.getElementById('mensajes-error');
    mensajesError.innerHTML = '';
}



function mostrarMensajeError(mensaje) {
    const mensajesError = document.getElementById('mensajes-error');
    mensajesError.innerHTML += `<span style="color: red;">${mensaje}</span><br>`;
}

function ejecutarSimulacion(estrategia) {
    limpiarMemoria();
    const numParticiones = obtenerNumeroParticiones();
    const tamañoParticion = Math.floor(TAMANO_MEMORIA / numParticiones);
    const asignaciones = asignarMemoria(estrategia, numParticiones, tamañoParticion);
    dibujarMemoria(asignaciones, tamañoParticion);
}

function asignarMemoria(estrategia, numParticiones, tamañoParticion) {
    const particiones = [];
    const asignaciones = [];

   
    for (let i = 0; i < numParticiones; i++) {
        particiones.push({ id: i, programa: null });
    }

    PROGRAMAS.forEach((programa) => {
        let asignado = false;

        if (estrategia === 'primerAjuste') {
            for (let i = 0; i < particiones.length; i++) {
                if (!particiones[i].programa && tamañoParticion >= programa.tamaño) {
                    particiones[i].programa = { ...programa, offset: 0, color: 'lightblue' };
                    asignado = true;
                    break;
                }
            }
        } else if (estrategia === 'mejorAjuste') {
            const partidaDisponible = particiones
                .filter(p => !p.programa && tamañoParticion >= programa.tamaño)
                .sort((a, b) => tamañoParticion - programa.tamaño)[0];
            
            if (partidaDisponible) {
                partidaDisponible.programa = { ...programa, offset: 0, color: 'lightgreen' };
                asignado = true;
            }
        } else if (estrategia === 'peorAjuste') {
            const partidaDisponible = particiones
                .filter(p => !p.programa && tamañoParticion >= programa.tamaño)
                .sort((a, b) => b.id - a.id)[0];
            
            if (partidaDisponible) {
                partidaDisponible.programa = { ...programa, offset: 0, color: 'lightcoral' };
                asignado = true;
            }
        }

        if (!asignado) {
            mostrarMensajeError(`Error: No hay suficiente memoria para el ${programa.nombre}`);
        }
    });

    return particiones;
}
function dibujarMemoria(asignaciones, tamañoParticion) {
    const pantallaMemoria = document.getElementById('pantalla-memoria');
    const limitesMemoria = document.getElementById('limites-memoria');
    
    pantallaMemoria.innerHTML = ''; 
    limitesMemoria.innerHTML = ''; 
    
    let offset = 0;

    asignaciones.forEach((particion, index) => {
        
        let particionContenedor = document.createElement('div');
        particionContenedor.classList.add('particion-contenedor');
        particionContenedor.style.width = `${(tamañoParticion / TAMANO_MEMORIA) * 100}%`;
        particionContenedor.style.left = `${(offset / TAMANO_MEMORIA) * 100}%`;

        
        const bordeParticion = document.createElement('div');
        bordeParticion.classList.add('borde-particion');
        particionContenedor.appendChild(bordeParticion);

      
        const textoParticion = document.createElement('div');
        textoParticion.classList.add('etiqueta-particion');
        textoParticion.textContent = `P${index}`;
        particionContenedor.appendChild(textoParticion);

        if (particion.programa) {
            const programaDiv = document.createElement('div');
            programaDiv.classList.add('bloque-memoria');
            programaDiv.style.backgroundColor = particion.programa.color;
            
           
            const anchoPrograma = (particion.programa.tamaño / tamañoParticion) * 100;
            programaDiv.style.width = `${anchoPrograma}%`;
            
            programaDiv.title = `${particion.programa.nombre}: ${particion.programa.tamaño / 1024 / 1024} MiB`;
            particionContenedor.appendChild(programaDiv);

            const limiteInicio = offset.toString(16).toUpperCase().padStart(6, '0');
            const limiteFin = (offset + particion.programa.tamaño).toString(16).toUpperCase().padStart(6, '0');
            limitesMemoria.innerHTML += `${particion.programa.nombre}: ${limiteInicio} - ${limiteFin}<br>`;
        }

        pantallaMemoria.appendChild(particionContenedor);

        const memoriaLibre = particion.programa ? tamañoParticion - particion.programa.tamaño : tamañoParticion;
        const limiteParticionFin = (offset + tamañoParticion).toString(16).toUpperCase().padStart(6, '0');
        limitesMemoria.innerHTML += `Partición ${index}: ${offset.toString(16).toUpperCase().padStart(6, '0')} - ${limiteParticionFin} (Libre: ${memoriaLibre / 1024 / 1024} MiB)<br>`;
        offset += tamañoParticion;
    });

   
    const ultimaParticion = pantallaMemoria.lastChild;
    if (ultimaParticion) {
        const bordeUltimaParticion = ultimaParticion.querySelector('.borde-particion');
        if (bordeUltimaParticion) {
            bordeUltimaParticion.remove();
        }
    }
}
