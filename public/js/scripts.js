document.addEventListener('DOMContentLoaded', () => {
  const grupoForm = document.getElementById('grupo-form');
  const equipoForm = document.getElementById('equipo-form');
  const gruposList = document.getElementById('grupos-list');
  const equipoGrupoSelect = document.getElementById('equipo-grupo');
  const togglePanelButton = document.getElementById('toggle-panel');
  const panel = document.getElementById('panel');
  const uptimeChartCanvas = document.getElementById('uptime-chart');
  const oltStatusCentral = document.getElementById('olt-status-central');
  const oltStatusTrozarello1 = document.getElementById('olt-status-trozarello-1');
  const oltStatusTrozarello2 = document.getElementById('olt-status-trozarello-2');
  const oltStatusLiguria = document.getElementById('olt-status-liguria');
  const mikrotikInfoContainer = document.getElementById('mikrotik-info');

  let equiposData = [];

  const fetchEquipos = () => {
    fetch('/api/equipos')
      .then(response => response.json())
      .then(data => {
        equiposData = data;
        renderGrupos();
      })
      .catch(error => console.error('Error fetching equipos:', error));
  };

  const renderGrupos = () => {
    const grupos = [...new Set(equiposData.map(equipo => equipo.grupo))];
    gruposList.innerHTML = '';
    equipoGrupoSelect.innerHTML = '';
    grupos.forEach(grupo => {
      const li = document.createElement('li');
      li.textContent = grupo;
      gruposList.appendChild(li);
      const option = document.createElement('option');
      option.value = grupo;
      option.textContent = grupo;
      equipoGrupoSelect.appendChild(option);
    });
  };

  grupoForm.addEventListener('submit', event => {
    event.preventDefault();
    const grupoNombre = document.getElementById('grupo-nombre').value;
    if (grupoNombre) {
      const newGrupo = { grupo: grupoNombre };
      fetch('/api/equipos/grupo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGrupo)
      }).then(() => {
        fetchEquipos();
        grupoForm.reset();
      }).catch(error => console.error('Error adding grupo:', error));
    }
  });

  equipoForm.addEventListener('submit', event => {
    event.preventDefault();
    const equipoGrupo = document.getElementById('equipo-grupo').value;
    const equipoNombre = document.getElementById('equipo-nombre').value;
    const equipoEstado = document.getElementById('equipo-estado').value;
    if (equipoGrupo && equipoNombre && equipoEstado) {
      const newEquipo = { grupo: equipoGrupo, nombre: equipoNombre, estado: equipoEstado };
      fetch('/api/equipos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEquipo)
      }).then(() => {
        fetchEquipos();
        equipoForm.reset();
      }).catch(error => console.error('Error adding equipo:', error));
    }
  });

  togglePanelButton.addEventListener('click', () => {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  });

  const updateChart = () => {
    // Simulación de datos de uptime
    const uptimeData = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
      datasets: [{
        label: 'Uptime',
        data: [100, 95, 90, 85, 80, 75], // Datos de ejemplo
        backgroundColor: uptimeData.data.map(uptime => uptime > 80 ? 'green' : 'red')
      }]
    };

    const config = {
      type: 'bar',
      data: uptimeData,
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };

    if (window.uptimeChart) {
      window.uptimeChart.destroy();
    }

    window.uptimeChart = new Chart(uptimeChartCanvas, config);
  };

  const checkOltStatus = (ip, port, statusElement) => {
    fetch('/api/ping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ip, port })
    })
      .then(response => response.json())
      .then(data => {
        statusElement.textContent = data.status;
      })
      .catch(() => {
        statusElement.textContent = 'Error';
      });
  };

  const fetchMikrotikInfo = () => {
    fetch('/api/mikrotik/info')
      .then(response => response.json())
      .then(data => {
        mikrotikInfoContainer.innerHTML = '';
        data.forEach(device => {
          const deviceInfo = document.createElement('div');
          deviceInfo.innerHTML = `
            <p>Nombre del Equipo: ${device.name}</p>
            <p>Carga del CPU: ${device.cpuLoad}</p>
            <p>Tiempo de Actividad: ${device.uptime}</p>
          `;
          mikrotikInfoContainer.appendChild(deviceInfo);
        });
      })
      .catch(() => {
        mikrotikInfoContainer.textContent = 'Error fetching MikroTik info';
      });
  };

  setInterval(() => {
    checkOltStatus('198.12.37.7', 19001, oltStatusCentral);
    checkOltStatus('198.12.37.7', 19081, oltStatusTrozarello1);
    checkOltStatus('198.12.37.7', 19081, oltStatusTrozarello2);
    checkOltStatus('198.12.37.6', 6500, oltStatusLiguria);
    fetchMikrotikInfo();
  }, 5000); // Verificar el estado de las OLT y obtener info de MikroTik cada 5 segundos

  fetchEquipos();
  updateChart();
  fetchMikrotikInfo();
});
