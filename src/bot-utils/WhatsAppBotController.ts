import http from 'http';
const express = require('express');
import bodyParser from "body-parser";
const morgan = require('morgan');

export function startWhatsAppBot() {
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(
        morgan(':method :url :status :res[content-length] - :response-time ms')
    );
    app.get('/', (req : any, res: any) => {
        console.log(req.url,req.body)
        res.send('Hello World!')
    });
    app.post('/', (req : any, res: any) => {
        console.log('POST: ',req.url,req.body)
        res.send('Hello World!')
    });
    app.listen(5050, () => {
        console.log(`WhatsApp Bot listening at http://localhost:${5050}`)
    })

}