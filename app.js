'use strict';

const express = require('express')
const app = express();
const http = require("https");




const port = 8080;
const host = '0.0.0.0';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/discovery_aeat', (req, res) => {


  var options = "";
  var collection = "";
  var filter = req.body.filter;
  var origen = req.body.origen;
  var consulta = req.body.query;
  var projectId = "";
  var respuesta ="";





  const DiscoveryV2 = require('ibm-watson/discovery/v2');
  const {
    IamAuthenticator
  } = require('ibm-watson/auth');

  const discovery = new DiscoveryV2({
    version: '2020-08-30',
    authenticator: new IamAuthenticator({
      apikey: process.env.API_KEY,
    }),
    serviceUrl: process.env.SERVICE_URL,
  });

  if (origen == 'informador') {
    projectId = process.env.INFORMADOR;

  } else {
    projectId = process.env.WEB;
  }

  const params = {
    projectId: projectId,
    query: consulta,
    filter: filter
  };

  discovery.query(params)
    .then(response => {

      //console.log(JSON.stringify(response.result.results, null, 2));
      if (origen == 'informador') {
        respuesta = respuesta_informador(response.result);
        //res.end(JSON.stringify(response.result.results, null, 2))
      } else {
        respuesta = respuesta_web(response.result);
      }
      console.log(JSON.stringify(respuesta));
      res.json(respuesta);
    })
    .catch(err => {
      console.log('error:', err);
      res.json({'error':'error'});
    });



})

function respuesta_informador (resultado){

  return {"respuesta": resultado.results[0].texto_respuesta_html,
  "nodo_id": resultado.results[0].extracted_metadata.filename};

}
function respuesta_web (resultado){

  if (resultado.results.length > 0) {
    if (resultado.results.length == 2) {
      return({
        resultados: [{
            title: resultado.results[0].title,
            link: resultado.results[0].metadata.source.url
          },
          {
            title: resultado.results[1].title,
            link: resultado.results[1].metadata.source.url
          }
        ]
      });


    } else {
      if (resultado.results.length == 1) {
        return({
          resultados: [{
            title: resultado.results[0].title,
            link: resultado.results[0].metadata.source.url
          }]
        });

      } else {
        return({
          resultados: [{
              title: resultado.results[0].title,
              link: resultado.results[0].metadata.source.url
            },
            {
              title: resultado.results[1].title,
              link: resultado.results[1].metadata.source.url
            },
            {
              title: resultado.results[2].title,
              link: resultado.results[2].metadata.source.url
            }
          ]
        });

      }

    }

  } else {
    return({
      resultados: [{
        title: "Lo sentimos, no hay resultados",
        link: ""
      }]
    })

  }

}


app.listen(port, host);
console.log(`Running on http://${host}:${port}`);
