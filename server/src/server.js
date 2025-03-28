import 'dotenv/config';
import express from 'express';
import configViewEngine from './config/configViewEingine.js';
import initWebroute from './route/web.js';
import initAPIroute from './route/api.js';
import corsMiddleware from './middleware/cors.js'
import sessionMiddleware from './middleware/session.js'

const app = express();
const port = process.env.PORT || 8000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//set up view engine
configViewEngine(app);
//set up router
// middleware
app.use(corsMiddleware);//cors
app.use(sessionMiddleware);//session

initWebroute(app);
//set up api router
initAPIroute(app);
app.get('/damn', (req, res) => {
  res.send('nigger');
});
//handle 404 not found
app.use((req,res) =>{
  return res.render('404.ejs')
})

app.listen(port, () => {
  console.log(`Example app listening http://localhost:${port}/ `);
});
