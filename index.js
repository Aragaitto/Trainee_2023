const dotenv = require('dotenv');
dotenv.config();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const express = require('express');

//pegar data e hora atual de são paulo
const moment = require('moment');

function getDataAtualBrasil(){
    const dataAtual = moment().utcOffset('-0300').format('DD/MM/YYYY HH:mm:ss');
    return dataAtual
}


function createCoords(){
    const pi = Math.PI;
    const R = 6371; // raio da Terra em km
    const lat0 = -20.3167; // latitude da Curva da Jurema, ES
    const lon0 = -40.2999; // longitude da Curva da Jurema, ES
    const n = 1000; // número de pontos no círculo
    const d = 2; // diâmetro do círculo em km
    const speed = 50; // velocidade em km/h

    // criar vetor de pontos em um círculo na Curva da Jurema
    const points = [];
    for (let i = 0; i < n; i++) {
        const lat = lat0 + (d / (2 * R)) * (180 / pi) * Math.cos(2 * pi * i / n);
        const lon = lon0 + (d / (2 * R)) * (180 / pi) * Math.sin(2 * pi * i / n) / Math.cos(lat0*(pi/180));
        points.push({ lat, lon });
    }

    return points
}

function convertData(coordenadas, coord){

    let i = 0; // índice para percorrer os pontos do círculo

    // atualizar dados aleatórios
    let corMotor = 60 + Math.floor(Math.random() * 20);
    let corBaterias = 70 + Math.floor(Math.random() * 20);
    let temp = 25 + Math.floor(Math.random() * 5);
    let umi = Math.floor(Math.random() * 100);
    let tAlimentacaoPCB = 12 + Math.floor(Math.random() * 2);
    let stateStringSolar1 = Math.floor(Math.random() * 2);
    let stateStringSolar2 = Math.floor(Math.random() * 2);
    let tSaidaMPPT = 48 + Math.floor(Math.random() * 3);
    let tEntradaMPPT = 60 + Math.floor(Math.random() * 15);
    let corMPPT =  5 + Math.floor(Math.random() * 10);
    let spd = 15 + Math.floor(Math.random() * 5);


    return {
        correnteMotor: String(corMotor),
        correnteBaterias: String(corBaterias),
        temperatura: String(temp),
        umidade: String(umi),
        tensaoAlimentacaoPCB: String(tAlimentacaoPCB),
        estadoStringSolar1: String(stateStringSolar1),
        estadoStringSolar2: String(stateStringSolar2),
        tensaoSaidaMPPT: String(tSaidaMPPT),
        tensaoEntradaMPPT: String(tEntradaMPPT),
        correnteMPPT: String(corMPPT),
        velocidadeBarco: String(spd),
        latitude: String(coordenadas[coord].lat),
        longitude: String(coordenadas[coord].lon),
        updateAt: getDataAtualBrasil()
    }  
}

const points = createCoords();


const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`Servidor rodando em http://$:${port}`);
});

io.on('connection', (socket) => {
  console.log('new user: ', socket.id);
  //enviar dados a cada 1 segundos para o cliente
  let coord = 0;
  let intervalo = setInterval(() => {
      if (coord === 1000) {
          coord = 0;
      }
      const data = convertData(points, coord);
      io.emit('data', data);
      console.log(data);  
      coord++;
  }
  , 1000);
  
  socket.on('disconnect', () => {
    clearInterval(intervalo);
    console.log('user disconnected: ', socket.id);
  });
});


